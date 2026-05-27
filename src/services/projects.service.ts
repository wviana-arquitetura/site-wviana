import { unstable_cache } from "next/cache";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { rowToProject } from "@/lib/supabase/types";
import type {
  ProjectRow,
  ProjectGalleryRow,
  HomeFeaturedRow,
} from "@/lib/supabase/types";
import type { Project } from "@/types/project";

export type ProjectTypology = Project["typology"];

const CACHE_TAG = "projects";
const HOME_FEATURED_TAG = "home_featured";

/**
 * Busca todos os projetos publicados do Supabase, com galeria embarcada,
 * em ordem com os destaques da home primeiro e o resto por display_order.
 *
 * Cacheado via unstable_cache + tag — invalidado pelo painel admin ao
 * clicar em "Publicar" (revalidateTag).
 */
async function fetchProjectsFromDb(): Promise<Project[]> {
  const supabase = createSupabaseServiceRoleClient();

  const [{ data: projectRows, error: projectsError }, { data: galleryRows, error: galleryError }, { data: featuredRows, error: featuredError }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("published_status", "published")
      .order("display_order", { ascending: true }),
    supabase
      .from("project_gallery_images")
      .select("*")
      .order("position", { ascending: true }),
    supabase
      .from("home_featured")
      .select("*")
      .order("position", { ascending: true }),
  ]);

  if (projectsError || !projectRows) {
    console.error("[projects.service] Erro buscando projects:", projectsError);
    return [];
  }
  if (galleryError) {
    console.error("[projects.service] Erro buscando galeria:", galleryError);
  }
  if (featuredError) {
    console.error("[projects.service] Erro buscando home_featured:", featuredError);
  }

  const galleryByProjectId = new Map<string, ProjectGalleryRow[]>();
  for (const item of (galleryRows ?? []) as ProjectGalleryRow[]) {
    const list = galleryByProjectId.get(item.project_id) ?? [];
    list.push(item);
    galleryByProjectId.set(item.project_id, list);
  }

  const projects = (projectRows as ProjectRow[]).map((row) =>
    rowToProject(row, galleryByProjectId.get(row.id) ?? []),
  );

  // Reordena: destaques da home vêm primeiro, depois o resto por display_order
  const featuredOrder = (featuredRows ?? []) as HomeFeaturedRow[];
  const featuredProjectIds = new Set(featuredOrder.map((f) => f.project_id));

  const idToProject = new Map(
    (projectRows as ProjectRow[]).map((row) => [row.id, row]),
  );

  const featuredProjects = featuredOrder
    .map((f) => {
      const row = idToProject.get(f.project_id);
      if (!row) return null;
      return rowToProject(row, galleryByProjectId.get(row.id) ?? []);
    })
    .filter((p): p is Project => p !== null);

  const remainingProjects = projects.filter(
    (p) => !featuredProjectIds.has((projectRows as ProjectRow[]).find((r) => r.slug === p.slug)?.id ?? ""),
  );

  return [...featuredProjects, ...remainingProjects];
}

const getCachedProjects = unstable_cache(
  fetchProjectsFromDb,
  ["all-projects"],
  { tags: [CACHE_TAG, HOME_FEATURED_TAG], revalidate: 3600 },
);

export async function getAllProjects(): Promise<Project[]> {
  return getCachedProjects();
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function fetchProjects(): Promise<Project[]> {
  return getAllProjects();
}

export async function getProjectTypologies(): Promise<ProjectTypology[]> {
  const projects = await getAllProjects();
  return Array.from(new Set(projects.map((p) => p.typology)));
}

export async function getRelatedProjects(slug: string, limit = 2): Promise<Project[]> {
  const projects = await getAllProjects();
  const current = projects.find((p) => p.slug === slug);
  if (!current) return [];

  const sameTypology = projects.filter(
    (p) => p.slug !== slug && p.typology === current.typology,
  );
  const fallback = projects.filter((p) => p.slug !== slug);

  const merged = [...sameTypology, ...fallback].reduce<Project[]>((acc, item) => {
    if (!acc.find((p) => p.slug === item.slug)) acc.push(item);
    return acc;
  }, []);

  return merged.slice(0, limit);
}

export async function getNextProject(slug: string): Promise<Project | null> {
  const projects = await getAllProjects();
  const currentIndex = projects.findIndex((p) => p.slug === slug);
  if (currentIndex < 0) return null;
  const nextIndex = (currentIndex + 1) % projects.length;
  return projects[nextIndex] ?? null;
}

/**
 * Admin only: lista TODOS os projetos (drafts + published), ordenados por
 * display_order. Inclui id do banco pra que o admin consiga editar.
 *
 * Não usa cache — admin precisa de dados frescos a cada navegação.
 */
export type AdminProjectListItem = {
  id: string;
  slug: string;
  title: string;
  typology: ProjectTypology;
  status_label: Project["status"];
  published_status: "draft" | "published";
  display_order: number;
  image_src: string;
  image_alt: string | null;
  updated_at: string;
};

export async function getAllProjectsForAdmin(): Promise<AdminProjectListItem[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, slug, title, typology, status_label, published_status, display_order, image_src, image_alt, updated_at",
    )
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[projects.service] getAllProjectsForAdmin:", error);
    return [];
  }

  return (data ?? []) as AdminProjectListItem[];
}
