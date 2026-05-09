"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Void } from "@/components/ui/void";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";
import {
  getAllProjects,
  getProjectTypologies,
} from "@/services/projects.service";
import type { Project } from "@/types/project";
import { BRAND } from "@/lib/brand";

export default function WorksPage() {
  const rootRef = useRef<HTMLElement>(null);
  const allProjects = getAllProjects();
  const typologies = getProjectTypologies();
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? allProjects.filter((p) => p.typology === filter)
    : allProjects;

  useArchitecturalReveal(rootRef, filter ?? "all");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main ref={rootRef}>
        {/* Hero */}
        <section className="px-8 pt-36 pb-12 md:px-16 md:pt-44 md:pb-16 lg:px-24">
          <div className="mx-auto max-w-[1800px]">
            <h1 className="reveal-rise text-monumental font-extralight text-foreground">
              Projetos
            </h1>
            <div
              className="reveal-draw mt-8 h-px w-full"
              style={{ background: "hsl(var(--accent) / 0.3)" }}
            />
          </div>
        </section>

        {/* Filters */}
        <section className="px-8 pb-16 md:px-16 lg:px-24">
          <div className="mx-auto flex max-w-[1800px] flex-wrap gap-6">
            <button
              onClick={() => setFilter(null)}
              className={`text-caption uppercase tracking-[0.18em] transition-colors ${
                !filter ? "text-foreground underline underline-offset-4" : ""
              }`}
              style={{ color: filter ? "hsl(var(--accent))" : undefined }}
            >
              Todos
              <span className="ml-1 text-micro" style={{ color: "hsl(var(--accent) / 0.5)" }}>
                ({allProjects.length})
              </span>
            </button>
            {typologies.map((typ) => {
              const count = allProjects.filter((p) => p.typology === typ).length;
              return (
                <button
                  key={typ}
                  onClick={() => setFilter(typ)}
                  className={`text-caption uppercase tracking-[0.18em] transition-colors ${
                    filter === typ ? "text-foreground underline underline-offset-4" : ""
                  }`}
                  style={{ color: filter !== typ ? "hsl(var(--accent))" : undefined }}
                >
                  {typ}
                  <span className="ml-1 text-micro" style={{ color: "hsl(var(--accent) / 0.5)" }}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Project listing */}
        <section className="px-8 pb-32 md:px-16 lg:px-24">
          <div className="mx-auto max-w-[1800px]">
            {filtered.map((project, i) => (
              <SplitCard key={project.slug} project={project} index={i} imageLeft={i % 2 === 0} />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-8 pb-24 md:px-16 lg:px-24">
          <div className="mx-auto max-w-[1800px] text-center">
            <p className="reveal-rise text-architectural font-light text-foreground/40">
              Tem um projeto?
            </p>
            <Link
              href={`mailto:${BRAND.email}`}
              className="reveal-illuminate group mt-2 inline-block text-architectural font-light text-foreground opacity-80 transition-opacity hover:opacity-100"
            >
              <span className="border-b pb-2 transition-colors" style={{ borderColor: "hsl(var(--accent) / 0.4)" }}>
                {BRAND.email}
              </span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function SplitCard({ project, index, imageLeft = false }: { project: Project; index: number; imageLeft?: boolean }) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <div className="mb-16 md:mb-24">
      <Link href={`/projects/${project.slug}`} className={`group flex flex-col gap-8 md:flex-row md:items-start ${imageLeft ? "md:flex-row-reverse" : ""}`}>
        {/* Info */}
        <div className="flex flex-col gap-3 md:w-[40%] md:pt-4">
          <span className="reveal-illuminate text-micro uppercase tracking-[0.22em]" style={{ color: "hsl(var(--accent) / 0.5)" }}>
            {num}
          </span>
          <h2 className="reveal-rise text-architectural font-extrabold text-foreground transition-opacity group-hover:opacity-60">
            {project.title}
          </h2>
          <p className="reveal-illuminate max-w-[400px] text-body-lg text-muted-foreground">
            {project.summary}
          </p>
          <span className="reveal-illuminate mt-2 inline-flex items-center gap-2 text-caption uppercase tracking-[0.18em] text-foreground transition-opacity group-hover:opacity-60">
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
        {/* Image */}
        <div className="reveal-curtain relative aspect-[4/5] overflow-hidden md:w-[55%]">
          <Image
            src={project.imageSrc}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover"
          />
        </div>
      </Link>
      <Void height="4vh" />
    </div>
  );
}
