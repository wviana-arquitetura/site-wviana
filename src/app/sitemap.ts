import type { MetadataRoute } from "next";
import { statSync } from "node:fs";
import path from "node:path";
import { BRAND } from "@/lib/brand";
import projects from "@/data/projects.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const projectsPath = path.join(process.cwd(), "src/data/projects.json");
  const projectsMtime = statSync(projectsPath).mtime;

  const staticRoutes = ["", "/projetos", "/processo", "/sobre", "/contato"];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BRAND.siteUrl}${route}`,
    lastModified: projectsMtime,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BRAND.siteUrl}/projetos/${project.slug}`,
    lastModified: projectsMtime,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...projectEntries];
}
