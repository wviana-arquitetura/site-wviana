"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useAdminDirtyStore } from "@/store/use-admin-dirty-store";
import { GuardedLink } from "./guarded-link";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderProjectsAction } from "@/app/admin/_actions/projects";
import type { AdminProjectListItem } from "@/services/projects.service";
import { ChangesPreviewDialog } from "./changes-preview-dialog";
import type { ChangeEntry } from "./project-changes-diff";

type Props = {
  initialProjects: AdminProjectListItem[];
};

export function SortableProjectsList({ initialProjects }: Props) {
  const [projects, setProjects] = useState(initialProjects);
  const [isPending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setProjects((items) => arrayMove(items, oldIndex, newIndex));
    setDirty(true);
  }

  function confirmSave() {
    setPreviewOpen(false);
    startTransition(async () => {
      const result = await reorderProjectsAction(projects.map((p) => p.id));
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Nova ordem salva e publicada");
      setDirty(false);
      clearDirty();
    });
  }

  function reset() {
    setProjects(initialProjects);
    setDirty(false);
    clearDirty();
  }

  // Calcula a lista de projetos que mudaram de posição
  const initialOrderById = new Map(
    initialProjects.map((p, idx) => [p.id, idx + 1]),
  );
  const moves: ChangeEntry[] = projects
    .map((project, currentIdx) => {
      const oldPosition = initialOrderById.get(project.id) ?? currentIdx + 1;
      const newPosition = currentIdx + 1;
      if (oldPosition === newPosition) return null;
      return {
        field: project.title,
        before: `Posição ${oldPosition}`,
        after: `Posição ${newPosition}`,
        kind: "modified" as const,
      };
    })
    .filter((c): c is ChangeEntry => c !== null);

  // Proteção contra perda de dados
  useUnsavedChangesGuard(dirty);
  const setDirtyStore = useAdminDirtyStore((s) => s.setDirty);
  const clearDirty = useAdminDirtyStore((s) => s.clear);
  useEffect(() => {
    setDirtyStore(dirty, moves.length);
  }, [dirty, moves.length, setDirtyStore]);
  useEffect(() => () => clearDirty(), [clearDirty]);

  return (
    <div>
      {/* Barra de ação flutuante */}
      {dirty ? (
        <div
          className="sticky top-0 z-10 -mx-2 mb-4 flex items-center justify-between gap-4 border bg-background px-4 py-3"
          style={{
            borderColor: "hsl(var(--accent-strong))",
            background: "hsl(var(--accent) / 0.08)",
          }}
        >
          <span className="text-caption uppercase tracking-[0.18em] text-foreground">
            {moves.length} projeto(s) movido(s)
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={reset}
              disabled={isPending}
              className="text-micro uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
            >
              Desfazer
            </button>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              disabled={isPending}
              className="border px-4 py-2 text-micro uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
              style={{ borderColor: "hsl(var(--accent-strong))" }}
            >
              {isPending ? "Salvando..." : "Revisar e salvar"}
            </button>
          </div>
        </div>
      ) : null}

      <ChangesPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title="Revisar nova ordem dos projetos"
        description="Estes projetos mudarão de posição na listagem pública (/projetos). A mudança vai ao ar imediatamente após confirmar."
        changes={moves}
        confirmLabel="Salvar nova ordem"
        loading={isPending}
        onConfirm={confirmSave}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul
            className="border-t"
            style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
          >
            {projects.map((project) => (
              <SortableRow key={project.id} project={project} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRow({ project }: { project: AdminProjectListItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="border-b bg-background"
    >
      <div className="grid grid-cols-[40px_64px_1fr_auto] items-center gap-4 px-2 py-4 md:grid-cols-[40px_80px_1fr_140px_120px_120px] md:gap-6">
        {/* Handle */}
        <button
          type="button"
          aria-label="Arrastar"
          {...attributes}
          {...listeners}
          className="flex h-10 w-10 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          ⋮⋮
        </button>

        {/* Thumb */}
        <div className="relative aspect-square w-16 overflow-hidden md:w-20">
          <Image
            src={project.image_src}
            alt={project.image_alt ?? project.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        {/* Title + slug */}
        <GuardedLink
          href={`/admin/projetos/${project.id}`}
          className="min-w-0 hover:opacity-70 transition-opacity"
        >
          <span className="block text-body-lg text-foreground truncate">
            {project.title}
          </span>
          <span
            className="mt-1 block text-micro uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            /{project.slug}
          </span>
        </GuardedLink>

        {/* Tipologia */}
        <div className="hidden md:block text-caption uppercase tracking-[0.18em] text-muted-foreground">
          {project.typology}
        </div>

        {/* Status */}
        <div className="hidden md:block">
          {project.published_status === "published" ? (
            <span
              className="inline-block px-3 py-1 text-micro uppercase tracking-[0.18em]"
              style={{
                background: "hsl(var(--accent) / 0.15)",
                color: "hsl(var(--accent-strong))",
              }}
            >
              Publicado
            </span>
          ) : (
            <span
              className="inline-block border px-3 py-1 text-micro uppercase tracking-[0.18em] text-muted-foreground"
              style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
            >
              Rascunho
            </span>
          )}
        </div>

        {/* Editar */}
        <GuardedLink
          href={`/admin/projetos/${project.id}`}
          className="justify-self-end text-micro uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          Editar →
        </GuardedLink>
      </div>
    </li>
  );
}
