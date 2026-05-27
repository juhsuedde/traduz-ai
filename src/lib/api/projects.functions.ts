import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie } from "@tanstack/react-start/server";
import { db } from "../db";
import { projects, domains, glossaryEntries } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { lucia } from "../auth/lucia";

async function getAuthUser() {
  const sessionId = getCookie("auth_session");
  if (!sessionId) throw new Error("Não autenticado");

  const { user } = await lucia.validateSession(sessionId);
  if (!user) throw new Error("Sessão inválida");

  return user;
}

const ProjectCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  domainId: z.string().uuid().optional(),
  description: z.string().max(1000).optional(),
  synopsis: z.string().max(5000).optional(),
  characters: z.string().max(5000).optional(),
  styleNotes: z.string().max(3000).optional(),
});

const ProjectUpdateSchema = ProjectCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export const getDomains = createServerFn({ method: "GET" }).handler(async () => {
  return db.select().from(domains).all();
});

export const getUserProjects = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getAuthUser();
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.updatedAt))
    .all();
});

export const getProjectById = createServerFn({ method: "POST" })
  .inputValidator(z.object({ projectId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await getAuthUser();

    const project = db.select().from(projects).where(eq(projects.id, data.projectId)).get();

    if (!project || project.userId !== user.id) {
      throw new Error("Projeto não encontrado");
    }

    const glossary = db
      .select()
      .from(glossaryEntries)
      .where(eq(glossaryEntries.projectId, data.projectId))
      .all();

    return { ...project, glossary };
  });

export const createProject = createServerFn({ method: "POST" })
  .inputValidator(ProjectCreateSchema)
  .handler(async ({ data }) => {
    const user = await getAuthUser();

    const project = db
      .insert(projects)
      .values({ ...data, userId: user.id })
      .returning()
      .get();

    return project;
  });

export const updateProject = createServerFn({ method: "POST" })
  .inputValidator(ProjectUpdateSchema)
  .handler(async ({ data }) => {
    const user = await getAuthUser();
    const { id, ...updates } = data;

    const existing = db.select().from(projects).where(eq(projects.id, id)).get();

    if (!existing || existing.userId !== user.id) {
      throw new Error("Projeto não encontrado");
    }

    const project = db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning()
      .get();

    return project;
  });

export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator(z.object({ projectId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await getAuthUser();

    const existing = db.select().from(projects).where(eq(projects.id, data.projectId)).get();

    if (!existing || existing.userId !== user.id) {
      throw new Error("Projeto não encontrado");
    }

    db.delete(projects).where(eq(projects.id, data.projectId)).run();
    return { success: true };
  });
