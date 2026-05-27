import { useSyncExternalStore } from "react";

export type Tom = "formal" | "neutro" | "casual";
export type Adaptacao = "conservadora" | "moderada" | "livre";
export type Foco = "fidelidade" | "equilibrado" | "naturalidade";

export type QuickSettings = {
  tom: Tom;
  adaptacao: Adaptacao;
  foco: Foco;
};

export const DEFAULT_SETTINGS: QuickSettings = {
  tom: "neutro",
  adaptacao: "moderada",
  foco: "equilibrado",
};

export const TOM_OPTIONS: { value: Tom; label: string; instruction: string }[] = [
  {
    value: "formal",
    label: "Formal",
    instruction:
      "Mantenha linguagem formal, respeitosa, adequada a contextos profissionais e acadêmicos.",
  },
  {
    value: "neutro",
    label: "Neutro",
    instruction:
      "Use linguagem natural e equilibrada, nem muito formal nem muito coloquial.",
  },
  {
    value: "casual",
    label: "Casual",
    instruction:
      "Priorize linguagem próxima da fala oral, coloquial e espontânea.",
  },
];

export const ADAPTACAO_OPTIONS: {
  value: Adaptacao;
  label: string;
  instruction: string;
}[] = [
  {
    value: "conservadora",
    label: "Conservadora",
    instruction:
      "Mantenha estruturas e expressões o mais próximas possível do original. Adapte apenas quando necessário para compreensão.",
  },
  {
    value: "moderada",
    label: "Moderada",
    instruction:
      "Adapte expressões culturais quando necessário, mantendo o equilíbrio entre fidelidade e naturalidade.",
  },
  {
    value: "livre",
    label: "Livre",
    instruction:
      "Adapte livremente expressões, referências culturais e jogos de palavras para soar natural no português brasileiro.",
  },
];

export const FOCO_OPTIONS: { value: Foco; label: string; instruction: string }[] = [
  {
    value: "fidelidade",
    label: "Fidelidade ao original",
    instruction:
      "Priorize manter o sentido literal, estrutura e nuances do texto original.",
  },
  {
    value: "equilibrado",
    label: "Equilibrado",
    instruction:
      "Equilibre fidelidade ao original com fluidez no idioma de destino.",
  },
  {
    value: "naturalidade",
    label: "Naturalidade no destino",
    instruction:
      "Priorize soar como algo escrito/original em português brasileiro, mesmo que precise afastar-se do literal.",
  },
];

export function shortLabel(s: QuickSettings): string {
  const tom = TOM_OPTIONS.find((o) => o.value === s.tom)!.label;
  const adapt = ADAPTACAO_OPTIONS.find((o) => o.value === s.adaptacao)!.label;
  const foco = FOCO_OPTIONS.find((o) => o.value === s.foco)!.label.split(" ")[0];
  return `${tom} · ${adapt} · ${foco}`;
}

export function buildPrompt(opts: {
  domain: string;
  settings: QuickSettings;
  projectName?: string | null;
  projectContext?: string | null;
}): string {
  const { domain, settings, projectName, projectContext } = opts;
  const tom = TOM_OPTIONS.find((o) => o.value === settings.tom)!.instruction;
  const adapt = ADAPTACAO_OPTIONS.find((o) => o.value === settings.adaptacao)!.instruction;
  const foco = FOCO_OPTIONS.find((o) => o.value === settings.foco)!.instruction;

  const lines = [
    `Você é um assistente de tradução especializado no domínio: ${domain}.`,
    "",
    "Diretrizes de tradução:",
    `• Tom: ${tom}`,
    `• Adaptação cultural: ${adapt}`,
    `• Foco: ${foco}`,
  ];

  if (projectName) {
    lines.push("", `Projeto ativo: ${projectName}.`);
    if (projectContext) lines.push(projectContext);
  }

  return lines.join("\n");
}

/* ---------- Store ---------- */

let byProject: Record<string, QuickSettings> = {};
let sessionSettings: QuickSettings = { ...DEFAULT_SETTINGS };
let globalDefaults: QuickSettings = { ...DEFAULT_SETTINGS };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getProjectSettings(projectId: string): QuickSettings {
  return byProject[projectId] ?? { ...globalDefaults };
}

export function setProjectSettings(projectId: string, s: QuickSettings) {
  byProject = { ...byProject, [projectId]: s };
  emit();
}

export function resetProjectSettings(projectId: string) {
  const next = { ...byProject };
  delete next[projectId];
  byProject = next;
  emit();
}

export function setSessionSettings(s: QuickSettings) {
  sessionSettings = s;
  emit();
}

export function getGlobalDefaults(): QuickSettings {
  return { ...globalDefaults };
}

export function setGlobalDefaults(s: QuickSettings) {
  globalDefaults = { ...s };
  emit();
}

export function resetGlobalDefaults() {
  globalDefaults = { ...DEFAULT_SETTINGS };
  emit();
}

/** Subscribes to settings for a given project id, or session if null. */
export function useQuickSettings(projectId: string | null): QuickSettings {
  return useSyncExternalStore(
    subscribe,
    () => (projectId ? byProject[projectId] ?? globalDefaults : sessionSettings),
    () => DEFAULT_SETTINGS,
  );
}

/** Returns true if the project has explicit (non-default) saved settings. */
export function useHasProjectOverride(projectId: string | null): boolean {
  return useSyncExternalStore(
    subscribe,
    () => (projectId ? Object.prototype.hasOwnProperty.call(byProject, projectId) : false),
    () => false,
  );
}

/** Hook for global defaults used when creating new projects. */
export function useGlobalDefaults(): QuickSettings {
  return useSyncExternalStore(
    subscribe,
    () => globalDefaults,
    () => DEFAULT_SETTINGS,
  );
}