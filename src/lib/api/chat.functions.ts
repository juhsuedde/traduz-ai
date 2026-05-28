import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie } from "@tanstack/react-start/server";
import { db } from "../db";
import { chatSessions, messages, domains } from "../db/schema";
import { eq } from "drizzle-orm";
import { buildSystemPrompt } from "../prompts";
import { lucia } from "../auth/lucia";
import { getOpenRouterClient, OPENROUTER_MODEL } from "./openrouter";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const ChatInputSchema = z.object({
  sessionId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  domainSlug: z.string().default("audiovisual"),
  sessionType: z.enum(["translation", "review"]).default("translation"),
  message: z.string().min(1).max(10000),
  history: z.array(MessageSchema).max(20).default([]),
});

async function getAuthUser() {
  const sessionId = getCookie("auth_session");
  if (!sessionId) throw new Error("Não autenticado");

  const { user } = await lucia.validateSession(sessionId);
  if (!user) throw new Error("Sessão inválida");
  return user;
}

export const getOrCreateSession = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sessionId: z.string().uuid().optional(),
      projectId: z.string().uuid().optional(),
      domainSlug: z.string().default("audiovisual"),
      sessionType: z.enum(["translation", "review"]).default("translation"),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthUser();

    if (data.sessionId) {
      const session = db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.id, data.sessionId))
        .get();
      if (session && session.userId === user.id) return session;
    }

    const domain = db.select().from(domains).where(eq(domains.slug, data.domainSlug)).get();

    const session = db
      .insert(chatSessions)
      .values({
        userId: user.id,
        projectId: data.projectId || null,
        domainId: domain?.id,
        sessionType: data.sessionType,
        title: "Nova conversa",
      })
      .returning()
      .get();

    return session;
  });

export const saveMessage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sessionId: z.string().uuid(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      tokensUsed: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const message = db.insert(messages).values(data).returning().get();
    return message;
  });

export const getSessionMessages = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sessionId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await getAuthUser();

    const session = db.select().from(chatSessions).where(eq(chatSessions.id, data.sessionId)).get();

    if (!session || session.userId !== user.id) {
      throw new Error("Sessão não encontrada");
    }

    return db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, data.sessionId))
      .orderBy(messages.createdAt)
      .all();
  });

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator(ChatInputSchema)
  .handler(async ({ data }) => {
    const user = await getAuthUser();
    const openai = getOpenRouterClient();

    const systemPrompt = await buildSystemPrompt(data.domainSlug, data.projectId, data.sessionType);

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...data.history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: data.message },
    ];

    const response = await openai.chat.completions.create({
      model: OPENROUTER_MODEL,
      max_tokens: 2000,
      messages,
    });

    const assistantMessage = response.choices[0]?.message?.content || "";
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;

    return {
      message: assistantMessage,
      tokensUsed: inputTokens + outputTokens,
    };
  });
