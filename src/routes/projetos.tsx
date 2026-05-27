import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { projects as seed, conversations, currentUser, type Project } from "@/lib/mock-data";
import { Plus, Search, Filter, Clock, MessageSquareText, BookOpen, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos · traduz.ai" },
      { name: "description", content: "Gerencie seus projetos de tradução." },
    ],
  }),
  component: ProjetosPage,
});

const tabs = ["Todos", "Em andamento", "Revisão", "Concluídos"] as const;

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function ProjetosPage() {
  const [projects] = useState<Project[]>(seed);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Todos");
  const [query, setQuery] = useState("");

  const active = projects.filter((p) => p.status !== "done");

  const filtered = projects.filter((p) => {
    const matchTab =
      tab === "Todos" ||
      (tab === "Em andamento" && p.status === "in-progress") ||
      (tab === "Revisão" && p.status === "review") ||
      (tab === "Concluídos" && p.status === "done");
    const matchQuery =
      !query || `${p.name} ${p.client} ${p.domain}`.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchQuery;
  });

  return (
    <AppShell>
      <PageHeader
        title={`Olá, ${currentUser.name} 👋`}
        subtitle="Tudo que você está traduzindo, em um só lugar."
        action={
          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Novo projeto
          </button>
        }
      />

      <section className="glass rounded-3xl p-7 mb-6 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-start gap-4 max-w-xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Pronta quando você estiver.</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Peça ao assistente — ajustes de tom, terminologia ou uma segunda opinião rápida.
            </p>
          </div>
        </div>
        <Link
          to="/inicio"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
        >
          Abrir assistente <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Clock className="w-4 h-4" />} label="Projetos ativos" value={active.length.toString()} />
        <StatCard icon={<MessageSquareText className="w-4 h-4" />} label="Conversas esta semana" value="14" />
        <StatCard icon={<BookOpen className="w-4 h-4" />} label="Termos no glossário" value="128" />
      </div>

      <div className="glass rounded-3xl p-3 mb-6 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar projetos, clientes, domínios…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/40">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm rounded-xl transition ${
                tab === t ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button className="p-3 rounded-2xl bg-white/60 hover:bg-white/80 transition">
          <Filter className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <article key={p.id} className="glass rounded-3xl p-6 hover:bg-white/70 transition-all cursor-pointer">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground mb-1.5">{p.client}</div>
                <h3 className="font-semibold tracking-tight text-lg leading-snug">{p.name}</h3>
              </div>
              <StatusBadge status={p.status} />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Chip>{p.domain}</Chip>
              <Chip>{p.languagePair}</Chip>
              <Chip>Entrega {p.due}</Chip>
            </div>

            <div className="h-2 rounded-full bg-white/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400"
                style={{ width: `${p.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{p.progress}% traduzido</span>
              <span>{fmt(p.words)} palavras</span>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="glass rounded-3xl p-10 text-center text-muted-foreground col-span-full">
            Nenhum projeto encontrado.
          </div>
        )}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-lg font-semibold tracking-tight">Conversas recentes</h3>
          <Link to="/inicio" className="text-sm text-muted-foreground hover:text-foreground">Ver todas</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {conversations.map((c) => (
            <Link
              key={c.id}
              to="/inicio"
              className="glass rounded-3xl p-4 hover:bg-white/70 transition block"
            >
              <div className="text-xs text-muted-foreground mb-1">{c.project} · {c.updated}</div>
              <div className="font-medium text-sm leading-snug mb-1">{c.title}</div>
              <div className="text-xs text-muted-foreground truncate">{c.preview}</div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
        {icon}<span>{label}</span>
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-3 py-1 rounded-full bg-white/60 text-muted-foreground">{children}</span>
  );
}

function StatusBadge({ status }: { status: Project["status"] }) {
  const cfg = {
    "in-progress": { label: "Em andamento", cls: "bg-gradient-to-r from-pink-200 to-purple-200 text-purple-900" },
    review: { label: "Em revisão", cls: "bg-gradient-to-r from-amber-100 to-pink-200 text-amber-900" },
    done: { label: "Concluído", cls: "bg-gradient-to-r from-emerald-200 to-teal-200 text-emerald-900" },
  }[status];
  return <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${cfg.cls}`}>{cfg.label}</span>;
}