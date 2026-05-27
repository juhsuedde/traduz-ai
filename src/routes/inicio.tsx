import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { useChat, type ChatMessage } from "@/hooks/use-chat";
import { getUserProjects, getDomains } from "@/lib/api/projects.functions";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { setActiveProject } from "@/lib/active-project-store";
import { QuickSettingsPanel } from "@/components/quick-settings-panel";
import {
  setProjectSettings,
  setSessionSettings,
  shortLabel,
  useQuickSettings,
} from "@/lib/quick-settings";

export const Route = createFileRoute("/inicio")({
  head: () => ({
    meta: [
      { title: "Início · traduz.ai" },
      { name: "description", content: "Traduza e revise textos em conversa direta com a IA." },
    ],
  }),
  component: ChatPage,
});

const DOMAIN_NAMES = ["Audiovisual", "Literária", "Games", "Técnica", "Jurídica"] as const;

const SLUG_MAP: Record<string, string> = {
  audiovisual: "Audiovisual",
  literary: "Literária",
  games: "Games",
  technical: "Técnica",
  legal: "Jurídica",
};

const DOMAIN_TO_SLUG: Record<string, string> = {
  Audiovisual: "audiovisual",
  Literária: "literary",
  Games: "games",
  Técnica: "technical",
  Jurídica: "legal",
};

function ChatPage() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"traducao" | "revisao">("traducao");
  const [domain, setDomain] = useState<string>("Audiovisual");
  const [projectId, setProjectId] = useState<string>("none");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const projectSlug = DOMAIN_TO_SLUG[domain] ?? "audiovisual";

  const { messages, sendMessage, isStreaming } = useChat({
    userId: user?.id ?? "",
    domainSlug: projectSlug,
    projectId: projectId !== "none" ? projectId : undefined,
    sessionType: mode === "revisao" ? "review" : "translation",
  });

  const { data: domainsList } = useQuery({
    queryKey: ["domains"],
    queryFn: () => getDomains({}),
  });

  const { data: projectsList } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getUserProjects({}),
    enabled: !!user,
  });

  const activeProject = projectsList?.find((p) => p.id === projectId);
  const settings = useQuickSettings(activeProject ? activeProject.id : null);
  const effectiveDomain = activeProject
    ? (SLUG_MAP[domainsList?.find((d) => d.id === activeProject.domainId)?.slug ?? ""] ?? domain)
    : domain;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    setActiveProject(
      activeProject
        ? {
            id: activeProject.id,
            name: activeProject.name,
            domain: effectiveDomain,
          }
        : null,
    );
  }, [activeProject, effectiveDomain]);

  const updateSettings = (s: typeof settings) => {
    if (activeProject) setProjectSettings(activeProject.id, s);
    else setSessionSettings(s);
  };

  const send = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage(text);
  };

  return (
    <AppShell>
      <section className="glass rounded-3xl flex flex-col overflow-hidden h-[calc(100vh-110px)] min-h-[560px]">
        {/* Top bar */}
        <div className="px-5 py-3 border-b border-white/40 flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="appearance-none bg-white/70 hover:bg-white text-sm font-medium pl-4 pr-9 py-2 rounded-2xl outline-none cursor-pointer transition"
            >
              {DOMAIN_NAMES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
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
              {(projectsList ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>

          {activeProject && (
            <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-200/70 to-purple-200/70 text-purple-950 font-medium">
              {activeProject.name}
            </span>
          )}

          <button
            onClick={() => setSettingsOpen((v) => !v)}
            className={`inline-flex items-center gap-2 text-xs font-medium rounded-2xl transition ${
              settingsOpen
                ? "bg-gradient-to-r from-pink-200 to-purple-200 text-purple-950 pl-3 pr-3 py-2 gap-2"
                : "bg-white/70 hover:bg-white text-foreground w-9 h-9 justify-center"
            }`}
            aria-label="Ajustes rápidos"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {settingsOpen && (
              <>
                <span>{shortLabel(settings)}</span>
                <ChevronDown className="w-3.5 h-3.5 transition rotate-180" />
              </>
            )}
          </button>

          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5" /> traduz.ai
          </div>
        </div>

        {settingsOpen && (
          <div className="px-5 py-4 border-b border-white/40 bg-white/30 animate-fade-in">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="text-sm font-medium">Ajustes rápidos</div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/70 text-muted-foreground flex items-center justify-center"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <QuickSettingsPanel
              value={settings}
              onChange={updateSettings}
              domain={effectiveDomain}
              projectName={activeProject?.name ?? null}
              projectContext={null}
              helperText={
                activeProject
                  ? `Alterações são salvas automaticamente no projeto "${activeProject.name}".`
                  : "Sem projeto selecionado — os ajustes valem só para esta sessão."
              }
            />
          </div>
        )}

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
          {isStreaming && messages[messages.length - 1]?.content === "" && (
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
                  mode === "traducao"
                    ? "bg-gradient-to-r from-pink-300 to-purple-300 text-white shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Modo Tradução
              </button>
              <button
                onClick={() => setMode("revisao")}
                className={`px-4 py-1.5 rounded-full transition ${
                  mode === "revisao"
                    ? "bg-gradient-to-r from-sky-300 to-teal-300 text-white shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Modo Revisão
              </button>
            </div>
          </div>

          <div className="flex items-end gap-2 bg-white/70 rounded-2xl p-2 pl-3">
            <button
              className="w-9 h-9 rounded-xl hover:bg-white/80 text-muted-foreground flex items-center justify-center transition shrink-0"
              aria-label="Anexar arquivo"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-xl hover:bg-white/80 text-muted-foreground flex items-center justify-center transition shrink-0"
              aria-label="Anexar imagem"
            >
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
