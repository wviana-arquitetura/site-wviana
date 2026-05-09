"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "@/lib/gsap";

export function HorizonSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    if (!section || !line) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      line.style.transform = "scaleX(1)";
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 50%",
            scrub: 1,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-8 py-24 md:px-16 md:py-32 lg:px-24"
    >
      <p
        className="reveal-rise max-w-[1400px] text-balance text-center font-light leading-[1.05] tracking-tight text-foreground"
        style={{
          fontFamily: "var(--font-display), system-ui, sans-serif",
          fontSize: "clamp(2.5rem, 6vw, 6.5rem)",
          letterSpacing: "-0.02em",
        }}
      >
        250+ projetos entregues. 8 anos de mercado.
      </p>

      <div
        ref={lineRef}
        className="mt-12 h-px w-full max-w-[1000px]"
        style={{
          background: "hsl(var(--accent) / 0.4)",
          transformOrigin: "left",
          transform: "scaleX(0)",
        }}
      />
    </section>
  );
}
