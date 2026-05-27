export const currentUser = {
  name: "Ana",
  email: "ana@traduz.ai",
  initials: "AN",
  role: "Tradutora EN → PT",
};

export type Project = {
  id: string;
  name: string;
  domain: string;
};

export const projects: Project[] = [
  {
    id: "p1",
    name: "Stranger Things S5",
    domain: "Audiovisual",
  },
  {
    id: "p2",
    name: "A Biblioteca da Meia-Noite",
    domain: "Literária",
  },
  {
    id: "p3",
    name: "Stardew Valley",
    domain: "Games",
  },
];

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type Conversation = {
  id: string;
  title: string;
  project: string;
  updated: string;
  preview: string;
  messages: ChatMessage[];
};

export const conversations: Conversation[] = [];

export type GlossaryEntry = {
  id: string;
  source: string;
  target: string;
  note: string;
  tag: string;
};

export const glossary: GlossaryEntry[] = [
  { id: "g1", source: "Glow", target: "Brillo", note: "Use as noun. Avoid 'resplandor' (too formal).", tag: "Brand voice" },
  { id: "g2", source: "Routine", target: "Rutina", note: "Daily ritual context — never 'régimen'.", tag: "Product" },
  { id: "g3", source: "Radiant", target: "Radiante", note: "Approved by client style guide v2.", tag: "Approved" },
  { id: "g4", source: "Hydration boost", target: "Impulso de hidratación", note: "Marketing-friendly; clinical version: 'hidratación intensiva'.", tag: "Marketing" },
  { id: "g5", source: "Cruelty-free", target: "Libre de crueldad", note: "Do not translate as 'sin crueldad'.", tag: "Compliance" },
  { id: "g6", source: "Skin barrier", target: "Barrera cutánea", note: "Scientific. Use consistently across SKUs.", tag: "Technical" },
];