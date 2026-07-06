-- =============================================================================
-- Migration 0005 — solicitações de acesso ao painel
-- =============================================================================
-- Complementa o fluxo de convites (migration 0004) na direção contrária:
-- quem tenta entrar sem cadastro pode pedir acesso na própria tela de login.
--
-- Como a pessoa já completou o OAuth pra ser barrada, ela TEM sessão — o
-- pedido é gravado com o uuid e o e-mail reais da sessão (nada digitado,
-- nada falsificável) e a FK pra auth.users funciona. Por isso a aprovação
-- do owner insere direto em admin_users: o acesso vale imediatamente, sem
-- novo login nem convite.
--
-- Segurança: RLS ligado e SEM policies — acesso exclusivo da service role
-- nas server actions (a action de pedir valida a sessão antes de gravar).
-- =============================================================================

create table public.admin_access_requests (
  id uuid primary key default gen_random_uuid(),

  -- Um pedido por conta; some se a conta for apagada do Auth.
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),

  constraint admin_access_requests_email_lowercase check (email = lower(email))
);

comment on table public.admin_access_requests is
  'Pedidos de acesso feitos na tela de login por contas sem cadastro. Aprovação (em /admin/usuarios) insere direto em admin_users. Acesso exclusivo via service role.';

alter table public.admin_access_requests enable row level security;
-- Sem policies de propósito: só a service role enxerga esta tabela.
