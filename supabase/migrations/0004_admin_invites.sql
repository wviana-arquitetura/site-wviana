-- =============================================================================
-- Migration 0004 — convites de acesso ao painel
-- =============================================================================
-- Elimina o cadastro manual de admins via SQL. O dono convida pelo e-mail
-- (tabela admin_invites); no primeiro login via Google, o /auth/callback
-- promove o convite a uma linha em admin_users (via service role) e o apaga.
-- A FK admin_users.id → auth.users.id permanece intacta: admin_users só
-- ganha linha quando o uuid já existe em auth.users.
--
-- Segurança:
--   - admin_invites com RLS ligado e SEM policies: nenhum papel (anon ou
--     authenticated) lê ou escreve — acesso exclusivo da service role nas
--     server actions. O middleware (anon key) não precisa desta tabela.
--   - Trigger protect_last_owner impede remover/rebaixar o último owner
--     mesmo via service role (triggers não são bypassados, ao contrário
--     de RLS) — última camada além da checagem nas server actions.
-- =============================================================================

create table public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role admin_role not null default 'editor',
  invited_by uuid references public.admin_users(id) on delete set null,
  invited_by_email text,
  created_at timestamptz not null default now(),

  -- Comparação no callback é por igualdade exata; normalizamos na escrita.
  constraint admin_invites_email_lowercase check (email = lower(email))
);

comment on table public.admin_invites is
  'Convites pendentes de acesso ao painel. Promovidos a admin_users no primeiro login (/auth/callback). Acesso exclusivo via service role.';

alter table public.admin_invites enable row level security;
-- Sem policies de propósito: só a service role enxerga esta tabela.


-- =============================================================================
-- Trigger: protege o último owner
-- =============================================================================
-- Bloqueia DELETE ou rebaixamento (owner → editor) quando não sobraria nenhum
-- outro owner. As server actions já validam isso; o trigger é a garantia final
-- no banco, valendo até para a service role.

create or replace function public.protect_last_owner()
returns trigger as $$
begin
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role is distinct from 'owner')
     and not exists (
       select 1 from public.admin_users
       where role = 'owner' and id <> old.id
     )
  then
    raise exception 'Não é possível remover ou rebaixar o último owner';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger admin_users_protect_last_owner
  before delete or update of role on public.admin_users
  for each row
  execute function public.protect_last_owner();
