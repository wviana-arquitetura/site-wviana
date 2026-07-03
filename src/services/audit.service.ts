import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { AuditLogRow } from "@/lib/supabase/types";

/**
 * Lista as entradas mais recentes da trilha de auditoria. Uso exclusivo do
 * painel admin (via service role, sem cache — sempre fresco).
 */
export async function getAuditLog(limit = 200): Promise<AuditLogRow[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[audit.service] getAuditLog:", error.message);
    return [];
  }

  return (data ?? []) as AuditLogRow[];
}
