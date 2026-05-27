"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { setHomeFeaturedAction } from "@/app/admin/_actions/projects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangesPreviewDialog } from "./changes-preview-dialog";
import type { ChangeEntry } from "./project-changes-diff";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useAdminDirtyStore } from "@/store/use-admin-dirty-store";

type Option = {
  id: string;
  slug: string;
  title: string;
  typology: string;
  image_src: string;
  image_alt: string | null;
};

type FeaturedPickerProps = {
  /** Lista de projetos publicados (candidatos a destaque). */
  options: Option[];
  /** Slugs/ids inicialmente selecionados, em ordem (1º, 2º, 3º). Null se vazio. */
  initial: [string | null, string | null, string | null];
};

export function FeaturedPicker({ options, initial }: FeaturedPickerProps) {
  const [selected, setSelected] = useState<
    [string | null, string | null, string | null]
  >(initial);
  const [isPending, startTransition] = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);

  const optionsById = new Map(options.map((o) => [o.id, o]));

  function setSlot(slot: 0 | 1 | 2, projectId: string) {
    const next = [...selected] as typeof selected;
    next[slot] = projectId;
    setSelected(next);
  }

  function openReview() {
    if (selected.some((id) => !id)) {
      toast.error("Escolha um projeto para cada um dos 3 slots");
      return;
    }
    if (new Set(selected).size !== 3) {
      toast.error("Os 3 destaques precisam ser projetos diferentes");
      return;
    }
    if (!hasChanges) {
      toast.info("Nada mudou nos destaques");
      return;
    }
    setPreviewOpen(true);
  }

  function confirmSave() {
    setPreviewOpen(false);
    startTransition(async () => {
      const result = await setHomeFeaturedAction(
        selected as [string, string, string],
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // A action recarrega via revalidatePath; o store é limpo no useEffect
      // de unmount, mas vamos zerar local pra evitar re-trigger imediato.
      toast.success("Destaques atualizados — já estão no ar");
    });
  }

  // Calcula as alterações por slot
  const hasChanges = selected.some((id, idx) => id !== initial[idx]);

  const changes: ChangeEntry[] = [0, 1, 2]
    .filter((idx) => selected[idx] !== initial[idx])
    .map((idx) => {
      const beforeId = initial[idx];
      const afterId = selected[idx];
      const beforeTitle = beforeId
        ? (optionsById.get(beforeId)?.title ?? "(removido)")
        : "(vazio)";
      const afterTitle = afterId
        ? (optionsById.get(afterId)?.title ?? "(desconhecido)")
        : "(vazio)";
      return {
        field: `Posição ${idx + 1}`,
        before: beforeTitle,
        after: afterTitle,
        kind: !beforeId ? "added" : !afterId ? "removed" : "modified",
      } as ChangeEntry;
    });

  // Proteção contra perda de dados
  useUnsavedChangesGuard(hasChanges);
  const setDirty = useAdminDirtyStore((s) => s.setDirty);
  const clearDirty = useAdminDirtyStore((s) => s.clear);
  useEffect(() => {
    setDirty(hasChanges, changes.length);
  }, [hasChanges, changes.length, setDirty]);
  useEffect(() => () => clearDirty(), [clearDirty]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[0, 1, 2].map((slotIdx) => {
          const currentId = selected[slotIdx as 0 | 1 | 2];
          const current = currentId ? optionsById.get(currentId) : null;
          return (
            <div
              key={slotIdx}
              className="border p-5"
              style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
            >
              <span
                className="text-micro uppercase tracking-[0.22em]"
                style={{ color: "hsl(var(--accent-strong))" }}
              >
                Posição {slotIdx + 1}
              </span>

              <div className="mt-4 aspect-[4/5] relative w-full overflow-hidden bg-secondary/30">
                {current ? (
                  <Image
                    src={current.image_src}
                    alt={current.image_alt ?? current.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <span className="text-caption uppercase tracking-[0.18em]">
                      Vazio
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Select
                  value={currentId ?? ""}
                  onValueChange={(value) => setSlot(slotIdx as 0 | 1 | 2, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.title} ({opt.typology})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-micro uppercase tracking-[0.18em] text-muted-foreground">
          {hasChanges
            ? `${changes.length} alteração(ões) pendente(s)`
            : "Nenhuma alteração"}
        </span>
        <button
          type="button"
          onClick={openReview}
          disabled={isPending || !hasChanges}
          className="border px-6 py-3 text-caption uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ borderColor: "hsl(var(--accent-strong))" }}
        >
          {isPending ? "Salvando..." : "Revisar e publicar"}
        </button>
      </div>

      <ChangesPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title="Revisar troca dos destaques"
        description="Estes são os 3 projetos que aparecerão na home. A mudança vai pro ar imediatamente após confirmar (site atualiza em ~1 minuto)."
        changes={changes}
        confirmLabel="Salvar e publicar"
        loading={isPending}
        onConfirm={confirmSave}
      />
    </div>
  );
}
