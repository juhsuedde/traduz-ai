import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { projects, conversations, currentUser } from "@/lib/mock-data";
import { ArrowRight, Sparkles, Clock, BookOpen, MessageSquareText, Plus } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "traduz.ai — Home" },
      { name: "description", content: "Your friendly translation workspace." },
      { property: "og:title", content: "traduz.ai" },
      { property: "og:description", content: "Your friendly translation workspace." },
    ],
  }),
  component: Index,
});

function Index() {
  const active = projects.filter((p) => p.status !== "done");
  return (
    <AppShell>
      <PageHeader
        title={`Hey ${currentUser.name} 👋`}
        subtitle="Here's what's happening in your workspace today."
      />

      <section className="glass rounded-3xl p-7 mb-6 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-start gap-4 max-w-xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Ready when you are.</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Ask the assistant anything — tone tweaks, terminology, or a quick second opinion.
            </p>
          </div>
        </div>
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
        >
          Open assistant <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Clock className="w-4 h-4" />} label="Active projects" value={active.length.toString()} />
        <StatCard icon={<MessageSquareText className="w-4 h-4" />} label="Conversations this week" value="14" />
        <StatCard icon={<BookOpen className="w-4 h-4" />} label="Glossary terms" value="128" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-lg font-semibold tracking-tight">Active projects</h3>
            <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground">View all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {active.map((p) => (
              <div key={p.id} className="glass rounded-3xl p-5 hover:bg-white/70 transition-all cursor-pointer">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">{p.domain} · {p.languagePair}</div>
                    <div className="font-semibold truncate">{p.name}</div>
                  </div>
                  <div className="text-xs px-3 py-1 rounded-full bg-white/60 text-muted-foreground shrink-0">Due {p.due}</div>
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
              </div>
            ))}
            <Link
              to="/projects"
              className="glass rounded-3xl p-5 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-white/70 transition"
            >
              <Plus className="w-4 h-4" /> <span className="text-sm font-medium">New project</span>
            </Link>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-lg font-semibold tracking-tight">Recent chats</h3>
            <Link to="/chat" className="text-sm text-muted-foreground hover:text-foreground">All</Link>
          </div>
          <div className="flex flex-col gap-3">
            {conversations.map((c) => (
              <Link
                key={c.id}
                to="/chat"
                className="glass rounded-3xl p-4 hover:bg-white/70 transition block"
              >
                <div className="text-xs text-muted-foreground mb-1">{c.project} · {c.updated}</div>
                <div className="font-medium text-sm leading-snug mb-1">{c.title}</div>
                <div className="text-xs text-muted-foreground truncate">{c.preview}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
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
