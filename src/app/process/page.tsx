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
      // Reduz a quantidade de scroll vertical necessária — o pin é mais ágil
      // sem cortar a animação. Track ainda percorre 100% do trajeto horizontal.
      const scrollDistance = totalScroll * 0.6;

      // Garante que a progress bar cresce a partir da esquerda — gsap.set fixa o
      // transformOrigin no estilo matrix, evitando que o transform inline seja sobrescrito
      gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${scrollDistance}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      tl.to(track, { x: -totalScroll, ease: "none" }, 0);
      tl.to(progress, { scaleX: 1, ease: "none" }, 0);
    }, container);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main ref={rootRef}>
        {/* Intro — preenche viewport, conteúdo centralizado verticalmente */}
        <section className="flex min-h-screen items-center px-8 pt-24 pb-12 md:px-16 md:pt-28 md:pb-16 lg:px-24">
          <div className="mx-auto w-full max-w-[1800px]">
            <span
              className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Processo
            </span>
            <h1 className="reveal-rise mt-6 max-w-[1200px] text-architectural font-light leading-[1.05] text-foreground">
              Método W. Viana. Arquitetura estruturada.
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

        {/* Horizontal scroll phases */}
        <section ref={horizontalRef} className="relative h-screen overflow-hidden">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="absolute left-0 top-0 z-10 h-[2px] w-full"
            style={{ background: "hsl(var(--accent))" }}
          />

          <div
            ref={trackRef}
            className="flex h-full"
            style={{ width: `${phases.length * 100}vw` }}
          >
            {phases.map((phase, i) => {
              const watermarkOnLeft = i % 2 === 1;
              return (
                <div
                  key={phase.index}
                  className="relative flex h-full w-screen flex-col justify-center px-8 md:px-16 lg:px-24"
                  style={{
                    borderRight: "1px solid hsl(var(--accent) / 0.15)",
                    borderLeft: i === 0 ? "1px solid hsl(var(--accent) / 0.15)" : "none",
                  }}
                >
                  {/* Watermark — alterna lado a cada fase para criar ritmo visual */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute top-1/2 -translate-y-1/2 select-none font-extrabold leading-none ${
                      watermarkOnLeft
                        ? "left-8 md:left-16 lg:left-24"
                        : "right-8 md:right-16 lg:right-24"
                    }`}
                    style={{
                      fontSize: "clamp(8rem, 20vw, 26rem)",
                      color: "hsl(var(--accent) / 0.28)",
                    }}
                  >
                    {phase.index}
                  </span>

                  <div
                    className={`relative max-w-[500px] ${
                      watermarkOnLeft ? "ml-auto md:mr-[15%]" : "ml-0 md:ml-[15%]"
                    }`}
                  >
                    <span
                      className="text-micro uppercase tracking-[0.22em]"
                      style={{ color: "hsl(var(--accent-strong))" }}
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
              );
            })}
          </div>
        </section>

        {/* Deliverables — cabe em 100vh, conteúdo distribuído verticalmente */}
        <section className="flex min-h-screen flex-col px-8 py-12 md:px-16 md:py-16 lg:px-24">
          <div className="mx-auto flex w-full max-w-[1800px] flex-1 flex-col">
            <span
              className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Entregáveis
            </span>

            {/* Lista cresce para preencher o espaço disponível */}
            <div className="mt-6 flex flex-1 flex-col justify-between md:mt-10">
              {deliverables.map((item, i) => (
                <div
                  key={item.title}
                  className="reveal-rise flex items-start gap-6 border-t py-[clamp(0.75rem,1.6vh,1.5rem)] md:gap-8"
                  style={{ borderColor: "hsl(var(--accent) / 0.15)" }}
                >
                  <span
                    className="shrink-0 text-micro uppercase tracking-[0.22em]"
                    style={{ color: "hsl(var(--accent-strong))" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-12">
                    <span className="shrink-0 text-body-lg leading-[1.3] text-foreground md:w-[340px]">
                      {item.title}
                    </span>
                    <span
                      className="leading-[1.5] text-muted-foreground"
                      style={{ fontSize: "clamp(0.9rem, 1.05vw, 1.05rem)" }}
                    >
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
