"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/audit";
import { ADMIN_ROLE_LABEL, type AdminRole } from "@/lib/supabase/types";
import { requireOwner, type AdminActor } from "./guards";
import type { ActionResult } from "./projects";

/**
 * Server actions da área "Usuários" (/admin/usuarios). Todas exigem role
 * 'owner' (requireOwner) e escrevem via service role — RLS fica como última
 * camada, e o trigger protect_last_owner (migration 0004) garante no banco
 * que o último owner nunca é removido/rebaixado.
 */

const inviteSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Informe um e-mail válido")),
  role: z.enum(["owner", "editor"]),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;

function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/**
 * Convida alguém pelo e-mail Google. A pessoa entra sozinha no primeiro
 * login: o /auth/callback promove o convite a linha em admin_users.
 */
export async function inviteUserAction(
  raw: InviteFormValues,
): Promise<ActionResult> {
  let actor: AdminActor;
  try {
    actor = await requireOwner();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const { email, role } = parsed.data;
  const supabase = createSupabaseServiceRoleClient();

  const { data: existingUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingUser) {
    return {
      ok: false,
      error: "Essa pessoa já tem acesso ao painel",
      fieldErrors: { email: "E-mail já cadastrado" },
    };
  }

  const { data: existingInvite } = await supabase
    .from("admin_invites")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingInvite) {
    return {
      ok: false,
      error: "Já existe um convite pendente para esse e-mail",
      fieldErrors: { email: "Convite já criado" },
    };
  }

  const { data: existingRequest } = await supabase
    .from("admin_access_requests")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingRequest) {
    return {
      ok: false,
      error:
        "Essa pessoa já pediu acesso — aprove a solicitação em vez de convidar",
      fieldErrors: { email: "Há uma solicitação pendente deste e-mail" },
    };
  }

  const { error } = await supabase.from("admin_invites").insert({
    email,
    role,
    invited_by: actor.userId,
    invited_by_email: actor.email,
  });
  if (error) {
    return { ok: false, error: error.message };
  }

  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "invite",
    entityType: "admin_user",
    entityId: null,
    entityLabel: email,
    summary: `Convidou ${email} como ${ADMIN_ROLE_LABEL[role].toLowerCase()}`,
    details: { email, role },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/**
 * Cancela um convite que ainda não foi ativado.
 */
export async function revokeInviteAction(
  inviteId: string,
): Promise<ActionResult> {
  let actor: AdminActor;
  try {
    actor = await requireOwner();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data: invite } = await supabase
    .from("admin_invites")
    .select("email, role")
    .eq("id", inviteId)
    .maybeSingle();
  if (!invite) {
    return { ok: false, error: "Convite não encontrado" };
  }

  const { error } = await supabase
    .from("admin_invites")
    .delete()
    .eq("id", inviteId);
  if (error) {
    return { ok: false, error: error.message };
  }

  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "invite_revoke",
    entityType: "admin_user",
    entityId: null,
    entityLabel: invite.email,
    summary: `Cancelou o convite de ${invite.email}`,
    details: { email: invite.email, role: invite.role },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/**
 * Remove o acesso de alguém. Proteções: ninguém remove a si mesmo, e o
 * último owner não pode ser removido.
 */
export async function removeUserAction(userId: string): Promise<ActionResult> {
  let actor: AdminActor;
  try {
    actor = await requireOwner();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  if (userId === actor.userId) {
    return { ok: false, error: "Você não pode remover o próprio acesso" };
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data: target } = await supabase
    .from("admin_users")
    .select("id, email, role")
    .eq("id", userId)
    .maybeSingle();
  if (!target) {
    return { ok: false, error: "Usuário não encontrado" };
  }

  if (target.role === "owner") {
    const { count } = await supabase
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .eq("role", "owner");
    if ((count ?? 0) <= 1) {
      return { ok: false, error: "Não é possível remover o único dono do painel" };
    }
  }

  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("id", userId);
  if (error) {
    return { ok: false, error: error.message };
  }

  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "user_remove",
    entityType: "admin_user",
    entityId: userId,
    entityLabel: target.email,
    summary: `Removeu o acesso de ${target.email}`,
    details: { email: target.email, role: target.role },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/**
 * Aprova um pedido de acesso feito na tela de login. Como quem pediu já
 * logou pelo menos uma vez, o uuid existe em auth.users — dá pra inserir
 * direto em admin_users e o acesso vale imediatamente, sem novo login.
 * Entra sempre como editor; promoção a dono é feita depois, na lista.
 */
export async function approveAccessRequestAction(
  requestId: string,
): Promise<ActionResult> {
  let actor: AdminActor;
  try {
    actor = await requireOwner();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data: request } = await supabase
    .from("admin_access_requests")
    .select("id, user_id, email")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) {
    return { ok: false, error: "Solicitação não encontrada" };
  }

  // Já tem acesso (ex.: promovido por convite nesse meio-tempo)? Só limpa.
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", request.user_id)
    .maybeSingle();
  if (!existing) {
    const { error } = await supabase.from("admin_users").insert({
      id: request.user_id,
      email: request.email,
      role: "editor",
    });
    if (error) {
      return { ok: false, error: error.message };
    }
  }

  await supabase.from("admin_access_requests").delete().eq("id", requestId);
  // Convite pendente pro mesmo e-mail vira redundante.
  await supabase.from("admin_invites").delete().eq("email", request.email);

  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "access_approve",
    entityType: "admin_user",
    entityId: request.user_id,
    entityLabel: request.email,
    summary: `Aprovou o pedido de acesso de ${request.email} (entra como editor)`,
    details: { email: request.email, role: "editor" },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/**
 * Recusa (apaga) um pedido de acesso. A pessoa pode pedir de novo se tentar
 * entrar outra vez.
 */
export async function rejectAccessRequestAction(
  requestId: string,
): Promise<ActionResult> {
  let actor: AdminActor;
  try {
    actor = await requireOwner();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data: request } = await supabase
    .from("admin_access_requests")
    .select("id, email")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) {
    return { ok: false, error: "Solicitação não encontrada" };
  }

  const { error } = await supabase
    .from("admin_access_requests")
    .delete()
    .eq("id", requestId);
  if (error) {
    return { ok: false, error: error.message };
  }

  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "access_reject",
    entityType: "admin_user",
    entityId: null,
    entityLabel: request.email,
    summary: `Recusou o pedido de acesso de ${request.email}`,
    details: { email: request.email },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/**
 * Muda o papel de alguém (owner ↔ editor). O último owner não pode ser
 * rebaixado.
 */
export async function changeUserRoleAction(
  userId: string,
  role: AdminRole,
): Promise<ActionResult> {
  let actor: AdminActor;
  try {
    actor = await requireOwner();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsedRole = z.enum(["owner", "editor"]).safeParse(role);
  if (!parsedRole.success) {
    return { ok: false, error: "Papel inválido" };
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data: target } = await supabase
    .from("admin_users")
    .select("id, email, role")
    .eq("id", userId)
    .maybeSingle();
  if (!target) {
    return { ok: false, error: "Usuário não encontrado" };
  }
  if (target.role === parsedRole.data) {
    return { ok: true };
  }

  if (target.role === "owner" && parsedRole.data === "editor") {
    const { count } = await supabase
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .eq("role", "owner");
    if ((count ?? 0) <= 1) {
      return { ok: false, error: "Não é possível rebaixar o único dono do painel" };
    }
  }

  const { error } = await supabase
    .from("admin_users")
    .update({ role: parsedRole.data })
    .eq("id", userId);
  if (error) {
    return { ok: false, error: error.message };
  }

  const beforeLabel = ADMIN_ROLE_LABEL[target.role as AdminRole];
  const afterLabel = ADMIN_ROLE_LABEL[parsedRole.data];
  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "role_change",
    entityType: "admin_user",
    entityId: userId,
    entityLabel: target.email,
    summary: `Alterou o papel de ${target.email}: ${beforeLabel.toLowerCase()} → ${afterLabel.toLowerCase()}`,
    details: [
      { field: "Papel", before: beforeLabel, after: afterLabel, kind: "modified" },
    ],
  });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}
