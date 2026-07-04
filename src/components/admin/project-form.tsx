"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminDirtyStore } from "@/store/use-admin-dirty-store";
import {
  createProjectAction,
  updateProjectAction,
  type ProjectFormValues,
} from "@/app/admin/_actions/projects";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "./image-uploader";
import { GalleryEditor, type GalleryItem } from "./gallery-editor";
import { ChangesPreviewDialog } from "./changes-preview-dialog";
import { ConfirmLeaveDialog } from "./confirm-leave-dialog";
import { diffProjectValues, diffGallery } from "./project-changes-diff";
import { AdminBody, AdminFooterBar } from "./admin-page-shell";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { cn } from "@/lib/utils";

type ProjectFormProps = {
  mode: "create" | "edit";
  initial: ProjectFormValues & { id?: string };
  galleryInitial?: GalleryItem[];
  onSaveGallery?: (gallery: GalleryItem[]) => Promise<void>;
  /** Painel lateral fixo (capa, status, publicar, excluir). Só no modo edição. */
  aside?: React.ReactNode;
};

const TYPOLOGY_OPTIONS = ["Residencial", "Comercial", "Corporativo"] as const;
const STATUS_OPTIONS = ["Concluído", "Em andamento"] as const;

function toCommaString(arr: string[] | null | undefined): string {
  return arr && arr.length > 0 ? arr.join(", ") : "";
}

function fromCommaString(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProjectForm({
  mode,
  initial,
  galleryInitial = [],
  onSaveGallery,
  aside,
}: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<ProjectFormValues>(initial);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [gallery, setGallery] = useState<GalleryItem[]>(galleryInitial);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  function update<K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
    if (fieldErrors[key as string]) {
      setFieldErrors((e) => {
        const rest = { ...e };
        delete rest[key as string];
        return rest;
      });
    }
  }

  // Calcula as alterações sempre que `values` ou `gallery` mudarem
  const projectChanges =
    mode === "edit" ? diffProjectValues(initial, values) : [];
  const galleryChanges =
    mode === "edit" ? diffGallery(galleryInitial, gallery) : [];
  const allChanges = [...projectChanges, ...galleryChanges];

  // Em modo "create", consideramos dirty quando QUALQUER campo for alterado
  // em relação ao formulário inicial (vazio).
  const createDirty =
    mode === "create" &&
    JSON.stringify(values) !== JSON.stringify(initial);

  const isDirty =
    mode === "edit" ? allChanges.length > 0 : createDirty;

  // Proteção nativa do browser (fechar aba, recarregar, voltar)
  useUnsavedChangesGuard(isDirty);

  // Sincroniza com store global (lida pela nav lateral pra bloquear cliques)
  const setDirty = useAdminDirtyStore((s) => s.setDirty);
  const clearDirty = useAdminDirtyStore((s) => s.clear);
  useEffect(() => {
    setDirty(isDirty, mode === "edit" ? allChanges.length : 1);
  }, [isDirty, allChanges.length, mode, setDirty]);

  // Limpa ao desmontar
  useEffect(() => {
    return () => clearDirty();
  }, [clearDirty]);

  function handleCancelClick() {
    if (isDirty) {
      setLeaveOpen(true);
    } else {
      router.back();
    }
  }

  function confirmLeave() {
    setLeaveOpen(false);
    clearDirty();
    router.back();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    // Em modo criação, vai direto pro save (não tem diff útil — tudo é novo).
    // Em modo edição, abre o dialog com a lista de mudanças pra revisão.
    if (mode === "create") {
      void persistChanges();
      return;
    }

    // Edição sem nenhuma mudança? Não faz sentido abrir o dialog.
    if (allChanges.length === 0) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setPreviewOpen(true);
  }

  async function persistChanges() {
    setPreviewOpen(false);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProjectAction(values)
          : await updateProjectAction(initial.id!, values);

      if (!result.ok) {
        toast.error(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      // Salva também a galeria se for edição
      if (mode === "edit" && onSaveGallery) {
        try {
          await onSaveGallery(gallery);
        } catch (err) {
          toast.error("Erro ao salvar galeria");
          console.error(err);
          return;
        }
      }

      toast.success(mode === "create" ? "Projeto criado" : "Projeto salvo");

      // Limpa dirty antes do redirect pra evitar interceptação acidental
      clearDirty();

      if (mode === "create" && result.projectId) {
        router.push(`/admin/projetos/${result.projectId}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <AdminBody>
        <div
          className={cn(
            "grid w-full grid-cols-1 gap-8",
            aside
              ? "lg:grid-cols-[minmax(0,1fr)_clamp(280px,24vw,360px)]"
              : "mx-auto max-w-[1100px]",
          )}
        >
          <div className="min-w-0">
      <Tabs defaultValue="geral">
        <TabsList className="sticky top-16 z-20 bg-background pt-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="capa">Capa</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          {mode === "edit" ? <TabsTrigger value="galeria">Galeria</TabsTrigger> : null}
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* ABA 1 — GERAL */}
        <TabsContent value="geral" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label="Slug (URL)"
              hint="Apenas letras minúsculas, números e hifens"
              error={fieldErrors.slug}
            >
              <Input
                value={values.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="residencial-novo"
              />
            </FormField>

            <FormField label="Título" error={fieldErrors.title}>
              <Input
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Residencial XX"
              />
            </FormField>

            <FormField label="Categoria" error={fieldErrors.category}>
              <Input
                value={values.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="Residencial"
              />
            </FormField>

            <FormField label="Tipologia" error={fieldErrors.typology}>
              <Select
                value={values.typology}
                onValueChange={(v) => update("typology", v as ProjectFormValues["typology"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPOLOGY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Status" error={fieldErrors.status_label}>
              <Select
                value={values.status_label}
                onValueChange={(v) => update("status_label", v as ProjectFormValues["status_label"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Localização" error={fieldErrors.location}>
              <Input
                value={values.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Fortaleza"
              />
            </FormField>

            <FormField label="País/Estado" error={fieldErrors.country}>
              <Input
                value={values.country}
                onChange={(e) => update("country", e.target.value)}
                placeholder="CE"
              />
            </FormField>

            <FormField label="Área" hint="Opcional · ex: 188m²">
              <Input
                value={values.area ?? ""}
                onChange={(e) => update("area", e.target.value || null)}
                placeholder="188m²"
              />
            </FormField>

            <FormField label="Ano" hint="Opcional">
              <Input
                value={values.year ?? ""}
                onChange={(e) => update("year", e.target.value || null)}
                placeholder="2024"
              />
            </FormField>

            <FormField label="Cliente" hint="Opcional">
              <Input
                value={values.client ?? ""}
                onChange={(e) => update("client", e.target.value || null)}
                placeholder=""
              />
            </FormField>
          </div>

          <FormField
            label="Escopo de serviços"
            hint="Separe por vírgula (ex: Design de Interiores, Projeto Arquitetônico)"
          >
            <Input
              value={toCommaString(values.scope)}
              onChange={(e) => update("scope", fromCommaString(e.target.value))}
              placeholder="Design de Interiores, Projeto Arquitetônico"
            />
          </FormField>

          <FormField label="Resumo curto" error={fieldErrors.summary}>
            <Textarea
              value={values.summary}
              onChange={(e) => update("summary", e.target.value)}
              rows={4}
              placeholder="Frase de impacto que descreve o projeto..."
            />
          </FormField>
        </TabsContent>

        {/* ABA 2 — CAPA */}
        <TabsContent value="capa" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <FormField label="Imagem de capa" error={fieldErrors.image_src}>
                <ImageUploader
                  pathPrefix={values.slug || "novo-projeto"}
                  value={values.image_src || null}
                  onUploaded={(url, blurHash) => {
                    // Grava src e blur_hash juntos: o setValues do React garante
                    // que ambos entram no mesmo render (sem stale closure).
                    setValues((v) => ({
                      ...v,
                      image_src: url,
                      image_blur_hash: blurHash,
                    }));
                    setFieldErrors((e) => {
                      if (!e.image_src) return e;
                      const rest = { ...e };
                      delete rest.image_src;
                      return rest;
                    });
                  }}
                  label="Imagem de capa do projeto"
                  aspect="4/5"
                />
              </FormField>
            </div>
            <div className="space-y-4">
              <FormField label="Alt da capa" hint="Descrição da imagem para SEO/acessibilidade">
                <Textarea
                  value={values.image_alt ?? ""}
                  onChange={(e) => update("image_alt", e.target.value || null)}
                  rows={3}
                  placeholder="Sala principal do residencial..."
                />
              </FormField>
              <FormField
                label="URL OG image (opcional)"
                hint="Use uma imagem específica para redes sociais. Em branco usa a capa."
              >
                <Input
                  value={values.og_image_src ?? ""}
                  onChange={(e) => update("og_image_src", e.target.value || null)}
                  placeholder=""
                />
              </FormField>
            </div>
          </div>
        </TabsContent>

        {/* ABA 3 — CONTEÚDO */}
        <TabsContent value="conteudo" className="space-y-4">
          <p className="text-body text-muted-foreground">
            Capítulos do projeto. Cada projeto pode ter quantos capítulos quiser. O
            padrão é 2 (Contexto e Solução).
          </p>

          {values.chapters.map((chapter, idx) => (
            <div
              key={idx}
              className="border p-5 space-y-3"
              style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-micro uppercase tracking-[0.22em]"
                  style={{ color: "hsl(var(--accent-strong))" }}
                >
                  Capítulo {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = values.chapters.filter((_, i) => i !== idx);
                    update("chapters", next);
                  }}
                  className="text-micro uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
                >
                  Remover
                </button>
              </div>
              <FormField label="Título do capítulo">
                <Input
                  value={chapter.title}
                  onChange={(e) => {
                    const next = [...values.chapters];
                    next[idx] = { ...next[idx]!, title: e.target.value };
                    update("chapters", next);
                  }}
                  placeholder="Contexto"
                />
              </FormField>
              <FormField label="Conteúdo">
                <Textarea
                  value={chapter.content}
                  onChange={(e) => {
                    const next = [...values.chapters];
                    next[idx] = { ...next[idx]!, content: e.target.value };
                    update("chapters", next);
                  }}
                  rows={5}
                />
              </FormField>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              update("chapters", [...values.chapters, { title: "", content: "" }])
            }
            className="border px-6 py-3 text-caption uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary"
            style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
          >
            + Adicionar capítulo
          </button>
        </TabsContent>

        {/* ABA 4 — GALERIA (apenas em edit) */}
        {mode === "edit" ? (
          <TabsContent value="galeria">
            <GalleryEditor
              pathPrefix={values.slug}
              items={gallery}
              onChange={setGallery}
            />
          </TabsContent>
        ) : null}

        {/* ABA 5 — SEO */}
        <TabsContent value="seo" className="space-y-4">
          <FormField label="SEO Title" hint="Em branco usa o título do projeto">
            <Input
              value={values.seo_title ?? ""}
              onChange={(e) => update("seo_title", e.target.value || null)}
              placeholder=""
            />
          </FormField>
          <FormField
            label="SEO Description"
            hint="Em branco usa o resumo. Limite ~155 caracteres pro Google."
          >
            <Textarea
              value={values.seo_description ?? ""}
              onChange={(e) => update("seo_description", e.target.value || null)}
              rows={3}
            />
          </FormField>
          <FormField
            label="Serviços (schema.org)"
            hint="Lista de serviços relacionados. Separe por vírgula."
          >
            <Input
              value={toCommaString(values.services)}
              onChange={(e) =>
                update("services", fromCommaString(e.target.value))
              }
              placeholder="Design de Interiores, Projeto Arquitetônico"
            />
          </FormField>
          <FormField
            label="Áreas atendidas (schema.org)"
            hint="Lista de regiões. Separe por vírgula."
          >
            <Input
              value={toCommaString(values.area_served)}
              onChange={(e) =>
                update("area_served", fromCommaString(e.target.value))
              }
              placeholder="Fortaleza, Ceará, Brasil"
            />
          </FormField>
        </TabsContent>
      </Tabs>
          </div>

          {aside ? (
            <aside className="order-first lg:order-none lg:sticky lg:top-20 lg:self-start">
              {aside}
            </aside>
          ) : null}
        </div>
      </AdminBody>

      {/* Submit bar fixa no rodapé (largura cheia, dentro do <form>) */}
      <AdminFooterBar>
        {/* Indicador de mudanças pendentes (só em modo edição) */}
        {mode === "edit" ? (
          <span className="text-micro uppercase tracking-[0.18em] text-muted-foreground">
            {allChanges.length === 0
              ? "Nenhuma alteração"
              : `${allChanges.length} alteração(ões) pendente(s)`}
          </span>
        ) : (
          <span className="text-micro uppercase tracking-[0.18em] text-muted-foreground">
            Preencha os campos e crie o projeto como rascunho
          </span>
        )}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCancelClick}
            className="text-caption uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || (mode === "edit" && allChanges.length === 0)}
            className="border px-8 py-3 text-caption uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ borderColor: "hsl(var(--accent-strong))" }}
          >
            {isPending
              ? "Salvando..."
              : mode === "create"
                ? "Criar projeto"
                : "Revisar e salvar"}
          </button>
        </div>
      </AdminFooterBar>
    </form>

    {/* Dialog de revisão de alterações (só em modo edição) */}
    {mode === "edit" ? (
      <ChangesPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title="Revisar alterações"
        description="Confira o que mudou antes de salvar. Estas alterações ficam como rascunho até você clicar em Publicar."
        changes={allChanges}
        confirmLabel="Salvar alterações"
        loading={isPending}
        onConfirm={persistChanges}
      />
    ) : null}

    <ConfirmLeaveDialog
      open={leaveOpen}
      onOpenChange={setLeaveOpen}
      changesCount={mode === "edit" ? allChanges.length : 1}
      description={
        mode === "create"
          ? "Você está criando um novo projeto. Se sair agora, todos os dados preenchidos serão perdidos."
          : `Você tem ${allChanges.length} alteração(ões) não salvas. Se sair agora, todas as mudanças serão perdidas.`
      }
      onConfirm={confirmLeave}
    />
    </>
  );
}

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p
          className="text-micro uppercase tracking-[0.18em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          ⚠ {error}
        </p>
      ) : hint ? (
        <p className="text-micro uppercase tracking-[0.18em] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
