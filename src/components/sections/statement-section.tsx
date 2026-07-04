"use client";

import { useRef, useLayoutEffect, useMemo } from "react";
import { Inter } from "next/font/google";
import gsap, { ScrollTrigger } from "@/lib/gsap";

const SENTENCES = [
  "Não projetamos apenas espaços.",
  "Projetamos experiências.",
  "Cada escolha é pensada. Cada detalhe tem propósito.",
  "Arquitetura precisa e atemporal.",
];
const MANIFESTO = SENTENCES.join(" ");
const UNDERLINED_WORDS = new Set(["experiências", "propósito", "atemporal"]);
const manifestoFont = Inter({
  subsets: ["latin-ext"],
  weight: ["200", "300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

export function StatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);

  const words = useMemo(() => MANIFESTO.split(" "), []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || wordsRef.current.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      wordsRef.current.forEach((w) => {
        if (w) w.style.opacity = "1";
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      tl.to(wordsRef.current, {
        opacity: 1,
        duration: 0.5,
        stagger: 0.09,
        ease: "power2.out",
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top 25%",
        once: true,
        onEnter: () => {
          tl.play();
        },
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex min-h-screen flex-col justify-between py-16 md:py-20"
      style={{ background: "hsl(var(--background-warm))" }}
    >
      <div className="mx-auto w-full max-w-[1800px] px-8 md:px-16 lg:px-24">
        <div className="ml-0 max-w-[1200px] md:ml-[15%]">
          {/* Kicker + linha decorativa */}
          <div className="flex items-center gap-4">
            <span
              className="text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Manifesto
            </span>
            <span
              aria-hidden="true"
              className="h-px flex-1"
              style={{ background: "hsl(var(--accent) / 0.3)" }}
            />
          </div>
        </div>
      </div>

      {/* Texto central */}
      <div className="mx-auto w-full max-w-[1800px] px-8 md:px-16 lg:px-24">
        <div className="ml-0 max-w-[1200px] md:ml-[15%]">
          <p
            className={`${manifestoFont.className} font-extralight leading-[1.15] text-foreground/95`}
            style={{
              fontWeight: 200,
              fontSynthesis: "none",
              letterSpacing: "-0.01em",
              fontSize: "clamp(1.6rem, 3.2vw, 4rem)",
            }}
            aria-label={MANIFESTO}
          >
            {words.map((word, idx) => {
              const normalized = word.replace(/[.,!?;:]/g, "").toLowerCase();
              const isUnderlined = UNDERLINED_WORDS.has(normalized);

              return (
                <span
                  key={idx}
                  ref={(el) => {
                    if (el) wordsRef.current[idx] = el;
                  }}
                  className="inline-block mr-[0.3em]"
                  style={{
                    opacity: 0.08,
                    fontWeight: isUnderlined ? 300 : 200,
                    color: isUnderlined ? "hsl(var(--secondary))" : undefined,
                    fontStyle: isUnderlined ? "italic" : "normal",
                    fontSynthesis: isUnderlined ? "style" : "none",
                  }}
                  aria-hidden="true"
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>
      </div>

      {/* Assinatura no rodapé */}
      <div className="mx-auto w-full max-w-[1800px] px-8 md:px-16 lg:px-24">
        <div className="ml-0 max-w-[1200px] md:ml-[15%]">
          <p
            className="text-caption uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            Wellington Viana, Fundador
          </p>
        </div>
      </div>
    </section>
  );
}
