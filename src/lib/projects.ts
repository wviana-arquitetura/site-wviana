import {
  getAllProjects,
  getProjectBySlug as getProjectBySlugFromService,
} from "@/services/projects.service";
import type { Project } from "@/types/project";

export type { Project };

/**
 * Atalho server-side para listar todos os projetos publicados.
 * Use diretamente em Server Components / Route Handlers (não em Client Components).
 */
export async function getProjects(): Promise<Project[]> {
  return getAllProjects();
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return getProjectBySlugFromService(slug);
}
