"use client";

import { useEffect, useRef } from "react";
import { useArchitecturalReveal } from "@/hooks/use-architectural-reveal";
import type { Project } from "@/types/project";
import { Void } from "@/components/ui/void";
import { ProjectCover } from "./project-cover";
import { ProjectBrief } from "./project-brief";
import { ProjectNarrative } from "./project-narrative";
import { ProjectDocumentation } from "./project-documentation";
import { ProjectContinuation } from "./project-continuation";
import { ProjectContactCta } from "./project-actions";
import { trackEvent } from "@/lib/analytics";

type ProjectDetailContentProps = {
  project: Project;
  nextProject: Project | null;
};

export function ProjectDetailContent({
  project,
  nextProject,
}: Readonly<ProjectDetailContentProps>) {
  const rootRef = useRef<HTMLElement>(null);

  useArchitecturalReveal(rootRef, project.slug);

  useEffect(() => {
    trackEvent("project_view", {
      project_slug: project.slug,
      project_name: project.title,
      project_type: project.typology,
    });
  }, [project.slug, project.title, project.typology]);

  // Filtra capítulos que apenas duplicam o summary (caso atual de todos os projetos
  // do JSON: chapters[0].content === summary). Se sobrar algo, renderiza Narrative.
  const meaningfulChapters = project.chapters.filter(
    (c) => c.content.trim() !== project.summary.trim() || c.title.trim() !== "",
  );

  return (
    <main ref={rootRef}>
      <ProjectCover project={project} />
      <ProjectBrief project={project} />
      {meaningfulChapters.length > 0 ? (
        <>
          <Void height="8vh" />
          <ProjectNarrative chapters={meaningfulChapters} />
        </>
      ) : null}
      <Void height="8vh" />
      <ProjectDocumentation gallery={project.gallery} slug={project.slug} />

      {/* Fecho do capítulo: acabaram as fotos, antes de empurrar pro próximo
          projeto. É onde o interesse está no pico. Mesmo fio da página de
          contato para assentar o CTA entre a galeria e a seção escura. */}
      <section className="bg-background px-8 pb-16 md:px-16 md:pb-24 lg:px-24">
        <div className="mx-auto max-w-[1800px]">
          <div
            className="reveal-draw h-px w-full"
            style={{ background: "hsl(var(--accent) / 0.3)" }}
          />
          <div className="reveal-illuminate mt-6 md:mt-8">
            <ProjectContactCta project={project} location="project_detail" />
          </div>
        </div>
      </section>

      <ProjectContinuation nextProject={nextProject} />
    </main>
  );
}
