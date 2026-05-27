import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { QuickSettingsPanel } from "@/components/quick-settings-panel";
import {
  resetProjectSettings,
  setProjectSettings,
  useQuickSettings,
} from "@/lib/quick-settings";
import {
  Plus,
  FileCheck2,
  FileX2,
  BookOpen,
  MoreHorizontal,
  ArrowRight,
  X,
  Upload,
  Trash2,
  Pencil,
  Copy,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos · traduz.ai" },
      { name: "description", content: "Cadernos de contexto para seus trabalhos de tradução." },
    ],
  }),
  component: ProjetosPage,
});

type Domain = "Audiovisual" | "Literária" | "Games" | "Técnica" | "Jurídica";

type GlossaryItem = { source: string; target: string; note?: string };

type ContextProject = {
  id: string;
  name: string;
  domain: Domain;
  description: string;
  synopsis?: string;
  characters?: string;
  glossary: GlossaryItem[];
  styleGuideFile?: string | null;
};

const DOMAIN_STYLES: Record<Domain, { badge: string; ring: string }> = {
  Audiovisual: { badge: "bg-gradient-to-r from-rose-200 to-pink-200 text-rose-900", ring: "from-rose-200/70 to-pink-200/70" },
  Literária:   { badge: "bg-gradient-to-r from-purple-200 to-violet-200 text-purple-900", ring: "from-purple-200/70 to-violet-200/70" },
  Games:       { badge: "bg-gradient-to-r from-emerald-200 to-teal-200 text-emerald-900", ring: "from-emerald-200/70 to-teal-200/70" },
  Técnica:     { badge: "bg-gradient-to-r from-sky-200 to-blue-200 text-sky-900", ring: "from-sky-200/70 to-blue-200/70" },
  Jurídica:    { badge: "bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-900", ring: "from-amber-100/70 to-yellow-200/70" },
};

const SEED: ContextProject[] = [
  {
    id: "p1",
    name: "Stranger Things S5",
    domain: "Audiovisual",
    description: "Série de ficção científica da Netflix — temporada final",
    synopsis:
      "Hawkins enfrenta a invasão final do Mundo Invertido. Eleven recupera seus poderes e o grupo se reúne para encerrar a história.",
    characters:
      "Eleven: fala curta, direta, vocabulário simples. Dustin: sarcástico, gírias adolescentes. Hopper: tom paterno, frases curtas.",
    glossary: Array.from({ length: 12 }).map((_, i) => ({
      source: ["Mind Flayer", "Upside Down", "Demogorgon"][i % 3] + (i > 2 ? ` ${i}` : ""),
      target: ["Devorador de Mentes", "Mundo Invertido", "Demogorgon"][i % 3],
    })),
    styleGuideFile: "netflix-style-guide.pdf",
  },
  {
    id: "p2",
    name: "A Biblioteca da Meia-Noite",
    domain: "Literária",
    description: "Romance de Matt Haig — edição brasileira",
    synopsis:
      "Nora Seed descobre uma biblioteca infinita entre a vida e a morte, onde cada livro é uma versão possível da sua vida.",
    characters: "Nora: introspectiva, melancólica, narração em primeira pessoa fluida.",
    glossary: Array.from({ length: 8 }).map((_, i) => ({
      source: ["regret", "root life", "midnight"][i % 3] + (i > 2 ? ` ${i}` : ""),
      target: ["arrependimento", "vida-raiz", "meia-noite"][i % 3],
    })),
    styleGuideFile: null,
  },
  {
    id: "p3",
    name: "Stardew Valley",
    domain: "Games",
    description: "RPG de simulação rural — atualização 1.6",
    synopsis:
      "Jogo de fazenda com elementos de RPG e simulação social. Atualização 1.6 adiciona novas plantações, festivais e diálogos.",
    characters: "Diálogos curtos, tom acolhedor, sem palavrões. Manter trocadilhos quando possível.",
    glossary: Array.from({ length: 24 }).map((_, i) => ({
      source: ["Junimo", "Parsnip", "Stardrop"][i % 3] + (i > 2 ? ` ${i}` : ""),
      target: ["Junimo", "Pastinaca", "Gota-estrela"][i % 3],
    })),
    styleGuideFile: "concernedape-loc.pdf",
  },
];

const DOMAIN_OPTIONS: Domain[] = ["Audiovisual", "Literária", "Games", "Técnica", "Jurídica"];

function ProjetosPage() {
  const [projects, setProjects] = useState<ContextProject[]>(SEED);
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const openProject = useMemo(
    () => projects.find((p) => p.id === openId) ?? null,
    [openId, projects],
  );

  const onCreate = (p: ContextProject) => {
    setProjects((all) => [p, ...all]);
    setCreating(false);
  };

  const onDuplicate = (id: string) => {
    setProjects((all) => {
      const p = all.find((x) => x.id === id);
      if (!p) return all;
      return [{ ...p, id: crypto.randomUUID(), name: `${p.name} (cópia)` }, ...all];
    });
    setMenuFor(null);
  };

  const onDelete = (id: string) => {
    setProjects((all) => all.filter((p) => p.id !== id));
    setMenuFor(null);
  };

  return (
    <AppShell>
      <PageHeader
        title="Seus Projetos"
        subtitle="Cadernos de contexto para seus trabalhos de tradução"
        action={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm font-medium hover:opacity-90 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Novo Projeto
          </button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState onCreate={() => setCreating(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onOpen={() => setOpenId(p.id)}
              menuOpen={menuFor === p.id}
              onToggleMenu={() => setMenuFor(menuFor === p.id ? null : p.id)}
              onDuplicate={() => onDuplicate(p.id)}
              onDelete={() => onDelete(p.id)}
            />
          ))}
        </div>
      )}

      {creating && <NewProjectModal onClose={() => setCreating(false)} onSave={onCreate} />}
      {openProject && (
        <ProjectDetailModal project={openProject} onClose={() => setOpenId(null)} />
      )}
    </AppShell>
  );
}

function ProjectCard({
  project,
  onOpen,
  menuOpen,
  onToggleMenu,
  onDuplicate,
  onDelete,
}: {
  project: ContextProject;
  onOpen: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const style = DOMAIN_STYLES[project.domain];
  return (
    <article
      onClick={onOpen}
      className="glass card-hover rounded-3xl p-6 hover:bg-white/70 cursor-pointer relative animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold tracking-tight text-lg leading-snug truncate">{project.name}</h3>
          <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${style.badge}`}>
            {project.domain}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu();
            }}
            className="w-8 h-8 rounded-xl hover:bg-white/70 flex items-center justify-center text-muted-foreground"
            aria-label="Mais opções"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-10 glass rounded-2xl p-1.5 min-w-[140px] shadow-md z-20"
            >
              <MenuItem icon={<Pencil className="w-3.5 h-3.5" />} onClick={onDuplicate}>Editar</MenuItem>
              <MenuItem icon={<Copy className="w-3.5 h-3.5" />} onClick={onDuplicate}>Duplicar</MenuItem>
              <MenuItem icon={<Trash2 className="w-3.5 h-3.5" />} onClick={onDelete} danger>Excluir</MenuItem>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-1 mb-4">{project.description}</p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            {project.styleGuideFile ? (
              <>
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                Guia de estilo
              </>
            ) : (
              <>
                <FileX2 className="w-3.5 h-3.5 text-muted-foreground/70" />
                Sem guia
              </>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {project.glossary.length} termos
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white transition inline-flex items-center gap-1"
        >
          Abrir <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </article>
  );
}

function MenuItem({
  icon, children, onClick, danger,
}: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-xs px-3 py-2 rounded-xl hover:bg-white/70 flex items-center gap-2 ${
        danger ? "text-rose-600" : "text-foreground"
      }`}
    >
      {icon}{children}
    </button>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="glass rounded-3xl p-12 text-center flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
        <Sparkles className="w-7 h-7 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold tracking-tight mb-1">Nenhum projeto ainda</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Crie um projeto para guardar contexto, personagens e glossários. O agente usará essas informações nas traduções.
        </p>
      </div>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm font-medium hover:opacity-90 shadow-sm transition"
      >
        <Plus className="w-4 h-4" /> Criar primeiro projeto
      </button>
    </div>
  );
}

/* ---------- New Project Modal ---------- */

function NewProjectModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (p: ContextProject) => void;
}) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState<Domain>("Audiovisual");
  const [description, setDescription] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [characters, setCharacters] = useState("");
  const [glossary, setGlossary] = useState<GlossaryItem[]>([{ source: "", target: "", note: "" }]);
  const [styleGuideFile, setStyleGuideFile] = useState<string | null>(null);

  const updateGloss = (i: number, key: keyof GlossaryItem, val: string) => {
    setGlossary((g) => g.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  };

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      domain,
      description: description.trim(),
      synopsis: synopsis.trim(),
      characters: characters.trim(),
      glossary: glossary.filter((g) => g.source.trim() && g.target.trim()),
      styleGuideFile,
    });
  };

  return (
    <ModalShell onClose={onClose} title="Novo projeto">
      <div className="flex flex-col gap-4">
        <Field label="Nome do projeto">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Stranger Things S5"
            className="w-full bg-white/70 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white"
          />
        </Field>

        <Field label="Domínio">
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value as Domain)}
            className="w-full bg-white/70 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white cursor-pointer"
          >
            {DOMAIN_OPTIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>

        <Field label="Descrição" hint="Opcional">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Sobre o que é esse trabalho?"
            rows={2}
            className="w-full bg-white/70 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white resize-none"
          />
        </Field>

        <Field label="Contexto / Sinopse">
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="Resumo da história, enredo, cenário..."
            rows={3}
            className="w-full bg-white/70 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white resize-none"
          />
        </Field>

        <Field label="Personagens">
          <textarea
            value={characters}
            onChange={(e) => setCharacters(e.target.value)}
            placeholder="Descreva os personagens principais e como falam"
            rows={3}
            className="w-full bg-white/70 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white resize-none"
          />
        </Field>

        <Field label="Glossário manual">
          <div className="flex flex-col gap-2">
            {glossary.map((g, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.2fr_auto] gap-2">
                <input
                  value={g.source}
                  onChange={(e) => updateGloss(i, "source", e.target.value)}
                  placeholder="Termo original"
                  className="bg-white/70 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white"
                />
                <input
                  value={g.target}
                  onChange={(e) => updateGloss(i, "target", e.target.value)}
                  placeholder="Tradução"
                  className="bg-white/70 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white"
                />
                <input
                  value={g.note ?? ""}
                  onChange={(e) => updateGloss(i, "note", e.target.value)}
                  placeholder="Notas (opcional)"
                  className="bg-white/70 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white"
                />
                <button
                  onClick={() => setGlossary((g) => g.filter((_, idx) => idx !== i))}
                  className="w-9 h-9 rounded-xl hover:bg-white/70 text-muted-foreground flex items-center justify-center"
                  aria-label="Remover"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setGlossary((g) => [...g, { source: "", target: "", note: "" }])}
              className="self-start text-xs font-medium px-3 py-2 rounded-xl bg-white/60 hover:bg-white inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar termo
            </button>
          </div>
        </Field>

        <Field label="Guia de estilo">
          <label className="flex items-center gap-3 bg-white/70 rounded-2xl px-4 py-3 text-sm cursor-pointer hover:bg-white transition">
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {styleGuideFile ? styleGuideFile : "Clique para anexar um PDF ou documento"}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setStyleGuideFile(f.name);
              }}
            />
          </label>
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-sm text-muted-foreground hover:bg-white/60 transition"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm font-medium hover:opacity-90 shadow-sm transition"
          >
            Salvar projeto
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ---------- Project Detail Modal ---------- */

function ProjectDetailModal({
  project,
  onClose,
}: {
  project: ContextProject;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"visao" | "ajustes" | "glossario" | "guia">("visao");
  const [query, setQuery] = useState("");
  const style = DOMAIN_STYLES[project.domain];
  const settings = useQuickSettings(project.id);

  const filteredGloss = project.glossary.filter(
    (g) =>
      !query ||
      g.source.toLowerCase().includes(query.toLowerCase()) ||
      g.target.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <ModalShell
      onClose={onClose}
      title={
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-lg tracking-tight">{project.name}</span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${style.badge}`}>
            {project.domain}
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="inline-flex bg-white/60 rounded-full p-1 text-xs font-medium self-start">
          {[
            { id: "visao", label: "Visão geral" },
            { id: "ajustes", label: "Ajustes de tradução" },
            { id: "glossario", label: "Glossário" },
            { id: "guia", label: "Guia de estilo" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-1.5 rounded-full transition ${
                tab === t.id
                  ? "bg-gradient-to-r from-pink-300 to-purple-300 text-white shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "visao" && (
          <div className="flex flex-col gap-4">
            <Section title="Descrição">{project.description || "—"}</Section>
            <Section title="Sinopse">{project.synopsis || "—"}</Section>
            <Section title="Personagens">{project.characters || "—"}</Section>
          </div>
        )}

        {tab === "ajustes" && (
          <QuickSettingsPanel
            value={settings}
            onChange={(s) => setProjectSettings(project.id, s)}
            onReset={() => resetProjectSettings(project.id)}
            domain={project.domain}
            projectName={project.name}
            projectContext={project.synopsis}
            helperText="Esses ajustes serão aplicados automaticamente quando você usar este projeto no chat."
          />
        )}

        {tab === "glossario" && (
          <div className="flex flex-col gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar termo..."
              className="bg-white/70 rounded-2xl px-4 py-2.5 text-sm outline-none focus:bg-white"
            />
            <div className="glass rounded-2xl divide-y divide-white/40 overflow-hidden">
              {filteredGloss.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">Nenhum termo.</div>
              )}
              {filteredGloss.map((g, i) => (
                <div key={i} className="px-4 py-3 grid grid-cols-1 md:grid-cols-[1fr_1fr_1.2fr] gap-2 text-sm">
                  <div className="font-medium">{g.source}</div>
                  <div className="text-muted-foreground">→ {g.target}</div>
                  <div className="text-xs text-muted-foreground">{g.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "guia" && (
          <div className="glass rounded-2xl p-5">
            {project.styleGuideFile ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-medium text-sm">{project.styleGuideFile}</div>
                    <div className="text-xs text-muted-foreground">Guia anexado</div>
                  </div>
                </div>
                <button className="text-xs font-medium px-3 py-2 rounded-xl bg-white/70 hover:bg-white transition">
                  Ver
                </button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Nenhum guia de estilo anexado.
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button className="px-4 py-2.5 rounded-2xl text-sm bg-white/70 hover:bg-white transition inline-flex items-center gap-2">
            <Pencil className="w-3.5 h-3.5" /> Editar projeto
          </button>
          <Link
            to="/inicio"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm font-medium hover:opacity-90 shadow-sm transition inline-flex items-center gap-2"
          >
            Usar este projeto no chat <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </ModalShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
        {title}
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
  );
}

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/* ---------- Modal Shell ---------- */

function ModalShell({
  title, onClose, children,
}: { title: React.ReactNode; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            {typeof title === "string" ? (
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            ) : (
              title
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-white/70 flex items-center justify-center text-muted-foreground shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}