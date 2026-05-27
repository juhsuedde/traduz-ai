import srtParser from "srt-parser-2";

export type ProcessedFile = {
  type: "txt" | "srt" | "docx";
  segments: Array<{ id: string; original: string; metadata?: Record<string, string> }>;
};

export function parseSRT(content: string): ProcessedFile {
  const parser = new srtParser();
  const entries = parser.fromSrt(content);
  return {
    type: "srt",
    segments: entries.map((e) => ({
      id: e.id,
      original: e.text,
      metadata: { startTime: e.startTime, endTime: e.endTime },
    })),
  };
}

export function parseTXT(content: string): ProcessedFile {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return {
    type: "txt",
    segments: paragraphs.map((p, i) => ({ id: String(i + 1), original: p })),
  };
}

export async function parseDOCX(buffer: ArrayBuffer): Promise<ProcessedFile> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const paragraphs = result.value
    .split("\n")
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);
  return {
    type: "docx",
    segments: paragraphs.map((p, i) => ({ id: String(i + 1), original: p })),
  };
}

export function reconstructSRT(
  original: ProcessedFile,
  translations: Array<{ id: string; translated: string }>,
): string {
  const map = new Map(translations.map((t) => [t.id, t.translated]));
  const lines: string[] = [];
  for (const seg of original.segments) {
    lines.push(
      seg.id,
      `${seg.metadata?.startTime} --> ${seg.metadata?.endTime}`,
      map.get(seg.id) || seg.original,
      "",
    );
  }
  return lines.join("\n");
}

export function reconstructTXT(translations: Array<{ id: string; translated: string }>): string {
  return translations.map((t) => t.translated).join("\n\n");
}
