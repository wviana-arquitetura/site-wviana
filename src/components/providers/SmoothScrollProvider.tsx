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
    // Desabilita scroll restoration do navegador: quando ativo, o navegador restaura
    // a posição salva no histórico no próximo frame, sobrescrevendo nosso reset
    // e fazendo a página abrir no meio em vez de no topo.
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

  // Reset de scroll a cada mudança de rota.
  //
  // O Next.js App Router usa template.tsx que remonta o conteúdo a cada navegação,
  // e o Lenis perde sincronia com o DOM real (o scrollTop do <html> permanece
  // do projeto anterior). Por isso o lenis.scrollTo(0) funciona uma vez,
  // mas algo "restaura" o scroll na sequência da renderização da nova rota.
  //
  // Solução em camadas:
  // 1. Força scrollTop do <html> e <body> direto, sem passar pelo Lenis
  // 2. Chama lenis.scrollTo(0) para alinhar o estado interno do Lenis
  // 3. Chama lenis.resize() para que o Lenis recalcule as dimensões da nova página
  // 4. Repete o reset por mais alguns frames (a página pode estar montando)
  useEffect(() => {
    const forceReset = () => {
      // Força o DOM direto — fonte mais autoritativa que o Lenis
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
      // Re-sincroniza o Lenis com o DOM
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true });
        // resize() força o Lenis a recalcular scrollHeight da nova página
        lenis.resize();
      }
    };

    forceReset();

    // Reset em múltiplos frames seguintes — o React App Router renderiza a nova
    // página de forma assíncrona, e o documento pode crescer/encolher conforme
    // os componentes montam (especialmente as imagens com sizes/aspect)
    const rafIds: number[] = [];
    [1, 2, 3].forEach((n) => {
      const id = requestAnimationFrame(() => {
        if (n === 1) {
          requestAnimationFrame(() => {
            forceReset();
          });
        } else {
          forceReset();
        }
      });
      rafIds.push(id);
    });

    ScrollTrigger.refresh();

    const checks: number[] = [];
    [50, 200, 500, 1000].forEach((ms) => {
      const id = window.setTimeout(() => {
        // Se ainda não está no topo após X ms, força de novo
        const y = window.scrollY;
        if (y > 5) {
          forceReset();
        }
      }, ms);
      checks.push(id);
    });

    return () => {
      rafIds.forEach((id) => cancelAnimationFrame(id));
      checks.forEach((id) => window.clearTimeout(id));
    };
  }, [pathname]);

  return children;
}
