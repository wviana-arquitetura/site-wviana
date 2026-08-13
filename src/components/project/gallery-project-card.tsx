"use client";

import { useRef } from "react";
import Link from "next/link";
import { ImageWithReveal } from "@/components/ui/image-with-reveal";
import { ProjectActions } from "@/components/project/project-actions";
import type { Project } from "@/types/project";
import { trackEvent } from "@/lib/analytics";

type GalleryProjectCardProps = {
  project: Project;
  imageLeft?: boolean;
  /** Marca a imagem como prioritária (LCP). Use só quando o card está acima da dobra. */
  priority?: boolean;
  /** Posição do card na seção, 1-based — vai pro analytics dos CTAs. */
  position?: number;
};

export function GalleryProjectCard({
  project,
  imageLeft = false,
  priority = false,
  position,
}: GalleryProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const handleProjectClick = (ctaLocation: string) =>
    trackEvent("project_cta_click", {
      project_slug: project.slug,
      project_name: project.title,
      project_type: project.typology,
      project_position: position,
      cta_location: ctaLocation,
    });

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
          onClick={() => handleProjectClick("home_gallery_image")}
        >
          <div className="reveal-curtain relative aspect-[3/4] w-full overflow-hidden md:aspect-auto md:h-[88vh]">
            <ImageWithReveal
              src={project.imageSrc}
              alt={project.imageAlt ?? project.title}
              fill
              priority={priority}
              className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 42vw"
              quality={82}
              blurDataURL={project.imageBlurDataURL}
            />

            {/* Título ancorado no canto inferior, sobreposto à foto */}
            <h3
              className="reveal-rise absolute inset-x-0 bottom-0 px-5 pb-5 text-architectural font-extrabold leading-[0.95] md:px-7 md:pb-7"
              style={{
                color: "#ffffff",
                textShadow: "0 2px 16px rgba(0,0,0,0.35)",
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

        <div className="reveal-draw h-px w-24" style={{ background: "hsl(var(--accent) / 0.4)" }} />

        <p className="reveal-illuminate max-w-[520px] text-body-lg text-muted-foreground">
          {project.summary}
        </p>

        <ProjectActions
          project={project}
          location="home_gallery"
          position={position}
        />
      </div>
    </div>
  );
}
