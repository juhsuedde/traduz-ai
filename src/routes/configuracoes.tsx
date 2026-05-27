import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { currentUser } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UserCircle,
  Globe,
  SlidersHorizontal,
  Palette,
  Bell,
  Database,
  Info,
  Edit2,
  Save,
  X,
  RotateCcw,
  Moon,
  Zap,
  Monitor,
  LayoutList,
  Rows3,
  AlignJustify,
  Trash2,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  QuickSettingsPanel,
} from "@/components/quick-settings-panel";
import {
  getGlobalDefaults,
  setGlobalDefaults,
  resetGlobalDefaults,
  type QuickSettings,
  DEFAULT_SETTINGS,
} from "@/lib/quick-settings";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — traduz.ai" },
      { name: "description", content: "Personalize sua experiência no traduz.ai" },
    ],
  }),
  component: ConfiguracoesPage,
});

const DOMAIN_OPTIONS = [
  "Audiovisual",
  "Literária",
  "Games",
  "Técnica",
  "Jurídica",
  "Último usado",
];

type Density = "compacto" | "confortavel" | "espacoso";

function ConfiguracoesPage() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileRole, setProfileRole] = useState(currentUser.role);

  const [defaultDomain, setDefaultDomain] = useState("Último usado");
  const [globalSettings, setGlobalSettings] = useState<QuickSettings>(() =>
    getGlobalDefaults(),
  );

  const [darkMode, setDarkMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [density, setDensity] = useState<Density>("confortavel");

  const [emailNotif, setEmailNotif] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  const handleSaveProfile = () => {
    setProfileOpen(false);
  };

  const handleResetGlobal = () => {
    resetGlobalDefaults();
    setGlobalSettings(DEFAULT_SETTINGS);
  };

  const handleChangeGlobal = (s: QuickSettings) => {
    setGlobalSettings(s);
    setGlobalDefaults(s);
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 animate-fade-in pb-10">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Configurações
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Personalize sua experiência
          </p>
        </div>
      </header>

      {/* 1. PERFIL */}
      <SectionCard icon={<UserCircle className="w-5 h-5" />} title="Perfil">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-purple-300 to-pink-300 text-white text-lg font-semibold">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold">{profileName}</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gradient-to-r from-pink-200 to-purple-200 text-purple-900">
                {profileRole}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {currentUser.email}
            </p>
            <button
              onClick={() => setProfileOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-white/70 hover:bg-white transition"
            >
              <Edit2 className="w-3.5 h-3.5" /> Editar perfil
            </button>
          </div>
        </div>
      </SectionCard>

      {/* 2. DOMÍNIO PADRÃO */}
      <SectionCard icon={<Globe className="w-5 h-5" />} title="Domínio padrão">
        <label className="text-sm text-muted-foreground block mb-2">
          Qual domínio abrir por padrão ao iniciar?
        </label>
        <div className="relative max-w-xs">
          <select
            value={defaultDomain}
            onChange={(e) => setDefaultDomain(e.target.value)}
            className="w-full appearance-none bg-white/70 rounded-2xl px-4 py-2.5 text-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            {DOMAIN_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </SectionCard>

      {/* 3. AJUSTES RÁPIDOS PADRÃO */}
      <SectionCard
        icon={<SlidersHorizontal className="w-5 h-5" />}
        title="Ajustes padrão para novos projetos"
      >
        <p className="text-sm text-muted-foreground mb-4">
          Quando você criar um novo projeto, ele começará com esses ajustes.
          Você pode alterar depois em cada projeto.
        </p>
        <QuickSettingsPanel
          value={globalSettings}
          onChange={handleChangeGlobal}
          onReset={handleResetGlobal}
          domain="Geral"
          resetLabel="Redefinir para padrão de fábrica"
          helperText="Esses ajustes não afetam projetos já existentes — apenas novos."
        />
      </SectionCard>

      {/* 4. APARÊNCIA */}
      <SectionCard icon={<Palette className="w-5 h-5" />} title="Aparência">
        <div className="flex flex-col gap-5">
          <ToggleRow
            icon={<Moon className="w-4 h-4" />}
            label="Modo escuro"
            checked={darkMode}
            onChange={setDarkMode}
            note="(placeholder visual)"
          />
          <ToggleRow
            icon={<Zap className="w-4 h-4" />}
            label="Animações reduzidas"
            checked={reducedMotion}
            onChange={setReducedMotion}
          />
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              Densidade da interface
            </label>
            <div className="flex gap-2">
              <DensityButton
                active={density === "compacto"}
                onClick={() => setDensity("compacto")}
                icon={<LayoutList className="w-4 h-4" />}
                label="Compacto"
              />
              <DensityButton
                active={density === "confortavel"}
                onClick={() => setDensity("confortavel")}
                icon={<Rows3 className="w-4 h-4" />}
                label="Confortável"
              />
              <DensityButton
                active={density === "espacoso"}
                onClick={() => setDensity("espacoso")}
                icon={<AlignJustify className="w-4 h-4" />}
                label="Espaçoso"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 5. NOTIFICAÇÕES */}
      <SectionCard icon={<Bell className="w-5 h-5" />} title="Notificações">
        <div className="flex flex-col gap-4">
          <ToggleRow
            label="Notificações por e-mail"
            checked={emailNotif}
            onChange={setEmailNotif}
            note="(mock)"
          />
          <ToggleRow
            label="Resumo semanal de atividade"
            checked={weeklySummary}
            onChange={setWeeklySummary}
            note="(mock)"
          />
        </div>
      </SectionCard>

      {/* 6. DADOS */}
      <SectionCard icon={<Database className="w-5 h-5" />} title="Dados">
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl bg-white/70 hover:bg-white transition">
            <Download className="w-4 h-4" /> Exportar meus dados
          </button>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition border border-red-100">
            <Trash2 className="w-4 h-4" /> Excluir minha conta
          </button>
        </div>
      </SectionCard>

      {/* 7. SOBRE */}
      <SectionCard icon={<Info className="w-5 h-5" />} title="Sobre">
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            <span className="text-foreground font-medium">Versão:</span>{" "}
            traduz.ai v1.0
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-1 text-foreground hover:underline transition"
            >
              Termos de uso <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-foreground hover:underline transition"
            >
              Política de privacidade <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs mt-1">Feito com 💜 para tradutores</p>
        </div>
      </SectionCard>

      {/* Modal Editar Perfil */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setProfileOpen(false)}
          />
          <div className="relative glass rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Editar perfil</h3>
              <button
                onClick={() => setProfileOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/60 hover:bg-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Nome
                </label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-white/70 rounded-xl px-3 py-2 text-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Função / Pares de idioma
                </label>
                <input
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full bg-white/70 rounded-xl px-3 py-2 text-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setProfileOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white/60 hover:bg-white transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:opacity-90 transition"
              >
                <Save className="w-3.5 h-3.5" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-3xl p-5 md:p-6 card-hover">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-purple-900">
          {icon}
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
  note,
}: {
  icon?: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-sm">
          {label}{" "}
          {note && (
            <span className="text-xs text-muted-foreground">{note}</span>
          )}
        </span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked
            ? "bg-gradient-to-r from-pink-400 to-purple-400"
            : "bg-white/70"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

function DensityButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
        active
          ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-sm"
          : "bg-white/60 hover:bg-white text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
