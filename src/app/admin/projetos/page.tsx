import { getAllProjectsForAdmin } from "@/services/projects.service";
import { SortableProjectsList } from "@/components/admin/sortable-projects-list";
import { GuardedLink } from "@/components/admin/guarded-link";
import { AdminShell, AdminHeader, AdminBody } from "@/components/admin/admin-page-shell";

export const dynamic = "force-dynamic";

export default async function AdminProjectsListPage() {
  const projects = await getAllProjectsForAdmin();

  return (
    <AdminShell>
      <AdminHeader
        eyebrow="Conteúdo"
        title="Projetos"
        meta={`${projects.length} ${projects.length === 1 ? "projeto" : "projetos"} · arraste para reordenar`}
        actions={
          <GuardedLink
            href="/admin/projetos/novo"
            className="border px-6 py-3 text-caption uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary"
            style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
          >
            + Novo projeto
          </GuardedLink>
        }
      />

      {projects.length === 0 ? (
        <AdminBody>
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
        </AdminBody>
      ) : (
        <SortableProjectsList initialProjects={projects} />
      )}
    </AdminShell>
  );
}
