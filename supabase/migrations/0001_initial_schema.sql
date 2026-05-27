-- =============================================================================
-- Schema inicial — painel administrativo do site W.VIANA
-- =============================================================================
-- Cria tabelas para projetos, galeria, favoritos da home e usuários admin.
-- Aplica Row Level Security (RLS) para que o site público leia apenas projetos
-- publicados, e somente usuários autorizados consigam escrever.
-- =============================================================================


-- =============================================================================
-- 1. ENUMS
-- =============================================================================

create type project_published_status as enum ('draft', 'published');
create type project_typology as enum ('Residencial', 'Comercial', 'Corporativo');
create type project_status_label as enum ('Concluído', 'Em andamento');
create type admin_role as enum ('owner', 'editor');


-- =============================================================================
-- 2. TABELA: admin_users
-- =============================================================================
-- Quem pode acessar o painel administrativo. Linha por usuário autorizado.
-- A coluna `id` referencia `auth.users.id` do Supabase Auth — quando alguém
-- loga via Google, o id da sessão tem que existir aqui senão é rejeitado.

create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role admin_role not null default 'editor',
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Usuários autorizados a acessar o painel administrativo. Inserir manualmente para o primeiro acesso.';


-- =============================================================================
-- 3. TABELA: projects
-- =============================================================================
-- Substitui o `src/data/projects.json`. Cada projeto do portfólio é uma linha.
-- Versionamento simples via `published_status`: draft (rascunho, só visível no
-- painel) vs published (visível no site público).

create table public.projects (
  id uuid primary key default gen_random_uuid(),

  -- Identificação
  slug text not null unique,
  title text not null,
  category text not null,
  typology project_typology not null,
  status_label project_status_label not null,

  -- Localização e metadados
  location text not null,
  country text not null,
  area text,
  year text,
  client text,

  -- Imagens (URLs do Supabase Storage)
  image_src text not null,
  image_alt text,
  og_image_src text,

  -- Conteúdo
  summary text not null,
  scope jsonb not null default '[]'::jsonb,
  services jsonb default '[]'::jsonb,
  area_served jsonb default '[]'::jsonb,
  chapters jsonb not null default '[]'::jsonb,

  -- SEO
  seo_title text,
  seo_description text,

  -- Estado editorial
  published_status project_published_status not null default 'draft',
  display_order integer not null default 0,

  -- Auditoria
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id) on delete set null,
  updated_by uuid references public.admin_users(id) on delete set null
);

create index projects_published_idx on public.projects(published_status, display_order);
create index projects_slug_idx on public.projects(slug);

comment on table public.projects is
  'Projetos do portfólio. Substitui src/data/projects.json. Site público lê só published.';


-- =============================================================================
-- 4. TABELA: project_gallery_images
-- =============================================================================
-- Galeria de cada projeto (1:N). Ordem controlada por `position`.

create table public.project_gallery_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  src text not null,
  alt text not null default '',
  position integer not null default 0
);

create index project_gallery_project_idx on public.project_gallery_images(project_id, position);

comment on table public.project_gallery_images is
  'Imagens da galeria de cada projeto. Ordem pela coluna position.';


-- =============================================================================
-- 5. TABELA: home_featured
-- =============================================================================
-- Os 3 projetos em destaque na home. Constraint garante exatamente 3 posições
-- distintas (1, 2, 3) e nenhum projeto repetido.

create table public.home_featured (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  position integer not null check (position between 1 and 3) unique
);

comment on table public.home_featured is
  'Os 3 projetos em destaque na home, ordenados por position (1 a 3).';


-- =============================================================================
-- 6. TRIGGER: atualiza updated_at automaticamente
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();


-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Habilita RLS em todas as tabelas. Sem política, ninguém lê/escreve.

alter table public.projects enable row level security;
alter table public.project_gallery_images enable row level security;
alter table public.home_featured enable row level security;
alter table public.admin_users enable row level security;


-- ---- POLÍTICAS: projects ----

-- Site público (anônimo ou autenticado) lê apenas projetos publicados.
create policy "Public can read published projects"
  on public.projects
  for select
  using (published_status = 'published');

-- Admin autenticado lê TODOS os projetos (drafts + published).
create policy "Admin can read all projects"
  on public.projects
  for select
  to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Admin pode inserir.
create policy "Admin can insert projects"
  on public.projects
  for insert
  to authenticated
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- Admin pode atualizar.
create policy "Admin can update projects"
  on public.projects
  for update
  to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Admin pode deletar.
create policy "Admin can delete projects"
  on public.projects
  for delete
  to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()));


-- ---- POLÍTICAS: project_gallery_images ----

-- Site público lê galeria de projetos publicados.
create policy "Public can read gallery of published projects"
  on public.project_gallery_images
  for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_gallery_images.project_id
        and projects.published_status = 'published'
    )
  );

-- Admin gerencia tudo na galeria.
create policy "Admin can manage gallery"
  on public.project_gallery_images
  for all
  to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));


-- ---- POLÍTICAS: home_featured ----

-- Site público lê os 3 destaques.
create policy "Public can read home featured"
  on public.home_featured
  for select
  using (true);

-- Admin gerencia.
create policy "Admin can manage home featured"
  on public.home_featured
  for all
  to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));


-- ---- POLÍTICAS: admin_users ----

-- Usuário autenticado vê apenas a própria linha (descobre se é admin).
create policy "Users can read own admin row"
  on public.admin_users
  for select
  to authenticated
  using (id = auth.uid());

-- Apenas owners podem inserir novos admins.
create policy "Only owners can insert admins"
  on public.admin_users
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and role = 'owner'
    )
  );


-- =============================================================================
-- 8. STORAGE BUCKET para imagens de projetos
-- =============================================================================
-- Bucket público de leitura, upload restrito a admins.

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- Leitura pública de qualquer imagem no bucket
create policy "Public read project images"
  on storage.objects
  for select
  using (bucket_id = 'project-images');

-- Admin pode fazer upload
create policy "Admin upload project images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- Admin pode atualizar (sobrescrever)
create policy "Admin update project images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'project-images'
    and exists (select 1 from public.admin_users where id = auth.uid())
  );

-- Admin pode deletar
create policy "Admin delete project images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'project-images'
    and exists (select 1 from public.admin_users where id = auth.uid())
  );
