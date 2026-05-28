import { eventHandler, readBody, setResponseHeaders, getCookie } from "h3";
import { createChatStream } from "../../lib/api/chat-stream-handler";

export default eventHandler(async (event) => {
  const body = (await readBody(event)) as {
    projectId?: string;
    domainSlug?: string;
    sessionType?: "translation" | "review";
    message?: string;
    history?: { role: "user" | "assistant"; content: string }[];
  };

  const sessionId = getCookie(event, "auth_session");
  if (!sessionId) {
    return new Response("Unauthorized", { status: 401 });
  }

  setResponseHeaders(event, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const readable = await createChatStream({ ...body, sessionId });
  return new Response(readable);
});
