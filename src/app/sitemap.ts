import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { getAllProjects } from "@/services/projects.service";

/**
 * Sitemap gerado a partir dos projetos do Supabase (mesma fonte das páginas),
 * pra que projetos criados/editados no painel admin apareçam aqui automaticamente.
 * Cacheado junto com getAllProjects (revalidate/tags).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getAllProjects();

  // Última atualização entre os projetos — proxy razoável pra "última mudança
  // de conteúdo do site". Cai pra data do build se não houver projetos.
  const latestProjectUpdate = projects.reduce<Date>((latest, project) => {
    const parsed = project.updatedAt ? new Date(project.updatedAt) : null;
    if (parsed && !Number.isNaN(parsed.getTime()) && parsed > latest) {
      return parsed;
    }
    return latest;
  }, new Date(0));
  const siteLastModified =
    latestProjectUpdate.getTime() > 0 ? latestProjectUpdate : new Date();

  const staticRoutes = ["", "/projetos", "/processo", "/sobre", "/contato", "/privacidade", "/termos"];
  const legalRoutes = new Set(["/privacidade", "/termos"]);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BRAND.siteUrl}${route}`,
    lastModified: legalRoutes.has(route) ? new Date() : siteLastModified,
    changeFrequency: route === "" ? "weekly" : legalRoutes.has(route) ? "yearly" : "monthly",
    priority: route === "" ? 1 : legalRoutes.has(route) ? 0.3 : 0.8,
    ...(route === "/sobre"
      ? { images: [`${BRAND.siteUrl}/images/team/wellington-viana/sobre-desktop.webp`] }
      : {}),
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => {
    const parsed = project.updatedAt ? new Date(project.updatedAt) : null;
    const lastModified =
      parsed && !Number.isNaN(parsed.getTime()) ? parsed : siteLastModified;
    return {
      url: `${BRAND.siteUrl}/projetos/${project.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  return [...staticEntries, ...projectEntries];
}
