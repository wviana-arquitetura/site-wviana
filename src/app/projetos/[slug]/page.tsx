import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailContent } from "@/components/project/project-detail-content";
import { getProjectCreativeWorkJsonLd, pageMeta } from "@/lib/seo";
import { getAllProjects, getProjectBySlug } from "@/services/projects.service";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: "Projeto" };
  }
  const desc =
    project.summary.length > 160
      ? `${project.summary.slice(0, 157)}…`
      : project.summary;
  return pageMeta({
    title: project.title,
    description: desc,
    path: `/projetos/${project.slug}`,
    ogImagePath: project.imageSrc,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const jsonLd = getProjectCreativeWorkJsonLd(project);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground">
        <ProjectDetailContent project={project} />
      </div>
    </>
  );
}
