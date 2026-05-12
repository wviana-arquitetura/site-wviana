"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { registerLenis, getLenis } from "@/lib/scroll";

type SmoothScrollProviderProps = {
  children: React.ReactNode;
};

const SCROLL_KEY_PREFIX = "wviana_scroll_pos:";

function scrollStorageKey(pathname: string) {
  return `${SCROLL_KEY_PREFIX}${pathname}`;
}

function readSavedScrollRaw(pathname: string): number {
  try {
    const raw = sessionStorage.getItem(scrollStorageKey(pathname));
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 0) return 0;
    return n;
  } catch {
    return 0;
  }
}

function writeScrollY(pathname: string, y: number) {
  try {
    sessionStorage.setItem(scrollStorageKey(pathname), String(Math.round(y)));
  } catch {
    // storage indisponível (modo privado etc.)
  }
}

export function SmoothScrollProvider({
  children,
}: Readonly<SmoothScrollProviderProps>) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  const wasPopStateRef = useRef(false);
  const isFirstPathnameEffectRef = useRef(true);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => {
      wasPopStateRef.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    let rafId: number | null = null;

    const flushScrollSave = () => {
      writeScrollY(pathnameRef.current, window.scrollY);
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        flushScrollSave();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("beforeunload", flushScrollSave);
    window.addEventListener("pagehide", flushScrollSave);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", flushScrollSave);
      window.removeEventListener("pagehide", flushScrollSave);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      flushScrollSave();
    };
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
    });

    registerLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const forceScrollTo = (y: number) => {
      const max = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const clamped = Math.min(Math.max(0, y), max);
      document.documentElement.scrollTop = clamped;
      document.body.scrollTop = clamped;
      window.scrollTo(0, clamped);
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(clamped, { immediate: true, force: true });
        lenis.resize();
      }
    };

    const scheduleStabilization = (targetY: number) => {
      const rafIds: number[] = [];
      [1, 2, 3].forEach((n) => {
        const id = requestAnimationFrame(() => {
          if (n === 1) {
            requestAnimationFrame(() => {
              forceScrollTo(targetY);
            });
          } else {
            forceScrollTo(targetY);
          }
        });
        rafIds.push(id);
      });

      ScrollTrigger.refresh();

      const checks: number[] = [];
      [50, 200, 500, 1000].forEach((ms) => {
        const id = window.setTimeout(() => {
          if (Math.abs(window.scrollY - targetY) > 5) {
            forceScrollTo(targetY);
          }
        }, ms);
        checks.push(id);
      });

      return () => {
        rafIds.forEach((id) => cancelAnimationFrame(id));
        checks.forEach((id) => window.clearTimeout(id));
      };
    };

    let targetY = 0;

    if (isFirstPathnameEffectRef.current) {
      isFirstPathnameEffectRef.current = false;
      const nav = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming | undefined;
      if (nav?.type === "reload") {
        targetY = readSavedScrollRaw(pathname);
      }
    } else if (wasPopStateRef.current) {
      wasPopStateRef.current = false;
      targetY = readSavedScrollRaw(pathname);
    }

    forceScrollTo(targetY);
    return scheduleStabilization(targetY);
  }, [pathname]);

  return children;
}
