import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Sparkles, Upload, Loader2, FileText, CheckCircle2 } from "lucide-react";

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
    problem: "'Eu não posso' → 'Não posso'",
    suggestion: "Em português falado, omitir o sujeito soa mais natural.",
  },
  {
    type: "Semântica",
    problem: "'aquilo' → 'isso'",
    suggestion: "'Isso' funciona melhor para ações imediatas/contextuais.",
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
  const [hasProject] = useState(true);
  const [hasStyleGuide] = useState(false);
  const [status, setStatus] = useState<"idle" | "analyzing" | "done">("idle");

  const availableChecks: Check[] = [
    { id: "gramatica", label: "Gramática", available: true },
    { id: "semantica", label: "Semântica", available: true },
    { id: "fluencia", label: "Fluência e Coerência", available: true },
    { id: "projeto", label: "Adesão ao Projeto", available: hasProject },
    { id: "guia", label: "Verificação do Guia de Estilo", available: hasStyleGuide },
  ];

  const toggle = (id: CheckId) => setChecks((c) => ({ ...c, [id]: !c[id] }));

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
          placeholder="Cole o texto para revisar..."
          className="w-full bg-white/60 rounded-2xl p-4 text-sm outline-none resize-none placeholder:text-muted-foreground"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 hover:bg-white/80 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>{fileName ?? "Anexar arquivo"}</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
          <div className="text-xs text-muted-foreground">
            {text.trim().split(/\s+/).filter(Boolean).length} palavras
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
                      : "bg-white/30 text-muted-foreground/60 border-transparent cursor-not-allowed"
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
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "analyzing" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Analisando…
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
        <section className="glass rounded-3xl p-10 flex flex-col items-center justify-center gap-3 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <div className="text-sm font-medium">Analisando seu texto…</div>
          <div className="text-xs text-muted-foreground">Conferindo gramática, semântica e fluência.</div>
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
        <section className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">
          Suas sugestões aparecerão aqui depois da revisão.
        </section>
      )}

      {/* Reference to silence unused warning on SAMPLE_FIXED if ever needed */}
      <span className="hidden">{SAMPLE_FIXED}</span>
    </AppShell>
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