import projectsData from "@/data/projects.json";
import type { Project } from "@/types/project";

const projects = projectsData as Project[];
const homeFeaturedSlugs = ["residencial-rc", "residencial-pl", "residencial-tn"];

function sortProjectsWithHomeFeaturedFirst(items: Project[]): Project[] {
  const featured = homeFeaturedSlugs
    .map((slug) => items.find((project) => project.slug === slug))
    .filter((project): project is Project => project !== undefined);
  const featuredSlugSet = new Set(featured.map((project) => project.slug));
  const remaining = items.filter((project) => !featuredSlugSet.has(project.slug));

  return [...featured, ...remaining];
}

const orderedProjects = sortProjectsWithHomeFeaturedFirst(projects);

export type ProjectTypology = Project["typology"];

export function getAllProjects(): Project[] {
  return orderedProjects;
}

export function getProjectBySlug(slug: string): Project | null {
  return orderedProjects.find((project) => project.slug === slug) ?? null;
}

export async function fetchProjects(): Promise<Project[]> {
  return orderedProjects;
}

export function getProjectTypologies(): ProjectTypology[] {
  return Array.from(new Set(orderedProjects.map((project) => project.typology)));
}

export function getRelatedProjects(slug: string, limit = 2): Project[] {
  const current = getProjectBySlug(slug);

  if (!current) {
    return [];
  }

  const sameTypology = orderedProjects.filter(
    (project) => project.slug !== slug && project.typology === current.typology,
  );

  const fallback = orderedProjects.filter((project) => project.slug !== slug);

  const merged = [...sameTypology, ...fallback].reduce<Project[]>((acc, item) => {
    if (!acc.find((project) => project.slug === item.slug)) {
      acc.push(item);
    }

    return acc;
  }, []);

  return merged.slice(0, limit);
}

export function getNextProject(slug: string): Project | null {
  const currentIndex = orderedProjects.findIndex((project) => project.slug === slug);

  if (currentIndex < 0) {
    return null;
  }

  const nextIndex = (currentIndex + 1) % orderedProjects.length;

  return orderedProjects[nextIndex] ?? null;
}