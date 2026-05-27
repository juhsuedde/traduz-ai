import { db } from "./index";
import { domains } from "./schema";

export function seedDomains() {
  const existing = db.select().from(domains).all();
  if (existing.length > 0) return;

  db.insert(domains)
    .values([
      {
        slug: "audiovisual",
        name: "Audiovisual",
        icon: "Clapperboard",
        color: "#ffb5a7",
        basePrompt: `Você é um tradutor especialista em legendagem audiovisual. Traduza o texto a seguir para o Português do Brasil, considerando que ele será usado como legenda de filme/série.

Diretrizes:
- Mantenha fielmente o sentido, o tom e a intenção original
- Evite traduções literais que soem artificiais
- Priorize linguagem fluida, natural e próxima da fala oral
- Adapte expressões para que soem espontâneas e culturalmente naturais
- Preserve o impacto emocional e a nuance da mensagem original
- Respeite o contexto do projeto fornecido abaixo`,
        description: "Legendagem e dublagem",
      },
      {
        slug: "literary",
        name: "Literária",
        icon: "BookOpen",
        color: "#c9b1ff",
        basePrompt: `Você é um tradutor literário especializado. Traduza o texto a seguir para o Português do Brasil.

Diretrizes:
- Preserve a voz, o estilo e o ritmo do autor original
- Mantenha o registro linguístico (formal, coloquial, arcaico, etc.)
- Preserve nuances poéticas, metáforas e jogos de palavras quando possível
- Adapte culturalmente apenas quando necessário para a compreensão
- Respeite o contexto do projeto fornecido abaixo`,
        description: "Tradução literária",
      },
      {
        slug: "games",
        name: "Games",
        icon: "Gamepad2",
        color: "#a8e6cf",
        basePrompt: `Você é um tradutor especializado em localização de games. Traduza o texto a seguir para o Português do Brasil.

Diretrizes:
- Mantenha imersão e consistência terminológica
- Preserve tom e personalidade de personagens
- Adapte referências culturais para o público brasileiro quando apropriado
- Use terminologia padronizada da indústria de games
- Respeite o contexto do projeto fornecido abaixo`,
        description: "Localização de games",
      },
      {
        slug: "technical",
        name: "Técnica",
        icon: "Cog",
        color: "#a0c4ff",
        basePrompt: `Você é um tradutor técnico especializado. Traduza o texto a seguir para o Português do Brasil.

Diretrizes:
- Priorize precisão terminológica acima de tudo
- Mantenha formalidade e estrutura sintática do original
- Preserve siglas e termos técnicos consagrados
- Seja consistente com terminologia ao longo do texto
- Respeite o contexto do projeto fornecido abaixo`,
        description: "Tradução técnica",
      },
      {
        slug: "legal",
        name: "Jurídica",
        icon: "Scale",
        color: "#ffd6a5",
        basePrompt: `Você é um tradutor jurídico especializado. Traduza o texto a seguir para o Português do Brasil.

Diretrizes:
- Precisão terminológica jurídica é obrigatória
- Preserve a estrutura formal e o estilo normativo
- Use equivalentes jurídicos consagrados no direito brasileiro
- Não simplifique linguagem técnica sem indicação explícita
- Respeite o contexto do projeto fornecido abaixo`,
        description: "Tradução jurídica",
      },
    ])
    .run();
}

seedDomains();
