"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "@/lib/gsap";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Void } from "@/components/ui/void";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";

const phases = [
  {
    index: "01",
    title: "Imersão e Diagnóstico",
    description:
      "Entendimento profundo da operação e identidade do cliente.",
  },
  {
    index: "02",
    title: "Estratégia Espacial",
    description:
      "Definição de fluxos, layout e organização funcional.",
  },
  {
    index: "03",
    title: "Conceito e Visualização",
    description:
      "Apresentação do projeto em 3D realista para validação.",
  },
  {
    index: "04",
    title: "Projeto Executivo",
    description:
      "Documentação técnica completa para execução sem imprevistos.",
  },
  {
    index: "05",
    title: "Planejamento Orçamentário",
    description:
      "Orçamentação estruturada e nivelação de fornecedores.",
  },
  {
    index: "06",
    title: "Acompanhamento Técnico",
    description:
      "Visitas estratégicas para garantir fidelidade ao projeto.",
  },
  {
    index: "07",
    title: "Produção Final",
    description:
      "Refinamento do projeto concluído, para garantir a excelência do resultado final.",
  },
];

const deliverables = [
  {
    title: "Layout Inteligente dos Ambientes",
    description:
      "Estudo estratégico da distribuição dos espaços para garantir funcionalidade, conforto, circulação eficiente e melhor aproveitamento da área.",
  },
  {
    title: "Perspectivas 3D Realistas",
    description:
      "Visualizações fiéis do projeto com iluminação, materiais, texturas e composição dos ambientes, permitindo que você enxergue o resultado final antes da execução da obra.",
  },
  {
    title: "Projeto Executivo de Obra",
    description:
      "Conjunto completo de desenhos técnicos para orientar a obra com precisão, incluindo plantas, cortes, detalhamentos e especificações necessárias para a execução.",
  },
  {
    title: "Projeto Executivo de Marcenaria",
    description:
      "Detalhamento técnico personalizado de móveis planejados, com medidas e especificação de acabamentos pensados para cada ambiente.",
  },
  {
    title: "Planilha Orçamentária",
    description:
      "Levantamento organizado dos custos da obra, auxiliando no planejamento financeiro e na tomada de decisões com mais segurança e previsibilidade.",
  },
];

const TOTAL_PHASES = String(phases.length).padStart(2, "0");

export default function ProcessPage() {
  const rootRef = useRef<HTMLElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useArchitecturalReveal(rootRef);

  useLayoutEffect(() => {
    const container = horizontalRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    if (!container || !track || !progress) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const totalScroll = track.scrollWidth - container.offsetWidth;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${totalScroll}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      tl.to(track, { x: -totalScroll, ease: "none" }, 0);
      tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
    }, container);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main ref={rootRef}>
        {/* Intro */}
        <section className="px-8 pt-36 pb-24 md:px-16 md:pt-44 md:pb-32 lg:px-24">
          <div className="mx-auto max-w-[1800px]">
            <span
              className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent))" }}
            >
              Processo
            </span>
            <h1 className="reveal-rise mt-6 max-w-[1000px] text-architectural font-light leading-[1.05] text-foreground">
              Método W.Viana. Arquitetura estruturada.
            </h1>
            <p className="reveal-illuminate mt-8 max-w-[600px] text-body-lg text-muted-foreground">
              Nosso método foi estruturado para que você tenha clareza,
              previsibilidade e tranquilidade do início ao fim.
            </p>
            <div
              className="reveal-draw mt-12 h-px w-full"
              style={{ background: "hsl(var(--accent) / 0.3)" }}
            />
          </div>
        </section>

        <Void height="8vh" />

        {/* Horizontal scroll phases */}
        <section ref={horizontalRef} className="relative h-screen overflow-hidden">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="absolute left-0 top-0 z-10 h-[2px] w-full"
            style={{
              background: "hsl(var(--accent))",
              transformOrigin: "left",
              transform: "scaleX(0)",
            }}
          />

          <div
            ref={trackRef}
            className="flex h-full"
            style={{ width: `${phases.length * 100}vw` }}
          >
            {phases.map((phase, i) => (
              <div
                key={phase.index}
                className="relative flex h-full w-screen flex-col justify-center px-8 md:px-16 lg:px-24"
                style={{
                  borderRight:
                    i < phases.length - 1
                      ? "1px solid hsl(var(--accent) / 0.15)"
                      : "none",
                }}
              >
                {/* Watermark */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 select-none font-extrabold leading-none md:left-16 lg:left-24"
                  style={{
                    fontSize: "clamp(6rem, 15vw, 20rem)",
                    color: "hsl(var(--accent) / 0.06)",
                  }}
                >
                  {phase.index}
                </span>

                <div className="relative ml-0 max-w-[500px] md:ml-[15%]">
                  <span
                    className="text-micro uppercase tracking-[0.22em]"
                    style={{ color: "hsl(var(--accent))" }}
                  >
                    Fase {phase.index} / {TOTAL_PHASES}
                  </span>

                  <div
                    className="mt-4 h-px w-16"
                    style={{ background: "hsl(var(--accent) / 0.3)" }}
                  />

                  <h2 className="mt-6 text-architectural font-light text-foreground">
                    {phase.title}
                  </h2>
                  <p className="mt-6 max-w-[440px] text-body-lg text-muted-foreground">
                    {phase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Void height="15vh" />

        {/* Deliverables */}
        <section className="px-8 py-24 md:px-16 md:py-32 lg:px-24">
          <div className="mx-auto max-w-[1800px]">
            <span
              className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent))" }}
            >
              Entregáveis
            </span>
            <div className="mt-8">
              {deliverables.map((item, i) => (
                <div
                  key={item.title}
                  className="reveal-rise flex items-baseline gap-6 border-t py-6 md:gap-8 md:py-8"
                  style={{ borderColor: "hsl(var(--accent) / 0.15)" }}
                >
                  <span
                    className="shrink-0 text-micro uppercase tracking-[0.22em]"
                    style={{ color: "hsl(var(--accent) / 0.5)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-8">
                    <span className="shrink-0 text-body-lg text-foreground md:w-[260px]">
                      {item.title}
                    </span>
                    <span className="text-caption text-muted-foreground md:text-body-lg">
                      {item.description}
                    </span>
                  </div>
                </div>
              ))}
              <div className="border-t" style={{ borderColor: "hsl(var(--accent) / 0.15)" }} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
