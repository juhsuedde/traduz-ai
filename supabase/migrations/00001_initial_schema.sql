-- =============================================================
-- traduz.ai — Schema completo
-- Executar no Supabase SQL Editor (ordem definida)
-- =============================================================

-- 1. Domínios (seed fixo, leitura pública)
-- =============================================================
create table public.domains (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text,
  color text,
  base_prompt text not null,
  description text,
  restrictions jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.domains enable row level security;
create policy "domains are viewable by everyone"
  on public.domains for select using (true);

insert into public.domains (slug, name, icon, color, base_prompt, description) values
(
  'audiovisual',
  'Audiovisual',
  'Clapperboard',
  '#ffb5a7',
  'Você é um tradutor especialista em legendagem audiovisual. Traduza o texto a seguir para o Português do Brasil, considerando que ele será usado como legenda de filme/série.

Diretrizes:
- Mantenha fielmente o sentido, o tom e a intenção original
- Evite traduções literais que soem artificiais
- Priorize linguagem fluida, natural e próxima da fala oral
- Adapte expressões para que soem espontâneas e culturalmente naturais
- Preserve o impacto emocional e a nuance da mensagem original
- Respeite o contexto do projeto fornecido abaixo',
  'Legendagem e dublagem'
),
(
  'literary',
  'Literária',
  'BookOpen',
  '#c9b1ff',
  'Você é um tradutor literário especializado. Traduza o texto a seguir para o Português do Brasil.

Diretrizes:
- Preserve a voz, o estilo e o ritmo do autor original
- Mantenha o registro linguístico (formal, coloquial, arcaico, etc.)
- Preserve nuances poéticas, metáforas e jogos de palavras quando possível
- Adapte culturalmente apenas quando necessário para a compreensão
- Respeite o contexto do projeto fornecido abaixo',
  'Tradução literária'
),
(
  'games',
  'Games',
  'Gamepad2',
  '#a8e6cf',
  'Você é um tradutor especializado em localização de games. Traduza o texto a seguir para o Português do Brasil.

Diretrizes:
- Mantenha imersão e consistência terminológica
- Preserve tom e personalidade de personagens
- Adapte referências culturais para o público brasileiro quando apropriado
- Use terminologia padronizada da indústria de games
- Respeite o contexto do projeto fornecido abaixo',
  'Localização de games'
),
(
  'technical',
  'Técnica',
  'Cog',
  '#a0c4ff',
  'Você é um tradutor técnico especializado. Traduza o texto a seguir para o Português do Brasil.

Diretrizes:
- Priorize precisão terminológica acima de tudo
- Mantenha formalidade e estrutura sintática do original
- Preserve siglas e termos técnicos consagrados
- Seja consistente com terminologia ao longo do texto
- Respeite o contexto do projeto fornecido abaixo',
  'Tradução técnica'
),
(
  'legal',
  'Jurídica',
  'Scale',
  '#ffd6a5',
  'Você é um tradutor jurídico especializado. Traduza o texto a seguir para o Português do Brasil.

Diretrizes:
- Precisão terminológica jurídica é obrigatória
- Preserve a estrutura formal e o estilo normativo
- Use equivalentes jurídicos consagrados no direito brasileiro
- Não simplifique linguagem técnica sem indicação explícita
- Respeite o contexto do projeto fornecido abaixo',
  'Tradução jurídica'
);

-- 2. Perfis (extensão de auth.users)
-- =============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  active_domain_id uuid references public.domains(id),
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Projetos
-- =============================================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain_id uuid references public.domains(id),
  name text not null,
  description text,
  synopsis text,
  characters text,
  style_notes text,
  style_guide_url text,
  style_guide_filename text,
  context_data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "users can crud own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index projects_user_id_idx on public.projects(user_id);
create index projects_updated_at_idx on public.projects(updated_at desc);

-- 4. Glossário
-- =============================================================
create table public.glossary_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  original_term text not null,
  translated_term text not null,
  notes text,
  tag text,
  created_at timestamptz default now()
);

alter table public.glossary_entries enable row level security;

create policy "users can crud own glossary entries"
  on public.glossary_entries for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create index glossary_project_id_idx on public.glossary_entries(project_id);

-- 5. Sessões de chat
-- =============================================================
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  domain_id uuid references public.domains(id),
  title text default 'Nova conversa',
  session_type text not null default 'translation'
    check (session_type in ('translation', 'review')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.chat_sessions enable row level security;

create policy "users can crud own sessions"
  on public.chat_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index sessions_user_id_idx on public.chat_sessions(user_id);
create index sessions_updated_at_idx on public.chat_sessions(updated_at desc);

-- 6. Mensagens
-- =============================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  attachments jsonb default '[]'::jsonb,
  tokens_used integer,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "users can crud own messages"
  on public.messages for all
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create index messages_session_id_idx on public.messages(session_id);
create index messages_created_at_idx on public.messages(created_at);

-- 7. Guias de estilo
-- =============================================================
create table public.style_guides (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_size integer,
  mime_type text,
  parsed_rules jsonb default '[]'::jsonb,
  parsing_status text default 'pending'
    check (parsing_status in ('pending', 'processing', 'done', 'error')),
  created_at timestamptz default now()
);

alter table public.style_guides enable row level security;

create policy "users can crud own style guides"
  on public.style_guides for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

-- 8. Trigger updated_at genérico
-- =============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

create trigger set_sessions_updated_at
  before update on public.chat_sessions
  for each row execute procedure public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- 9. Storage policies (executar APÓS criar bucket style-guides no dashboard)
-- =============================================================
-- create policy "users can upload style guides"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'style-guides' and
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- create policy "users can view own style guides"
--   on storage.objects for select
--   using (
--     bucket_id = 'style-guides' and
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- create policy "users can delete own style guides"
--   on storage.objects for delete
--   using (
--     bucket_id = 'style-guides' and
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
