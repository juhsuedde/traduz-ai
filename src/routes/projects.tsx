import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { projects as seed, type Project } from "@/lib/mock-data";
import { Plus, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects · traduz.ai" },
      { name: "description", content: "Browse and manage your translation projects." },
    ],
  }),
  component: ProjectsPage,
});

const tabs = ["All", "In progress", "Review", "Done"] as const;

function ProjectsPage() {
  const [projects] = useState<Project[]>(seed);
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = projects.filter((p) => {
    const matchTab =
      tab === "All" ||
      (tab === "In progress" && p.status === "in-progress") ||
      (tab === "Review" && p.status === "review") ||
      (tab === "Done" && p.status === "done");
    const matchQuery =
      !query || `${p.name} ${p.client} ${p.domain}`.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchQuery;
  });

  return (
    <AppShell>
      <PageHeader
        title="Projects"
        subtitle="Everything you're translating, in one calm place."
        action={
          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> New project
          </button>
        }
      />

      <div className="glass rounded-3xl p-3 mb-6 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, clients, domains…"
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
              <Chip>Due {p.due}</Chip>
            </div>

            <div className="h-2 rounded-full bg-white/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400"
                style={{ width: `${p.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{p.progress}% translated</span>
              <span>{p.words.toLocaleString()} words</span>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="glass rounded-3xl p-10 text-center text-muted-foreground col-span-full">
            No projects match your filters.
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-3 py-1 rounded-full bg-white/60 text-muted-foreground">{children}</span>
  );
}

function StatusBadge({ status }: { status: Project["status"] }) {
  const cfg = {
    "in-progress": { label: "In progress", cls: "bg-gradient-to-r from-pink-200 to-purple-200 text-purple-900" },
    review: { label: "Review", cls: "bg-gradient-to-r from-amber-100 to-pink-200 text-amber-900" },
    done: { label: "Done", cls: "bg-gradient-to-r from-emerald-200 to-teal-200 text-emerald-900" },
  }[status];
  return <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${cfg.cls}`}>{cfg.label}</span>;
}