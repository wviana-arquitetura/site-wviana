"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDesktopMailtoBlankTarget } from "@/hooks/use-desktop-mailto-target";
import gsap from "@/lib/gsap";
import { BRAND } from "@/lib/brand";
import { useUiStore } from "@/store/use-ui-store";

const navItems = [
  { href: "/projetos", label: "Projetos", index: "01" },
  { href: "/processo", label: "Processo", index: "02" },
  { href: "/sobre", label: "Sobre", index: "03" },
  { href: "/contato", label: "Contato", index: "04" },
];

export function NavigationDrawer() {
  const pathname = usePathname();
  const isOpen = useUiStore((s) => s.isNavigationOpen);
  const setNavigationOpen = useUiStore((s) => s.setNavigationOpen);
  const mailtoTarget = useDesktopMailtoBlankTarget();
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const previousFocusedRef = useRef<HTMLElement | null>(null);

  // Close on navigation
  useEffect(() => {
    setNavigationOpen(false);
  }, [pathname, setNavigationOpen]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus management + keyboard support
  useEffect(() => {
    if (!isOpen) {
      previousFocusedRef.current?.focus?.();
      return;
    }

    previousFocusedRef.current = document.activeElement as HTMLElement | null;

    const backdrop = backdropRef.current;
    if (!backdrop) return;

    const getFocusable = () =>
      Array.from(
        backdrop.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      );

    requestAnimationFrame(() => {
      const focusable = getFocusable();
      focusable[0]?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setNavigationOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, setNavigationOpen]);

  // Animate open/close
  // - Mata a timeline anterior antes de criar a nova (evita race em toggle rápido).
  // - Fechamento curto (~0.35s) pra terminar antes do pico da cortina taupe da
  //   PageTransition (delay 0.15 + 0.7s) quando o close vem de uma navegação.
  // - SiteHeader/Drawer vivem no layout.tsx (montam uma vez), então estado e
  //   timeline GSAP persistem entre rotas — sem re-mount cortando animação.
  useEffect(() => {
    const backdrop = backdropRef.current;
    const content = contentRef.current;
    const links = linksRef.current;
    if (!backdrop || !content || !links) return;

    const items = links.querySelectorAll<HTMLElement>(".nav-link-item");
    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });

    if (isOpen) {
      tl.set(backdrop, { display: "block" })
        .fromTo(
          backdrop,
          { xPercent: 100 },
          { xPercent: 0, duration: 0.7 },
        )
        .fromTo(
          items,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
          },
          "-=0.3",
        );
    } else {
      tl.eventCallback("onComplete", () => {
        gsap.set(backdrop, { display: "none" });
      });
      tl.to(items, {
        autoAlpha: 0,
        y: -10,
        duration: 0.18,
        stagger: 0.02,
        ease: "power2.in",
      }).to(backdrop, { xPercent: 100, duration: 0.25 }, "-=0.05");
    }

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  return (
    <div
      id="site-navigation-drawer"
      ref={backdropRef}
      className="fixed inset-0 z-[9998] bg-foreground"
      style={{ display: "none" }}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Navegação principal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setNavigationOpen(false);
        }
      }}
    >
      <div
        ref={contentRef}
        className="flex h-full flex-col justify-center px-8 md:px-16 lg:px-24"
      >
        <nav ref={linksRef} className="space-y-3 md:space-y-4">
          {navItems.map((item) => (
            <div key={item.href} className="nav-link-item flex items-baseline gap-5">
              <span
                className="text-micro uppercase tracking-[0.22em]"
                style={{ color: "hsl(var(--accent))" }}
              >
                {item.index}
              </span>
              <Link
                href={item.href}
                className="font-display font-extralight text-white transition-opacity hover:opacity-60"
                style={{ fontSize: "clamp(2.25rem, 7vw, 5.4rem)", lineHeight: "1.1" }}
                onClick={() => setNavigationOpen(false)}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="mt-12 flex flex-col gap-4 md:mt-16 md:flex-row md:items-center md:gap-12">
          <Link
            href={BRAND.mailtoUrl}
            target={mailtoTarget}
            rel={mailtoTarget ? "noopener noreferrer" : undefined}
            className="text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent))" }}
          >
            {BRAND.email}
          </Link>
          <Link
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent))" }}
          >
            whatsapp
          </Link>
          <Link
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent))" }}
          >
            Instagram
          </Link>
          <Link
            href={BRAND.pinterestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent))" }}
          >
            Pinterest
          </Link>
        </div>
      </div>
    </div>
  );
}
