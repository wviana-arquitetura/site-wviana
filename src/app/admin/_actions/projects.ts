"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

/**
 * Garante que o usuário atual é admin. Lança se não for.
 */
async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Não autenticado");
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!adminRow) {
    throw new Error("Não autorizado");
  }

  return { userId: user.id, supabase };
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
  try {
    await requireAdmin();
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
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Erro ao criar projeto" };
  }

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
  try {
    await requireAdmin();
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

  const { error } = await supabase.from("projects").update(parsed.data).eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/projetos");
  revalidatePath(`/admin/projetos/${id}`);
  return { ok: true, projectId: id };
}

/**
 * Apaga projeto (cascade nas tabelas dependentes via FK).
 */
export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }

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
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: project, error } = await supabase
    .from("projects")
    .update({ published_status: "published" })
    .eq("id", id)
    .select("slug")
    .single();

  if (error || !project) {
    return { ok: false, error: error?.message ?? "Erro ao publicar" };
  }

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
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: project, error } = await supabase
    .from("projects")
    .update({ published_status: "draft" })
    .eq("id", id)
    .select("slug")
    .single();

  if (error || !project) {
    return { ok: false, error: error?.message ?? "Erro ao despublicar" };
  }

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
  try {
    await requireAdmin();
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
  items: Array<{ src: string; alt: string }>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const supabase = createSupabaseServiceRoleClient();

  // Limpa galeria atual
  const { error: deleteError } = await supabase
    .from("project_gallery_images")
    .delete()
    .eq("project_id", projectId);
  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  if (items.length === 0) {
    revalidatePath(`/admin/projetos/${projectId}`);
    return { ok: true };
  }

  const rows = items.map((item, index) => ({
    project_id: projectId,
    src: item.src,
    alt: item.alt,
    position: index,
  }));

  const { error: insertError } = await supabase
    .from("project_gallery_images")
    .insert(rows);
  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  revalidatePath(`/admin/projetos/${projectId}`);
  return { ok: true };
}

/**
 * Define os 3 destaques da home na ordem dada.
 */
export async function setHomeFeaturedAction(
  orderedProjectIds: [string, string, string],
): Promise<ActionResult> {
  try {
    await requireAdmin();
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

  updateTag("home_featured");
  updateTag("projects");
  revalidatePath("/");
  revalidatePath("/admin/home");
  return { ok: true };
}
