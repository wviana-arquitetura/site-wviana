"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import gsap from "@/lib/gsap";

const INTRO_KEY = "wviana:intro-played";

// Rotas que pulam a intro (admin tem UI própria, auth é callback técnico).
const ROUTES_SKIP_INTRO = ["/admin", "/auth"];

export function GlobalIntroLoader() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shouldSkip = ROUTES_SKIP_INTRO.some((r) => pathname?.startsWith(r));
    if (shouldSkip) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const wasPlayed = sessionStorage.getItem(INTRO_KEY) === "true";

    if (reducedMotion || wasPlayed) return;

    const overlay = overlayRef.current;
    const line = lineRef.current;
    const logo = logoRef.current;
    const label = labelRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;

    if (!overlay || !line || !logo || !label || !top || !bottom) return;

    const rafId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        sessionStorage.setItem(INTRO_KEY, "true");
        setIsVisible(false);
      },
    });

    // Sequência encurtada (~3.2s → ~2s) pra liberar a viewport mais cedo: o
    // overlay opaco cobre a hero (que já está pintada por baixo) e atrasa o LCP
    // na primeira visita. Mantém a leitura da marca, só reduz as durações.
    tl
      // Step 1: Horizon line draws from center
      .fromTo(
        line,
        { width: 0 },
        { width: "40vw", duration: 0.55, ease: "power2.inOut" },
      )
      // Step 2: Logo fades in above the line
      .fromTo(
        logo,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.45 },
        "-=0.2",
      )
      // Step 3: Label fades in below
      .fromTo(
        label,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.35 },
        "-=0.15",
      )
      // Step 4: Hold
      .to({}, { duration: 0.2 })
      // Step 5: Content fades out
      .to([logo, line, label], {
        autoAlpha: 0,
        duration: 0.25,
      })
      // Step 6: Split reveal — top and bottom halves slide apart
      .set(overlay, { autoAlpha: 0 })
      .fromTo(
        top,
        { yPercent: 0 },
        { yPercent: -100, duration: 0.6, ease: "power4.inOut" },
      )
      .fromTo(
        bottom,
        { yPercent: 0 },
        { yPercent: 100, duration: 0.6, ease: "power4.inOut" },
        "<",
      );

    return () => {
      window.cancelAnimationFrame(rafId);
      tl.kill();
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <>
      {/* Main content overlay */}
      <div
        ref={overlayRef}
        className="intro-loader-overlay"
        aria-hidden="true"
      >
        <div ref={logoRef} className="intro-loader-logo">
          <Image
            src="/images/logos/brand/marca-variacao-07.svg"
            alt="W.VIANA"
            width={1920}
            height={1080}
            className="h-14 w-auto invert md:h-16"
          />
        </div>
        <div ref={lineRef} className="intro-loader-line" />
        <span ref={labelRef} className="intro-loader-label mt-3">
          Arquitetura | Interiores
        </span>
      </div>

      {/* Split panels for the reveal */}
      <div ref={topRef} className="intro-loader-top" aria-hidden="true" />
      <div
        ref={bottomRef}
        className="intro-loader-bottom"
        aria-hidden="true"
      />
    </>
  );
}
