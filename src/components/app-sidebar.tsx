import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageCircle,
  FolderOpen,
  PencilRuler,
  Settings,
  Sparkles,
  Menu,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Shuffle,
} from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useActiveProject, setActiveProject } from "@/lib/active-project-store";

const items = [
  { title: "Início", url: "/inicio", icon: MessageCircle, accent: "from-pink-300 to-purple-300" },
  { title: "Projetos", url: "/projetos", icon: FolderOpen, accent: "from-purple-300 to-violet-300" },
  { title: "Revisor", url: "/revisor", icon: PencilRuler, accent: "from-amber-200 to-pink-300" },
  { title: "Configurações", url: "/configuracoes", icon: Settings, accent: "from-slate-300 to-purple-300" },
] as const;

const recentThreads = [
  { id: "t1", title: "Tradução Stranger Things" },
  { id: "t2", title: "Revisão texto marketing" },
  { id: "t3", title: "Localização UI do jogo" },
];

function SidebarContent({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const activeProject = useActiveProject();

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Logo */}
      <div className={`glass rounded-3xl flex items-center gap-3 ${collapsed ? "p-3 justify-center" : "p-5"}`}>
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center shadow-sm shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-semibold tracking-tight text-foreground truncate">
              traduz<span className="text-primary">.ai</span>
            </div>
            <div className="text-xs text-muted-foreground truncate">para tradutores</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`glass rounded-3xl flex flex-col gap-1 ${collapsed ? "p-2" : "p-3"}`}>
        {items.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              onClick={onNavigate}
              title={collapsed ? item.title : undefined}
              className={`flex items-center gap-3 rounded-2xl text-sm transition-all ${
                collapsed ? "p-2 justify-center" : "px-4 py-3"
              } ${
                active
                  ? "bg-white/70 text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-white/40 hover:text-foreground"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition shrink-0 ${
                  active
                    ? `bg-gradient-to-br ${item.accent} text-white shadow-sm`
                    : "bg-white/40 text-muted-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
              </span>
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Conversas recentes */}
      {!collapsed && (
        <div className="glass rounded-3xl p-3 flex flex-col gap-1 flex-1 min-h-0">
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Conversas
            </span>
            <button
              className="w-6 h-6 rounded-lg bg-white/60 hover:bg-white text-muted-foreground flex items-center justify-center transition"
              aria-label="Nova conversa"
              title="Nova conversa"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-0.5 overflow-y-auto pr-1">
            {recentThreads.length === 0 ? (
              <div className="text-xs text-muted-foreground/70 px-3 py-3 italic">
                Nenhuma conversa ainda
              </div>
            ) : (
              recentThreads.map((t) => (
                <Link
                  key={t.id}
                  to="/inicio"
                  onClick={onNavigate}
                  className="px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-white/40 hover:text-foreground transition truncate"
                >
                  {t.title}
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Contexto ativo */}
      {!collapsed && activeProject && (
        <div className="glass rounded-3xl p-3 flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Projeto ativo
          </span>
          <div className="bg-white/60 rounded-2xl p-3 flex flex-col gap-2">
            <div className="font-medium text-sm leading-tight">{activeProject.name}</div>
            <span className="text-[10px] self-start px-2 py-0.5 rounded-full font-medium bg-gradient-to-r from-pink-200 to-purple-200 text-purple-900">
              {activeProject.domain}
            </span>
          </div>
          <div className="flex gap-1.5">
            <Link
              to="/projetos"
              onClick={onNavigate}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-white/60 hover:bg-white text-foreground flex items-center justify-center gap-1 transition"
            >
              Ver <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              onClick={() => setActiveProject(null)}
              className="text-xs px-3 py-2 rounded-xl bg-white/60 hover:bg-white text-muted-foreground flex items-center justify-center gap-1 transition"
              title="Trocar projeto"
            >
              <Shuffle className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Perfil */}
      <div className={`glass rounded-3xl flex items-center gap-3 ${collapsed ? "p-2 justify-center" : "p-4"}`}>
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-purple-300 to-pink-300 text-white font-semibold">
            {currentUser.initials}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{currentUser.name}</div>
            <div className="text-xs text-muted-foreground truncate">Tradutora EN → PT</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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
      <aside
        className={`hidden lg:flex flex-col p-4 sticky top-0 h-screen relative transition-all duration-200 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarContent pathname={pathname} collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-2 top-8 z-10 w-6 h-6 rounded-full bg-white shadow-md border border-white/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
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
            <SidebarContent
              pathname={pathname}
              collapsed={false}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
