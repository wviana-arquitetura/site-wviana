import type { Project } from "@/types/project";

export type PublishedStatus = "draft" | "published";
export type AdminRole = "owner" | "editor";

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  typology: Project["typology"];
  status_label: Project["status"];
  location: string;
  country: string;
  area: string | null;
  year: string | null;
  client: string | null;
  image_src: string;
  image_alt: string | null;
  og_image_src: string | null;
  summary: string;
  scope: string[];
  services: string[] | null;
  area_served: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  chapters: Project["chapters"];
  published_status: PublishedStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectGalleryRow = {
  id: string;
  project_id: string;
  src: string;
  alt: string;
  position: number;
};

export type HomeFeaturedRow = {
  id: string;
  project_id: string;
  position: 1 | 2 | 3;
};

export type AdminUserRow = {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
};

/**
 * Converte uma linha do banco + galeria no objeto `Project` que o site público
 * consome (ver src/types/project.ts).
 */
export function rowToProject(
  project: ProjectRow,
  gallery: ProjectGalleryRow[],
): Project {
  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    typology: project.typology,
    status: project.status_label,
    location: project.location,
    country: project.country,
    area: project.area ?? undefined,
    year: project.year ?? undefined,
    client: project.client ?? undefined,
    imageSrc: project.image_src,
    imageAlt: project.image_alt ?? undefined,
    ogImageSrc: project.og_image_src ?? undefined,
    summary: project.summary,
    scope: project.scope,
    services: project.services ?? undefined,
    areaServed: project.area_served ?? undefined,
    seoTitle: project.seo_title ?? undefined,
    seoDescription: project.seo_description ?? undefined,
    chapters: project.chapters,
    gallery: gallery
      .sort((a, b) => a.position - b.position)
      .map((g) => ({ src: g.src, alt: g.alt })),
    updatedAt: project.updated_at,
  };
}
