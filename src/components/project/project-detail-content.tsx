"use client";

import { useRef } from "react";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";
import { getNextProject } from "@/services/projects.service";
import type { Project } from "@/types/project";
import { Void } from "@/components/ui/void";
import { ProjectCover } from "./v2/project-cover";
import { ProjectBrief } from "./v2/project-brief";
import { ProjectNarrative } from "./v2/project-narrative";
import { ProjectDocumentation } from "./v2/project-documentation";
import { ProjectContinuation } from "./v2/project-continuation";

type ProjectDetailContentProps = {
  project: Project;
};

export function ProjectDetailContent({ project }: Readonly<ProjectDetailContentProps>) {
  const rootRef = useRef<HTMLElement>(null);
  const nextProject = getNextProject(project.slug);

  useArchitecturalReveal(rootRef, project.slug);

  return (
    <main ref={rootRef}>
      <ProjectCover project={project} />
      <ProjectBrief project={project} />
      <Void height="8vh" />
      <ProjectNarrative chapters={project.chapters} />
      <Void height="8vh" />
      <ProjectDocumentation gallery={project.gallery} slug={project.slug} />
      <ProjectContinuation nextProject={nextProject} />
    </main>
  );
}
