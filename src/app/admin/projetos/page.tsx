import { getAllProjectsForAdmin } from "@/services/projects.service";
import { SortableProjectsList } from "@/components/admin/sortable-projects-list";
import { GuardedLink } from "@/components/admin/guarded-link";

export const dynamic = "force-dynamic";

export default async function AdminProjectsListPage() {
  const projects = await getAllProjectsForAdmin();

  return (
    <div className="px-8 py-12 md:px-16 lg:px-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span
              className="text-micro uppercase tracking-[0.32em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Conteúdo
            </span>
            <h1 className="mt-4 text-architectural font-light text-foreground leading-[1.05]">
              Projetos
            </h1>
            <p className="mt-3 max-w-[640px] text-body text-muted-foreground">
              {projects.length} {projects.length === 1 ? "projeto" : "projetos"} no total ·
              arraste para reordenar a listagem pública · clique em um item para editar
            </p>
          </div>
          <GuardedLink
            href="/admin/projetos/novo"
            className="border px-6 py-3 text-caption uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary"
            style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
          >
            + Novo projeto
          </GuardedLink>
        </div>

        <div className="mt-12">
          {projects.length === 0 ? (
            <div
              className="border p-16 text-center"
              style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
            >
              <p className="text-body text-muted-foreground">
                Nenhum projeto cadastrado ainda.
              </p>
              <GuardedLink
                href="/admin/projetos/novo"
                className="mt-6 inline-block text-caption uppercase tracking-[0.18em] text-foreground underline underline-offset-4"
              >
                Criar primeiro projeto
              </GuardedLink>
            </div>
          ) : (
            <SortableProjectsList initialProjects={projects} />
          )}
        </div>
      </div>
    </div>
  );
}
