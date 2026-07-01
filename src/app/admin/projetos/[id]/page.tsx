import { notFound } from "next/navigation";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { ProjectFormValues } from "@/app/admin/_actions/projects";
import { GuardedLink } from "@/components/admin/guarded-link";
import { AdminShell, AdminHeader } from "@/components/admin/admin-page-shell";
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
      .select("id, src, alt, blur_hash, position")
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
    image_blur_hash: project.image_blur_hash,
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
    blurHash: row.blur_hash,
  }));

  return (
    <AdminShell>
      <AdminHeader
        back={
          <GuardedLink
            href="/admin/projetos"
            className="text-micro uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Voltar
          </GuardedLink>
        }
        eyebrow="Editar projeto"
        title={project.title}
        meta={`/${project.slug} · ${project.typology} · ${project.published_status === "published" ? "publicado" : "rascunho"}`}
      />
      <ProjectEditClient
        projectId={id}
        initial={initial}
        galleryInitial={gallery}
        currentStatus={project.published_status}
      />
    </AdminShell>
  );
}
