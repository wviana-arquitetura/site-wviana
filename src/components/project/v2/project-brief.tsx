import type { Project } from "@/types/project";

type ProjectBriefProps = {
  project: Project;
};

export function ProjectBrief({ project }: ProjectBriefProps) {
  return (
    <section className="bg-background px-8 py-24 md:px-16 md:py-32 lg:px-24">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-12 md:flex-row md:gap-16">
        {/* Left: Metadata */}
        <div className="reveal-stagger flex flex-col gap-6 md:w-[25%]">
          <MetaItem label="Tipo" value={project.typology} />
          {project.area ? <MetaItem label="Área Projetada" value={project.area} /> : null}
          <MetaItem label="Local" value={`${project.location}, ${project.country}`} />
          <div>
            <span
              className="text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent))" }}
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

        {/* Right: Summary */}
        <div className="md:w-[65%]">
          <p className="reveal-illuminate text-architectural font-light leading-[1.1] text-foreground">
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
        style={{ color: "hsl(var(--accent))" }}
      >
        {label}
      </span>
      <p className="mt-1 text-micro uppercase tracking-[0.22em] text-muted-foreground">
        {value}
      </p>
    </div>
  );
}
