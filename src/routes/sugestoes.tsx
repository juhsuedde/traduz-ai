import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Check,
  Send,
  Smile,
  Meh,
  Frown,
  FileText,
  X,
} from "lucide-react";

export const Route = createFileRoute("/sugestoes")({
  head: () => ({
    meta: [
      { title: "Sugestões — traduz.ai" },
      { name: "description", content: "Envie ideias para melhorar o traduz.ai" },
    ],
  }),
  component: SugestoesPage,
});

type SuggestionType =
  | "Melhoria no sistema"
  | "Melhoria na inteligência da IA"
  | "Novo conteúdo para Ajustes Rápidos"
  | "Novo domínio de tradução"
  | "Outro";

type Priority = "legal" | "importante" | "urgente";

type Status = "Em análise" | "Planejado" | "Em desenvolvimento" | "Implementado" | "Arquivado";

interface Suggestion {
  id: string;
  title: string;
  type: SuggestionType;
  description: string;
  example?: string;
  priority: Priority;
  date: string;
  status: Status;
}

const TYPE_OPTIONS: SuggestionType[] = [
  "Melhoria no sistema",
  "Melhoria na inteligência da IA",
  "Novo conteúdo para Ajustes Rápidos",
  "Novo domínio de tradução",
  "Outro",
];

const TYPE_BADGES: Record<SuggestionType, { bg: string; text: string }> = {
  "Melhoria no sistema": { bg: "bg-[#a0c4ff]/60", text: "text-[#1f3a7a]" },
  "Melhoria na inteligência da IA": { bg: "bg-[#c9b1ff]/60", text: "text-[#3d2a7a]" },
  "Novo conteúdo para Ajustes Rápidos": { bg: "bg-[#ffb5a7]/60", text: "text-[#7a2f24]" },
  "Novo domínio de tradução": { bg: "bg-[#a8e6cf]/60", text: "text-[#1f5b46]" },
  "Outro": { bg: "bg-[#e2e8f0]/80", text: "text-[#475569]" },
};

const STATUS_BADGES: Record<Status, { bg: string; text: string; icon?: React.ReactNode }> = {
  "Em análise": { bg: "bg-[#ffd6a5]/60", text: "text-[#7a4a14]" },
  "Planejado": { bg: "bg-[#a0c4ff]/60", text: "text-[#1f3a7a]" },
  "Em desenvolvimento": { bg: "bg-[#c9b1ff]/60", text: "text-[#3d2a7a]" },
  "Implementado": { bg: "bg-[#a8e6cf]/60", text: "text-[#1f5b46]", icon: <Check className="w-3 h-3" /> },
  "Arquivado": { bg: "bg-[#e2e8f0]/80", text: "text-[#475569]" },
};

const MOCK_HISTORY: Suggestion[] = [
  {
    id: "s1",
    title: "Adicionar ajuste 'Nível de formalidade por personagem' nos Ajustes Rápidos",
    type: "Novo conteúdo para Ajustes Rápidos",
    description:
      "Em traduções audiovisuais com múltiplos personagens, seria útil definir o nível de formalidade por personagem (ex: o idoso fala formal, o jovem fala casual). Isso ajudaria a IA a manter consistência de registro.",
    example:
      "Projeto 'Stranger Things': Hopper sempre formal, Eleven mais casual, Dustin com gírias leves.",
    priority: "importante",
    date: "Enviada há 3 dias",
    status: "Em análise",
  },
  {
    id: "s2",
    title: "A IA deveria reconhecer gírias britânicas automaticamente",
    type: "Melhoria na inteligência da IA",
    description:
      "Textos britânicos usam expressões como 'chuffed', 'gobsmacked', 'knackered'. A IA às vezes traduz literalmente. Seria ótimo se ela detectasse regionalismo britânico e adaptasse para equivalentes brasileiros.",
    example:
      "'I'm knackered' → 'Tô morto de cansaço' (não 'Estou ferrado de cansaço').",
    priority: "importante",
    date: "Enviada há 2 semanas",
    status: "Implementado",
  },
  {
    id: "s3",
    title: "Botão de copiar tradução com um clique",
    type: "Melhoria no sistema",
    description:
      "Depois de receber uma tradução no chat, preciso selecionar tudo e copiar manualmente. Um botão 'Copiar' ao lado de cada mensagem da IA seria muito prático.",
    example: "Ícone de cópia no canto superior direito de cada resposta da IA.",
    priority: "legal",
    date: "Enviada há 5 dias",
    status: "Planejado",
  },
];

function SugestoesPage() {
  const [submitted, setSubmitted] = useState(false);
  const [history] = useState<Suggestion[]>(MOCK_HISTORY);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [type, setType] = useState<SuggestionType>("Melhoria no sistema");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [example, setExample] = useState("");
  const [priority, setPriority] = useState<Priority>("importante");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setType("Melhoria no sistema");
      setTitle("");
      setDescription("");
      setExample("");
      setPriority("importante");
      setAttachment(null);
    }, 4000);
  };

  const handleAttach = () => {
    setAttachment("screenshot_traduz.png");
  };

  const handleRemoveAttach = () => {
    setAttachment(null);
  };

  const priorityMeta: Record<
    Priority,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    legal: { label: "Seria legal ter", icon: <Smile className="w-4 h-4" />, color: "bg-[#a8e6cf]/60 text-[#1f5b46]" },
    importante: { label: "Importante para meu trabalho", icon: <Meh className="w-4 h-4" />, color: "bg-[#ffd6a5]/60 text-[#7a4a14]" },
    urgente: { label: "Urgente, não consigo sem isso", icon: <Frown className="w-4 h-4" />, color: "bg-[#ffb5a7]/60 text-[#7a2f24]" },
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-8 animate-fade-in pb-10">
      {/* Header */}
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-amber-400" />
          Envie sua sugestão
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Você usa o traduz.ai todo dia. Sua opinião molda o que vem por aí.
        </p>
      </header>

      {/* Formulário / Confirmação */}
      <div className="glass rounded-3xl p-6 md:p-8 card-hover relative overflow-hidden">
        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-5 py-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a8e6cf] to-[#c9b1ff] flex items-center justify-center shadow-lg">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Obrigado!</h3>
              <p className="text-muted-foreground mt-1 text-sm max-w-sm mx-auto">
                Sua sugestão foi registrada e será analisada pela equipe. 💜
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Tipo */}
            <div className="relative">
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Tipo de sugestão
              </label>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-white/70 rounded-2xl px-4 py-2.5 text-sm border border-white/60 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <span>{type}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full glass-strong rounded-2xl overflow-hidden shadow-lg">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setType(opt);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/50 transition ${
                        type === opt ? "bg-white/40 font-medium" : ""
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Título */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Título
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dê um título curto à sua ideia"
                className="w-full bg-white/70 rounded-2xl px-4 py-2.5 text-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-muted-foreground/60"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Exemplo: "Adicionar ajuste de 'Época/Região histórica' nos Ajustes Rápidos"
              </p>
            </div>

            {/* Descrição */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conte com detalhes o que você imagina..."
                rows={4}
                className="w-full bg-white/70 rounded-2xl px-4 py-3 text-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none placeholder:text-muted-foreground/60"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Quanto mais contexto, melhor! Explique o problema que isso resolveria ou a oportunidade que criaria.
              </p>
            </div>

            {/* Exemplo de uso */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Exemplo de uso <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <textarea
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="Se quiser, mostre um exemplo prático"
                rows={2}
                className="w-full bg-white/70 rounded-2xl px-4 py-3 text-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Prioridade */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Quão importante isso é para você?
              </label>
              <div className="flex gap-2">
                {(["legal", "importante", "urgente"] as Priority[]).map((p) => {
                  const meta = priorityMeta[p];
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-medium transition ${
                        active
                          ? `${meta.color} shadow-sm ring-1 ring-white/60`
                          : "bg-white/40 text-muted-foreground hover:bg-white/60"
                      }`}
                    >
                      {meta.icon}
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Anexo */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Anexo <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              {attachment ? (
                <div className="inline-flex items-center gap-2 bg-white/60 rounded-2xl px-4 py-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{attachment}</span>
                  <button
                    onClick={handleRemoveAttach}
                    className="w-6 h-6 rounded-lg hover:bg-white flex items-center justify-center text-muted-foreground transition"
                    aria-label="Remover anexo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAttach}
                  className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-2xl bg-white/60 hover:bg-white transition"
                >
                  <Paperclip className="w-4 h-4" />
                  Anexar screenshot ou arquivo
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !description.trim()}
              className="mt-2 inline-flex items-center justify-center gap-2 w-full md:w-auto self-start px-8 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-4 h-4" />
              Enviar sugestão
            </button>
          </div>
        )}
      </div>

      {/* Histórico */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Suas sugestões enviadas
        </h2>

        {history.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center flex flex-col items-center gap-3">
            <Lightbulb className="w-10 h-10 text-muted-foreground/40" />
            <div>
              <p className="text-sm text-muted-foreground">
                Você ainda não enviou nenhuma sugestão
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Seja o primeiro a moldar o futuro do traduz.ai!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((s) => {
              const expanded = expandedId === s.id;
              const typeStyle = TYPE_BADGES[s.type];
              const statusStyle = STATUS_BADGES[s.status];
              return (
                <div
                  key={s.id}
                  className="glass rounded-3xl p-5 card-hover transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold leading-snug flex-1">
                        {s.title}
                      </h3>
                      <button
                        onClick={() => setExpandedId(expanded ? null : s.id)}
                        className="w-7 h-7 rounded-xl bg-white/50 hover:bg-white flex items-center justify-center text-muted-foreground transition shrink-0"
                        aria-label={expanded ? "Recolher" : "Expandir"}
                      >
                        {expanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                        {s.type}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.icon}
                        {s.status}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-auto">
                        {s.date}
                      </span>
                    </div>

                    {expanded && (
                      <div className="mt-2 pt-3 border-t border-white/40 flex flex-col gap-2 animate-fade-in">
                        <p className="text-sm text-foreground/90">{s.description}</p>
                        {s.example && (
                          <div className="bg-white/40 rounded-xl p-3 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/80">Exemplo:</span>{" "}
                            {s.example}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
