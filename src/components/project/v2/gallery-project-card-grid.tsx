"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";

type GalleryProjectCardGridProps = {
  project: Project;
  imageLeft?: boolean;
  priority?: boolean;
};

const ROTATE_INTERVAL_MS = 2800;
const CROSSFADE_MS = 1300;
const ENTRY_SHIFT_PX = 0;
const ENTRY_SCALE = 1.035;
const ACTIVE_ZOOM_DURATION_MS = ROTATE_INTERVAL_MS + 300;

/**
 * Variante do GalleryProjectCard para uso em grid 2-colunas (página /projetos).
 * Mantém a personalidade da home, mas com altura reduzida para 2 cards caberem
 * em 1 viewport. No hover (desktop) ou enquanto visível (mobile), faz auto-play
 * cíclico entre capa + 3 fotos da galeria com cross-fade.
 */
export function GalleryProjectCardGrid({
  project,
  imageLeft = false,
  priority = false,
}: GalleryProjectCardGridProps) {
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(false);
  const zoomRafRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shouldRotate, setShouldRotate] = useState(false);
  const [hasLoadedExtra, setHasLoadedExtra] = useState(false);
  const [hasStartedZoom, setHasStartedZoom] = useState(false);

  // Lista de imagens: capa + até 3 primeiras fotos da galeria.
  const images = [
    {
      src: project.imageSrc,
      alt: project.imageAlt ?? `Capa do projeto ${project.title}`,
    },
    ...project.gallery.slice(0, 3).map((image) => ({
      src: image.src,
      alt: image.alt,
    })),
  ];

  const startZoomOnActive = () => {
    if (zoomRafRef.current !== null) {
      window.cancelAnimationFrame(zoomRafRef.current);
    }
    setHasStartedZoom(false);
    zoomRafRef.current = window.requestAnimationFrame(() => {
      setHasStartedZoom(true);
      zoomRafRef.current = null;
    });
  };

  // Detecta mobile via media query para usar IntersectionObserver em vez de hover.

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(hover: none)").matches;
    isMobileRef.current = isMobile;
    if (!isMobile) return;

    const el = imageWrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
          startZoomOnActive();
          setShouldRotate(true);
          setHasLoadedExtra(true);
        } else {
          setShouldRotate(false);
          setActiveIndex(0);
          setHasStartedZoom(false);
        }
      },
      { threshold: [0, 0.7, 1] },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (zoomRafRef.current !== null) {
        window.cancelAnimationFrame(zoomRafRef.current);
      }
    };
  }, []);

  // Rotação automática enquanto shouldRotate é true.
  useEffect(() => {
    if (!shouldRotate || images.length <= 1) return;

    if (!isMobileRef.current) {
      const id = window.setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % images.length);
      }, ROTATE_INTERVAL_MS);
      return () => window.clearInterval(id);
    }

    let steps = 0;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % images.length;
        steps += 1;
        if (steps >= images.length) {
          window.clearInterval(id);
          setShouldRotate(false);
        }
        return next;
      });
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [shouldRotate, images.length]);

  const handleMouseEnter = () => {
    startZoomOnActive();
    setHasLoadedExtra(true);
    setShouldRotate(true);
  };
  const handleMouseLeave = () => {
    setShouldRotate(false);
    setActiveIndex(0);
    setHasStartedZoom(false);
  };

  return (
    <div
      className={`flex h-full w-full flex-col gap-6 md:flex-row md:items-center md:gap-6 lg:gap-8 ${
        imageLeft ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Foto vertical com título sobreposto */}
      <div className="md:w-[48%] md:shrink-0">
        <Link
          href={`/projetos/${project.slug}`}
          className="group relative block w-full"
          aria-label={`Ver projeto ${project.title}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={imageWrapperRef}
            className="reveal-curtain relative aspect-[3/4] w-full overflow-hidden md:aspect-auto md:h-[68vh]"
          >
            {images.map((image, idx) => {
              // Só monta o <Image> da capa de cara; as extras só quando hover ativa.
              const shouldRender = idx === 0 || hasLoadedExtra;
              if (!shouldRender) return null;
              return (
                <Image
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={idx === 0 && priority}
                  sizes="(max-width: 768px) 100vw, 22vw"
                  className="object-cover object-top"
                  style={{
                    opacity: activeIndex === idx ? 1 : 0,
                    transform:
                      activeIndex === idx
                        ? `translate3d(0, 0, 0) scale(${hasStartedZoom ? 1 : ENTRY_SCALE})`
                        : `translate3d(0, ${ENTRY_SHIFT_PX}px, 0) scale(${ENTRY_SCALE})`,
                    transitionTimingFunction:
                      activeIndex === idx
                        ? "linear"
                        : "cubic-bezier(0.4, 0, 0.2, 1)",
                    transitionDuration:
                      activeIndex === idx
                        ? `${ACTIVE_ZOOM_DURATION_MS}ms`
                        : `${CROSSFADE_MS}ms`,
                    transitionProperty: "opacity, transform",
                    willChange: "opacity, transform",
                  }}
                />
              );
            })}

            {/* Título sobreposto no canto inferior — mix-blend-mode adapta a contraste */}
            <h3
              className="reveal-rise pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-4 text-[clamp(2.5rem,10.5vw,3.6rem)] font-extrabold leading-[0.95] md:px-5 md:pb-5 md:text-[clamp(2rem,3.1vw,3.3rem)]"
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

            {/* Indicador discreto de progresso — só aparece durante rotação */}
            {images.length > 1 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3 right-3 z-10 flex gap-1 transition-opacity duration-300"
                style={{ opacity: shouldRotate ? 1 : 0 }}
              >
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className="block h-1 w-1 rounded-full"
                    style={{
                      background:
                        idx === activeIndex
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(255,255,255,0.4)",
                      transition: "background 300ms",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Texto ao lado da foto */}
      <div className="flex min-w-0 flex-col gap-5 md:w-[52%] md:gap-6">
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
            {project.scope.join(" + ")}
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
         className="reveal-draw h-px w-16"
         style={{ background: "hsl(var(--accent) / 0.4)" }}
        />

        <p className="reveal-illuminate text-body-lg leading-[1.5] text-muted-foreground">
          {project.summary}
        </p>

        <Link
          href={`/projetos/${project.slug}`}
          className="group/link mt-1 inline-flex items-center gap-2 text-caption uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
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
