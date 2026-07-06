import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/supabase/types";

/**
 * Guards de autorização das server actions do painel.
 *
 * Cada action revalida a permissão por conta própria (não confia só no
 * middleware). A leitura de admin_users roda com a sessão do usuário
 * (anon key + RLS "cada um lê a própria linha").
 */

export type AdminActor = {
  userId: string;
  email: string | null;
  role: AdminRole;
};

/**
 * Garante que o usuário atual é admin (owner ou editor). Lança se não for.
 */
export async function requireAdmin(): Promise<AdminActor> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Não autenticado");
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!adminRow) {
    throw new Error("Não autorizado");
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    role: adminRow.role as AdminRole,
  };
}

/**
 * Garante que o usuário atual é owner. Editores não gerenciam usuários.
 */
export async function requireOwner(): Promise<AdminActor> {
  const actor = await requireAdmin();
  if (actor.role !== "owner") {
    throw new Error("Apenas o dono pode gerenciar usuários");
  }
  return actor;
}
