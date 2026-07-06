"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/audit";
import {
  diffProjectValues,
  diffGallery,
} from "@/components/admin/project-changes-diff";
import { requireAdmin } from "./guards";

// Colunas que compõem um ProjectFormValues — usadas pra buscar o estado
// anterior de um projeto e computar o diff da auditoria.
const PROJECT_FORM_COLUMNS =
  "slug,title,category,typology,status_label,location,country,area,year,client,image_src,image_alt,image_blur_hash,og_image_src,summary,scope,services,area_served,chapters,seo_title,seo_description";

function pluralChanges(n: number): string {
  return `${n} ${n === 1 ? "alteração" : "alterações"}`;
}

const projectSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hifens"),
  title: z.string().min(1, "Título é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  typology: z.enum(["Residencial", "Comercial", "Corporativo"]),
  status_label: z.enum(["Concluído", "Em andamento"]),
  location: z.string().min(1, "Localização é obrigatória"),
  country: z.string().min(1, "País/Estado é obrigatório"),
  area: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  client: z.string().optional().nullable(),
  image_src: z.string().min(1, "Imagem de capa é obrigatória"),
  image_alt: z.string().optional().nullable(),
  image_blur_hash: z.string().optional().nullable(),
  og_image_src: z.string().optional().nullable(),
  summary: z.string().min(1, "Resumo é obrigatório"),
  scope: z.array(z.string()).default([]),
  services: z.array(z.string()).optional().nullable(),
  area_served: z.array(z.string()).optional().nullable(),
  chapters: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      }),
    )
    .default([]),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export type ActionResult =
  | { ok: true; projectId?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Cria projeto novo. Sempre como draft.
 */
export async function createProjectAction(
  raw: ProjectFormValues,
): Promise<ActionResult> {
  let actor: { userId: string; email: string | null };
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Dados inválidos", fieldErrors };
  }

  const supabase = createSupabaseServiceRoleClient();

  // slug único?
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();
  if (existing) {
    return {
      ok: false,
      error: "Já existe um projeto com esse slug",
      fieldErrors: { slug: "Slug já em uso" },
    };
  }

  // Próximo display_order
  const { data: maxOrderRow } = await supabase
    .from("projects")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxOrderRow?.display_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...parsed.data,
      published_status: "draft",
      display_order: nextOrder,
      created_by: actor.userId,
      updated_by: actor.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Erro ao criar projeto" };
  }

  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "create",
    entityId: data.id,
    entityLabel: parsed.data.title,
    summary: `Criou o projeto "${parsed.data.title}" (rascunho)`,
  });

  revalidatePath("/admin/projetos");
  return { ok: true, projectId: data.id };
}

/**
 * Atualiza projeto existente. Mantém o published_status atual (Publicar é
 * uma ação separada). Não revalida o site público; isso é responsabilidade
 * da action de publicar.
 */
export async function updateProjectAction(
  id: string,
  raw: ProjectFormValues,
): Promise<ActionResult> {
  let actor: { userId: string; email: string | null };
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Dados inválidos", fieldErrors };
  }

  const supabase = createSupabaseServiceRoleClient();

  // slug único exceto o próprio
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", parsed.data.slug)
    .neq("id", id)
    .maybeSingle();
  if (existing) {
    return {
      ok: false,
      error: "Já existe outro projeto com esse slug",
      fieldErrors: { slug: "Slug já em uso por outro projeto" },
    };
  }

  // Estado anterior, pra computar o diff da auditoria.
  const { data: beforeRow } = await supabase
    .from("projects")
    .select(PROJECT_FORM_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("projects")
    .update({ ...parsed.data, updated_by: actor.userId })
    .eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }

  const changes = beforeRow
    ? diffProjectValues(beforeRow as unknown as ProjectFormValues, parsed.data)
    : [];
  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "update",
    entityId: id,
    entityLabel: parsed.data.title,
    summary:
      changes.length > 0
        ? `Editou o projeto "${parsed.data.title}" (${pluralChanges(changes.length)})`
        : `Salvou o projeto "${parsed.data.title}" (sem alterações de campo)`,
    details: changes.length > 0 ? changes : null,
  });

  revalidatePath("/admin/projetos");
  revalidatePath(`/admin/projetos/${id}`);
  return { ok: true, projectId: id };
}

/**
 * Apaga projeto (cascade nas tabelas dependentes via FK).
 */
export async function deleteProjectAction(id: string): Promise<ActionResult> {
  let actor: { userId: string; email: string | null };
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();

  // Snapshot completo antes de excluir — preserva o estado na trilha e permite
  // reconstruir o projeto manualmente se preciso.
  const { data: snapshot } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }

  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "delete",
    entityId: id,
    entityLabel: (snapshot?.title as string | undefined) ?? null,
    summary: `Excluiu o projeto "${(snapshot?.title as string | undefined) ?? id}"`,
    details: snapshot ?? null,
  });

  // Se o projeto deletado era publicado, o site público precisa revalidar
  updateTag("projects");
  updateTag("home_featured");
  revalidatePath("/admin/projetos");
  redirect("/admin/projetos");
}

/**
 * Publica um projeto (de draft → published) e dispara revalidação do site.
 */
export async function publishProjectAction(id: string): Promise<ActionResult> {
  let actor: { userId: string; email: string | null };
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: project, error } = await supabase
    .from("projects")
    .update({ published_status: "published", updated_by: actor.userId })
    .eq("id", id)
    .select("slug, title")
    .single();

  if (error || !project) {
    return { ok: false, error: error?.message ?? "Erro ao publicar" };
  }

  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "publish",
    entityId: id,
    entityLabel: project.title,
    summary: `Publicou o projeto "${project.title}"`,
  });

  updateTag("projects");
  revalidatePath("/");
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${project.slug}`);
  revalidatePath("/admin/projetos");
  return { ok: true, projectId: id };
}

/**
 * Volta um projeto pra rascunho (some do site público).
 */
export async function unpublishProjectAction(id: string): Promise<ActionResult> {
  let actor: { userId: string; email: string | null };
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: project, error } = await supabase
    .from("projects")
    .update({ published_status: "draft", updated_by: actor.userId })
    .eq("id", id)
    .select("slug, title")
    .single();

  if (error || !project) {
    return { ok: false, error: error?.message ?? "Erro ao despublicar" };
  }

  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "unpublish",
    entityId: id,
    entityLabel: project.title,
    summary: `Despublicou o projeto "${project.title}" (voltou a rascunho)`,
  });

  updateTag("projects");
  revalidatePath("/");
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${project.slug}`);
  revalidatePath("/admin/projetos");
  return { ok: true, projectId: id };
}

/**
 * Recebe array de IDs na nova ordem e atualiza display_order em batch.
 */
export async function reorderProjectsAction(
  orderedIds: string[],
): Promise<ActionResult> {
  let actor: { userId: string; email: string | null };
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();

  // Atualiza um por um (Supabase não tem batch update por linhas distintas
  // sem RPC). Volume baixo (≤ 30 projetos) — performance é aceitável.
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]!;
    const { error } = await supabase
      .from("projects")
      .update({ display_order: i })
      .eq("id", id);
    if (error) {
      return { ok: false, error: `Erro reordenando: ${error.message}` };
    }
  }

  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "reorder",
    entityType: "projects",
    entityId: null,
    entityLabel: null,
    summary: `Reordenou a lista de projetos (${orderedIds.length} no total)`,
    details: { orderedIds },
  });

  updateTag("projects");
  revalidatePath("/projetos");
  revalidatePath("/admin/projetos");
  return { ok: true };
}

/**
 * Substitui a galeria de um projeto pelos itens passados.
 * `items` já vem na ordem desejada — usamos o índice como `position`.
 */
export async function replaceProjectGalleryAction(
  projectId: string,
  items: Array<{ src: string; alt: string; blurHash?: string | null }>,
): Promise<ActionResult> {
  let actor: { userId: string; email: string | null };
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();

  // Rótulo do projeto + galeria anterior, pra rotular e diferenciar na trilha.
  const [{ data: project }, { data: beforeGallery }] = await Promise.all([
    supabase.from("projects").select("title").eq("id", projectId).maybeSingle(),
    supabase
      .from("project_gallery_images")
      .select("src, alt, blur_hash")
      .eq("project_id", projectId)
      .order("position", { ascending: true }),
  ]);

  // Limpa galeria atual
  const { error: deleteError } = await supabase
    .from("project_gallery_images")
    .delete()
    .eq("project_id", projectId);
  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  if (items.length > 0) {
    const rows = items.map((item, index) => ({
      project_id: projectId,
      src: item.src,
      alt: item.alt,
      blur_hash: item.blurHash ?? null,
      position: index,
    }));

    const { error: insertError } = await supabase
      .from("project_gallery_images")
      .insert(rows);
    if (insertError) {
      return { ok: false, error: insertError.message };
    }
  }

  const projectTitle = (project?.title as string | undefined) ?? projectId;
  const beforeItems = (beforeGallery ?? []).map((g) => ({
    id: g.src,
    src: g.src,
    alt: g.alt,
    blurHash: g.blur_hash,
  }));
  const afterItems = items.map((i) => ({
    id: i.src,
    src: i.src,
    alt: i.alt,
    blurHash: i.blurHash ?? null,
  }));
  const changes = diffGallery(beforeItems, afterItems);
  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "gallery",
    entityId: projectId,
    entityLabel: (project?.title as string | undefined) ?? null,
    summary:
      changes.length > 0
        ? `Atualizou a galeria do projeto "${projectTitle}" (${pluralChanges(changes.length)})`
        : `Salvou a galeria do projeto "${projectTitle}" (sem mudanças)`,
    details: changes.length > 0 ? changes : null,
  });

  revalidatePath(`/admin/projetos/${projectId}`);
  return { ok: true };
}

/**
 * Define os 3 destaques da home na ordem dada.
 */
export async function setHomeFeaturedAction(
  orderedProjectIds: [string, string, string],
): Promise<ActionResult> {
  let actor: { userId: string; email: string | null };
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();

  // Limpa e re-popula. A constraint UNIQUE em project_id força sermos
  // cuidadosos: deletamos tudo antes.
  const { error: deleteError } = await supabase
    .from("home_featured")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  const rows = orderedProjectIds.map((projectId, index) => ({
    project_id: projectId,
    position: index + 1,
  }));

  const { error: insertError } = await supabase
    .from("home_featured")
    .insert(rows);
  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  // Rótulos dos 3 destaques pra trilha ficar legível.
  const { data: featuredProjects } = await supabase
    .from("projects")
    .select("id, title")
    .in("id", orderedProjectIds);
  const titleById = new Map(
    (featuredProjects ?? []).map((p) => [p.id as string, p.title as string]),
  );
  const orderedTitles = orderedProjectIds.map(
    (pid) => titleById.get(pid) ?? pid,
  );
  await recordAudit({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "featured",
    entityType: "home_featured",
    entityId: null,
    entityLabel: null,
    summary: `Definiu os destaques da home: ${orderedTitles.join(", ")}`,
    details: { orderedProjectIds, orderedTitles },
  });

  updateTag("home_featured");
  updateTag("projects");
  revalidatePath("/");
  revalidatePath("/admin/home");
  return { ok: true };
}
