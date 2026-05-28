import { buildSystemPrompt } from "../prompts";
import { lucia } from "../auth/lucia";
import { getOpenRouterClient, OPENROUTER_MODEL } from "./openrouter";

export type ChatStreamInput = {
  projectId?: string;
  domainSlug?: string;
  sessionType?: "translation" | "review";
  message?: string;
  history?: { role: "user" | "assistant"; content: string }[];
  sessionId: string;
};

export async function createChatStream(input: ChatStreamInput): Promise<ReadableStream> {
  if (!input.sessionId) {
    return errorStream("Unauthorized");
  }

  const { user } = await lucia.validateSession(input.sessionId);
  if (!user) {
    return errorStream("Unauthorized");
  }

  if (!input.message) {
    return errorStream("Bad request");
  }

  const openai = getOpenRouterClient();

  const systemPrompt = await buildSystemPrompt(
    input.domainSlug || "audiovisual",
    input.projectId,
    input.sessionType || "translation",
  );

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...(input.history || []),
    { role: "user" as const, content: input.message },
  ];

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        const stream = await openai.chat.completions.create({
          model: OPENROUTER_MODEL,
          max_tokens: 2000,
          messages,
          stream: true,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            const data = JSON.stringify({ text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });
}

function errorStream(msg: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}
