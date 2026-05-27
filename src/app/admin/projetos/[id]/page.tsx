import { notFound } from "next/navigation";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { ProjectFormValues } from "@/app/admin/_actions/projects";
import { GuardedLink } from "@/components/admin/guarded-link";
import { ProjectEditClient } from "./edit-client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = createSupabaseServiceRoleClient();

  const [{ data: project }, { data: galleryRows }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("project_gallery_images")
      .select("id, src, alt, position")
      .eq("project_id", id)
      .order("position", { ascending: true }),
  ]);

  if (!project) {
    notFound();
  }

  const initial: ProjectFormValues = {
    slug: project.slug,
    title: project.title,
    category: project.category,
    typology: project.typology,
    status_label: project.status_label,
    location: project.location,
    country: project.country,
    area: project.area,
    year: project.year,
    client: project.client,
    image_src: project.image_src,
    image_alt: project.image_alt,
    og_image_src: project.og_image_src,
    summary: project.summary,
    scope: project.scope ?? [],
    services: project.services,
    area_served: project.area_served,
    chapters: project.chapters ?? [],
    seo_title: project.seo_title,
    seo_description: project.seo_description,
  };

  const gallery = (galleryRows ?? []).map((row) => ({
    id: row.id,
    src: row.src,
    alt: row.alt,
  }));

  return (
    <div className="px-8 py-12 md:px-16 lg:px-24">
      <div className="mx-auto max-w-[1100px]">
        <GuardedLink
          href="/admin/projetos"
          className="text-micro uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Voltar para projetos
        </GuardedLink>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span
              className="block text-micro uppercase tracking-[0.32em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Editar projeto
            </span>
            <h1 className="mt-3 text-architectural font-light text-foreground leading-[1.05]">
              {project.title}
            </h1>
            <p className="mt-3 text-micro uppercase tracking-[0.22em] text-muted-foreground">
              /{project.slug} · {project.typology} · {project.published_status === "published" ? "publicado" : "rascunho"}
            </p>
          </div>
        </div>

        <div className="mt-12">
          <ProjectEditClient
            projectId={id}
            initial={initial}
            galleryInitial={gallery}
            currentStatus={project.published_status}
          />
        </div>
      </div>
    </div>
  );
}
