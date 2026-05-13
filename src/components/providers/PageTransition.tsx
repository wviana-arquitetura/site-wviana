"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "@/lib/gsap";
import { dispatchPageTransitionComplete } from "@/lib/page-transition-events";

type PageTransitionProps = {
  children: React.ReactNode;
};

export function PageTransition({ children }: Readonly<PageTransitionProps>) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const overlay = overlayRef.current;
    if (!root || !overlay) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(root, { autoAlpha: 1 });
      gsap.set(overlay, { scaleX: 0 });
      queueMicrotask(dispatchPageTransitionComplete);
      return;
    }

    const tl = gsap.timeline();

    // "A Cortina" — taupe wipe left-to-right, then exit
    tl.set(overlay, { transformOrigin: "left", scaleX: 1, autoAlpha: 1 })
      .to(overlay, {
        transformOrigin: "right",
        scaleX: 0,
        duration: 0.7,
        ease: "power4.inOut",
        delay: 0.15,
      })
      .addLabel("curtainEnd", ">")
      .fromTo(
        root,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: "power2.out" },
        "<0.1",
      )
      .call(dispatchPageTransitionComplete, [], "curtainEnd-=0.35");

    return () => {
      tl.kill();
      gsap.set(overlay, { scaleX: 0, autoAlpha: 0 });
      gsap.set(root, { autoAlpha: 1 });
    };
  }, [pathname]);

  return (
    <>
      <div
        className="page-transition-overlay"
        ref={overlayRef}
        aria-hidden="true"
      />
      <div className="page-transition-content" ref={rootRef}>
        {children}
      </div>
    </>
  );
}
