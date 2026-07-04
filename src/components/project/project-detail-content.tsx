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
      <ProjectContinuation nextProject={nextProject} />
    </main>
  );
}
