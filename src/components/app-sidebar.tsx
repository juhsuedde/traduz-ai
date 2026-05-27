import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, MessageSquareText, BookOpen, Settings, Sparkles } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const items = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Assistant", url: "/chat", icon: MessageSquareText },
  { title: "Glossary", url: "/glossary", icon: BookOpen },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex w-64 flex-col gap-4 p-4 sticky top-0 h-screen">
      <div className="glass rounded-3xl p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold tracking-tight text-foreground">traduz<span className="text-primary">.ai</span></div>
          <div className="text-xs text-muted-foreground">for translators</div>
        </div>
      </div>

      <nav className="glass rounded-3xl p-3 flex flex-col gap-1 flex-1">
        {items.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all ${
                active
                  ? "bg-white/70 text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-white/40 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

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
    </aside>
  );
}