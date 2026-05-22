import type { MetadataRoute } from "next";
import { statSync } from "node:fs";
import path from "node:path";
import { BRAND } from "@/lib/brand";
import projectsData from "@/data/projects.json";
import type { Project } from "@/types/project";

const projects = projectsData as Project[];

export default function sitemap(): MetadataRoute.Sitemap {
  const projectsPath = path.join(process.cwd(), "src/data/projects.json");
  const projectsMtime = statSync(projectsPath).mtime;

  const staticRoutes = ["", "/projetos", "/processo", "/sobre", "/contato", "/privacidade", "/termos"];

  const legalRoutes = new Set(["/privacidade", "/termos"]);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BRAND.siteUrl}${route}`,
    lastModified: projectsMtime,
    changeFrequency: route === "" ? "weekly" : legalRoutes.has(route) ? "yearly" : "monthly",
    priority: route === "" ? 1 : legalRoutes.has(route) ? 0.3 : 0.8,
    ...(route === "/sobre"
      ? { images: [`${BRAND.siteUrl}/images/team/wellington-viana/sobre-desktop.webp`] }
      : {}),
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => {
    // Se o JSON traz updatedAt valido, usamos ele; senao caimos no mtime do arquivo.
    const parsed = project.updatedAt ? new Date(project.updatedAt) : null;
    const lastModified =
      parsed && !Number.isNaN(parsed.getTime()) ? parsed : projectsMtime;
    return {
      url: `${BRAND.siteUrl}/projetos/${project.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  return [...staticEntries, ...projectEntries];
}
