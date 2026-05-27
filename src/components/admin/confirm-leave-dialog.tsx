"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmLeaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Número de alterações pendentes (mostrado no diálogo). */
  changesCount: number;
  /** Callback ao confirmar sair sem salvar. */
  onConfirm: () => void;
  /** Texto contextual sobre o que será perdido. */
  description?: string;
};

export function ConfirmLeaveDialog({
  open,
  onOpenChange,
  changesCount,
  onConfirm,
  description,
}: ConfirmLeaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-architectural font-light text-foreground leading-tight">
            Sair sem salvar?
          </DialogTitle>
          <DialogDescription className="mt-3 text-body text-muted-foreground">
            {description ??
              `Você tem ${changesCount} alteração(ões) não salvas. Se sair agora, todas as mudanças serão perdidas.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="border px-6 py-3 text-caption uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary"
            style={{ borderColor: "hsl(var(--accent-strong))" }}
          >
            Continuar editando
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-caption uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
            style={{ color: "hsl(0 60% 50%)" }}
          >
            Sair sem salvar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
