import { ProjectForm } from "@/components/admin/project-form";
import type { ProjectFormValues } from "@/app/admin/_actions/projects";
import { GuardedLink } from "@/components/admin/guarded-link";
import { AdminShell, AdminHeader } from "@/components/admin/admin-page-shell";

const EMPTY: ProjectFormValues = {
  slug: "",
  title: "",
  category: "Residencial",
  typology: "Residencial",
  status_label: "Concluído",
  location: "",
  country: "CE",
  area: null,
  year: null,
  client: null,
  image_src: "",
  image_alt: null,
  image_blur_hash: null,
  og_image_src: null,
  summary: "",
  scope: [],
  services: null,
  area_served: null,
  chapters: [
    { title: "Contexto", content: "" },
    { title: "Solução", content: "" },
  ],
  seo_title: null,
  seo_description: null,
};

export default function AdminNovoProjetoPage() {
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
        eyebrow="Novo projeto"
        title="Criar projeto"
        meta="rascunho · galeria liberada após salvar"
      />
      <ProjectForm mode="create" initial={EMPTY} />
    </AdminShell>
  );
}
