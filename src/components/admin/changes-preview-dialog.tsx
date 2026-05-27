"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChangeEntry } from "./project-changes-diff";
import { isImageUrl } from "./project-changes-diff";

type ChangesPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Título do dialog. Ex: "Revisar alterações antes de salvar" */
  title: string;
  /** Descrição/instrução curta abaixo do título. */
  description?: string;
  /** Lista de mudanças. Se vazia, mostra "Nada mudou". */
  changes: ChangeEntry[];
  /** Texto do botão de confirmação (default: "Confirmar"). */
  confirmLabel?: string;
  /** Variante visual do botão de confirmação. */
  confirmVariant?: "default" | "danger";
  /** Estado loading do botão de confirmação. */
  loading?: boolean;
  /** Callback ao confirmar. */
  onConfirm: () => void;
};

export function ChangesPreviewDialog({
  open,
  onOpenChange,
  title,
  description,
  changes,
  confirmLabel = "Confirmar",
  confirmVariant = "default",
  loading = false,
  onConfirm,
}: ChangesPreviewDialogProps) {
  const isEmpty = changes.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-architectural font-light text-foreground leading-tight">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="mt-2 text-body text-muted-foreground">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div
          className="my-6 max-h-[50vh] overflow-y-auto border"
          style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
        >
          {isEmpty ? (
            <p className="p-6 text-center text-body text-muted-foreground">
              Nada foi alterado.
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "hsl(var(--accent) / 0.2)" }}>
              {changes.map((change, idx) => (
                <li key={idx} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-caption uppercase tracking-[0.18em] text-foreground">
                      {change.field}
                    </span>
                    <ChangeBadge kind={change.kind} />
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_1fr]">
                    <DiffSide label="Antes" value={change.before} />
                    <span
                      className="hidden md:flex items-center justify-center text-muted-foreground"
                      aria-hidden="true"
                    >
                      →
                    </span>
                    <DiffSide label="Depois" value={change.after} highlight />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-caption uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="border px-6 py-3 text-caption uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            style={{
              borderColor:
                confirmVariant === "danger"
                  ? "hsl(0 60% 50%)"
                  : "hsl(var(--accent-strong))",
              color:
                confirmVariant === "danger"
                  ? "hsl(0 60% 50%)"
                  : "hsl(var(--foreground))",
            }}
          >
            {loading ? "Salvando..." : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangeBadge({ kind }: { kind: ChangeEntry["kind"] }) {
  const config = {
    added: { label: "Adicionado", color: "hsl(140 40% 35%)" },
    modified: { label: "Alterado", color: "hsl(var(--accent-strong))" },
    removed: { label: "Removido", color: "hsl(0 60% 50%)" },
  }[kind];

  return (
    <span
      className="text-micro uppercase tracking-[0.18em]"
      style={{ color: config.color }}
    >
      {config.label}
    </span>
  );
}

function DiffSide({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const showImage = isImageUrl(value);
  return (
    <div className="min-w-0">
      <span className="block text-micro uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div
        className="mt-1 break-words text-body"
        style={{
          color: highlight ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
        }}
      >
        {showImage ? (
          <div className="relative mt-1 h-16 w-16 overflow-hidden border" style={{ borderColor: "hsl(var(--accent) / 0.3)" }}>
            <Image src={value} alt="preview" fill sizes="64px" className="object-cover" />
          </div>
        ) : (
          <span className="whitespace-pre-wrap">{value}</span>
        )}
      </div>
    </div>
  );
}
