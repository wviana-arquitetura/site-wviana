"use client";

import { useRef, useLayoutEffect, useState, useEffect } from "react";
import gsap from "@/lib/gsap";

const LOGO_SRC = "/images/logos/brand/brand-2.svg";

export function ThresholdHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLSpanElement>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(LOGO_SRC)
      .then((r) => r.text())
      .then((text) => {
        if (!cancelled) setSvgMarkup(text);
      })
      .catch(() => {
        if (!cancelled) setSvgMarkup(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const container = logoContainerRef.current;
    if (!section || !container || !svgMarkup) return;

    const svg = container.querySelector("svg");
    if (!svg) return;

    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.display = "block";

    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    if (paths.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const foregroundColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--foreground")
      .trim();
    const strokeColor = foregroundColor
      ? `hsl(${foregroundColor})`
      : "#000";

    paths.forEach((p) => {
      p.style.fill = "rgba(0,0,0,0)";
      p.style.stroke = strokeColor;
      p.style.strokeWidth = "1";
      p.style.vectorEffect = "non-scaling-stroke";
    });

    if (prefersReducedMotion) {
      paths.forEach((p) => {
        p.style.fill = strokeColor;
        p.style.stroke = "rgba(0,0,0,0)";
      });
      return;
    }

    const ctx = gsap.context(() => {
      paths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 1,
        });
      });

      const tl = gsap.timeline({ delay: 0.15 });

      tl.to(paths, {
        strokeDashoffset: 0,
        duration: 1.3,
        ease: "power2.inOut",
        stagger: paths.length > 1 ? 0.05 : 0,
      })
        .to(
          paths,
          {
            fill: strokeColor,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.5",
        )
        .to(
          paths,
          {
            stroke: "rgba(0,0,0,0)",
            duration: 0.4,
            ease: "power1.out",
          },
          "<",
        );

      // Parallax: logo sobe ~12% conforme rola, criando profundidade
      // contra o fundo estático.
      gsap.to(container, {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(section, {
        autoAlpha: 0,
        scale: 0.94,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Bottom UI: drift mais lento para profundidade adicional
      const bottomLeft = bottomLeftRef.current;
      const bottomRight = bottomRightRef.current;
      const bottomTargets = [bottomLeft, bottomRight].filter(
        (el): el is HTMLElement => el !== null,
      );
      if (bottomTargets.length) {
        gsap.to(bottomTargets, {
          y: 40,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "50% top",
            scrub: 1,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, [svgMarkup]);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen flex-col items-center justify-center bg-background"
      data-section="hero"
    >
      <div
        ref={logoContainerRef}
        className="flex w-full items-center justify-center px-8 md:px-16 lg:px-24"
        aria-label="W.VIANA — Arquitetura | Interiores"
        role="img"
        style={{ minHeight: "30vh" }}
        dangerouslySetInnerHTML={
          svgMarkup
            ? {
                __html: scopeSvg(svgMarkup),
              }
            : undefined
        }
      />

      {/* Bottom-left: scroll indicator */}
      <div
        ref={bottomLeftRef}
        className="absolute bottom-10 left-8 flex flex-col items-center gap-2 md:left-16 lg:left-24"
      >
        <div
          className="h-10 w-px animate-pulse"
          style={{ background: "hsl(var(--accent) / 0.5)" }}
        />
        <span
          className="text-micro uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Scroll
        </span>
      </div>

      {/* Bottom-right: location */}
      <span
        ref={bottomRightRef}
        className="absolute bottom-10 right-8 text-micro uppercase tracking-[0.22em] md:right-16 lg:right-24"
        style={{ color: "hsl(var(--accent-strong))" }}
      >
        Brasil
      </span>
    </section>
  );
}

function scopeSvg(raw: string): string {
  return raw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(
      /<svg([^>]*)>/i,
      `<svg$1 style="width:min(82vw,1100px); height:auto; max-height:60vh; display:block;">`,
    );
}
