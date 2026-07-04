import { getAuditLog } from "@/services/audit.service";
import { AdminShell, AdminHeader, AdminBody } from "@/components/admin/admin-page-shell";
import type { AuditLogRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const BORDER = "hsl(var(--accent) / 0.3)";

const ACTION_LABEL: Record<string, string> = {
  create: "Criação",
  update: "Edição",
  delete: "Exclusão",
  publish: "Publicação",
  unpublish: "Despublicação",
  reorder: "Reordenação",
  gallery: "Galeria",
  featured: "Destaques",
};

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Fortaleza",
});

type ChangeEntry = {
  field: string;
  before: string;
  after: string;
  kind: "modified" | "added" | "removed";
};

function isChangeEntryArray(details: unknown): details is ChangeEntry[] {
  return (
    Array.isArray(details) &&
    details.every(
      (d) =>
        d && typeof d === "object" && "field" in d && "before" in d && "after" in d,
    )
  );
}

function DetailsBlock({ details }: { details: unknown }) {
  if (details === null || details === undefined) return null;

  if (isChangeEntryArray(details)) {
    return (
      <ul className="mt-3 space-y-1.5">
        {details.map((c, i) => (
          <li key={i} className="text-caption text-muted-foreground">
            <span className="text-foreground">{c.field}:</span>{" "}
            <span className="line-through opacity-60">{c.before}</span>{" "}
            <span aria-hidden>→</span>{" "}
            <span style={{ color: "hsl(var(--accent-strong))" }}>{c.after}</span>
          </li>
        ))}
      </ul>
    );
  }

  // Snapshot de exclusão, reordenação ou destaques — JSON recolhível.
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-micro uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
        Ver dados
      </summary>
      <pre
        className="mt-2 max-h-64 overflow-auto border p-3 text-micro text-muted-foreground"
        style={{ borderColor: BORDER }}
      >
        {JSON.stringify(details, null, 2)}
      </pre>
    </details>
  );
}

function LogRow({ entry }: { entry: AuditLogRow }) {
  const actionLabel = ACTION_LABEL[entry.action] ?? entry.action;
  const isDelete = entry.action === "delete";

  return (
    <li
      className="border-b py-5 last:border-b-0"
      style={{ borderColor: "hsl(var(--accent) / 0.15)" }}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="text-micro uppercase tracking-[0.18em]"
          style={{
            color: isDelete
              ? "hsl(0 65% 55%)"
              : "hsl(var(--accent-strong))",
          }}
        >
          {actionLabel}
        </span>
        <span className="text-body text-foreground">{entry.summary}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-micro uppercase tracking-[0.14em] text-muted-foreground">
        <span>{dateFmt.format(new Date(entry.created_at))}</span>
        <span aria-hidden>·</span>
        <span className="normal-case tracking-normal">
          {entry.actor_email ?? "autor desconhecido"}
        </span>
      </div>
      <DetailsBlock details={entry.details} />
    </li>
  );
}

export default async function AdminLogsPage() {
  const entries = await getAuditLog(200);

  return (
    <AdminShell>
      <AdminHeader
        eyebrow="Auditoria"
        title="Atividade"
        meta={`${entries.length} ${entries.length === 1 ? "registro" : "registros"} · mais recentes primeiro`}
      />

      <AdminBody>
        {entries.length === 0 ? (
          <div
            className="border p-16 text-center"
            style={{ borderColor: BORDER }}
          >
            <p className="text-body text-muted-foreground">
              Nenhuma alteração registrada ainda.
            </p>
            <p className="mt-2 text-caption text-muted-foreground">
              As ações feitas pelo painel (edições, exclusões, publicações)
              passam a aparecer aqui.
            </p>
          </div>
        ) : (
          <ul className="mx-auto w-full max-w-[1100px]">
            {entries.map((entry) => (
              <LogRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </AdminBody>
    </AdminShell>
  );
}
