import { useState, useRef, useCallback } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type UseChatOptions = {
  userId?: string;
  domainSlug?: string;
  projectId?: string;
  sessionType?: "translation" | "review";
};

type UseChatReturn = {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isStreaming: boolean;
  clearMessages: () => void;
};

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: ChatMessage = { role: "user", content: text };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);

      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const abortController = new AbortController();
        abortRef.current = abortController;

        const response = await fetch("/api/chat-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domainSlug: options.domainSlug || "audiovisual",
            projectId: options.projectId,
            sessionType: options.sessionType || "translation",
            message: text,
            history,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);

            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload);
              if (parsed.text) {
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === "assistant") {
                    copy[copy.length - 1] = {
                      ...last,
                      content: last.content + parsed.text,
                    };
                  }
                  return copy;
                });
              }
              if (parsed.error) {
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === "assistant") {
                    copy[copy.length - 1] = {
                      ...last,
                      content: `Erro: ${parsed.error}`,
                    };
                  }
                  return copy;
                });
              }
            } catch {
              // skip malformed JSON chunks
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Erro: ${(err as Error).message}`,
          },
        ]);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, options],
  );

  return { messages, sendMessage, isStreaming, clearMessages };
}
