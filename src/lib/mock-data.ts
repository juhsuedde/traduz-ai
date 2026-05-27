export const currentUser = {
  name: "Ana",
  email: "ana@traduz.ai",
  initials: "AN",
  role: "EN → ES · PT Translator",
};

export type Project = {
  id: string;
  name: string;
  client: string;
  domain: string;
  languagePair: string;
  progress: number;
  words: number;
  due: string;
  status: "in-progress" | "review" | "done";
  accent: string;
};

export const projects: Project[] = [
  {
    id: "p1",
    name: "Aurora Skincare — Spring Campaign",
    client: "Aurora Beauty Co.",
    domain: "Marketing · Beauty",
    languagePair: "EN → ES",
    progress: 72,
    words: 8420,
    due: "May 30",
    status: "in-progress",
    accent: "from-pink-200/60 to-purple-200/60",
  },
  {
    id: "p2",
    name: "MedCore Patient Handbook",
    client: "MedCore Health",
    domain: "Medical · Healthcare",
    languagePair: "EN → PT",
    progress: 35,
    words: 14200,
    due: "Jun 12",
    status: "in-progress",
    accent: "from-mint-200/60 to-sky-200/60",
  },
  {
    id: "p3",
    name: "Nimbus App Localization v2.4",
    client: "Nimbus Studio",
    domain: "Software · UI Strings",
    languagePair: "EN → ES",
    progress: 100,
    words: 3120,
    due: "May 18",
    status: "done",
    accent: "from-sky-200/60 to-lavender-200/60",
  },
  {
    id: "p4",
    name: "Bloom Legal — Terms of Service",
    client: "Bloom Legal",
    domain: "Legal · Contracts",
    languagePair: "EN → PT",
    progress: 58,
    words: 6740,
    due: "Jun 4",
    status: "review",
    accent: "from-amber-100/60 to-pink-200/60",
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

export const conversations: Conversation[] = [
  {
    id: "c1",
    title: "Tone check for skincare hero copy",
    project: "Aurora Skincare",
    updated: "10 min ago",
    preview: "Could you make it feel a bit more playful but…",
    messages: [
      { role: "user", content: "Help me translate this hero headline keeping a playful tone: 'Glow like you mean it.'" },
      { role: "assistant", content: "Here are three options in Spanish:\n\n1. Brilla como si nada\n2. Brilla con intención\n3. Resplandece a tu manera\n\nOption 1 feels the most playful and youthful — perfect for a campaign aimed at Gen Z." },
      { role: "user", content: "Love #1. Can you adapt it for Portuguese as well?" },
    ],
  },
  {
    id: "c2",
    title: "Medical terminology — dosage instructions",
    project: "MedCore Handbook",
    updated: "Yesterday",
    preview: "What's the standard PT-BR phrasing for 'as needed'?",
    messages: [
      { role: "user", content: "What's the standard PT-BR phrasing for 'take as needed'?" },
      { role: "assistant", content: "The accepted clinical phrasing is 'tomar conforme a necessidade' or the abbreviated 'S/N' on prescriptions. Avoid 'quando precisar' in formal medical contexts." },
    ],
  },
  {
    id: "c3",
    title: "Legal — liability clause review",
    project: "Bloom Legal ToS",
    updated: "2 days ago",
    preview: "Double-check this rendering preserves limitation of…",
    messages: [
      { role: "user", content: "Does this translation preserve the limitation of liability properly?" },
      { role: "assistant", content: "Yes, the structure holds, but consider replacing 'responsabilidade' with 'responsabilização' in clause 4.2 for stricter legal parallelism." },
    ],
  },
];

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