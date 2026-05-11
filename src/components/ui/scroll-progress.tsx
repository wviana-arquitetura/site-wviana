"use client";

/**
 * ScrollProgress — v3 "Instrumento Arquitetônico"
 *
 * Substitui a scrollbar nativa por um indicador autoral inspirado em
 * instrumentos de medição (escalímetro, prumo, trena de campo).
 *
 * Composição:
 *   • Trilho superior 1px que cruza a viewport, com "ponta-de-luz" que
 *     acompanha o avanço (fade radial sutil em mix-blend multiply).
 *   • Régua vertical (desktop): linha-mestra com halo difuso, ticks com
 *     rótulos numéricos nas marcações principais (0/25/50/75/100), caps
 *     romboidais nos terminais e cabeça-cápsula com tipografia display
 *     exibindo o número e o sufixo "%".
 *
 * Comportamento:
 *   • Idle elegante: após 1.4s sem scroll, a régua atenua opacidade e
 *     desliza levemente para fora — ressurge ao primeiro movimento.
 *   • Smoothing exponencial em GPU (translate3d + scaleY) para 60fps.
 *   • Respeita prefers-reduced-motion (apenas o trilho superior).
 */

import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/scroll";

const TICK_COUNT = 20; // marcações a cada 5%
const MAJOR_EVERY = 5; // major tick a cada 25%
const IDLE_MS = 1400;

export function ScrollProgress() {
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const topTipRef = useRef<HTMLDivElement>(null);
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
    let lastFilledIdx = -1;
    let railHeight = 0;

    const measure = () => {
      if (railRef.current) {
        const h = railRef.current.getBoundingClientRect().height;
        if (h > 0) railHeight = h;
      }
    };
    // Mede após o paint (ref já está no DOM)
    requestAnimationFrame(() => {
      measure();
      // Re-mede depois das fontes/layout assentar
      requestAnimationFrame(measure);
    });
    window.addEventListener("resize", measure);

    // Re-mede também a cada N frames como rede de proteção,
    // caso a régua entre na viewport tarde (lazy mount)
    let measureCountdown = 0;

    const setIdle = (idle: boolean) => {
      const root = railRef.current;
      if (root) root.dataset.idle = idle ? "true" : "false";
      if (topTipRef.current) {
        topTipRef.current.style.opacity = idle ? "0" : "1";
      }
    };

    const markActive = () => {
      setIdle(false);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIdle(true), IDLE_MS);
    };

    const tick = () => {
      // Rede de proteção: re-mede nos primeiros frames (até railHeight > 0)
      if (railHeight === 0 && measureCountdown < 60) {
        measure();
        measureCountdown++;
      }

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

      const speedBoost = Math.min(1, velocity / 60);

      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${smoothed})`;
      }

      if (topBarRef.current) {
        topBarRef.current.style.transform = `scaleX(${smoothed})`;
      }

      if (topTipRef.current) {
        const vw = window.innerWidth;
        topTipRef.current.style.transform = `translate3d(${
          smoothed * vw - 60
        }px, 0, 0)`;
      }

      if (headRef.current) {
        const offsetPx = smoothed * railHeight;
        headRef.current.style.transform = `translate3d(0, ${offsetPx}px, 0) scale(${
          1 + speedBoost * 0.05
        })`;
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
        if (filledIndex !== lastFilledIdx) {
          lastFilledIdx = filledIndex;
          const children = ticksRef.current.children;
          for (let i = 0; i < children.length; i++) {
            const el = children[i] as HTMLElement;
            const isFilled = i <= filledIndex;
            const want = isFilled ? "1" : "0";
            if (el.dataset.filled !== want) el.dataset.filled = want;
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
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", measure);
      };
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      {/* Trilho superior cinemático */}
      <div aria-hidden="true" className="scroll-topbar-track">
        <div ref={topBarRef} className="scroll-topbar-fill" />
        <div ref={topTipRef} className="scroll-topbar-tip" />
      </div>

      {/* Régua vertical (desktop) */}
      <div
        ref={railRef}
        aria-hidden="true"
        data-idle="true"
        className="scroll-rail hidden md:block"
      >
        {/* Caps romboidais terminais */}
        <span className="scroll-rail-cap" data-position="top" />
        <span className="scroll-rail-cap" data-position="bottom" />

        {/* Halo difuso */}
        <div className="scroll-rail-halo" />

        {/* Linha-mestra + preenchimento */}
        <div className="scroll-rail-line">
          <div ref={fillRef} className="scroll-rail-fill" />
        </div>

        {/* Ticks com rótulos */}
        <div ref={ticksRef} className="absolute inset-0">
          {Array.from({ length: TICK_COUNT + 1 }).map((_, i) => {
            const isMajor = i % MAJOR_EVERY === 0;
            const pct = Math.round((i / TICK_COUNT) * 100);
            return (
              <span
                key={i}
                data-filled="0"
                data-major={isMajor ? "1" : "0"}
                className="scroll-tick"
                style={{ top: `${(i / TICK_COUNT) * 100}%` }}
              >
                {isMajor && (
                  <span className="scroll-tick-label">
                    {pct.toString().padStart(2, "0")}
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Cabeça que desliza com o progresso */}
        <div ref={headRef} className="scroll-rail-head">
          <div className="scroll-head-inner">
            <span className="scroll-head-tick" />
            <span className="scroll-head-capsule">
              <span ref={numberRef} className="scroll-head-num">
                00
              </span>
              <span className="scroll-head-pct">%</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
