import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type ReviewRecord = {
  id: string;
  created_at?: string;
  createdAt?: string;
  respondent_name?: string;
  alignment?: string;
  priority_1?: string | null;
  priority_2?: string | null;
  priority_3?: string | null;
  payload?: {
    respondent?: { name?: string; reviewDate?: string };
    generalImpression?: { alignment?: string; comment?: string };
    priorities?: string[];
    sectionFeedback?: { decisions?: Record<string, string> };
    [key: string]: unknown;
  };
};

const SECTION_LABEL: Record<string, string> = {
  home: "Home",
  menu: "Menu",
  manifesto: "Manifesto",
  process: "Processo",
  studio: "Quem somos",
  projects: "Projetos",
  contact: "Contato",
};

const DECISION_LABEL: Record<string, string> = {
  approved: "Aprovado",
  minor_adjustments: "Ajustes leves",
  major_adjustments: "Ajustes importantes",
};

const ALIGNMENT_LABEL: Record<string, string> = {
  muito_alinhado: "Muito alinhado",
  bem_alinhado: "Bem alinhado, com ajustes",
  parcial: "Parcialmente alinhado",
  pouco_alinhado: "Pouco alinhado",
};

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const result = await getReviews();
  const reviews = result.reviews;

  const approvedCount = reviews.reduce((acc, review) => {
    const decisions = review.payload?.sectionFeedback?.decisions || {};
    return acc + Object.values(decisions).filter((value) => value === "approved").length;
  }, 0);

  const majorAdjustmentsCount = reviews.reduce((acc, review) => {
    const decisions = review.payload?.sectionFeedback?.decisions || {};
    return acc + Object.values(decisions).filter((value) => value === "major_adjustments").length;
  }, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="px-8 pt-36 pb-24 md:px-16 md:pt-44 md:pb-32 lg:px-24">
        <div className="mx-auto w-full max-w-[1200px]">
          <span
            className="text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            Admin
          </span>
          <h1 className="mt-4 text-architectural font-light leading-[1.05] text-foreground">
            Respostas do formulário
          </h1>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
            <p className="border px-3 py-2" style={{ borderColor: "hsl(var(--accent) / 0.2)" }}>
              <span className="text-muted-foreground">Fonte:</span> <strong>{result.source}</strong>
            </p>
            <p className="border px-3 py-2" style={{ borderColor: "hsl(var(--accent) / 0.2)" }}>
              <span className="text-muted-foreground">Respostas:</span> <strong>{reviews.length}</strong>
            </p>
            <p className="border px-3 py-2" style={{ borderColor: "hsl(var(--accent) / 0.2)" }}>
              <span className="text-muted-foreground">Seções aprovadas:</span> <strong>{approvedCount}</strong>
            </p>
            <p className="border px-3 py-2" style={{ borderColor: "hsl(var(--accent) / 0.2)" }}>
              <span className="text-muted-foreground">Ajustes importantes:</span>{" "}
              <strong>{majorAdjustmentsCount}</strong>
            </p>
          </div>

          <div
            className="mt-10 h-px w-full"
            style={{ background: "hsl(var(--accent) / 0.3)" }}
          />

          {reviews.length === 0 ? (
            <p className="mt-8 text-muted-foreground">Nenhuma resposta encontrada.</p>
          ) : (
            <div className="mt-8 space-y-5">
              {reviews.map((review) => {
                const createdAt = review.created_at || review.createdAt || "";
                const respondentName =
                  review.respondent_name ||
                  review.payload?.respondent?.name ||
                  "Sem nome";
                const alignment =
                  review.alignment ||
                  review.payload?.generalImpression?.alignment ||
                  "-";
                const priorities =
                  [review.priority_1, review.priority_2, review.priority_3].filter(Boolean) as string[];
                const fallbackPriorities = review.payload?.priorities || [];
                const finalPriorities = priorities.length > 0 ? priorities : fallbackPriorities;
                const decisions = review.payload?.sectionFeedback?.decisions || {};
                const reviewDate = review.payload?.respondent?.reviewDate || "-";
                const alignmentLabel = ALIGNMENT_LABEL[alignment] || alignment;

                return (
                  <article
                    key={review.id}
                    className="border p-5 md:p-6"
                    style={{ borderColor: "hsl(var(--accent) / 0.24)" }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-base text-foreground">
                        <strong>{respondentName}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-4">
                      <p className="rounded-sm bg-black/5 px-2 py-1">
                        <span className="text-foreground">ID</span>: {review.id}
                      </p>
                      <p className="rounded-sm bg-black/5 px-2 py-1">
                        <span className="text-foreground">Data informada</span>: {reviewDate}
                      </p>
                      <p className="rounded-sm bg-black/5 px-2 py-1">
                        <span className="text-foreground">Alinhamento</span>: {alignmentLabel}
                      </p>
                      <p className="rounded-sm bg-black/5 px-2 py-1">
                        <span className="text-foreground">Prioridades</span>: {" "}
                        {finalPriorities.length > 0 ? finalPriorities.join(" • ") : "-"}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Decisões por seção
                      </p>
                      <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(decisions).length > 0 ? (
                          Object.entries(decisions).map(([section, decision]) => (
                            <div
                              key={`${review.id}-${section}`}
                              className="flex items-center justify-between border px-2 py-1 text-xs"
                              style={{ borderColor: "hsl(var(--accent) / 0.24)", background: "hsl(var(--accent) / 0.05)" }}
                            >
                              <span>{SECTION_LABEL[section] || section}</span>
                              <strong>{DECISION_LABEL[decision] || decision}</strong>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>

                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Ver payload completo
                      </summary>
                      <pre
                        className="mt-3 overflow-x-auto border p-3 text-xs"
                        style={{ borderColor: "hsl(var(--accent) / 0.2)" }}
                      >
                        {JSON.stringify(review.payload || review, null, 2)}
                      </pre>
                    </details>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR");
}

async function getReviews(): Promise<{ source: "supabase" | "local"; reviews: ReviewRecord[] }> {
  const fromSupabase = await readFromSupabase();
  if (fromSupabase) {
    return { source: "supabase", reviews: fromSupabase };
  }

  const fromLocal = await readFromLocal();
  return { source: "local", reviews: fromLocal };
}

async function readFromSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  try {
    const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/client_reviews?select=*&order=created_at.desc&limit=100`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ReviewRecord[];
    return data;
  } catch {
    return null;
  }
}

async function readFromLocal() {
  const folder = path.join(process.cwd(), "data", "client-reviews");

  try {
    const entries = await readdir(folder);
    const jsonFiles = entries.filter((entry) => entry.endsWith(".json"));

    const loaded = await Promise.all(
      jsonFiles.map(async (fileName) => {
        try {
          const content = await readFile(path.join(folder, fileName), "utf-8");
          return JSON.parse(content) as ReviewRecord;
        } catch {
          return null;
        }
      }),
    );

    return loaded
      .filter((item): item is ReviewRecord => Boolean(item))
      .sort((a, b) => {
        const aTime = new Date(a.created_at || a.createdAt || 0).getTime();
        const bTime = new Date(b.created_at || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
  } catch {
    return [];
  }
}
