"use client";

import { useRef, useLayoutEffect, useState, useEffect } from "react";
import gsap from "@/lib/gsap";

const LOGO_SRC = "/images/logos/brand/marca-variacao-02.svg";

export function ThresholdHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
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

      gsap.to(section, {
        autoAlpha: 0,
        scale: 0.96,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [svgMarkup]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[var(--svh)] flex-col items-center justify-center bg-background"
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
      <div className="absolute bottom-[max(2.5rem,env(safe-area-inset-bottom,0px))] left-8 flex flex-col items-center gap-2 md:left-16 lg:left-24">
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
        className="absolute bottom-[max(2.5rem,env(safe-area-inset-bottom,0px))] right-8 text-micro uppercase tracking-[0.22em] md:right-16 lg:right-24"
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
