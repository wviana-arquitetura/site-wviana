"use client";

import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";

type GalleryProjectCardGridProps = {
  project: Project;
  imageLeft?: boolean;
};

/**
 * Variante do GalleryProjectCard para uso em grid 2-colunas (página /projetos).
 * Mantém a personalidade da home (foto vertical + título sobreposto + texto ao lado),
 * mas com altura reduzida para 2 cards caberem em 1 viewport.
 */
export function GalleryProjectCardGrid({
  project,
  imageLeft = false,
}: GalleryProjectCardGridProps) {
  return (
    <div
      className={`flex h-full w-full flex-col gap-6 md:flex-row md:items-center md:gap-6 lg:gap-8 ${
        imageLeft ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Foto vertical com título sobreposto */}
      <div className="md:w-[48%] md:shrink-0">
        <Link
          href={`/projetos/${project.slug}`}
          className="group relative block w-full"
          aria-label={`Ver projeto ${project.title}`}
        >
          <div className="reveal-curtain relative aspect-[3/4] w-full overflow-hidden md:aspect-auto md:h-[68vh]">
            <Image
              src={project.imageSrc}
              alt={project.title}
              fill
              className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 22vw"
            />

            {/* Título sobreposto no canto inferior — mix-blend-mode adapta a contraste */}
            <h3
              className="reveal-rise absolute inset-x-0 bottom-0 px-4 pb-4 font-extrabold leading-[0.95] md:px-5 md:pb-5"
              style={{
                color: "#ffffff",
                mixBlendMode: "difference",
                fontSize: "clamp(1.5rem, 2.4vw, 2.5rem)",
                hyphens: "auto",
                overflowWrap: "break-word",
                wordBreak: "normal",
              }}
              lang="pt-BR"
            >
              {project.title}
            </h3>
          </div>
        </Link>
      </div>

      {/* Texto ao lado da foto */}
      <div className="flex min-w-0 flex-col gap-5 md:w-[52%] md:gap-6">
        <div className="reveal-stagger flex flex-col gap-2">
          <span
            className="text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            {project.typology}
          </span>
          <span
            className="text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            {project.scope.join(" + ")}
          </span>
          <span
            className="text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            {project.location}, {project.country}
          </span>
          {project.area && (
            <span
              className="text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              {project.area}
            </span>
          )}
        </div>

        <div
          className="reveal-draw h-px w-16"
          style={{ background: "hsl(var(--accent) / 0.4)" }}
        />

        <p className="reveal-illuminate text-body-lg leading-[1.5] text-muted-foreground">
          {project.summary}
        </p>

        <Link
          href={`/projetos/${project.slug}`}
          className="group/link mt-1 inline-flex items-center gap-2 text-caption uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Ver projeto
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="transition-transform group-hover/link:translate-x-1"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
