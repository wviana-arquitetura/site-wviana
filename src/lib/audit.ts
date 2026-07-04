import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "reorder"
  | "gallery"
  | "featured";

export type AuditInput = {
  actorId: string | null;
  actorEmail: string | null;
  action: AuditAction;
  /** Tipo da entidade afetada. Default: "project". */
  entityType?: string;
  /** id da entidade; null em ações globais (reordenar, destaques). */
  entityId?: string | null;
  /** Rótulo legível (título/slug) no momento da ação — sobrevive à exclusão. */
  entityLabel?: string | null;
  summary: string;
  /** Diff estruturado ou snapshot. Precisa ser serializável em JSON. */
  details?: unknown;
};

/**
 * Grava uma entrada na trilha de auditoria (tabela `audit_log`).
 *
 * Best-effort: uma falha aqui é logada no servidor mas NUNCA propaga — não
 * queremos que um erro de auditoria derrube a operação real do admin (salvar,
 * excluir, publicar). Se a migration 0003 ainda não tiver sido aplicada, as
 * ações continuam funcionando; apenas não há registro.
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase.from("audit_log").insert({
      actor_id: input.actorId,
      actor_email: input.actorEmail,
      action: input.action,
      entity_type: input.entityType ?? "project",
      entity_id: input.entityId ?? null,
      entity_label: input.entityLabel ?? null,
      summary: input.summary,
      details: (input.details ?? null) as never,
    });
    if (error) {
      console.error("[audit] falha ao gravar entrada:", error.message);
    }
  } catch (e) {
    console.error("[audit] erro inesperado:", (e as Error).message);
  }
}
