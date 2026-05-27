import { useState } from "react";
import {
  ADAPTACAO_OPTIONS,
  FOCO_OPTIONS,
  TOM_OPTIONS,
  buildPrompt,
  type Adaptacao,
  type Foco,
  type QuickSettings,
  type Tom,
} from "@/lib/quick-settings";
import {
  MessageSquareQuote,
  Globe2,
  Target,
  RotateCcw,
  Save,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";

type Props = {
  value: QuickSettings;
  onChange: (s: QuickSettings) => void;
  onReset?: () => void;
  onSaveToProject?: () => void;
  domain: string;
  projectName?: string | null;
  projectContext?: string | null;
  showSaveButton?: boolean;
  resetLabel?: string;
  saveLabel?: string;
  helperText?: string;
};

export function QuickSettingsPanel({
  value,
  onChange,
  onReset,
  onSaveToProject,
  domain,
  projectName,
  projectContext,
  showSaveButton = false,
  resetLabel = "Usar padrão do domínio",
  saveLabel = "Salvar no projeto",
  helperText,
}: Props) {
  const [promptOpen, setPromptOpen] = useState(false);

  const setTom = (t: Tom) => onChange({ ...value, tom: t });
  const setAdapt = (a: Adaptacao) => onChange({ ...value, adaptacao: a });
  const setFoco = (f: Foco) => onChange({ ...value, foco: f });

  const tomLabel = TOM_OPTIONS.find((o) => o.value === value.tom)!.label;
  const adaptLabel = ADAPTACAO_OPTIONS.find((o) => o.value === value.adaptacao)!.label;
  const focoLabel = FOCO_OPTIONS.find((o) => o.value === value.foco)!.label.split(" ")[0];

  return (
    <div className="flex flex-col gap-4">
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

      <SliderCard
        icon={<MessageSquareQuote className="w-4 h-4" />}
        title="Tom"
        description="Quão formal ou coloquial a tradução deve soar."
        options={TOM_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        value={value.tom}
        onChange={(v) => setTom(v as Tom)}
      />

      <SliderCard
        icon={<Globe2 className="w-4 h-4" />}
        title="Adaptação cultural"
        description="Quanto adaptar expressões e referências culturais."
        options={ADAPTACAO_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        value={value.adaptacao}
        onChange={(v) => setAdapt(v as Adaptacao)}
      />

      <SliderCard
        icon={<Target className="w-4 h-4" />}
        title="Foco"
        description="Priorizar o original ou soar natural em português."
        options={FOCO_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        value={value.foco}
        onChange={(v) => setFoco(v as Foco)}
      />

      <div className="glass rounded-2xl px-4 py-3 text-sm">
        <span className="text-muted-foreground">Com essas configurações: </span>
        <span className="font-medium">
          Tom {tomLabel} + Adaptação {adaptLabel} + Foco {focoLabel}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-white/70 hover:bg-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> {resetLabel}
          </button>
        )}
        {showSaveButton && onSaveToProject && (
          <button
            onClick={onSaveToProject}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:opacity-90 transition"
          >
            <Save className="w-3.5 h-3.5" /> {saveLabel}
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-slate-100/70 border border-white/60 overflow-hidden">
        <button
          onClick={() => setPromptOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium hover:bg-slate-200/40 transition"
        >
          <span className="inline-flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            Ver como a IA vai traduzir
          </span>
          {promptOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {promptOpen && (
          <div className="px-4 pb-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
              Prompt usado pela IA (somente leitura)
            </div>
            <pre className="text-xs leading-relaxed whitespace-pre-wrap bg-white/70 rounded-xl p-3 text-foreground/80 font-sans">
              {buildPrompt({ domain, settings: value, projectName, projectContext })}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function SliderCard({
  icon,
  title,
  description,
  options,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const index = options.findIndex((o) => o.value === value);
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-7 h-7 rounded-xl bg-white/70 flex items-center justify-center text-muted-foreground">
          {icon}
        </span>
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-4 ml-9">{description}</p>

      <div className="relative">
        <div className="absolute left-3 right-3 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/70" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 transition-all"
          style={{
            left: "12px",
            width: `calc(${(index / (options.length - 1)) * 100}% - ${(index / (options.length - 1)) * 24}px)`,
          }}
        />
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
        >
          {options.map((o, i) => {
            const active = i === index;
            return (
              <button
                key={o.value}
                onClick={() => onChange(o.value)}
                className={`flex flex-col items-center gap-2 py-2 group transition ${
                  active ? "" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 transition ${
                    active
                      ? "bg-white border-purple-400 ring-4 ring-purple-200/60 shadow-sm"
                      : "bg-white/70 border-white/80 group-hover:border-purple-200"
                  }`}
                />
                <span
                  className={`text-[11px] text-center leading-tight ${active ? "font-medium text-foreground" : ""}`}
                >
                  {o.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
