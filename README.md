<div align="center">
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-yellow" alt="Status">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</div>

<h1 align="center">traduz.ai</h1>

<p align="center">
  Assistente de tradução com IA — feito por tradutores, para tradutores.
  <br />
  <a href="#funcionalidades"><strong>Explore a documentação »</strong></a>
  <br />
  <br />
</p>

## Sobre

**traduz.ai** é uma aplicação web full-stack desenvolvida para tradutores profissionais que traduzem para o português brasileiro. A plataforma utiliza inteligência artificial (via OpenRouter / GPT-4o-mini) como assistente de tradução, oferecendo controle total sobre o contexto, estilo e terminologia do projeto.

Diferente de soluções genéricas, o traduz.ai permite que o tradutor defina o domínio de tradução (Audiovisual, Literário, Games, Técnico, Jurídico), crie projetos com glossário e guia de estilo, e tenha a IA ajustada ao seu contexto específico.

## Funcionalidades

- **Chat de tradução com IA** — Interface conversacional com respostas em streaming (SSE). Escolha o domínio e converse com a IA para traduzir ou revisar textos.
- **Projetos contextuais** — Crie projetos com sinopse, personagens, notas de estilo e glossário. Toda essa informação é injetada no prompt da IA para manter consistência.
- **Glossário terminológico** — Defina termos fixos com tradução obrigatória por projeto. A IA respeita o glossário nas respostas.
- **Guia de estilo** — Faça upload de arquivos (SRT, TXT, DOCX) com instruções de estilo. A IA extrai e aplica as regras automaticamente.
- **Revisor de texto** — Ferramenta standalone que analisa gramática, semântica, fluência, aderência ao projeto e conformidade com o guia de estilo.
- **Tradução de arquivos** — Upload de arquivos SRT, TXT e DOCX para tradução em lote, segmento por segmento.
- **Ajustes rápidos** — Controle de tom (formal/neutro/casual), adaptação cultural (conservador/moderado/liberal) e foco (fidelidade/equilibrado/naturalidade).
- **Autenticação** — Cadastro e login com e-mail e senha (Lucia Auth + SQLite).
- **Sugestões** — Página de feedback para envio e acompanhamento de sugestões de funcionalidades.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Linguagem** | TypeScript |
| **Runtime** | Bun |
| **Frontend** | React 19 + TanStack Start (SSR) |
| **Roteamento** | TanStack Router (rotas baseadas em arquivos) |
| **Estado** | TanStack React Query |
| **UI** | Radix UI + shadcn/ui (New York) |
| **Estilização** | Tailwind CSS v4 |
| **Banco** | SQLite via Drizzle ORM |
| **Autenticação** | Lucia Auth v3 |
| **IA** | OpenAI SDK via OpenRouter |
| **Servidor** | h3 / Nitro (embutido no TanStack Start) |
| **Build** | Vite 7 |
| **Deploy** | Vercel |

## Pré-requisitos

- [Bun](https://bun.sh) (v1.x ou superior)
- Uma chave de API do [OpenRouter](https://openrouter.ai) (ou qualquer provedor compatível com OpenAI)

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/traduz-ai.git
cd traduz-ai

# Instale as dependências
bun install
```

## Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL=./traduzai.db
AUTH_SECRET=sua_chave_secreta_min_32_caracteres
OPENROUTER_API_KEY=sk-or-v1-sua-chave-aqui
```

> **AUTH_SECRET**: gere com `openssl rand -base64 32`.\
> **OPENROUTER_API_KEY**: obrigatória para funcionalidades de IA.\
> **OPENROUTER_MODEL** (opcional): modelo padrão `openai/gpt-4o-mini`.

### Banco de dados

O projeto usa SQLite local — sem necessidade de setup externo.

```bash
# Gera as migrations a partir do schema
bun run db:generate

# Aplica as migrations
bun run db:migrate

# Popula os domínios padrão (5 áreas de tradução)
bun run db:seed
```

## Desenvolvimento

```bash
bun run dev
```

Acesse em [http://localhost:3456](http://localhost:3456). Hot reload ativo.

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `bun run dev` | Inicia servidor de desenvolvimento |
| `bun run build` | Build de produção |
| `bun run preview` | Pré-visualiza o build de produção |
| `bun run lint` | Executa ESLint |
| `bun run format` | Formata código com Prettier |
| `bun run db:generate` | Gera migrations Drizzle |
| `bun run db:migrate` | Aplica migrations |
| `bun run db:seed` | Popula dados iniciais |
| `bun run db:studio` | Abre Drizzle Studio (GUI do banco) |

## Estrutura do projeto

```
src/
├── routes/          # Rotas da aplicação (file-based)
│   ├── index.tsx    # Landing page / seleção de domínio
│   ├── inicio.tsx   # Chat principal
│   ├── projetos.tsx # Gerenciamento de projetos
│   ├── revisor.tsx  # Revisor de texto
│   ├── entrar.tsx   # Login
│   └── cadastrar.tsx # Cadastro
├── components/      # Componentes React reutilizáveis
│   ├── ui/          # shadcn/ui
│   ├── app-shell.tsx
│   └── app-sidebar.tsx
├── hooks/           # Custom hooks
│   ├── use-chat.ts
│   └── use-auth.ts
└── lib/             # Lógica central
    ├── db/          # Schema e migrations Drizzle
    ├── auth/        # Autenticação (Lucia)
    ├── api/         # Server functions
    └── prompts.ts   # Builder de prompts para a IA
```

## Deploy

O projeto está configurado para deploy na **Vercel**.

```bash
bun run build
```

O build gera os artefatos em `.vercel/output/` (formato Vercel Serverless).

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

<p align="center">
  Feito para a comunidade de tradução.
</p>
