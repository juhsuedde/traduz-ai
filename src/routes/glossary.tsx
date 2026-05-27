import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { glossary as seed, projects, type GlossaryEntry } from "@/lib/mock-data";
import { Plus, Search, ArrowRight, Trash2 } from "lucide-react";

export const Route = createFileRoute("/glossary")({
  head: () => ({
    meta: [
      { title: "Glossary · traduz.ai" },
      { name: "description", content: "Keep your terms consistent across every project." },
    ],
  }),
  component: GlossaryPage,
});

function GlossaryPage() {
  const [entries, setEntries] = useState<GlossaryEntry[]>(seed);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");

  const filtered = entries.filter((e) =>
    !query || `${e.source} ${e.target} ${e.note} ${e.tag}`.toLowerCase().includes(query.toLowerCase()),
  );

  const add = () => {
    if (!source.trim() || !target.trim()) return;
    setEntries([{ id: crypto.randomUUID(), source, target, note: "Added just now", tag: "New" }, ...entries]);
    setSource("");
    setTarget("");
  };

  return (
    <AppShell>
      <PageHeader
        title="Glossary"
        subtitle={`Terms for ${projects[0].name}`}
      />

      <div className="glass rounded-3xl p-5 mb-6">
        <div className="text-sm font-medium mb-3">Add a term</div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Source (EN)"
            className="flex-1 min-w-[160px] bg-white/70 rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target (ES)"
            className="flex-1 min-w-[160px] bg-white/70 rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={add}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl glass mb-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms…"
          className="bg-transparent outline-none text-sm flex-1 py-1 placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((e) => (
          <article key={e.id} className="glass rounded-3xl p-5 flex items-center gap-4 group">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Source</div>
                <div className="font-medium">{e.source}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block" />
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Target</div>
                <div className="font-medium">{e.target}</div>
              </div>
            </div>
            <div className="hidden lg:block max-w-xs">
              <div className="text-xs text-muted-foreground mb-0.5">Note</div>
              <div className="text-sm">{e.note}</div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 text-purple-900 shrink-0">{e.tag}</span>
            <button
              onClick={() => setEntries(entries.filter((x) => x.id !== e.id))}
              className="w-9 h-9 rounded-xl bg-white/40 hover:bg-white/80 text-muted-foreground hover:text-destructive transition flex items-center justify-center shrink-0"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="glass rounded-3xl p-10 text-center text-muted-foreground">No terms found.</div>
        )}
      </div>
    </AppShell>
  );
}