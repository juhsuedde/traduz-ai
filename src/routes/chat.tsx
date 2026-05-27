import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { conversations as seed, type ChatMessage } from "@/lib/mock-data";
import { Send, Plus, Sparkles } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Assistant · traduz.ai" },
      { name: "description", content: "Chat with your translation assistant." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [activeId, setActiveId] = useState(seed[0].id);
  const [messagesById, setMessagesById] = useState<Record<string, ChatMessage[]>>(
    Object.fromEntries(seed.map((c) => [c.id, c.messages])),
  );
  const [input, setInput] = useState("");

  const active = seed.find((c) => c.id === activeId)!;
  const messages = messagesById[activeId] ?? [];

  const send = () => {
    if (!input.trim()) return;
    const next: ChatMessage[] = [
      ...messages,
      { role: "user", content: input },
      { role: "assistant", content: "(Mock reply) Got it — I'd suggest keeping it concise and matching the brand's playful register." },
    ];
    setMessagesById({ ...messagesById, [activeId]: next });
    setInput("");
  };

  return (
    <AppShell>
      <PageHeader title="Assistant" subtitle="A second pair of eyes, always nearby." />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 h-[calc(100vh-220px)] min-h-[520px]">
        {/* Conversations list */}
        <aside className="glass rounded-3xl p-3 flex flex-col gap-2 overflow-hidden">
          <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition mb-1">
            <Plus className="w-4 h-4" /> New chat
          </button>
          <div className="overflow-y-auto flex flex-col gap-1.5 pr-1">
            {seed.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`text-left p-3 rounded-2xl transition ${
                  c.id === activeId ? "bg-white/70 shadow-sm" : "hover:bg-white/40"
                }`}
              >
                <div className="text-xs text-muted-foreground mb-1">{c.project} · {c.updated}</div>
                <div className="text-sm font-medium leading-snug line-clamp-2">{c.title}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat panel */}
        <section className="glass rounded-3xl flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-white/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold leading-tight">{active.title}</div>
              <div className="text-xs text-muted-foreground">{active.project}</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {messages.map((m, i) => (
              <Bubble key={i} message={m} />
            ))}
          </div>

          <div className="p-4 border-t border-white/40">
            <div className="flex items-end gap-2 bg-white/70 rounded-2xl p-2 pl-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask anything — a tone tweak, a term, a rewrite…"
                rows={1}
                className="flex-1 bg-transparent outline-none text-sm resize-none py-2 placeholder:text-muted-foreground"
              />
              <button
                onClick={send}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 text-white flex items-center justify-center hover:opacity-90 transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-5 py-3 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-gradient-to-br from-pink-200 to-purple-200 text-purple-950 rounded-br-md"
            : "bg-white/80 text-foreground rounded-bl-md"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}