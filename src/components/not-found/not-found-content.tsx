"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useArchitecturalReveal } from "@/hooks/use-architectural-reveal";
import { trackEvent } from "@/lib/analytics";
import type { Project } from "@/types/project";

type NotFoundContentProps = {
  featured: Project[];
};

export function NotFoundContent({ featured }: NotFoundContentProps) {
  const rootRef = useRef<HTMLElement>(null);
  useArchitecturalReveal(rootRef);

  return (
    <main ref={rootRef} className="bg-background text-foreground">
      <section className="px-8 pt-36 pb-20 md:px-16 md:pt-44 md:pb-24 lg:px-24">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col">
          <span
            className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            Erro 404
          </span>

          <div className="reveal-rise mt-4 flex flex-col gap-2">
            <span
              aria-hidden="true"
              className="select-none font-light leading-[0.85] text-foreground"
              style={{
                fontSize: "clamp(7rem, 22vw, 22rem)",
                letterSpacing: "-0.04em",
              }}
            >
              404
            </span>
            <div
              className="reveal-draw h-px w-full max-w-[640px]"
              style={{
                background: "hsl(var(--accent) / 0.5)",
                transformOrigin: "left",
              }}
            />
          </div>

          <h1 className="reveal-rise mt-8 max-w-[820px] text-[clamp(1.75rem,4.2vw,3.25rem)] font-light leading-[1.1] text-foreground">
            Esse endereço ainda não existe no nosso portfólio.
          </h1>
          <p className="reveal-illuminate mt-5 max-w-[620px] text-body-lg leading-[1.55] text-muted-foreground">
            Talvez o link esteja desatualizado, ou talvez o projeto que você procura tenha outro caminho. Enquanto isso, dá uma olhada em alguns trabalhos recentes do escritório.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-3 border px-6 py-4 text-caption uppercase tracking-[0.18em] text-foreground transition-all hover:bg-secondary"
              style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
            >
              voltar ao início
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
            </Link>
            <Link
              href="/projetos"
              className="text-caption uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              ver todos os projetos
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="px-8 pb-28 md:px-16 md:pb-36 lg:px-24">
          <div className="mx-auto flex w-full max-w-[1800px] flex-col">
            <div className="flex items-end justify-between gap-6 border-t pt-10" style={{ borderColor: "hsl(var(--accent) / 0.22)" }}>
              <span
                className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
                style={{ color: "hsl(var(--accent-strong))" }}
              >
                Projetos em destaque
              </span>
              <Link
                href="/projetos"
                className="hidden text-caption uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                ver todos →
              </Link>
            </div>

            <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
              {featured.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projetos/${project.slug}`}
                  className="reveal-stagger group flex flex-col gap-5"
                  aria-label={`Ver projeto ${project.title}`}
                  onClick={() =>
                    trackEvent("project_cta_click", {
                      project_slug: project.slug,
                      project_name: project.title,
                      project_type: project.typology,
                      cta_location: "not_found_featured",
                    })
                  }
                >
                  <div className="reveal-curtain relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={project.imageSrc}
                      alt={project.imageAlt ?? project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className="text-micro uppercase tracking-[0.22em]"
                      style={{ color: "hsl(var(--accent-strong))" }}
                    >
                      {project.typology} · {project.location}, {project.country}
                    </span>
                    <h3 className="text-body-lg font-medium text-foreground transition-opacity group-hover:opacity-70">
                      {project.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
