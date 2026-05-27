import { eventHandler, readBody, setResponseHeaders, getCookie } from "h3";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "../../lib/prompts";
import { lucia } from "../../lib/auth/lucia";
import process from "node:process";

export default eventHandler(async (event) => {
  const body = (await readBody(event)) as {
    projectId?: string;
    domainSlug?: string;
    sessionType?: "translation" | "review";
    message?: string;
    history?: { role: "user" | "assistant"; content: string }[];
  };
  const { projectId, domainSlug, sessionType, message, history } = body;

  const sessionId = getCookie(event, "auth_session");
  if (!sessionId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!message) {
    return new Response("Bad request", { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = await buildSystemPrompt(
    domainSlug || "audiovisual",
    projectId,
    sessionType || "translation",
  );

  const messages: Anthropic.MessageParam[] = [
    ...(history || []),
    { role: "user" as const, content: message },
  ];

  setResponseHeaders(event, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            const data = JSON.stringify({ text: chunk.delta.text });
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

  return new Response(readable);
});
