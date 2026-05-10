"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import { getProjectBySlug } from "@/services/projects.service";
import { GalleryProjectCard } from "@/components/project/v2/gallery-project-card";
import { Void } from "@/components/ui/void";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";
import { getLenis } from "@/lib/scroll";
import gsap from "@/lib/gsap";

export function GalleryWalkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const projects = ["residencial-rc", "residencial-pl", "residencial-tn"]
    .map(getProjectBySlug)
    .filter(Boolean);

  useArchitecturalReveal(sectionRef);

  // Snap inteligente — respeita interrupção do usuário (wheel/touch
  // cancelam qualquer animação programática em curso, evitando "luta"
  // com o Lenis).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    let prevScrollY = window.scrollY;
    let dir: "down" | "up" = "down";
    let userInterrupted = false;

    const getHeaderH = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) *
      parseFloat(getComputedStyle(document.documentElement).fontSize);

    const snap = (top: number) => {
      const headerH = getHeaderH();
      const target = window.scrollY + top - headerH;
      if (Math.abs(top - headerH) <= 24) return;
      userInterrupted = false;
      getLenis()?.scrollTo(target, {
        duration: 1.1,
        // easeOutExpo — chega cinematográfico, sem sobrepasso
        easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      });
    };

    const handleScrollEnd = () => {
      if (userInterrupted) return;
      const viewH = window.innerHeight;
      const headerH = getHeaderH();
      const els = Array.from(section.querySelectorAll<HTMLElement>("[data-snap]"));

      if (dir === "down") {
        let arrivingTop: number | null = null;
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
          const target = window.scrollY + peekingTop - viewH;
          getLenis()?.scrollTo(target, {
            duration: 0.9,
            easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
          });
        }
      } else {
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
      timer = setTimeout(handleScrollEnd, 180);
    };

    const onUserInput = () => {
      userInterrupted = true;
      const lenis = getLenis();
      lenis?.stop();
      lenis?.start();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onUserInput, { passive: true });
    window.addEventListener("touchstart", onUserInput, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onUserInput);
      window.removeEventListener("touchstart", onUserInput);
      clearTimeout(timer);
    };
  }, []);

  // Velocity skew — cards reagem sutilmente à velocidade do scroll.
  // Detalhe premium clássico (Apple, Igloo Inc., Locomotive).
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = gsap.utils.toArray<HTMLElement>(
      section.querySelectorAll("[data-snap] > *"),
    );
    if (cards.length === 0) return;

    cards.forEach((card) => card.classList.add("scroll-velocity-target"));

    let rafId: number | null = null;
    let currentSkew = 0;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let velocity = 0;

    const tick = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const lenis = getLenis();
      const y = lenis ? lenis.scroll : window.scrollY;
      const instantV = (y - lastY) / dt;
      velocity = velocity * 0.78 + instantV * 0.22;
      lastY = y;
      lastTime = now;

      const targetSkew = gsap.utils.clamp(-2.5, 2.5, velocity * 2.4);
      currentSkew += (targetSkew - currentSkew) * 0.12;

      if (Math.abs(currentSkew) > 0.05) {
        cards.forEach((card) => {
          card.style.setProperty(
            "transform",
            `skewY(${currentSkew.toFixed(3)}deg)`,
          );
        });
      } else if (currentSkew !== 0) {
        currentSkew = 0;
        cards.forEach((card) => {
          card.style.removeProperty("transform");
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      cards.forEach((card) => {
        card.classList.remove("scroll-velocity-target");
        card.style.removeProperty("transform");
      });
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
              className="flex items-center md:min-h-[calc(var(--dvh)-var(--header-height))]"
            >
              <GalleryProjectCard
                project={project}
                imageLeft={i % 2 === 0}
              />
            </div>
            {i < projects.length - 1 && <Void height="12vh" />}
          </div>
        ))}
      </div>
    </section>
  );
}
