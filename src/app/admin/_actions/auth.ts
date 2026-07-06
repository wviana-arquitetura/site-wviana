"use server";

import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { recordAudit } from "@/lib/audit";

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type RequestAccessResult =
  | { ok: true; already: boolean }
  | { ok: false; error: string };

/**
 * Registra um pedido de acesso ao painel, feito na tela de login por quem
 * entrou com o Google mas foi barrado (sem linha em admin_users).
 *
 * Não exige ser admin — exige apenas sessão: o pedido usa o uuid e o e-mail
 * da própria sessão (nada digitado, nada falsificável). Um pedido por conta
 * (unique em user_id). A aprovação acontece em /admin/usuarios.
 */
export async function requestAccessAction(): Promise<RequestAccessResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return {
      ok: false,
      error: "Entre com o Google antes de solicitar acesso.",
    };
  }

  const email = user.email.toLowerCase();
  const admin = createSupabaseServiceRoleClient();

  const { data: adminRow } = await admin
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (adminRow) {
    return {
      ok: false,
      error: "Sua conta já tem acesso — clique em \"Entrar com Google\".",
    };
  }

  const { data: existing } = await admin
    .from("admin_access_requests")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return { ok: true, already: true };
  }

  const { error } = await admin
    .from("admin_access_requests")
    .insert({ user_id: user.id, email });
  if (error) {
    return { ok: false, error: "Não foi possível registrar o pedido. Tente de novo." };
  }

  await recordAudit({
    // actor_id tem FK pra admin_users — quem pede ainda não está lá.
    actorId: null,
    actorEmail: email,
    action: "access_request",
    entityType: "admin_user",
    entityId: user.id,
    entityLabel: email,
    summary: `${email} solicitou acesso ao painel`,
  });

  return { ok: true, already: false };
}
