import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, FolderOpen, PencilRuler, Sparkles, Menu, X, Plus } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const items = [
  { title: "Início", url: "/inicio", icon: MessageCircle, accent: "from-pink-300 to-purple-300" },
  { title: "Projetos", url: "/projetos", icon: FolderOpen, accent: "from-sky-300 to-teal-300" },
  { title: "Revisor", url: "/revisor", icon: PencilRuler, accent: "from-amber-200 to-pink-300" },
] as const;

const recentThreads = [
  { id: "t1", title: "Tradução Stranger Things" },
  { id: "t2", title: "Revisão texto marketing" },
  { id: "t3", title: "Localização indie game" },
  { id: "t4", title: "Contrato — cláusula 4.2" },
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="glass rounded-3xl p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold tracking-tight text-foreground">
            traduz<span className="text-primary">.ai</span>
          </div>
          <div className="text-xs text-muted-foreground">para tradutores</div>
        </div>
      </div>

      <nav className="glass rounded-3xl p-3 flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all ${
                active
                  ? "bg-white/70 text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-white/40 hover:text-foreground"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                  active
                    ? `bg-gradient-to-br ${item.accent} text-white shadow-sm`
                    : "bg-white/40 text-muted-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
              </span>
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="glass rounded-3xl p-3 flex flex-col gap-1 flex-1 min-h-0">
        <div className="flex items-center justify-between px-2 pt-1 pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Conversas recentes
          </span>
          <button
            className="w-6 h-6 rounded-lg bg-white/60 hover:bg-white text-muted-foreground flex items-center justify-center transition"
            aria-label="Nova conversa"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto pr-1">
          {recentThreads.map((t) => (
            <Link
              key={t.id}
              to="/inicio"
              onClick={onNavigate}
              className="px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-white/40 hover:text-foreground transition truncate"
            >
              {t.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-4 flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-gradient-to-br from-purple-300 to-pink-300 text-white font-semibold">
            {currentUser.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{currentUser.name}</div>
          <div className="text-xs text-muted-foreground truncate">{currentUser.role}</div>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 glass rounded-2xl p-3 shadow-sm"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col p-4 sticky top-0 h-screen">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 p-4 animate-in slide-in-from-left">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 z-10 glass rounded-xl p-2"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}