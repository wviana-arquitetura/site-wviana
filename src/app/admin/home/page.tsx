import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { FeaturedPicker } from "@/components/admin/featured-picker";
import { AdminShell, AdminHeader, AdminBody } from "@/components/admin/admin-page-shell";

export const dynamic = "force-dynamic";

async function loadData() {
  const supabase = createSupabaseServiceRoleClient();

  const [publishedRes, featuredRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, slug, title, typology, image_src, image_alt")
      .eq("published_status", "published")
      .order("display_order", { ascending: true }),
    supabase
      .from("home_featured")
      .select("position, project_id")
      .order("position", { ascending: true }),
  ]);

  const options = publishedRes.data ?? [];
  const featured = (featuredRes.data ?? []) as Array<{
    position: number;
    project_id: string;
  }>;

  const initial: [string | null, string | null, string | null] = [
    featured.find((f) => f.position === 1)?.project_id ?? null,
    featured.find((f) => f.position === 2)?.project_id ?? null,
    featured.find((f) => f.position === 3)?.project_id ?? null,
  ];

  return { options, initial };
}

export default async function AdminHomePage() {
  const { options, initial } = await loadData();

  return (
    <AdminShell>
      <AdminHeader
        eyebrow="Página inicial"
        title="Destaques da home"
        meta="3 projetos da seção principal · na ordem exibida no site"
      />
      {options.length < 3 ? (
        <AdminBody>
          <div
            className="border p-6"
            style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
          >
            <p className="text-body text-foreground">
              Você precisa de pelo menos 3 projetos publicados para definir os
              destaques. Atualmente: {options.length}.
            </p>
          </div>
        </AdminBody>
      ) : (
        <FeaturedPicker options={options} initial={initial} />
      )}
    </AdminShell>
  );
}
