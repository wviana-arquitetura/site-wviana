"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "@/lib/gsap";

export function HorizonSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const topLineRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const topLine = topLineRef.current;
    const bottomLine = bottomLineRef.current;
    const divider = dividerRef.current;
    if (!section || !topLine || !bottomLine || !divider) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      topLine.style.transform = "scaleX(1)";
      bottomLine.style.transform = "scaleX(1)";
      divider.style.transform = "scaleY(1)";
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [topLine, bottomLine],
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

      gsap.fromTo(
        divider,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "center 60%",
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
      className="flex h-screen min-h-[700px] flex-col items-center justify-center bg-background px-8 md:px-16 lg:px-24"
    >
      {/* Kicker */}
      <div className="reveal-rise mb-16 flex items-center gap-4 md:mb-20">
        <span
          className="h-px w-8"
          style={{ background: "hsl(var(--accent) / 0.6)" }}
        />
        <span
          className="text-micro uppercase tracking-[0.32em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Em números
        </span>
        <span
          className="h-px w-8"
          style={{ background: "hsl(var(--accent) / 0.6)" }}
        />
      </div>

      {/* Top rule */}
      <div
        ref={topLineRef}
        className="h-px w-full max-w-[1100px]"
        style={{
          background: "hsl(var(--accent) / 0.35)",
          transformOrigin: "left",
          transform: "scaleX(0)",
        }}
      />

      {/* Stat grid */}
      <div className="reveal-rise grid w-full max-w-[1100px] grid-cols-1 items-center md:grid-cols-[1fr_auto_1fr]">
        <Stat
          value="250"
          prefix="+"
          label={["Projetos", "entregues"]}
          align="md:items-end md:pr-12 lg:pr-20"
        />

        <div
          ref={dividerRef}
          className="hidden h-40 w-px md:block lg:h-48"
          style={{
            background: "hsl(var(--accent) / 0.35)",
            transformOrigin: "top",
            transform: "scaleY(0)",
          }}
        />

        {/* Mobile horizontal divider */}
        <div
          className="my-8 h-px w-24 md:hidden"
          style={{ background: "hsl(var(--accent) / 0.35)" }}
        />

        <Stat
          value="8"
          label={["Anos", "de mercado"]}
          align="md:items-start md:pl-12 lg:pl-20"
        />
      </div>

      {/* Bottom rule */}
      <div
        ref={bottomLineRef}
        className="h-px w-full max-w-[1100px]"
        style={{
          background: "hsl(var(--accent) / 0.35)",
          transformOrigin: "right",
          transform: "scaleX(0)",
        }}
      />
    </section>
  );
}

function Stat({
  value,
  prefix,
  label,
  align,
}: {
  value: string;
  prefix?: string;
  label: [string, string];
  align: string;
}) {
  return (
    <div
      className={`flex flex-col items-center py-12 md:py-16 ${align}`}
    >
      <div
        className="flex items-start leading-none text-foreground"
        style={{
          fontFamily: "var(--font-display), system-ui, sans-serif",
          fontSize: "clamp(5rem, 14vw, 12rem)",
          letterSpacing: "-0.04em",
          fontWeight: 300,
        }}
      >
        {prefix ? (
          <span
            style={{
              color: "hsl(var(--accent-strong))",
              fontSize: "0.55em",
              marginTop: "0.12em",
              marginRight: "0.04em",
            }}
          >
            {prefix}
          </span>
        ) : null}
        <span>{value}</span>
      </div>
      <div
        className="mt-6 flex flex-col text-center uppercase leading-[1.3] tracking-[0.24em] md:mt-8 md:text-left"
        style={{
          color: "hsl(var(--accent-strong))",
          fontSize: "clamp(0.875rem, 1.1vw, 1.0625rem)",
        }}
      >
        <span>{label[0]}</span>
        <span>{label[1]}</span>
      </div>
    </div>
  );
}
