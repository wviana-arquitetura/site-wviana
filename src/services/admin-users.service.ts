import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/audit";
import {
  ADMIN_ROLE_LABEL,
  type AdminAccessRequestRow,
  type AdminInviteRow,
  type AdminUserRow,
} from "@/lib/supabase/types";

/**
 * Lista quem tem acesso ao painel, mais antigos primeiro. Uso exclusivo da
 * página /admin/usuarios (via service role, sempre fresco).
 */
export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[admin-users.service] listAdminUsers:", error.message);
    return [];
  }

  return (data ?? []) as AdminUserRow[];
}

/**
 * Lista os convites pendentes (ainda não ativados por um primeiro login),
 * mais recentes primeiro.
 */
export async function listPendingInvites(): Promise<AdminInviteRow[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("admin_invites")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin-users.service] listPendingInvites:", error.message);
    return [];
  }

  return (data ?? []) as AdminInviteRow[];
}

/**
 * Lista os pedidos de acesso feitos na tela de login (ainda não aprovados
 * nem recusados), mais recentes primeiro.
 */
export async function listAccessRequests(): Promise<AdminAccessRequestRow[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("admin_access_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin-users.service] listAccessRequests:", error.message);
    return [];
  }

  return (data ?? []) as AdminAccessRequestRow[];
}

/**
 * Promove um convite pendente no primeiro login. Chamada pelo /auth/callback
 * logo após a troca do code por sessão: se o e-mail da conta Google tem
 * convite em admin_invites, insere a pessoa em admin_users (agora o uuid já
 * existe em auth.users — a FK deixa) com o papel do convite, apaga o convite
 * e registra na auditoria.
 *
 * Best-effort: falha aqui não derruba o login — o middleware barra o usuário
 * na sequência e ele pode tentar entrar de novo.
 */
export async function promotePendingInvite(user: {
  id: string;
  email: string | null;
}): Promise<void> {
  if (!user.email) return;
  const email = user.email.toLowerCase();

  try {
    const supabase = createSupabaseServiceRoleClient();

    // Já é admin? Nada a fazer (caminho de todo login subsequente).
    const { data: existing } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (existing) return;

    const { data: invite } = await supabase
      .from("admin_invites")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (!invite) return;

    const { error: insertError } = await supabase
      .from("admin_users")
      .insert({ id: user.id, email, role: invite.role });
    if (insertError) {
      console.error(
        "[admin-users.service] promoção de convite falhou:",
        insertError.message,
      );
      return;
    }

    await supabase.from("admin_invites").delete().eq("id", invite.id);
    // Se a pessoa também tinha pedido acesso, o pedido virou redundante.
    await supabase.from("admin_access_requests").delete().eq("user_id", user.id);

    await recordAudit({
      actorId: user.id,
      actorEmail: email,
      action: "first_login",
      entityType: "admin_user",
      entityId: user.id,
      entityLabel: email,
      summary: `${email} entrou pela primeira vez e ativou o convite (${ADMIN_ROLE_LABEL[invite.role as AdminUserRow["role"]].toLowerCase()})`,
      details: { role: invite.role, invitedByEmail: invite.invited_by_email },
    });
  } catch (e) {
    console.error(
      "[admin-users.service] erro inesperado na promoção:",
      (e as Error).message,
    );
  }
}
