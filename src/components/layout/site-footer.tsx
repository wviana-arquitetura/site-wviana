"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/brand";

type SiteFooterProps = {
  hideCta?: boolean;
};

export function SiteFooter({ hideCta = false }: SiteFooterProps) {
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (hideCta) {
      document.documentElement.style.setProperty("--footer-dark-progress", "0");
      window.dispatchEvent(
        new CustomEvent("footer-theme-progress", { detail: { progress: 0 } }),
      );
      return;
    }

    const footer = footerRef.current;
    if (!footer) return;

    const main = document.querySelector("main");
    const backgrounds = Array.from(
      document.querySelectorAll<HTMLElement>(".bg-background"),
    );
    const bgTargets = [document.body, ...(main ? [main] : []), ...backgrounds];

    const primaryText = Array.from(
      footer.querySelectorAll<HTMLElement>(".footer-primary-text"),
    );

    const setProgress = (progress: number) => {
      const clamped = Math.max(0, Math.min(1, progress));

      const bgLightness = 97 * (1 - clamped);
      const textLightness = 100 * clamped;

      const bgColor = `hsl(0 0% ${bgLightness}%)`;
      const textColor = `hsl(0 0% ${textLightness}%)`;

      bgTargets.forEach((el) => {
        el.style.backgroundColor = bgColor;
      });

      primaryText.forEach((el) => {
        el.style.color = textColor;
      });

      document.documentElement.style.setProperty("--footer-dark-progress", String(clamped));
      window.dispatchEvent(
        new CustomEvent("footer-theme-progress", { detail: { progress: clamped } }),
      );
    };

    const calculateProgress = () => {
      const rect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;

      // Ajuste fino visual: começa um pouco mais próximo do footer
      // e usa curva suave para evitar sensação de "tranco".
      const startPoint = viewportHeight * 0.85;
      const endPoint = viewportHeight * 0.4;
      const denominator = startPoint - endPoint;

      if (denominator <= 0) {
        setProgress(0);
        return;
      }

      const linear = (startPoint - rect.top) / denominator;
      const clamped = Math.max(0, Math.min(1, linear));
      const eased = clamped * clamped * (3 - 2 * clamped); // smoothstep

      setProgress(eased);
    };

    let rafId: number | null = null;
    const scheduleRecalc = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        calculateProgress();
      });
    };

    setProgress(0);
    calculateProgress();

    window.addEventListener("scroll", scheduleRecalc, { passive: true });
    window.addEventListener("resize", scheduleRecalc);
    window.addEventListener("orientationchange", scheduleRecalc);

    return () => {
      window.removeEventListener("scroll", scheduleRecalc);
      window.removeEventListener("resize", scheduleRecalc);
      window.removeEventListener("orientationchange", scheduleRecalc);

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }

      bgTargets.forEach((el) => {
        el.style.removeProperty("background-color");
      });

      document.documentElement.style.setProperty("--footer-dark-progress", "0");
      window.dispatchEvent(
        new CustomEvent("footer-theme-progress", { detail: { progress: 0 } }),
      );
    };
  }, [hideCta]);

  return (
    <footer
      ref={footerRef}
      className="relative z-10 mt-24 w-full bg-transparent text-foreground"
    >
      {!hideCta && (
        <section className="relative flex min-h-[calc(var(--dvh)-var(--header-height))] items-center px-8 md:px-16 lg:px-24">
          <div className="mx-auto flex w-full max-w-[1800px] flex-col justify-between gap-16 md:flex-row md:items-end">
            <div className="flex flex-col items-start">
              <p
                className="text-micro uppercase tracking-[0.22em]"
                style={{ color: "hsl(var(--accent-strong))" }}
              >
                Próximo passo
              </p>
              <h2
                className="footer-primary-text mt-6 font-light leading-[0.88] tracking-[-0.04em]"
                style={{
                  color: "hsl(var(--foreground))",
                  /* Mesma curva do text-monumental (4rem / 12vw / 14rem), fator 13/14 no teto */
                  fontSize: "clamp(calc(4rem * 13 / 14), calc(12vw * 13 / 14), 13rem)",
                }}
              >
                agende
                <br />
                uma
                <br />
                conversa
              </h2>
              <Link
                href={`mailto:${BRAND.email}`}
                className="footer-primary-text group mt-8 inline-flex max-w-full self-start break-all font-light tracking-tight opacity-80 transition-opacity hover:opacity-100 sm:break-normal"
                style={{
                  color: "hsl(var(--foreground))",
                  fontSize: "clamp(1.05rem, 2.1vw, 1.4rem)",
                  lineHeight: 1.35,
                }}
              >
                <span className="border-b border-[hsl(var(--accent)/0.4)] pb-2 transition-all group-hover:border-[hsl(var(--accent))]">
                  {BRAND.email}
                </span>
              </Link>
              <Link
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-primary-text group mt-4 inline-flex self-start font-light tracking-tight opacity-80 transition-opacity hover:opacity-100"
                style={{
                  color: "hsl(var(--foreground))",
                  fontSize: "clamp(1.05rem, 2.1vw, 1.4rem)",
                  lineHeight: 1.35,
                }}
              >
                <span className="border-b border-[hsl(var(--accent)/0.4)] pb-2 transition-all group-hover:border-[hsl(var(--accent))]">
                  whatsapp
                </span>
              </Link>
            </div>
          </div>

          <div
            className="pointer-events-none absolute bottom-6 right-0 select-none md:bottom-8 md:right-0 lg:right-0"
            style={{
              opacity: 0.16,
              transform: "translateX(14%)",
            }}
          >
            <Image
              src="/images/logos/brand/brand-7.svg"
              alt="W.VIANA"
              width={1920}
              height={1080}
              className="h-auto w-[clamp(24rem,50vw,68rem)]"
              style={{ filter: "invert(1)" }}
              priority
            />
          </div>
        </section>
      )}

      <section className="relative flex flex-col overflow-hidden bg-transparent">
        <div
          className="mx-auto flex w-full max-w-[1800px] flex-col gap-4 border-t px-8 py-6 md:flex-row md:items-center md:justify-between md:px-16 lg:px-24"
          style={{ borderColor: "hsl(var(--accent) / 0.15)" }}
        >
          <p
            className="text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            &copy; 2026 W.VIANA Arquitetura | Interiores
          </p>
          <div className="flex gap-6">
            <Link
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-micro uppercase tracking-[0.22em] transition-opacity hover:opacity-60"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Instagram
            </Link>
            <Link
              href={BRAND.pinterestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-micro uppercase tracking-[0.22em] transition-opacity hover:opacity-60"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Pinterest
            </Link>
          </div>
        </div>
      </section>
    </footer>
  );
}
