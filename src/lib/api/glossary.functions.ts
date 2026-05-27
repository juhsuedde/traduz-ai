import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie } from "@tanstack/react-start/server";
import { db } from "../db";
import { glossaryEntries, projects } from "../db/schema";
import { eq } from "drizzle-orm";
import { lucia } from "../auth/lucia";

async function getAuthUser() {
  const sessionId = getCookie("auth_session");
  if (!sessionId) throw new Error("Não autenticado");

  const { user } = await lucia.validateSession(sessionId);
  if (!user) throw new Error("Sessão inválida");

  return user;
}

const GlossaryEntrySchema = z.object({
  projectId: z.string().uuid(),
  originalTerm: z.string().min(1).max(500),
  translatedTerm: z.string().min(1).max(500),
  notes: z.string().max(1000).optional(),
  tag: z.string().max(100).optional(),
});

export const addGlossaryEntry = createServerFn({ method: "POST" })
  .inputValidator(GlossaryEntrySchema)
  .handler(async ({ data }) => {
    const user = await getAuthUser();

    const project = db.select().from(projects).where(eq(projects.id, data.projectId)).get();

    if (!project || project.userId !== user.id) {
      throw new Error("Projeto não encontrado");
    }

    const entry = db.insert(glossaryEntries).values(data).returning().get();
    return entry;
  });

export const deleteGlossaryEntry = createServerFn({ method: "POST" })
  .inputValidator(z.object({ entryId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await getAuthUser();

    const entry = db
      .select()
      .from(glossaryEntries)
      .where(eq(glossaryEntries.id, data.entryId))
      .get();

    if (!entry) throw new Error("Entrada não encontrada");

    const project = db.select().from(projects).where(eq(projects.id, entry.projectId)).get();

    if (!project || project.userId !== user.id) {
      throw new Error("Sem permissão");
    }

    db.delete(glossaryEntries).where(eq(glossaryEntries.id, data.entryId)).run();
    return { success: true };
  });

export const replaceProjectGlossary = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      projectId: z.string().uuid(),
      entries: z.array(
        z.object({
          originalTerm: z.string().min(1).max(500),
          translatedTerm: z.string().min(1).max(500),
          notes: z.string().max(1000).optional(),
          tag: z.string().max(100).optional(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthUser();

    const project = db.select().from(projects).where(eq(projects.id, data.projectId)).get();

    if (!project || project.userId !== user.id) {
      throw new Error("Projeto não encontrado");
    }

    db.delete(glossaryEntries).where(eq(glossaryEntries.projectId, data.projectId)).run();

    if (data.entries.length > 0) {
      db.insert(glossaryEntries)
        .values(data.entries.map((e) => ({ ...e, projectId: data.projectId })))
        .run();
    }

    return { success: true, count: data.entries.length };
  });
