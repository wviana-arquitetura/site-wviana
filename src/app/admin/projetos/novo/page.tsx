import { ProjectForm } from "@/components/admin/project-form";
import type { ProjectFormValues } from "@/app/admin/_actions/projects";
import { GuardedLink } from "@/components/admin/guarded-link";

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
    <div className="px-8 py-12 md:px-16 lg:px-24">
      <div className="mx-auto max-w-[1100px]">
        <GuardedLink
          href="/admin/projetos"
          className="text-micro uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Voltar para projetos
        </GuardedLink>
        <span
          className="mt-8 block text-micro uppercase tracking-[0.32em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Novo projeto
        </span>
        <h1 className="mt-3 text-architectural font-light text-foreground leading-[1.05]">
          Criar projeto
        </h1>
        <p className="mt-3 text-body text-muted-foreground">
          Preencha os dados principais. A galeria de imagens fica disponível após
          salvar o projeto pela primeira vez.
        </p>

        <div className="mt-12">
          <ProjectForm mode="create" initial={EMPTY} />
        </div>
      </div>
    </div>
  );
}
