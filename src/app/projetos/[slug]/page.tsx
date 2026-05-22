import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailContent } from "@/components/project/project-detail-content";
import { getBreadcrumbJsonLd, getProjectCreativeWorkJsonLd, pageMeta } from "@/lib/seo";
import { getAllProjects, getProjectBySlug } from "@/services/projects.service";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: "Projeto" };
  }

  return pageMeta({
    title: project.seoTitle ?? project.title,
    socialTitle: project.title,
    description: project.seoDescription ?? project.summary,
    path: `/projetos/${project.slug}`,
    ogImagePath: `/og/projetos/${project.slug}`,
    imageAlt: project.imageAlt ?? `Imagem do projeto ${project.title}`,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const jsonLd = getProjectCreativeWorkJsonLd(project);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Início", path: "/" },
    { name: "Projetos", path: "/projetos" },
    { name: project.title, path: `/projetos/${project.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground">
        <ProjectDetailContent project={project} />
      </div>
    </>
  );
}
