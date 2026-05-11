"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";

type GalleryProjectCardProps = {
  project: Project;
  imageLeft?: boolean;
};

export function GalleryProjectCard({
  project,
  imageLeft = false,
}: GalleryProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className={`flex w-full flex-col gap-10 md:flex-row md:items-center md:gap-16 lg:gap-24 ${
        imageLeft ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Image column — foto vertical alta com título ancorado no canto inferior */}
      <div className="md:w-[42%] md:shrink-0">
        <Link
          href={`/projetos/${project.slug}`}
          className="group relative block w-full"
          aria-label={`Ver projeto ${project.title}`}
        >
          <div className="reveal-curtain relative aspect-[3/4] w-full overflow-hidden md:aspect-auto md:h-[88vh]">
            <Image
              src={project.imageSrc}
              alt={project.title}
              fill
              className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 42vw"
            />

            {/* Título ancorado no canto inferior, sobreposto à foto */}
            <h3
              className="reveal-rise absolute inset-x-0 bottom-0 px-5 pb-5 text-architectural font-extrabold leading-[0.95] md:px-7 md:pb-7"
              style={{
                color: "#ffffff",
                mixBlendMode: "difference",
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

      {/* Text column — metadata + summary + link, sem o título (que está na foto) */}
      <div className="flex min-w-0 flex-col gap-8 md:w-[48%] md:gap-10">
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
          className="reveal-draw h-px w-24"
          style={{ background: "hsl(var(--accent) / 0.4)" }}
        />

        <p className="reveal-illuminate max-w-[520px] text-body-lg text-muted-foreground">
          {project.summary}
        </p>

        <Link
          href={`/projetos/${project.slug}`}
          className="group/link mt-2 inline-flex items-center gap-2 text-caption uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
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
