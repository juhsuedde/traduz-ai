import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Eye, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/revisor")({
  head: () => ({
    meta: [
      { title: "Revisor · traduz.ai" },
      { name: "description", content: "Ferramenta de revisão de textos traduzidos." },
    ],
  }),
  component: RevisorPage,
});

type Issue = { type: "tone" | "term" | "grammar"; text: string; suggestion: string };

const mockIssues: Issue[] = [
  { type: "tone", text: "Resplandor único", suggestion: "Brillo único — mais alinhado ao tom da marca (informal)." },
  { type: "term", text: "régimen diario", suggestion: "rutina diaria — termo aprovado no glossário do projeto." },
  { type: "grammar", text: "los productos es", suggestion: "los productos son — concordância de número." },
];

export default function RevisorPage() {
  const [source, setSource] = useState("Glow like you mean it. Our daily routine brings radiant skin in 7 days.");
  const [target, setTarget] = useState("Resplandor único. Nuestro régimen diario trae piel radiante en 7 días.");
  const [analyzed, setAnalyzed] = useState(false);

  return (
    <AppShell>
      <PageHeader
        title="Revisor"
        subtitle="Cole sua tradução e receba sugestões de tom, termos e gramática."
        action={
          <button
            onClick={() => setAnalyzed(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
          >
            <Sparkles className="w-4 h-4" /> Analisar texto
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="glass rounded-3xl p-5 flex flex-col">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/60">Original (EN)</span>
          </div>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            rows={8}
            className="flex-1 bg-white/60 rounded-2xl p-4 text-sm outline-none resize-none placeholder:text-muted-foreground"
            placeholder="Cole o texto original aqui…"
          />
        </div>

        <div className="glass rounded-3xl p-5 flex flex-col">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 text-purple-900">Tradução (ES)</span>
          </div>
          <textarea
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            rows={8}
            className="flex-1 bg-white/60 rounded-2xl p-4 text-sm outline-none resize-none placeholder:text-muted-foreground"
            placeholder="Cole sua tradução aqui…"
          />
        </div>
      </div>

      <section className="glass rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold tracking-tight">Sugestões da revisão</h3>
            <p className="text-xs text-muted-foreground">
              {analyzed ? `${mockIssues.length} pontos para revisar` : "Clique em \"Analisar texto\" para ver sugestões."}
            </p>
          </div>
        </div>

        {!analyzed ? (
          <div className="text-sm text-muted-foreground text-center py-10">
            Nenhuma análise ainda — os resultados aparecerão aqui.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mockIssues.map((it, i) => (
              <IssueCard key={i} issue={it} />
            ))}
            <div className="glass rounded-2xl p-4 flex items-center gap-3 bg-emerald-50/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-900">Estilo geral e pontuação parecem bem.</span>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const cfg = {
    tone: { label: "Tom", cls: "from-pink-200 to-purple-200 text-purple-900" },
    term: { label: "Termo", cls: "from-sky-200 to-teal-200 text-teal-900" },
    grammar: { label: "Gramática", cls: "from-amber-100 to-pink-200 text-amber-900" },
  }[issue.type];
  return (
    <article className="glass rounded-2xl p-4 flex items-start gap-3">
      <AlertCircle className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium bg-gradient-to-r ${cfg.cls}`}>{cfg.label}</span>
          <span className="text-sm font-medium truncate">"{issue.text}"</span>
        </div>
        <p className="text-sm text-muted-foreground">{issue.suggestion}</p>
      </div>
    </article>
  );
}