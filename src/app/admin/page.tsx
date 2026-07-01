import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllProjects } from "@/services/projects.service";
import { AdminShell, AdminBody } from "@/components/admin/admin-page-shell";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const projects = await getAllProjects();

  // Conta drafts (incluindo projetos não publicados que getAllProjects não retorna)
  const { count: totalCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });
  const { count: draftCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("published_status", "draft");

  const userName = user?.email?.split("@")[0] ?? "";

  return (
    <AdminShell>
      <AdminBody>
        <div className="mx-auto w-full max-w-[1200px]">
          <span
            className="text-micro uppercase tracking-[0.32em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            Painel administrativo
          </span>
          <h1 className="mt-4 text-architectural font-light text-foreground leading-[1.05]">
            Olá, {userName}.
          </h1>
          <p className="mt-6 max-w-[560px] text-body-lg text-muted-foreground">
            Você gerencia aqui os projetos do portfólio do site. Edite textos, troque
            imagens, reordene a listagem e escolha os 3 destaques da home.
          </p>

          {/* Quick stats — números grandes dão o destaque do painel */}
          <div className="mt-12 grid grid-cols-1 gap-px md:grid-cols-3" style={{ background: "hsl(var(--accent) / 0.3)" }}>
            <Stat label="Projetos publicados" value={projects.length} />
            <Stat label="Rascunhos" value={draftCount ?? 0} />
            <Stat label="Total" value={totalCount ?? 0} />
          </div>

          {/* Quick links */}
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <QuickLink
              href="/admin/projetos"
              label="Gerenciar projetos"
              description="Editar textos, imagens, criar novos e reordenar a listagem"
            />
            <QuickLink
              href="/admin/home"
              label="Destaques da home"
              description="Escolher os 3 projetos que aparecem na página inicial"
            />
          </div>
        </div>
      </AdminBody>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-background p-6">
      <span
        className="text-micro uppercase tracking-[0.22em]"
        style={{ color: "hsl(var(--accent-strong))" }}
      >
        {label}
      </span>
      <p className="mt-3 text-architectural font-light text-foreground leading-none">
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block border p-6 transition-colors hover:bg-secondary/30"
      style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
    >
      <span className="text-body-lg font-medium text-foreground">{label}</span>
      <p className="mt-2 text-body text-muted-foreground">{description}</p>
      <span
        className="mt-6 inline-block text-micro uppercase tracking-[0.22em] text-foreground opacity-80 transition-opacity group-hover:opacity-100"
        style={{ color: "hsl(var(--accent-strong))" }}
      >
        Acessar →
      </span>
    </Link>
  );
}
