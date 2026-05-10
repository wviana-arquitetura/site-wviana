"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { registerLenis, getLenis } from "@/lib/scroll";

type SmoothScrollProviderProps = {
  children: React.ReactNode;
};

export function SmoothScrollProvider({
  children,
}: Readonly<SmoothScrollProviderProps>) {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.16,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    registerLenis(lenis);

    let scrollingTimeout: ReturnType<typeof setTimeout> | undefined;
    const body = document.body;

    const onScroll = () => {
      ScrollTrigger.update();

      body.classList.add("is-scrolling");

      if (scrollingTimeout) clearTimeout(scrollingTimeout);

      scrollingTimeout = setTimeout(() => {
        body.classList.remove("is-scrolling");
      }, 120);
    };

    lenis.on("scroll", onScroll);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      if (scrollingTimeout) clearTimeout(scrollingTimeout);

      body.classList.remove("is-scrolling");

      gsap.ticker.remove(update);
      lenis.destroy();

      // Se seu registerLenis aceitar null, recomendo limpar:
      // registerLenis(null);
    };
  }, []);

  useEffect(() => {
    const lenis = getLenis();

    if (lenis) {
      lenis.scrollTo(0, {
        immediate: true,
        force: true,
      });
    } else {
      window.scrollTo(0, 0);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });
  }, [pathname]);

  return children;
}