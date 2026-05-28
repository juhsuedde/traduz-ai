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
  {
    id: "g1",
    source: "Mind Flayer",
    target: "Devorador de Mentes",
    note: "Manter o nome consagrado da dublagem.",
    tag: "Personagem",
  },
  {
    id: "g2",
    source: "Upside Down",
    target: "Mundo Invertido",
    note: "Sempre com inicial maiúscula.",
    tag: "Universo",
  },
  { id: "g3", source: "Demogorgon", target: "Demogorgon", note: "Não traduzir.", tag: "Aprovado" },
];
