import type { ProjectMetric } from "@/types/project";

type ProjectEvidenceProps = {
  metrics: ProjectMetric[];
};

export function ProjectEvidence({ metrics }: ProjectEvidenceProps) {
  return (
    <section className="bg-background px-8 py-24 md:px-16 md:py-32 lg:px-24">
      <div className="mx-auto max-w-[1800px]">
        <span
          className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Números
        </span>
        <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-x-12 md:gap-y-10 lg:gap-x-16">
          {metrics.map((metric, i) => (
            <div
              key={metric.label}
              className={`reveal-rise flex min-w-0 flex-col gap-3 ${i > 0 ? "md:border-l md:pl-8 lg:pl-10" : ""}`}
              style={i > 0 ? { borderColor: "hsl(var(--accent) / 0.2)" } : undefined}
            >
              {/* monumental = vw da viewport inteira — em 3 colunas estoura; escala própria ao bloco */}
              <span
                className="block break-words font-extrabold leading-[0.95] tracking-tight text-foreground"
                style={{
                  fontSize: "clamp(2rem, 3.25vw, 4.5rem)",
                  overflowWrap: "anywhere",
                }}
              >
                {metric.value}
              </span>
              <span
                className="text-micro uppercase tracking-[0.22em]"
                style={{ color: "hsl(var(--accent-strong))" }}
              >
                {metric.label}
              </span>
              <p className="text-caption text-muted-foreground">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
