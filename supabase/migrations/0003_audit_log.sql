-- =============================================================================
-- Migration 0003 — trilha de auditoria do painel admin
-- =============================================================================
-- Registra cada ação de escrita feita pelo painel (criar, editar, excluir,
-- publicar, despublicar, reordenar, galeria e destaques da home): quem fez,
-- quando, em qual projeto e o antes/depois.
--
-- Append-only na prática: as entradas são inseridas apenas pela service role
-- das server actions verificadas. Não há policy de insert/update/delete, então
-- nenhum usuário autenticado consegue forjar ou apagar registros via RLS.
-- =============================================================================

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Quem fez. actor_id vira null se o admin for removido do sistema; actor_email
  -- é um snapshot que sobrevive à remoção, pra a trilha continuar legível.
  actor_id uuid references public.admin_users(id) on delete set null,
  actor_email text,

  -- O que fez.
  action text not null,          -- create | update | delete | publish | unpublish | reorder | gallery | featured
  entity_type text not null default 'project',
  entity_id uuid,                -- null em ações globais (reorder, featured)
  entity_label text,             -- título/slug no momento da ação; legível mesmo após exclusão

  -- Detalhe legível + estruturado (diff de campos, ou snapshot no caso de exclusão).
  summary text not null,
  details jsonb
);

create index audit_log_created_idx on public.audit_log(created_at desc);
create index audit_log_entity_idx on public.audit_log(entity_id);

comment on table public.audit_log is
  'Trilha de auditoria do painel: quem alterou o quê e quando. Append-only via service role.';


-- =============================================================================
-- RLS
-- =============================================================================
-- Admin autenticado LÊ a trilha. Ninguém insere/edita/apaga via RLS: a escrita
-- é exclusiva da service role (bypass RLS) nas server actions verificadas.

alter table public.audit_log enable row level security;

create policy "Admin can read audit log"
  on public.audit_log
  for select
  to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()));
