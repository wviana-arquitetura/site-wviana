import { Inter } from "next/font/google";
import type { Project } from "@/types/project";

type ProjectBriefProps = {
  project: Project;
};

const projectSummaryFont = Inter({
  subsets: ["latin-ext"],
  weight: ["200", "300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

export function ProjectBrief({ project }: ProjectBriefProps) {
  return (
    <section className="flex min-h-screen items-center bg-background px-8 py-16 md:px-16 md:py-20 lg:px-24">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-12 md:flex-row md:gap-16">
        {/* Left: Metadata */}
        <div className="reveal-stagger flex flex-col gap-6 md:w-[25%]">
          <p className="sr-only">Tipo: {project.typology}</p>
          {project.area ? <MetaItem label="Área Projetada" value={project.area} /> : null}
          <MetaItem label="Local" value={`${project.location}, ${project.country}`} />
          <div>
            <span
              className="text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Escopo
            </span>
            <div className="mt-2 flex flex-col gap-1">
              {project.scope.map((item) => (
                <span key={item} className="text-micro uppercase tracking-[0.22em] text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary — fontSize cap'd para caber em uma viewport mesmo em summaries longos */}
        <div className="md:w-[65%] md:max-w-[900px]">
          <p
            className={`${projectSummaryFont.className} reveal-illuminate max-w-[28ch] font-extralight leading-[1.1] text-foreground md:max-w-[24ch]`}
            style={{ fontSize: "clamp(1.6rem, 3.6vw, 4.6rem)", fontSynthesis: "none", fontWeight: 200 }}
          >
            {project.summary}
          </p>
        </div>
      </div>
    </section>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span
        className="text-micro uppercase tracking-[0.22em]"
        style={{ color: "hsl(var(--accent-strong))" }}
      >
        {label}
      </span>
      <p className="mt-1 text-micro uppercase tracking-[0.22em] text-muted-foreground">
        {value}
      </p>
    </div>
  );
}
