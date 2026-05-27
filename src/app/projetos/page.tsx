import { getAllProjects, getProjectTypologies } from "@/services/projects.service";
import { getBreadcrumbJsonLd, getProjectsItemListJsonLd } from "@/lib/seo";
import { ProjetosClient } from "./projetos-client";

export default async function ProjetosPage() {
  const allProjects = await getAllProjects();
  const typologies = await getProjectTypologies();

  const itemListJsonLd = getProjectsItemListJsonLd(allProjects);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Início", path: "/" },
    { name: "Projetos", path: "/projetos" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground">
        <ProjetosClient allProjects={allProjects} typologies={typologies} />
      </div>
    </>
  );
}
