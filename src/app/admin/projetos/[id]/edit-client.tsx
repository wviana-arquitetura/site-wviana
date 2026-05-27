"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProjectForm } from "@/components/admin/project-form";
import type { GalleryItem } from "@/components/admin/gallery-editor";
import { ChangesPreviewDialog } from "@/components/admin/changes-preview-dialog";
import {
  deleteProjectAction,
  publishProjectAction,
  replaceProjectGalleryAction,
  unpublishProjectAction,
  type ProjectFormValues,
} from "@/app/admin/_actions/projects";

type ProjectEditClientProps = {
  projectId: string;
  initial: ProjectFormValues;
  galleryInitial: GalleryItem[];
  currentStatus: "draft" | "published";
};

export function ProjectEditClient({
  projectId,
  initial,
  galleryInitial,
  currentStatus,
}: ProjectEditClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function saveGallery(items: GalleryItem[]) {
    const result = await replaceProjectGalleryAction(
      projectId,
      items.map((i) => ({ src: i.src, alt: i.alt })),
    );
    if (!result.ok) {
      throw new Error(result.error);
    }
  }

  function confirmPublish() {
    setPublishDialogOpen(false);
    startTransition(async () => {
      const result =
        currentStatus === "published"
          ? await unpublishProjectAction(projectId)
          : await publishProjectAction(projectId);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        currentStatus === "published"
          ? "Projeto despublicado — não aparece mais no site"
          : "Projeto publicado — já está no ar",
      );
      router.refresh();
    });
  }

  function confirmDelete() {
    setDeleteDialogOpen(false);
    startTransition(async () => {
      const result = await deleteProjectAction(projectId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Projeto excluído");
    });
  }

  const isCurrentlyPublished = currentStatus === "published";

  return (
    <div className="space-y-12">
      <ProjectForm
        mode="edit"
        initial={{ ...initial, id: projectId }}
        galleryInitial={galleryInitial}
        onSaveGallery={saveGallery}
      />

      {/* Actions secundárias: publicar / despublicar / excluir */}
      <div
        className="border-t pt-8"
        style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
      >
        <span
          className="text-micro uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Ações do projeto
        </span>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setPublishDialogOpen(true)}
            disabled={isPending}
            className="border px-6 py-3 text-caption uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            style={{ borderColor: "hsl(var(--accent-strong))" }}
          >
            {isCurrentlyPublished ? "Tirar do ar (rascunho)" : "Publicar projeto"}
          </button>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isPending}
            className="text-caption uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            Excluir projeto
          </button>
        </div>
        <p className="mt-3 text-micro uppercase tracking-[0.18em] text-muted-foreground">
          {isCurrentlyPublished
            ? "Mudanças nos campos só vão pro site público após salvar e republicar."
            : "Enquanto rascunho, o projeto não aparece no site. Publique quando estiver pronto."}
        </p>
      </div>

      {/* Dialog: publicar / tirar do ar */}
      <ChangesPreviewDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        title={
          isCurrentlyPublished
            ? "Tirar projeto do ar?"
            : "Publicar projeto no site?"
        }
        description={
          isCurrentlyPublished
            ? "O projeto vai sair da listagem pública do site e da página individual. Pode ser republicado depois."
            : "O projeto vai passar a aparecer em wvianaarquitetura.com.br/projetos e na página individual. O site público atualiza em ~1 minuto."
        }
        changes={[
          {
            field: "Status do projeto",
            before: isCurrentlyPublished ? "Publicado" : "Rascunho",
            after: isCurrentlyPublished ? "Rascunho" : "Publicado",
            kind: "modified",
          },
          {
            field: "Visibilidade no site público",
            before: isCurrentlyPublished ? "Visível" : "Oculto",
            after: isCurrentlyPublished ? "Oculto" : "Visível",
            kind: "modified",
          },
        ]}
        confirmLabel={
          isCurrentlyPublished ? "Tirar do ar" : "Publicar agora"
        }
        confirmVariant={isCurrentlyPublished ? "danger" : "default"}
        loading={isPending}
        onConfirm={confirmPublish}
      />

      {/* Dialog: excluir */}
      <ChangesPreviewDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir projeto permanentemente?"
        description="Essa ação não pode ser desfeita. O projeto, suas imagens da galeria e a entrada nos destaques (se houver) serão removidos do banco de dados."
        changes={[
          {
            field: "Projeto",
            before: initial.title,
            after: "Removido",
            kind: "removed",
          },
          {
            field: "Galeria",
            before: `${galleryInitial.length} imagem(ns)`,
            after: "Removida",
            kind: "removed",
          },
        ]}
        confirmLabel="Excluir permanentemente"
        confirmVariant="danger"
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
