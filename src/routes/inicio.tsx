import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { projects, type ChatMessage } from "@/lib/mock-data";
import { Send, Paperclip, Image as ImageIcon, ChevronDown, Sparkles } from "lucide-react";
import { setActiveProject } from "@/lib/active-project-store";

export const Route = createFileRoute("/inicio")({
  head: () => ({
    meta: [
      { title: "Início · traduz.ai" },
      { name: "description", content: "Traduza e revise textos em conversa direta com a IA." },
    ],
  }),
  component: ChatPage,
});

const DOMAINS = ["Audiovisual", "Literária", "Games", "Técnica", "Jurídica"] as const;

const INITIAL_MESSAGES: ChatMessage[] = [
  { role: "user", content: "I can't believe you actually did that." },
  { role: "assistant", content: "Não acredito que você realmente fez isso." },
  { role: "user", content: "It's not like I had a choice." },
  { role: "assistant", content: "Não é como se eu tivesse escolha." },
];

const MOCK_REPLIES = [
  "Aqui vai uma sugestão natural em PT-BR, mantendo o tom original.",
  "Tradução pronta — ajustei o ritmo para soar mais fluido em português.",
  "Mantive o sentido original e suavizei a construção para o leitor brasileiro.",
];

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"traducao" | "revisao">("traducao");
  const [domain, setDomain] = useState<(typeof DOMAINS)[number]>("Audiovisual");
  const [projectId, setProjectId] = useState<string>("none");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    setActiveProject(
      activeProject
        ? { id: activeProject.id, name: activeProject.name, domain: activeProject.domain }
        : null,
    );
  }, [activeProject]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setTyping(true);
    const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
    typeOut(reply);
  };

  const typeOut = (full: string) => {
    let i = 0;
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    const interval = setInterval(() => {
      i += 2;
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: full.slice(0, i) };
        return copy;
      });
      if (i >= full.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 25);
  };

  return (
    <AppShell>
      <section className="glass rounded-3xl flex flex-col overflow-hidden h-[calc(100vh-110px)] min-h-[560px]">
        {/* Top bar */}
        <div className="px-5 py-3 border-b border-white/40 flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value as (typeof DOMAINS)[number])}
              className="appearance-none bg-white/70 hover:bg-white text-sm font-medium pl-4 pr-9 py-2 rounded-2xl outline-none cursor-pointer transition"
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>

          <div className="relative">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="appearance-none bg-white/70 hover:bg-white text-sm pl-4 pr-9 py-2 rounded-2xl outline-none cursor-pointer transition"
            >
              <option value="none">Nenhum projeto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>

          {activeProject && (
            <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-200/70 to-purple-200/70 text-purple-950 font-medium">
              {activeProject.name}
            </span>
          )}

          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5" /> traduz.ai
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="m-auto text-center text-sm text-muted-foreground">
              Envie um texto para começar a traduzir 👇
            </div>
          )}
          {messages.map((m, i) => (
            <Bubble key={i} message={m} />
          ))}
          {typing && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="bg-white/80 rounded-3xl rounded-bl-md px-5 py-3 text-sm">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mode toggle + Composer */}
        <div className="p-4 border-t border-white/40 flex flex-col gap-3">
          <div className="flex justify-center">
            <div className="inline-flex bg-white/60 rounded-full p-1 text-xs font-medium">
              <button
                onClick={() => setMode("traducao")}
                className={`px-4 py-1.5 rounded-full transition ${
                  mode === "traducao" ? "bg-gradient-to-r from-pink-300 to-purple-300 text-white shadow-sm" : "text-muted-foreground"
                }`}
              >
                Modo Tradução
              </button>
              <button
                onClick={() => setMode("revisao")}
                className={`px-4 py-1.5 rounded-full transition ${
                  mode === "revisao" ? "bg-gradient-to-r from-sky-300 to-teal-300 text-white shadow-sm" : "text-muted-foreground"
                }`}
              >
                Modo Revisão
              </button>
            </div>
          </div>

          <div className="flex items-end gap-2 bg-white/70 rounded-2xl p-2 pl-3">
            <button className="w-9 h-9 rounded-xl hover:bg-white/80 text-muted-foreground flex items-center justify-center transition shrink-0" aria-label="Anexar arquivo">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-xl hover:bg-white/80 text-muted-foreground flex items-center justify-center transition shrink-0" aria-label="Anexar imagem">
              <ImageIcon className="w-4 h-4" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Digite o texto para traduzir..."
              rows={1}
              className="flex-1 bg-transparent outline-none text-sm resize-none py-2 placeholder:text-muted-foreground max-h-32"
            />
            <button
              onClick={send}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 text-white flex items-center justify-center hover:opacity-90 transition shrink-0"
              aria-label="Enviar"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  if (!message.content) return null;
  return (
    <div className={`flex animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}>
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