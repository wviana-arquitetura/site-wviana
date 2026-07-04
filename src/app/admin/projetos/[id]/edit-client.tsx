"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
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
      items.map((i) => ({ src: i.src, alt: i.alt, blurHash: i.blurHash ?? null })),
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

  const aside = (
    <div
      className="space-y-5 border p-5"
      style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
    >
      {/* Capa (estado salvo — atualiza após salvar) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary/30">
        {initial.image_src ? (
          <Image
            src={initial.image_src}
            alt={initial.image_alt ?? initial.title}
            fill
            sizes="360px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-micro uppercase tracking-[0.18em] text-muted-foreground">
              Sem capa
            </span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-micro uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Status
        </span>
        {isCurrentlyPublished ? (
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

      {/* Ações primárias */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setPublishDialogOpen(true)}
          disabled={isPending}
          className="w-full border px-6 py-3 text-caption uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
          style={{ borderColor: "hsl(var(--accent-strong))" }}
        >
          {isCurrentlyPublished ? "Tirar do ar (rascunho)" : "Publicar projeto"}
        </button>
        {isCurrentlyPublished ? (
          <a
            href={`/projetos/${initial.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-micro uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver no site →
          </a>
        ) : null}
        <p className="text-micro uppercase tracking-[0.18em] text-muted-foreground">
          {isCurrentlyPublished
            ? "Mudanças nos campos só vão pro site após salvar e republicar."
            : "Enquanto rascunho, o projeto não aparece no site."}
        </p>
      </div>

      {/* Zona de risco */}
      <div
        className="border-t pt-4"
        style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
      >
        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={isPending}
          className="text-micro uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
        >
          Excluir projeto
        </button>
      </div>
    </div>
  );

  return (
    <>
      <ProjectForm
        mode="edit"
        initial={{ ...initial, id: projectId }}
        galleryInitial={galleryInitial}
        onSaveGallery={saveGallery}
        aside={aside}
      />

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
    </>
  );
}
