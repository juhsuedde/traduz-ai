import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Clapperboard,
  BookOpen,
  Gamepad2,
  Cog,
  Scale,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const domains = [
  {
    id: "audiovisual",
    name: "Audiovisual",
    description: "Legendagem e dublagem",
    icon: Clapperboard,
    accent: "oklch(0.85 0.08 20)",
    accentGradient: "from-rose-200/60 to-orange-200/60",
    hoverGlow: "hover:shadow-[0_0_30px_-5px_oklch(0.85_0.08_20/0.4)]",
  },
  {
    id: "literary",
    name: "Literária",
    description: "Tradução literária",
    icon: BookOpen,
    accent: "oklch(0.88 0.06 300)",
    accentGradient: "from-purple-200/60 to-pink-200/60",
    hoverGlow: "hover:shadow-[0_0_30px_-5px_oklch(0.88_0.06_300/0.4)]",
  },
  {
    id: "games",
    name: "Games",
    description: "Localização de games",
    icon: Gamepad2,
    accent: "oklch(0.9 0.06 160)",
    accentGradient: "from-emerald-200/60 to-teal-200/60",
    hoverGlow: "hover:shadow-[0_0_30px_-5px_oklch(0.9_0.06_160/0.4)]",
  },
  {
    id: "technical",
    name: "Técnica",
    description: "Tradução técnica",
    icon: Cog,
    accent: "oklch(0.88 0.06 250)",
    accentGradient: "from-sky-200/60 to-blue-200/60",
    hoverGlow: "hover:shadow-[0_0_30px_-5px_oklch(0.88_0.06_250/0.4)]",
  },
  {
    id: "legal",
    name: "Jurídica",
    description: "Tradução jurídica",
    icon: Scale,
    accent: "oklch(0.9 0.07 80)",
    accentGradient: "from-amber-200/60 to-yellow-200/60",
    hoverGlow: "hover:shadow-[0_0_30px_-5px_oklch(0.9_0.07_80/0.4)]",
  },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bem-vindo · traduz.ai" },
      { name: "description", content: "Escolha seu domínio de tradução e comece a trabalhar." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    setSelectedDomain(id);
    setTimeout(() => {
      navigate({ to: "/inicio" });
    }, 250);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Custom soft gradient background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.92 0.04 300) 0%, oklch(0.94 0.03 180) 50%, oklch(0.96 0.02 200) 100%)",
        }}
      />

      {/* Top right user avatar */}
      <div className="absolute top-6 right-6 z-20">
        <div className="glass rounded-full pl-4 pr-2 py-2 flex items-center gap-3">
          <span className="text-sm font-medium hidden sm:inline">{currentUser.name}</span>
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-gradient-to-br from-purple-300 to-pink-300 text-white text-xs font-semibold">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Logo top left */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold tracking-tight text-foreground text-lg">
          traduz<span className="text-primary">.ai</span>
        </span>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <div className="max-w-4xl w-full flex flex-col items-center gap-10">
          {/* Heading */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              O que você vai traduzir hoje?
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
              Escolha um domínio para personalizar sua experiência — terminologia, sugestões e recursos serão ajustados automaticamente.
            </p>
          </div>

          {/* Domain cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {domains.map((domain) => {
              const Icon = domain.icon;
              const isSelected = selectedDomain === domain.id;
              return (
                <button
                  key={domain.id}
                  onClick={() => handleSelect(domain.id)}
                  className={`glass rounded-[20px] p-6 text-left transition-all duration-300 group
                    ${domain.hoverGlow}
                    hover:scale-[1.02] active:scale-[0.98]
                    ${isSelected ? "ring-2 ring-primary/50 scale-[1.02]" : ""}
                  `}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${domain.accentGradient} shadow-sm`}
                  >
                    <Icon
                      className="w-7 h-7"
                      style={{ color: domain.accent }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {domain.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {domain.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Selecionar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom section */}
          <div className="flex flex-col items-center gap-3 pt-4">
            <Link
              to="/inicio"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary"
            >
              Ou comece a traduzir agora
            </Link>
            <p className="text-xs text-muted-foreground">
              Você pode mudar isso a qualquer momento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
