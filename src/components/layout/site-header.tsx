"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useUiStore } from "@/store/use-ui-store";
import { NavigationDrawer } from "./navigation-drawer";

export function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [footerDarkProgress, setFooterDarkProgress] = useState(0);
  const showDevReviewShortcut = process.env.NEXT_PUBLIC_SHOW_REVIEW_SHORTCUT !== "false";
  const isNavigationOpen = useUiStore((s) => s.isNavigationOpen);
  const toggleNavigation = useUiStore((s) => s.toggleNavigation);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const readInitialProgress = () => {
      const initialProgress = Number(
        getComputedStyle(document.documentElement).getPropertyValue("--footer-dark-progress") ||
          "0",
      );
      if (!Number.isNaN(initialProgress)) {
        setFooterDarkProgress(initialProgress);
      }
    };

    readInitialProgress();

    const onFooterThemeProgress = (event: Event) => {
      const customEvent = event as CustomEvent<{ progress: number }>;
      const progress = customEvent.detail?.progress ?? 0;
      setFooterDarkProgress(progress);
    };

    window.addEventListener("footer-theme-progress", onFooterThemeProgress as EventListener);

    return () => {
      window.removeEventListener("footer-theme-progress", onFooterThemeProgress as EventListener);
    };
  }, []);

  const useLightForeground = isNavigationOpen || footerDarkProgress > 0.01;
  const interactiveColor = useLightForeground ? "hsl(0 0% 100%)" : "hsl(var(--foreground))";

  const headerContent = (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[2147483640]"
        style={{
          borderBottom: scrolled && !isNavigationOpen
            ? useLightForeground
              ? "1px solid hsl(0 0% 100% / 0.18)"
              : "1px solid hsl(var(--accent) / 0.2)"
            : "1px solid transparent",
          background: scrolled && !isNavigationOpen
            ? useLightForeground
              ? "hsl(var(--foreground) / 0.72)"
              : "hsl(var(--background) / 0.82)"
            : "transparent",
          backdropFilter: scrolled && !isNavigationOpen ? "blur(8px)" : "none",
          transition: "border-color 0.6s ease, background-color 0.6s ease, backdrop-filter 0.6s ease",
        }}
      >
        <div className="mx-auto flex h-12 max-w-[1800px] items-center justify-between px-8 md:h-14 md:px-16 lg:px-24">
          {/* Logo — mesmo alinhamento à esquerda em todos os breakpoints (sem -m que deslocava o SVG) */}
          <Link
            href="/"
            className="relative z-[2147483646] flex shrink-0 items-center overflow-visible py-1 transition-opacity duration-500 hover:opacity-60"
            aria-label="W.VIANA — Início"
          >
            <Image
              src="/images/logos/brand/Prancheta 7_1.svg"
              alt="W.VIANA Arquitetura de Interiores"
              width={1920}
              height={1080}
              className="relative z-[2147483647] h-[2.75rem] w-auto max-w-[10rem] object-contain object-left md:h-[3.25rem] md:max-w-[12rem] lg:max-w-[14rem]"
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            {showDevReviewShortcut ? (
              <Link
                href="/revisao-cliente"
                className="group relative inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[8px] uppercase tracking-[0.12em] opacity-55 transition-all duration-300 hover:opacity-90 focus:opacity-100"
                style={{
                  color: interactiveColor,
                  borderColor: useLightForeground ? "hsl(0 0% 100% / 0.2)" : "hsl(var(--accent) / 0.28)",
                }}
                aria-label="Abrir formulário de revisão"
              >
                rev
                <span
                  role="tooltip"
                  className="pointer-events-none absolute right-0 top-[calc(100%+7px)] z-[2147483647] w-[220px] translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                  style={{
                    background: useLightForeground ? "hsl(0 0% 8% / 0.95)" : "hsl(var(--foreground) / 0.9)",
                    color: "hsl(0 0% 100%)",
                    border: "1px solid hsl(0 0% 100% / 0.18)",
                    padding: "6px 8px",
                    fontSize: "8px",
                    letterSpacing: "0.01em",
                    textTransform: "none",
                  }}
                >
                  atalho para o formulário de revisão do cliente v1.
                  Temporário, apenas para a fase de desenvolvimento.
                </span>
              </Link>
            ) : null}

            {/* Menu trigger — borda e fundo discretos (sem animação de movimento) */}
            <button
              onClick={toggleNavigation}
              type="button"
              id="site-navigation-trigger"
              className={[
                "inline-grid shrink-0 place-items-center rounded-sm border px-3 py-1.5 text-micro font-semibold uppercase tracking-[0.32em]",
                "transition-[color,background-color,border-color] duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                useLightForeground
                  ? "border-white/35 bg-white/[0.1] hover:border-white/55 hover:bg-white/[0.16] focus-visible:ring-white/50"
                  : "border-[hsl(var(--foreground)/0.35)] bg-[hsl(var(--foreground)/0.06)] hover:border-[hsl(var(--foreground)/0.55)] hover:bg-[hsl(var(--foreground)/0.12)] focus-visible:ring-[hsl(var(--foreground)/0.45)]",
              ].join(" ")}
              style={{ color: interactiveColor }}
              aria-label={isNavigationOpen ? "Fechar navegação" : "Abrir navegação"}
              aria-expanded={isNavigationOpen}
              aria-controls="site-navigation-drawer"
            >
              {/* Largura fixa pela string mais longa — evita “pulo” entre Menu e Fechar */}
              <span className="invisible col-start-1 row-start-1 pointer-events-none" aria-hidden>
                [Fechar]
              </span>
              <span className="col-start-1 row-start-1">{isNavigationOpen ? "[Fechar]" : "[Menu]"}</span>
            </button>
          </div>
        </div>
      </header>

      <NavigationDrawer />
    </>
  );

  if (!mounted) return null;

  return createPortal(headerContent, document.body);
}
