import { db } from "./db";
import { domains, projects, glossaryEntries, styleGuides } from "./db/schema";
import { eq } from "drizzle-orm";

export async function buildSystemPrompt(
  domainSlug: string,
  projectId?: string | null,
  sessionType: "translation" | "review" = "translation",
): Promise<string> {
  const domain = db.select().from(domains).where(eq(domains.slug, domainSlug)).get();
  if (!domain) throw new Error("Domínio não encontrado");

  const parts: string[] = [];
  parts.push(domain.basePrompt);

  if (projectId) {
    const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
    if (project) {
      parts.push("\n---\n## Contexto do Projeto Ativo\n");
      parts.push(`**Projeto:** ${project.name}`);

      if (project.synopsis) parts.push(`\n**Sinopse:** ${project.synopsis}`);
      if (project.characters) parts.push(`\n**Personagens:**\n${project.characters}`);
      if (project.styleNotes) parts.push(`\n**Notas de estilo:** ${project.styleNotes}`);

      const glossary = db
        .select()
        .from(glossaryEntries)
        .where(eq(glossaryEntries.projectId, projectId))
        .all();

      if (glossary.length > 0) {
        parts.push("\n**Glossário fixo (OBRIGATÓRIO respeitar):**");
        glossary.forEach((entry) => {
          const note = entry.notes ? ` — ${entry.notes}` : "";
          parts.push(`- "${entry.originalTerm}" → "${entry.translatedTerm}"${note}`);
        });
        parts.push("\nEsses termos são fixados pelo tradutor. Nunca os altere.");
      }

      const guide = db.select().from(styleGuides).where(eq(styleGuides.projectId, projectId)).get();

      if (guide?.parsedRules && Array.isArray(guide.parsedRules) && guide.parsedRules.length > 0) {
        parts.push("\n**Regras do Guia de Estilo:**");
        guide.parsedRules.forEach((rule: unknown) => {
          if (typeof rule === "string") parts.push(`- ${rule}`);
        });
      }
    }
  }

  if (sessionType === "review") {
    parts.push(
      "\n---\n## Modo de Revisão\nVocê está em modo revisão. Analise o texto fornecido e:\n1. Aponte problemas de gramática, semântica e fluência\n2. Sugira correções específicas\n3. Explique o raciocínio de cada correção\n4. Retorne o texto corrigido completo",
    );
  } else {
    parts.push("\n---\nAgora traduza o texto fornecido seguindo todas as diretrizes acima.");
  }

  return parts.join("\n");
}
