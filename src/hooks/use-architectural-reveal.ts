"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap, { ScrollTrigger } from "@/lib/gsap";

/**
 * Reveals de entrada acionados por classe CSS:
 *  .reveal-illuminate  → opacity 0.06 → 1          (1.0s)
 *  .reveal-rise        → y:20 + opacity 0 → 1      (0.7s)
 *  .reveal-curtain     → wipe horizontal de clipPath (0.85s)
 *  .reveal-draw        → scaleX 0 → 1              (0.8s)
 *  .reveal-stagger     → igual ao rise, 80ms de stagger entre irmãos
 */
export function useArchitecturalReveal(
  rootRef: RefObject<HTMLElement | null>,
  dependencyKey = "",
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        const illuminate =
          gsap.utils.toArray<HTMLElement>(".reveal-illuminate");
        const riseStagger = gsap.utils.toArray<HTMLElement>(
          ".reveal-rise, .reveal-stagger",
        );
        const curtain = gsap.utils.toArray<HTMLElement>(".reveal-curtain");
        const draw = gsap.utils.toArray<HTMLElement>(".reveal-draw");

        if (illuminate.length) gsap.set(illuminate, { opacity: 1 });
        if (riseStagger.length)
          gsap.set(riseStagger, { autoAlpha: 1, y: 0 });
        if (curtain.length)
          gsap.set(curtain, { clipPath: "inset(0 0% 0 0)" });
        if (draw.length) gsap.set(draw, { scaleX: 1 });
        return;
      }

      // ── Illuminate: light entering a room ──
      const illuminateItems =
        gsap.utils.toArray<HTMLElement>(".reveal-illuminate");
      illuminateItems.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0.06 },
          {
            opacity: 1,
            duration: 1.0,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      // ── Rise: subtle upward emergence ──
      const riseItems = gsap.utils.toArray<HTMLElement>(".reveal-rise");
      riseItems.forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      // ── Curtain: horizontal clip-path reveal ──
      const curtainItems =
        gsap.utils.toArray<HTMLElement>(".reveal-curtain");
      curtainItems.forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.85,
            ease: "power3.inOut",
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          },
        );
      });

      // ── Draw: line extension from left ──
      const drawItems = gsap.utils.toArray<HTMLElement>(".reveal-draw");
      drawItems.forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      });

      // ── Stagger: rise with sibling delay ──
      const staggerGroups =
        gsap.utils.toArray<HTMLElement>(".reveal-stagger");
      if (staggerGroups.length > 0) {
        // Group by parent
        const parents = new Map<Element, HTMLElement[]>();
        staggerGroups.forEach((el) => {
          const parent = el.parentElement ?? root;
          if (!parents.has(parent)) parents.set(parent, []);
          parents.get(parent)!.push(el);
        });

        parents.forEach((children, parent) => {
          gsap.fromTo(
            children,
            { autoAlpha: 0, y: 20 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: parent as HTMLElement,
                start: "top 86%",
                once: true,
              },
            },
          );
        });
      }

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, [rootRef, dependencyKey]);
}
