"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { GalleryProjectCardGrid } from "@/components/project/v2/gallery-project-card-grid";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";
import { useDesktopMailtoBlankTarget } from "@/hooks/use-desktop-mailto-target";
import { getAllProjects, getProjectTypologies } from "@/services/projects.service";
import { BRAND } from "@/lib/brand";
import { getBreadcrumbJsonLd, getProjectsItemListJsonLd } from "@/lib/seo";

function chunkPairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

export default function ProjetosPage() {
  const rootRef = useRef<HTMLElement>(null);
  const allProjects = getAllProjects();
  const typologies = getProjectTypologies();
  const [filter, setFilter] = useState<string | null>(null);
  const itemListJsonLd = getProjectsItemListJsonLd(allProjects);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Início", path: "/" },
    { name: "Projetos", path: "/projetos" },
  ]);

  const filtered = filter ? allProjects.filter((p) => p.typology === filter) : allProjects;

  const mailtoTarget = useDesktopMailtoBlankTarget();

  useArchitecturalReveal(rootRef);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground">
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
                style={{ color: filter ? "hsl(var(--accent-strong))" : undefined }}
              >
                Todos
                <span className="ml-1 text-micro" style={{ color: "hsl(var(--accent-strong))" }}>
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
                    style={{
                      color: filter !== typ ? "hsl(var(--accent-strong))" : undefined,
                    }}
                  >
                    {typ}
                    <span
                      className="ml-1 text-micro"
                      style={{ color: "hsl(var(--accent-strong))" }}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Project listing — 2 projetos por linha, cada linha cabe em 1 viewport */}
          <section className="bg-background px-8 pb-24 md:px-16 md:pb-32 lg:px-24">
            <div className="mx-auto max-w-[1800px]">
              {chunkPairs(filtered).map((row, rowIdx) => (
                <div
                  key={`row-${rowIdx}`}
                  data-snap
                  className="grid grid-cols-1 items-center gap-y-16 py-12 md:grid-cols-2 md:gap-x-12 md:min-h-[calc(var(--dvh)-var(--header-height))] md:py-0 lg:gap-x-16"
                >
                  {row.map((project, colIdx) => (
                    <GalleryProjectCardGrid
                      key={project.slug}
                      project={project}
                      imageLeft={colIdx === 0}
                      priority={rowIdx === 0}
                    />
                  ))}
                </div>
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
                href={BRAND.mailtoUrl}
                target={mailtoTarget}
                rel={mailtoTarget ? "noopener noreferrer" : undefined}
                className="reveal-illuminate group mt-2 inline-block text-architectural font-light text-foreground opacity-80 transition-opacity hover:opacity-100"
              >
                <span
                  className="border-b pb-2 transition-colors"
                  style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
                >
                  {BRAND.email}
                </span>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
