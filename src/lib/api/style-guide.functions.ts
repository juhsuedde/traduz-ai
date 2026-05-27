import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie } from "@tanstack/react-start/server";
import { db } from "../db";
import { projects, styleGuides } from "../db/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { lucia } from "../auth/lucia";

async function getAuthUser() {
  const sessionId = getCookie("auth_session");
  if (!sessionId) throw new Error("Não autenticado");

  const { user } = await lucia.validateSession(sessionId);
  if (!user) throw new Error("Sessão inválida");

  return user;
}

const UPLOAD_DIR = "./uploads/style-guides";

export const uploadStyleGuide = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      projectId: z.string().uuid(),
      fileName: z.string(),
      fileContent: z.string(),
      mimeType: z.string(),
      fileSize: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthUser();

    const project = db.select().from(projects).where(eq(projects.id, data.projectId)).get();

    if (!project || project.userId !== user.id) {
      throw new Error("Projeto não encontrado");
    }

    const userDir = join(UPLOAD_DIR, user.id, data.projectId);
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = join(userDir, `${timestamp}_${safeName}`);

    const buffer = Buffer.from(data.fileContent, "base64");
    await writeFile(filePath, buffer);

    const guide = db
      .insert(styleGuides)
      .values({
        projectId: data.projectId,
        fileName: data.fileName,
        fileUrl: filePath,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        parsingStatus: "pending",
      })
      .returning()
      .get();

    db.update(projects)
      .set({
        styleGuideUrl: filePath,
        styleGuideFilename: data.fileName,
      })
      .where(eq(projects.id, data.projectId))
      .run();

    return guide;
  });
