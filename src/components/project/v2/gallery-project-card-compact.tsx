"use client";

import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";

type GalleryProjectCardCompactProps = {
  project: Project;
};

export function GalleryProjectCardCompact({ project }: GalleryProjectCardCompactProps) {
  return (
    <Link
      href={`/projetos/${project.slug}`}
      className="group flex h-full flex-col gap-6"
      aria-label={`Ver projeto ${project.title}`}
    >
      {/* Foto vertical alta — preenche a maior parte da altura disponível,
          com título sobreposto no canto inferior (mix-blend-mode garante contraste) */}
      <div className="reveal-curtain relative aspect-[3/4] w-full min-h-0 overflow-hidden md:aspect-auto md:flex-1">
        <Image
          src={project.imageSrc}
          alt={project.imageAlt ?? project.title}
          fill
          className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Título dentro da foto, no canto inferior */}
        <h3
          className="reveal-rise absolute inset-x-0 bottom-0 px-5 pb-5 font-extrabold leading-[0.95] md:px-7 md:pb-7"
          style={{
            color: "#ffffff",
            textShadow: "0 2px 16px rgba(0,0,0,0.35)",
            fontSize: "clamp(1.75rem, 3.2vw, 3.5rem)",
            hyphens: "auto",
            overflowWrap: "break-word",
            wordBreak: "normal",
          }}
          lang="pt-BR"
        >
          {project.title}
        </h3>
      </div>

      {/* Bloco editorial abaixo da foto — metadata + linha + summary + link */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span
            className="text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            {project.typology} · {project.location}, {project.country}
            {project.area ? ` · ${project.area}` : ""}
          </span>
        </div>

        <div className="h-px w-16" style={{ background: "hsl(var(--accent) / 0.4)" }} />

        <p className="reveal-illuminate text-body-lg leading-[1.5] text-muted-foreground">
          {project.summary}
        </p>

        <span
          className="mt-1 inline-flex items-center gap-2 text-caption uppercase tracking-[0.18em] transition-opacity group-hover:opacity-60"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Ver projeto
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="transition-transform group-hover:translate-x-1"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
