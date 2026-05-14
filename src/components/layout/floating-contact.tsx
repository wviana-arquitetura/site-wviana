"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";
import { getLenis } from "@/lib/scroll";
import { trackEvent } from "@/lib/analytics";

/**
 * CTA persistente:
 *  - Mobile: barra inferior full-width com smart-hide (esconde no scroll-down).
 *  - Desktop: pílula canto-inferior-direito, fade+slide.
 * Destino: WhatsApp (canal primário do escritório).
 */

const SHOW_AFTER_RATIO_MOBILE = 0.6;
const SHOW_AFTER_RATIO_DESKTOP = 0.9;
const SCROLL_HIDE_DELTA = 6;

export function FloatingContact() {
  const [visible, setVisible] = useState(false);
  const [hiddenByScroll, setHiddenByScroll] = useState(false);
  const lastYRef = useRef(0);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const ratio = isDesktop
      ? SHOW_AFTER_RATIO_DESKTOP
      : SHOW_AFTER_RATIO_MOBILE;
    const threshold = window.innerHeight * ratio;

    lastYRef.current = window.scrollY;

    const handleScroll = () => {
      const lenis = getLenis();
      const y = lenis ? lenis.scroll : window.scrollY;

      setVisible(y > threshold);

      const delta = y - lastYRef.current;
      if (Math.abs(delta) > SCROLL_HIDE_DELTA) {
        // Em desktop a pílula não some no scroll-down — só mobile precisa.
        if (!isDesktop) {
          setHiddenByScroll(delta > 0 && y > threshold + 80);
        }
        lastYRef.current = y;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const active = visible && !hiddenByScroll;

  return (
    <>
      {/* MOBILE — barra editorial inferior */}
      <div
        aria-hidden={!active}
        className={[
          "pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden",
          "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          active ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <a
          href={BRAND.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar com a W.VIANA pelo WhatsApp"
          onClick={() =>
            trackEvent("whatsapp_click", {
              cta_location: "floating_bar_mobile",
              contact_channel: "whatsapp",
              link_domain: "wa.me",
              link_path: "/whatsapp",
            })
          }
          tabIndex={active ? 0 : -1}
          className={[
            "pointer-events-auto flex h-14 w-full items-center justify-between",
            "border-t border-white/10 bg-black/85 px-5 backdrop-blur-2xl",
            "active:bg-[#BAAEA4] active:text-black",
            "transition-colors duration-300",
          ].join(" ")}
        >
          <span className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[#BAAEA4]"
            />
            <span className="text-[10px] font-medium tracking-[0.24em] text-white/55 uppercase">
              Disponível
            </span>
          </span>

          <span className="text-[11px] font-medium tracking-[0.22em] text-white uppercase">
            Conversar
          </span>

          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center"
          >
            <ArrowRight
              className="h-4 w-4 text-white"
              strokeWidth={1.5}
            />
          </span>
        </a>
      </div>

      {/* DESKTOP — pílula editorial */}
      <div
        aria-hidden={!active}
        className={[
          "pointer-events-none fixed right-8 bottom-8 z-40 hidden md:block",
          "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          active
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0",
        ].join(" ")}
      >
        <a
          href={BRAND.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar com a W.VIANA pelo WhatsApp"
          onClick={() =>
            trackEvent("whatsapp_click", {
              cta_location: "floating_pill_desktop",
              contact_channel: "whatsapp",
              link_domain: "wa.me",
              link_path: "/whatsapp",
            })
          }
          tabIndex={active ? 0 : -1}
          className={[
            "group pointer-events-auto relative flex h-12 items-center gap-3 overflow-hidden",
            "rounded-full border border-white/10 bg-black/55 px-5 backdrop-blur-xl",
            "transition-colors duration-500 ease-out",
            "hover:bg-[#BAAEA4] hover:text-black",
            "focus-visible:ring-2 focus-visible:ring-[#BAAEA4]",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            "focus-visible:outline-none",
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#BAAEA4] transition-colors duration-500 group-hover:bg-black"
          />

          <span className="text-[10px] font-medium tracking-[0.24em] text-white uppercase transition-colors duration-500 group-hover:text-black">
            Conversar
          </span>

          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center"
          >
            <ArrowUpRight
              className="h-3.5 w-3.5 text-white transition-[transform,color] duration-500 ease-out group-hover:translate-x-[2px] group-hover:-translate-y-[2px] group-hover:text-black"
              strokeWidth={1.5}
            />
          </span>
        </a>
      </div>
    </>
  );
}
