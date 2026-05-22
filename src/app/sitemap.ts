import type { MetadataRoute } from "next";
import { statSync } from "node:fs";
import path from "node:path";
import { BRAND } from "@/lib/brand";
import projects from "@/data/projects.json";

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

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BRAND.siteUrl}/projetos/${project.slug}`,
    lastModified: projectsMtime,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...projectEntries];
}
