"use client";

import { useRef } from "react";
import Image from "next/image";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Void } from "@/components/ui/void";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";

const capabilities = [
  "Projeto Arquitetônico",
  "Interiores & Materialidade",
];

export default function StudioPage() {
  const rootRef = useRef<HTMLElement>(null);
  useArchitecturalReveal(rootRef);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main ref={rootRef}>
        {/* 1. Hero */}
        <section className="relative flex min-h-[var(--svh)] flex-col overflow-hidden pt-20 md:pt-24">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[4%] top-[48%] z-0 hidden -translate-y-1/2 select-none font-extrabold leading-none md:block"
            style={{
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontSize: "clamp(10rem, 22vw, 32rem)",
              color: "hsl(var(--accent) / 0.045)",
            }}
          >
            W
          </span>

          <div className="relative z-10 grid flex-1 grid-cols-1 gap-8 px-6 py-8 md:grid-cols-2 md:gap-12 md:px-12 md:py-12 lg:px-16">
            <div className="reveal-curtain relative flex w-full items-start justify-center md:items-center">
              <Image
                src="/images/team/wellington-viana/retrato.webp"
                alt="Wellington Viana"
                width={1200}
                height={1500}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-auto w-full max-w-[520px] object-contain"
              />
            </div>

            <div className="relative z-10 flex flex-col justify-center">
              <span
                className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
                style={{ color: "hsl(var(--accent))" }}
              >
                Sobre
              </span>
              <h1 className="reveal-rise mt-2 text-2xl font-extralight leading-tight tracking-tight text-foreground md:mt-3 md:text-3xl lg:text-[clamp(1.75rem,2.5vw,2.75rem)]">
                Wellington Viana
              </h1>
              <p
                className="reveal-illuminate mt-2 text-micro uppercase tracking-[0.22em]"
                style={{ color: "hsl(var(--accent))" }}
              >
                Fundador
              </p>
              <div
                className="reveal-draw mt-4 h-px w-full md:mt-5"
                style={{ background: "hsl(var(--accent) / 0.3)" }}
              />
              <div className="mt-4 space-y-3 md:mt-5 md:space-y-3.5">
                <p className="reveal-illuminate text-sm leading-snug text-muted-foreground md:text-base md:leading-relaxed">
                  Formado em Arquitetura e Urbanismo pela Universidade de
                  Fortaleza, Wellington Viana atua há mais de 8 anos
                  transformando espaços em experiências únicas. À frente do
                  seu escritório, construiu uma trajetória marcada pela
                  sensibilidade estética, pela atenção aos detalhes e pela
                  criação de projetos que refletem, de forma autêntica, a
                  essência de cada cliente.
                </p>
                <p className="reveal-illuminate text-sm leading-snug text-muted-foreground md:text-base md:leading-relaxed">
                  Com uma assinatura contemporânea, elegante e atemporal,
                  Wellington acredita que a arquitetura vai muito além da
                  estética: ela precisa traduzir personalidade, despertar
                  sensações e proporcionar bem-estar em cada ambiente. Seus
                  projetos unem funcionalidade, sofisticação e identidade,
                  criando espaços que equilibram conforto, beleza e
                  exclusividade.
                </p>
                <p className="reveal-illuminate text-sm leading-snug text-muted-foreground md:text-base md:leading-relaxed">
                  Cada projeto nasce de uma escuta cuidadosa e de um olhar
                  estratégico sobre o estilo de vida de quem irá vivê-lo. O
                  resultado são ambientes personalizados, pensados nos mínimos
                  detalhes, onde materiais, iluminação, texturas e composição
                  dialogam de forma harmônica para criar experiências únicas.
                </p>
                <p className="reveal-illuminate text-sm leading-snug text-muted-foreground md:text-base md:leading-relaxed">
                  Mais do que projetar espaços, Wellington entrega arquitetura
                  com propósito — ambientes que contam histórias, valorizam
                  vivências e permanecem atuais ao longo do tempo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Void height="8vh" />

        {/* Números */}
        <section className="px-8 py-16 md:px-16 md:py-24 lg:px-24">
          <div className="mx-auto max-w-[1800px]">
            <span
              className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent))" }}
            >
              Números
            </span>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {[
                { value: "2018", label: "Fundação" },
                { value: "250+", label: "Projetos" },
                { value: "Brasil", label: "Atuação" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`reveal-rise flex flex-col items-start gap-2 ${i > 0 ? "md:border-l md:pl-8" : ""}`}
                  style={
                    i > 0
                      ? { borderColor: "hsl(var(--accent) / 0.2)" }
                      : undefined
                  }
                >
                  <span
                    className="font-bold leading-none"
                    style={{
                      fontSize: "clamp(3rem, 8vw, 8rem)",
                      color: "hsl(var(--accent) / 0.2)",
                    }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-micro uppercase tracking-[0.22em] text-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Void height="8vh" />

        {/* Competências */}
        <section className="px-8 md:px-16 lg:px-24">
          <div className="mx-auto max-w-[1800px]">
            <span
              className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent))" }}
            >
              Competências
            </span>
            <div className="mt-8">
              {capabilities.map((cap) => (
                <div
                  key={cap}
                  className="reveal-rise border-t py-5"
                  style={{ borderColor: "hsl(var(--accent) / 0.15)" }}
                >
                  <span className="text-body-lg text-foreground">{cap}</span>
                </div>
              ))}
              <div
                className="border-t"
                style={{ borderColor: "hsl(var(--accent) / 0.15)" }}
              />
            </div>
          </div>
        </section>

        <Void height="8vh" />

        {/* Endereço */}
        <section className="px-8 pb-32 md:px-16 lg:px-24">
          <div className="mx-auto max-w-[1800px]">
            <span
              className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent))" }}
            >
              Endereço
            </span>
            <div className="reveal-rise mt-6">
              <p className="text-architectural font-light leading-[1.15] text-foreground">
                Rua Vicente Linhares, 521
              </p>
              <p className="mt-2 text-body-lg text-muted-foreground">
                Ed. Humberto Santana Business — Fortaleza, CE
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
