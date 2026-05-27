import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { getCookie } from "@tanstack/react-start/server";
import { buildSystemPrompt } from "../prompts";
import {
  parseSRT,
  parseTXT,
  parseDOCX,
  reconstructSRT,
  reconstructTXT,
  type ProcessedFile,
} from "../file-processors.server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import process from "node:process";
import { lucia } from "../auth/lucia";

const UPLOAD_DIR = "./uploads/translations";
const BATCH_SIZE = 10;

async function getAuthUser() {
  const sessionId = getCookie("auth_session");
  if (!sessionId) throw new Error("Não autenticado");

  const { user } = await lucia.validateSession(sessionId);
  if (!user) throw new Error("Sessão inválida");
  return user;
}

async function translateBatch(
  segments: Array<{ id: string; original: string }>,
  systemPrompt: string,
  anthropic: Anthropic,
) {
  const input = JSON.stringify(segments.map((s) => ({ id: s.id, text: s.original })));
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: systemPrompt + '\n\nRetorne APENAS JSON: [{"id": "1", "translated": "texto"}, ...]',
    messages: [{ role: "user", content: `Traduza:\n${input}` }],
  });
  const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
  try {
    return JSON.parse(raw);
  } catch {
    return segments.map((s) => ({ id: s.id, translated: s.original }));
  }
}

export const translateFile = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      projectId: z.string().uuid().optional(),
      domainSlug: z.string().default("audiovisual"),
      fileContent: z.string(),
      fileType: z.enum(["txt", "srt", "docx"]),
      fileName: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthUser();
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = await buildSystemPrompt(data.domainSlug, data.projectId, "translation");

    let parsed: ProcessedFile;
    if (data.fileType === "srt") {
      parsed = parseSRT(data.fileContent);
    } else if (data.fileType === "docx") {
      const buffer = Buffer.from(data.fileContent, "base64");
      parsed = await parseDOCX(buffer.buffer);
    } else {
      parsed = parseTXT(data.fileContent);
    }

    if (parsed.segments.length === 0) throw new Error("Arquivo vazio");
    if (parsed.segments.length > 500) throw new Error("Máximo 500 segmentos");

    const translations: Array<{ id: string; translated: string }> = [];
    for (let i = 0; i < parsed.segments.length; i += BATCH_SIZE) {
      const batch = parsed.segments.slice(i, i + BATCH_SIZE);
      const result = await translateBatch(batch, systemPrompt, anthropic);
      translations.push(...result);
    }

    let output: string;
    if (data.fileType === "srt") {
      output = reconstructSRT(parsed, translations);
    } else {
      output = reconstructTXT(translations);
    }

    const userDir = join(UPLOAD_DIR, user.id);
    if (!existsSync(userDir)) await mkdir(userDir, { recursive: true });

    const outputName = data.fileName.replace(/\.(srt|txt|docx)$/i, "_PT-BR.$1");
    const filePath = join(userDir, `${Date.now()}_${outputName}`);
    await writeFile(filePath, output);

    return {
      downloadUrl: filePath,
      segmentsTranslated: translations.length,
      fileName: outputName,
      fileType: data.fileType,
    };
  });
