"use client";

import Image from "next/image";
import type { Project } from "@/types/project";

type ProjectCoverProps = {
  project: Project;
};

export function ProjectCover({ project }: ProjectCoverProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src={project.imageSrc}
        alt={`Capa do projeto ${project.title}`}
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />

      {/* Gradient overlay — garante legibilidade do título em qualquer foto */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
        }}
      />

      {/* Title overlay — bottom left */}
      <div className="absolute inset-x-0 bottom-0 px-8 pb-12 md:px-16 md:pb-16 lg:px-24">
        <h1
          className="text-monumental font-extrabold text-white"
          style={{ textShadow: "0 2px 40px rgba(0,0,0,0.3)" }}
        >
          {project.title}
        </h1>
      </div>
    </section>
  );
}
