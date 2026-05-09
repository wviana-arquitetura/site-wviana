"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";

type GalleryProjectCardProps = {
  project: Project;
  index: number;
};

export function GalleryProjectCard({ project, index }: GalleryProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const num = String(index + 1).padStart(2, "0");

  return (
    <div ref={cardRef}>
      {/* Top rule */}
      <div
        className="reveal-draw mb-8 h-px w-full md:mb-12"
        style={{ background: "hsl(var(--accent) / 0.3)" }}
      />

      <div className="flex flex-col gap-8 md:flex-row md:gap-0">
        {/* Left: Metadata */}
        <div className="flex flex-col gap-2 md:w-[30%] md:pr-8">
          <div className="reveal-stagger flex flex-col gap-3">
            <span
              className="text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent))" }}
            >
              {num}
            </span>
            <span
              className="text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent))" }}
            >
              {project.title}
            </span>
            <span
              className="text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent) / 0.85)" }}
            >
              {project.typology}
            </span>
            <span
              className="text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent) / 0.85)" }}
            >
              {project.location}, {project.country}
            </span>
          </div>
        </div>

        {/* Right: Image + Title + Summary */}
        <div className="md:w-[70%]">
          <Link href={`/projects/${project.slug}`} className="group block">
            {/* Image */}
            <div className="reveal-curtain relative h-[55vh] w-full overflow-hidden">
              <Image
                src={project.imageSrc}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 70vw"
              />
            </div>

            {/* Title */}
            <h3 className="reveal-rise mt-6 text-architectural font-extrabold text-foreground md:mt-8">
              {project.title}
            </h3>

            {/* Summary */}
            <p className="reveal-illuminate mt-3 max-w-[600px] text-body-lg text-muted-foreground">
              {project.summary}
            </p>

            {/* Link */}
            <span
              className="reveal-illuminate mt-4 inline-flex items-center gap-2 text-caption uppercase tracking-[0.18em] text-foreground transition-opacity group-hover:opacity-60"
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
          </Link>
        </div>
      </div>
    </div>
  );
}
