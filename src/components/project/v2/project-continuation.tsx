import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";

type ProjectContinuationProps = {
  nextProject: Project | null;
};

export function ProjectContinuation({ nextProject }: ProjectContinuationProps) {
  if (!nextProject) return null;

  return (
    <section className="flex min-h-screen flex-col bg-foreground px-8 py-16 md:px-16 md:py-20 lg:px-24">
      <Link
        href={`/projetos/${nextProject.slug}`}
        className="group mx-auto flex w-full max-w-[1800px] flex-1 flex-col"
      >
        <span
          className="text-micro uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--accent))" }}
        >
          Próximo
        </span>

        <h2
          className="mt-4 font-extralight leading-[0.95] text-white transition-opacity group-hover:opacity-70"
          style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}
        >
          {nextProject.title}
        </h2>

        {/* Imagem ocupa o restante da viewport, sem vazar */}
        <div className="relative mt-6 min-h-0 flex-1 overflow-hidden md:mt-8">
          <Image
            src={nextProject.imageSrc}
            alt={nextProject.imageAlt ?? nextProject.title}
            fill
            sizes="100vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>
      </Link>
    </section>
  );
}
