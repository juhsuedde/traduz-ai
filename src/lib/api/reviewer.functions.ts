import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie } from "@tanstack/react-start/server";
import { db } from "../db";
import { projects, glossaryEntries, styleGuides } from "../db/schema";
import { eq } from "drizzle-orm";
import { lucia } from "../auth/lucia";
import { getOpenRouterClient, OPENROUTER_MODEL } from "./openrouter";

async function getAuthUser() {
  const sessionId = getCookie("auth_session");
  if (!sessionId) throw new Error("Não autenticado");

  const { user } = await lucia.validateSession(sessionId);
  if (!user) throw new Error("Sessão inválida");
  return user;
}

const ReviewInputSchema = z.object({
  text: z.string().min(1).max(10000),
  projectId: z.string().uuid().optional(),
  checks: z.object({
    grammar: z.boolean().default(true),
    semantics: z.boolean().default(true),
    fluency: z.boolean().default(true),
    projectAdherence: z.boolean().default(false),
    styleGuide: z.boolean().default(false),
  }),
  originalText: z.string().max(10000).optional(),
});

export const reviewText = createServerFn({ method: "POST" })
  .inputValidator(ReviewInputSchema)
  .handler(async ({ data }) => {
    const user = await getAuthUser();
    const openai = getOpenRouterClient();

    const activeChecks: string[] = [];
    if (data.checks.grammar) activeChecks.push("gramática");
    if (data.checks.semantics) activeChecks.push("semântica");
    if (data.checks.fluency) activeChecks.push("fluência");

    let projectContext = "";
    if ((data.checks.projectAdherence || data.checks.styleGuide) && data.projectId) {
      const project = db.select().from(projects).where(eq(projects.id, data.projectId)).get();

      if (project && project.userId === user.id) {
        if (data.checks.projectAdherence) {
          activeChecks.push("adesão ao projeto");
          const glossary = db
            .select()
            .from(glossaryEntries)
            .where(eq(glossaryEntries.projectId, data.projectId))
            .all();

          if (glossary.length > 0) {
            projectContext += "\n**Glossário obrigatório:**\n";
            glossary.forEach((e) => {
              projectContext += `- "${e.originalTerm}" → "${e.translatedTerm}"${
                e.notes ? ` (${e.notes})` : ""
              }\n`;
            });
          }
          if (project.styleNotes) {
            projectContext += `\n**Notas de estilo:**\n${project.styleNotes}\n`;
          }
        }

        if (data.checks.styleGuide) {
          const guide = db
            .select()
            .from(styleGuides)
            .where(eq(styleGuides.projectId, data.projectId))
            .get();

          if (guide?.parsedRules && Array.isArray(guide.parsedRules)) {
            activeChecks.push("guia de estilo");
            projectContext += `\n**Regras do Guia de Estilo (${guide.fileName}):**\n`;
            guide.parsedRules.forEach((rule: unknown) => {
              if (rule && typeof rule === "object" && "description" in rule) {
                projectContext += `- ${(rule as { description: string }).description}\n`;
              }
            });
          }
        }
      }
    }

    const systemPrompt = `Você é um revisor especialista em tradução para o Português do Brasil.
Verifique: ${activeChecks.join(", ")}.
${projectContext}

Retorne APENAS JSON:
{
  "corrected_text": "texto corrigido",
  "notes": [
    {
      "id": "note_1",
      "type": "Gramática|Semântica|Fluência|Projeto|Guia",
      "original_fragment": "trecho exato do original",
      "corrected_fragment": "versão corrigida",
      "explanation": "explicação educativa",
      "severity": "low|medium|high"
    }
  ],
  "summary": "resumo da qualidade",
  "score": 85
}`;

    const userPrompt = data.originalText
      ? `Original:\n${data.originalText}\n\nTradução:\n${data.text}`
      : `Texto:\n${data.text}`;

    const response = await openai.chat.completions.create({
      model: OPENROUTER_MODEL,
      max_tokens: 3000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawJson = response.choices[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(rawJson);
      return {
        originalText: data.text,
        correctedText: parsed.corrected_text || data.text,
        notes: parsed.notes || [],
        summary: parsed.summary || "",
        score: typeof parsed.score === "number" ? Math.min(100, Math.max(0, parsed.score)) : 80,
      };
    } catch {
      return {
        originalText: data.text,
        correctedText: data.text,
        notes: [],
        summary: "Não foi possível analisar.",
        score: 0,
      };
    }
  });
