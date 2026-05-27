import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Sparkles, Upload, FileText, CheckCircle2, Search } from "lucide-react";
import { useActiveProject } from "@/lib/active-project-store";

export const Route = createFileRoute("/revisor")({
  head: () => ({
    meta: [
      { title: "Revisor · traduz.ai" },
      { name: "description", content: "Ferramenta de revisão de textos." },
    ],
  }),
  component: RevisorPage,
});

type CheckId = "gramatica" | "semantica" | "fluencia" | "projeto" | "guia";
type Check = { id: CheckId; label: string; available: boolean };

const SAMPLE_ORIGINAL = "Eu não posso acreditar que você realmente fez aquilo.";
const SAMPLE_FIXED = "Não posso acreditar que você realmente fez isso.";

type Note = { type: "Gramática" | "Semântica" | "Fluência" | "Projeto" | "Guia"; problem: string; suggestion: string };

const MOCK_NOTES: Note[] = [
  {
    type: "Fluência",
    problem: "Omitir 'Eu' soa mais natural",
    suggestion:
      "Em legendas e textos informais, o sujeito explícito ('Eu') pode ser omitido para soar mais próximo da fala oral.",
  },
  {
    type: "Semântica",
    problem: "'aquilo' → 'isso'",
    suggestion:
      "'Isso' é mais adequado para ações imediatas e contextualmente próximas. 'Aquilo' indica distância, o que não é o caso aqui.",
  },
];

function RevisorPage() {
  const [text, setText] = useState(SAMPLE_ORIGINAL);
  const [fileName, setFileName] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<CheckId, boolean>>({
    gramatica: true,
    semantica: true,
    fluencia: true,
    projeto: false,
    guia: false,
  });
  const activeProject = useActiveProject();
  const hasProject = !!activeProject;
  const [styleGuideName, setStyleGuideName] = useState<string | null>(null);
  const hasStyleGuide = !!styleGuideName;
  const [status, setStatus] = useState<"idle" | "analyzing" | "done">("idle");

  const availableChecks: Check[] = [
    { id: "gramatica", label: "Gramática", available: true },
    { id: "semantica", label: "Semântica", available: true },
    { id: "fluencia", label: "Fluência e Coerência", available: true },
    { id: "projeto", label: "Adesão ao Projeto", available: hasProject },
    { id: "guia", label: "Verificação do Guia de Estilo", available: hasStyleGuide },
  ];

  const toggle = (id: CheckId) => setChecks((c) => ({ ...c, [id]: !c[id] }));

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFileName(f.name);
    if (/\.(pdf|docx?|md|txt)$/i.test(f.name)) setStyleGuideName(f.name);
  };

  const analyze = () => {
    if (!text.trim()) return;
    setStatus("analyzing");
    window.setTimeout(() => setStatus("done"), 2000);
  };

  return (
    <AppShell>
      <PageHeader
        title="Revisor"
        subtitle="Cole um texto, escolha o que checar e receba sugestões claras."
      />

      {/* Input */}
      <section className="glass rounded-3xl p-5 mb-5">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (status === "done") setStatus("idle");
          }}
          rows={6}
          placeholder="Cole aqui o texto que você quer revisar..."
          className="w-full bg-white/60 rounded-2xl p-4 text-sm outline-none resize-none placeholder:text-muted-foreground"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 hover:bg-white/80 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>{fileName ?? "Anexar arquivo"}</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="text-xs text-muted-foreground">
            {text.trim().split(/\s+/).filter(Boolean).length} palavras · {text.length} caracteres
          </div>
        </div>
      </section>

      {/* Pills */}
      <section className="mb-5">
        <div className="text-xs text-muted-foreground mb-2 px-1">O que verificar</div>
        <div className="flex flex-wrap gap-2">
          {availableChecks.map((c) => {
            const active = checks[c.id] && c.available;
            return (
              <button
                key={c.id}
                disabled={!c.available}
                onClick={() => c.available && toggle(c.id)}
                title={
                  c.available
                    ? undefined
                    : c.id === "projeto"
                      ? "Selecione um projeto para ativar"
                      : "Anexe um guia de estilo para ativar"
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                  active
                    ? "bg-gradient-to-r from-pink-200 to-purple-200 text-purple-900 border-white/50 shadow-sm"
                    : c.available
                      ? "glass text-muted-foreground hover:text-foreground border-transparent"
                      : "bg-white/30 text-muted-foreground/50 border-transparent cursor-not-allowed opacity-60"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end mb-6">
        <button
          onClick={analyze}
          disabled={status === "analyzing" || !text.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm font-medium hover:opacity-90 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "analyzing" ? (
            <>
              <DotsPulse /> Analisando…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Revisar
            </>
          )}
        </button>
      </div>

      {/* Analyzing state */}
      {status === "analyzing" && (
        <section className="glass rounded-3xl p-10 flex flex-col items-center justify-center gap-4 animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="relative text-sm font-medium flex items-center gap-2">
            Analisando seu texto <DotsPulse />
          </div>
          <div className="relative text-xs text-muted-foreground">
            Conferindo gramática, semântica e fluência.
          </div>
        </section>
      )}

      {/* Results */}
      {status === "done" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <article className="glass rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Texto Original</h3>
              </div>
              <p className="text-sm leading-relaxed bg-white/60 rounded-2xl p-4">
                <Mark color="red">Eu não posso</Mark> acreditar que você realmente fez{" "}
                <Mark color="red">aquilo</Mark>.
              </p>
            </article>

            <article className="glass rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-sm">Texto Corrigido</h3>
              </div>
              <p className="text-sm leading-relaxed bg-white/60 rounded-2xl p-4">
                <Mark color="green">Não posso</Mark> acreditar que você realmente fez{" "}
                <Mark color="green">isso</Mark>.
              </p>
            </article>
          </div>

          <section>
            <div className="px-1 mb-3">
              <h3 className="font-semibold tracking-tight">Observações</h3>
              <p className="text-xs text-muted-foreground">
                {MOCK_NOTES.length} sugestões para deixar seu texto mais natural.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {MOCK_NOTES.map((n, i) => (
                <NoteCard key={i} note={n} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Idle empty hint */}
      {status === "idle" && (
        <section className="glass rounded-3xl p-10 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-sm text-muted-foreground">
            Suas sugestões aparecerão aqui depois da revisão.
          </div>
        </section>
      )}
    </AppShell>
  );
}

function DotsPulse() {
  return (
    <span className="inline-flex gap-1 items-center">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:240ms]" />
    </span>
  );
}

function Mark({ color, children }: { color: "red" | "green"; children: React.ReactNode }) {
  const cls =
    color === "red"
      ? "bg-red-200/70 text-red-900 underline decoration-red-400/70 decoration-2 underline-offset-2"
      : "bg-emerald-200/70 text-emerald-900 underline decoration-emerald-500/70 decoration-2 underline-offset-2";
  return <span className={`rounded px-1 ${cls}`}>{children}</span>;
}

function NoteCard({ note }: { note: Note }) {
  const badge: Record<Note["type"], string> = {
    Gramática: "from-amber-100 to-pink-200 text-amber-900",
    Semântica: "from-sky-200 to-teal-200 text-teal-900",
    Fluência: "from-pink-200 to-purple-200 text-purple-900",
    Projeto: "from-emerald-200 to-teal-200 text-emerald-900",
    Guia: "from-purple-200 to-indigo-200 text-indigo-900",
  };
  return (
    <article className="glass rounded-3xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium bg-gradient-to-r ${badge[note.type]}`}
        >
          {note.type}
        </span>
        <span className="text-sm font-medium">{note.problem}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{note.suggestion}</p>
    </article>
  );
}