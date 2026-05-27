import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { FeaturedPicker } from "@/components/admin/featured-picker";

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
    <div className="px-8 py-12 md:px-16 lg:px-24">
      <div className="mx-auto max-w-[1400px]">
        <span
          className="text-micro uppercase tracking-[0.32em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Página inicial
        </span>
        <h1 className="mt-4 text-architectural font-light text-foreground leading-[1.05]">
          Destaques da home
        </h1>
        <p className="mt-6 max-w-[640px] text-body-lg text-muted-foreground">
          Escolha os 3 projetos que aparecem na seção principal da página inicial. A
          ordem das posições é exatamente a que aparece no site.
        </p>

        <div className="mt-12">
          {options.length < 3 ? (
            <div
              className="border p-8"
              style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
            >
              <p className="text-body text-foreground">
                Você precisa de pelo menos 3 projetos publicados para definir os
                destaques. Atualmente: {options.length}.
              </p>
            </div>
          ) : (
            <FeaturedPicker options={options} initial={initial} />
          )}
        </div>
      </div>
    </div>
  );
}
