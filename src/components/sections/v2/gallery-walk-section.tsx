"use client";

import { useRef, useEffect } from "react";
import { getProjectBySlug } from "@/services/projects.service";
import { GalleryProjectCard } from "@/components/project/v2/gallery-project-card";
import { Void } from "@/components/ui/void";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";
import { getLenis } from "@/lib/scroll";

export function GalleryWalkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const projects = ["residencial-rc", "residencial-pl", "residencial-tn"]
    .map(getProjectBySlug)
    .filter(Boolean);

  useArchitecturalReveal(sectionRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    let prevScrollY = window.scrollY;
    let dir: "down" | "up" = "down";

    const getHeaderH = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) *
      parseFloat(getComputedStyle(document.documentElement).fontSize);

    const snap = (top: number) => {
      const headerH = getHeaderH();
      const target = window.scrollY + top - headerH;
      if (Math.abs(top - headerH) <= 24) return;
      getLenis()?.scrollTo(target, {
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });
    };

    const handleScrollEnd = () => {
      const viewH = window.innerHeight;
      const headerH = getHeaderH();
      const els = Array.from(section.querySelectorAll<HTMLElement>("[data-snap]"));

      if (dir === "down") {
        // Card cruzou 20% da tela → snapa pra ele
        let arrivingTop: number | null = null;
        // Card peeking (< 20%) → snapa de volta, esconde ele na borda inferior
        let peekingTop: number | null = null;

        els.forEach((el) => {
          const top = el.getBoundingClientRect().top;
          if (top >= headerH && top <= viewH * 0.8) {
            if (arrivingTop === null || top < arrivingTop) arrivingTop = top;
          } else if (top > viewH * 0.8 && top < viewH) {
            if (peekingTop === null || top < peekingTop) peekingTop = top;
          }
        });

        if (arrivingTop !== null) {
          snap(arrivingTop);
        } else if (peekingTop !== null) {
          // Coloca o topo do card peeking exatamente na borda inferior da viewport
          const target = window.scrollY + peekingTop - viewH;
          getLenis()?.scrollTo(target, {
            duration: 1.0,
            easing: (t: number) => 1 - Math.pow(1 - t, 4),
          });
        }
      } else {
        // Só snapa pra cima: card voltando do topo que cruzou a header vindo de cima
        let bestTop: number | null = null;
        els.forEach((el) => {
          const top = el.getBoundingClientRect().top;
          if (top >= headerH - viewH * 0.3 && top <= viewH * 0.5) {
            if (bestTop === null || Math.abs(top - headerH) < Math.abs(bestTop - headerH)) {
              bestTop = top;
            }
          }
        });
        if (bestTop !== null) snap(bestTop);
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (y !== prevScrollY) dir = y > prevScrollY ? "down" : "up";
      prevScrollY = y;
      clearTimeout(timer);
      timer = setTimeout(handleScrollEnd, 160);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-background px-8 py-24 md:px-16 md:py-32 lg:px-24 lg:py-48"
    >
      <div className="mx-auto max-w-[1800px]">
        {projects.map((project, i) => (
          <div key={project.slug}>
            <div
              data-snap
              className="min-h-[calc(var(--dvh)-var(--header-height))]"
            >
              <GalleryProjectCard project={project} index={i} />
            </div>
            {i < projects.length - 1 && <Void height="12vh" />}
          </div>
        ))}
      </div>
    </section>
  );
}
