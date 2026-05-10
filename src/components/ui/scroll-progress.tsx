"use client";

/**
 * ScrollProgress — régua arquitetônica vertical
 *
 * Indicador de scroll inspirado em instrumentos de medição (escalímetro,
 * trena, prumo). Composto por:
 *   • Linha-mestra de 1px com marcações (ticks) a cada 10% — as marcações já
 *     percorridas se iluminam em accent; as restantes ficam em traço fino.
 *   • Cabeça do indicador: número em tipografia display + label "scroll"
 *     que desliza pela régua acompanhando a posição.
 *   • Trilho superior ultra-fino (1px) atravessando toda a viewport — sempre
 *     visível, dá a referência horizontal do progresso.
 *
 * Comportamento:
 *   • Auto-hide após 1.4s sem interação (fade graceful).
 *   • Reage à velocidade do scroll com leve expansão (escala).
 *   • Respeita prefers-reduced-motion (mostra apenas a barra superior).
 */

import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/scroll";

const TICK_COUNT = 10; // marcações a cada 10%
const IDLE_MS = 1400;

export function ScrollProgress() {
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const ticksRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lastProgress = 0;
    let lastY = 0;
    let velocity = 0;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let lastShownPct = -1;

    const setIdle = (idle: boolean) => {
      const root = railRef.current;
      if (!root) return;
      root.dataset.idle = idle ? "true" : "false";
    };

    const markActive = () => {
      setIdle(false);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIdle(true), IDLE_MS);
    };

    const tick = () => {
      const lenis = getLenis();
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const y = lenis ? lenis.scroll : window.scrollY;
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      const dy = Math.abs(y - lastY);
      velocity = velocity * 0.85 + dy * 0.15;
      lastY = y;

      const smoothed = lastProgress + (progress - lastProgress) * 0.18;
      lastProgress = smoothed;

      const speedBoost = Math.min(1, velocity / 50);

      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${smoothed})`;
      }

      if (topBarRef.current) {
        topBarRef.current.style.transform = `scaleX(${smoothed})`;
      }

      if (headRef.current) {
        headRef.current.style.transform = `translate3d(0, ${smoothed * 100}%, 0) scale(${1 + speedBoost * 0.04})`;
        headRef.current.style.opacity = smoothed > 0.002 ? "1" : "0";
      }

      if (numberRef.current) {
        const pct = Math.round(smoothed * 100);
        if (pct !== lastShownPct) {
          lastShownPct = pct;
          numberRef.current.textContent = pct.toString().padStart(2, "0");
        }
      }

      if (ticksRef.current) {
        const filledIndex = Math.floor(smoothed * TICK_COUNT);
        const children = ticksRef.current.children;
        for (let i = 0; i < children.length; i++) {
          const el = children[i] as HTMLElement;
          const isFilled = i <= filledIndex;
          if (el.dataset.filled !== (isFilled ? "1" : "0")) {
            el.dataset.filled = isFilled ? "1" : "0";
          }
        }
      }

      document.documentElement.style.setProperty(
        "--scroll-progress",
        smoothed.toFixed(4),
      );

      if (velocity > 0.5) markActive();

      rafRef.current = requestAnimationFrame(tick);
    };

    if (!reduced) {
      setIdle(true);
      rafRef.current = requestAnimationFrame(tick);
    } else {
      const onScroll = () => {
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (topBarRef.current) {
          topBarRef.current.style.transform = `scaleX(${p})`;
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  return (
    <>
      {/* Trilho superior atravessando a viewport (1px) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[2147483641] h-px"
        style={{
          background:
            "linear-gradient(to right, hsl(var(--accent) / 0) 0%, hsl(var(--accent) / 0.18) 50%, hsl(var(--accent) / 0) 100%)",
        }}
      >
        <div
          ref={topBarRef}
          className="h-full origin-left"
          style={{
            background:
              "linear-gradient(to right, hsl(var(--accent-strong) / 0.0) 0%, hsl(var(--accent-strong) / 0.9) 30%, hsl(var(--foreground)) 100%)",
            transform: "scaleX(0)",
            mixBlendMode: "multiply",
          }}
        />
      </div>

      {/* Régua arquitetônica vertical (desktop) */}
      <div
        ref={railRef}
        aria-hidden="true"
        data-idle="true"
        className={[
          "scroll-rail",
          "pointer-events-none fixed right-5 top-1/2 z-[2147483641]",
          "hidden h-[44vh] -translate-y-1/2 md:right-7 md:block lg:right-9",
        ].join(" ")}
        style={{
          width: "44px",
        }}
      >
        {/* Linha-mestra centralizada */}
        <div
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--accent) / 0) 0%, hsl(var(--accent) / 0.22) 12%, hsl(var(--accent) / 0.22) 88%, hsl(var(--accent) / 0) 100%)",
          }}
        >
          <div
            ref={fillRef}
            className="absolute inset-0 origin-top"
            style={{
              background:
                "linear-gradient(to bottom, hsl(var(--foreground)) 0%, hsl(var(--accent-strong)) 100%)",
              transform: "scaleY(0)",
              transition: "background 600ms ease",
            }}
          />
        </div>

        {/* Ticks (marcações) */}
        <div
          ref={ticksRef}
          className="absolute inset-y-0 left-1/2 -translate-x-1/2"
        >
          {Array.from({ length: TICK_COUNT + 1 }).map((_, i) => (
            <span
              key={i}
              data-filled="0"
              className="scroll-tick absolute -translate-x-1/2"
              style={{
                top: `${(i / TICK_COUNT) * 100}%`,
                width: i % 5 === 0 ? "10px" : "5px",
                height: "1px",
                background:
                  i % 5 === 0
                    ? "hsl(var(--accent-strong) / 0.55)"
                    : "hsl(var(--accent) / 0.35)",
                transition: "background 300ms ease, width 300ms ease",
              }}
            />
          ))}
        </div>

        {/* Cabeça que desliza com o progresso */}
        <div
          ref={headRef}
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
          style={{
            opacity: 0,
            willChange: "transform, opacity",
            transition: "opacity 220ms ease",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="block h-px"
              style={{
                width: "12px",
                background: "hsl(var(--foreground))",
              }}
            />
            <span
              ref={numberRef}
              className="block leading-none"
              style={{
                fontFamily: "var(--font-display), system-ui, sans-serif",
                fontSize: "0.6875rem",
                fontWeight: 400,
                letterSpacing: "0.08em",
                color: "hsl(var(--foreground))",
              }}
            >
              00
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scroll-rail {
          transition: opacity 600ms ease;
          opacity: 1;
        }
        .scroll-rail[data-idle="true"] {
          opacity: 0.35;
        }
        .scroll-tick[data-filled="1"] {
          background: hsl(var(--foreground)) !important;
          width: 12px !important;
        }
      `}</style>
    </>
  );
}
