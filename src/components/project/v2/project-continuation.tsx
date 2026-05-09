import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";

type ProjectContinuationProps = {
  nextProject: Project | null;
};

export function ProjectContinuation({ nextProject }: ProjectContinuationProps) {
  if (!nextProject) return null;

  return (
    <section className="bg-foreground px-8 py-24 md:px-16 md:py-32 lg:px-24">
      <Link
        href={`/projects/${nextProject.slug}`}
        className="group mx-auto block max-w-[1800px]"
      >
        <span
          className="text-micro uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--accent))" }}
        >
          Próximo
        </span>

        <h2 className="mt-4 text-monumental font-extralight text-white transition-opacity group-hover:opacity-70">
          {nextProject.title}
        </h2>

        <div className="mt-8 relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src={nextProject.imageSrc}
            alt={nextProject.title}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>
      </Link>
    </section>
  );
}
