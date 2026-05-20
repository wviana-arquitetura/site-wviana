"use client";

import { useRef } from "react";
import Image from "next/image";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";
import { getAboutPageJsonLd, getBreadcrumbJsonLd } from "@/lib/seo";

const capabilities = [
  {
    title: "Projeto Arquitetônico",
    description:
      "Responsável por definir toda a concepção construtiva do imóvel — desde a distribuição dos ambientes e circulação até fachadas, volumetria e soluções técnicas da obra.",
  },
  {
    title: "Interiores e Materialidade",
    description:
      "Desenvolvido para transformar os ambientes internos através de soluções personalizadas, definindo layout, mobiliário, iluminação, revestimentos, texturas e materiais que compõem cada espaço.",
  },
];

export default function StudioPage() {
  const rootRef = useRef<HTMLElement>(null);
  const aboutJsonLd = getAboutPageJsonLd();
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Início", path: "/" },
    { name: "Sobre", path: "/sobre" },
  ]);
  useArchitecturalReveal(rootRef);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground">
        <main ref={rootRef}>
          {/* 1. Hero — desktop: foto horizontal + texto na parede / mobile: foto recortada + texto + W watermark */}
          <section className="relative flex min-h-[var(--svh)] flex-col overflow-hidden bg-background md:h-[var(--svh)] md:bg-transparent">
            {/* DESKTOP: Foto de fundo full-bleed */}
            <div className="absolute inset-0 z-0 hidden md:block">
              <Image
                src="/images/team/wellington-viana/sobre-desktop.webp"
                alt="Retrato de Wellington Viana em estúdio, fundador do escritório W.VIANA"
                fill
                priority
                sizes="100vw"
                className="h-full w-full object-cover object-[10%_center]"
              />
            </div>

            {/* MOBILE: foto só na primeira tela (svh) — recorte estável; texto extra rola sobre fundo sólido */}
            <div className="absolute inset-x-0 top-0 z-0 h-[var(--svh)] overflow-hidden md:hidden">
              <Image
                src="/images/team/wellington-viana/sobre-mobile-2.webp"
                alt="Retrato de Wellington Viana em estúdio, fundador do escritório W.VIANA"
                fill
                priority
                sizes="100vw"
                className="h-full w-full object-cover object-right-bottom"
              />
            </div>

            {/* Conteúdo de texto — safe-area + altura compatível com header fixo (h-12 + notch) */}
            <div className="relative z-20 flex min-h-[var(--svh)] flex-col px-4 pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] pt-[calc(env(safe-area-inset-top,0px)+4.25rem)] sm:px-6 md:min-h-0 md:flex-1 md:items-center md:justify-end md:px-12 md:pb-8 md:pt-0 lg:px-16">
              <div className="relative w-full max-w-[34rem] md:ml-auto md:flex md:w-[clamp(34rem,42vw,50rem)] md:max-w-none md:items-center md:pl-8">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-4 right-0 z-0 w-[clamp(20rem,88vw,30rem)] translate-x-[24%] select-none md:hidden"
                  style={{
                    opacity: 0.35,
                    filter:
                      "brightness(0) saturate(100%) invert(38%) sepia(15%) saturate(450%) hue-rotate(355deg) brightness(95%) contrast(85%)",
                  }}
                >
                  <Image
                    src="/images/logos/brand/marca-variacao-07.svg"
                    alt=""
                    width={1000}
                    height={1000}
                    className="h-auto w-full"
                  />
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-4 right-0 z-0 hidden w-[22rem] translate-x-[24%] select-none md:block lg:w-[26rem] xl:w-[30rem] 2xl:w-[34rem]"
                  style={{
                    opacity: 0.35,
                    filter:
                      "brightness(0) saturate(100%) invert(38%) sepia(15%) saturate(450%) hue-rotate(355deg) brightness(95%) contrast(85%)",
                  }}
                >
                  <Image
                    src="/images/logos/brand/marca-variacao-07.svg"
                    alt=""
                    width={1000}
                    height={1000}
                    className="h-auto w-full"
                  />
                </div>
                <div className="relative z-10">
                  <span className="reveal-illuminate text-micro uppercase tracking-[0.22em] [color:hsl(27,38%,22%)] md:[color:hsl(27,22%,38%)]">
                    Sobre
                  </span>
                  <h1
                    className="reveal-rise mt-2 font-extralight leading-[0.95] tracking-tight text-foreground"
                    style={{ fontSize: "clamp(2rem, 4vw, 4.5rem)" }}
                  >
                    Wellington Viana
                  </h1>
                  <p className="reveal-illuminate mt-2 text-micro uppercase tracking-[0.22em] [color:hsl(27,32%,30%)] md:[color:hsl(27,20%,45%)]">
                    Fundador
                  </p>
                  <div className="reveal-draw mt-4 h-px w-20 [background:hsl(27,28%,38%)] md:[background:hsl(27,18%,50%)]" />
                  <div className="mt-4 flex w-full flex-col gap-3 md:mt-5 md:gap-4">
                    <p className="reveal-illuminate text-[clamp(0.75rem,3vw,0.85rem)] leading-[1.55] text-foreground/80 md:text-[clamp(0.95rem,1.15vw,1.2rem)]">
                      Arquitetura, para Wellington, se mede no dia a dia: na luz que entra de
                      manhã, no caminho entre a cozinha e a sala, no canto onde a casa convida a
                      parar. Formado em Arquitetura e Urbanismo pela Universidade de Fortaleza, há
                      mais de 8 anos assina projetos residenciais, comerciais e corporativos que
                      começam pela mesma pergunta — como cada cliente quer viver esse espaço?
                    </p>
                    <p className="reveal-illuminate text-[clamp(0.75rem,3vw,0.85rem)] leading-[1.55] text-foreground/80 md:text-[clamp(0.95rem,1.15vw,1.2rem)]">
                      Sua assinatura é contemporânea, elegante e atemporal: ambientes onde
                      materiais, luz e proporção conversam sem disputar atenção. Sofisticação sem
                      ruído, personalização sem excesso. Projetos feitos para permanecer — e para
                      serem vividos todos os dias.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Em síntese — números e marcas */}
          <section className="flex flex-col px-6 py-20 md:min-h-screen md:justify-center md:px-16 md:py-20 lg:px-24">
            <div className="mx-auto w-full max-w-[1800px]">
              <span
                className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
                style={{ color: "hsl(var(--accent-strong))" }}
              >
                Em síntese
              </span>
              <div className="mt-10 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-0">
                {[
                  { value: "2018", label: "Fundação" },
                  { value: "250+", label: "Projetos" },
                  { value: "Brasil", label: "Atuação" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`reveal-rise flex flex-col items-start gap-4 ${
                      i > 0 ? "md:border-l md:pl-12" : ""
                    }`}
                    style={i > 0 ? { borderColor: "hsl(var(--accent) / 0.2)" } : undefined}
                  >
                    <span
                      className="font-extralight leading-[0.9] text-foreground"
                      style={{ fontSize: "clamp(3rem, 8vw, 8rem)" }}
                    >
                      {stat.value}
                    </span>
                    <span
                      className="text-micro uppercase tracking-[0.22em]"
                      style={{ color: "hsl(var(--accent-strong))" }}
                    >
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Competências — duas frentes do escritório */}
          <section className="flex flex-col px-6 py-20 md:min-h-screen md:justify-center md:px-16 md:py-20 lg:px-24">
            <div className="mx-auto w-full max-w-[1800px]">
              <span
                className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
                style={{ color: "hsl(var(--accent-strong))" }}
              >
                Competências
              </span>
              <div className="mt-10 grid gap-12 md:mt-16 md:grid-cols-2 md:gap-16 lg:gap-24">
                {capabilities.map((cap) => (
                  <div key={cap.title} className="reveal-rise flex flex-col gap-6">
                    <h2
                      className="font-light leading-[1.05] text-foreground"
                      style={{ fontSize: "clamp(2rem, 3.5vw, 3.5rem)" }}
                    >
                      {cap.title}
                    </h2>
                    <div className="h-px w-16" style={{ background: "hsl(var(--accent) / 0.4)" }} />
                    <p className="max-w-[480px] text-body-lg leading-[1.6] text-muted-foreground">
                      {cap.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Endereço — encerramento */}
          <section className="flex flex-col px-6 py-20 md:min-h-screen md:justify-center md:px-16 md:py-20 lg:px-24">
            <div className="mx-auto w-full max-w-[1800px]">
              <span
                className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
                style={{ color: "hsl(var(--accent-strong))" }}
              >
                Endereço
              </span>
              <div className="reveal-rise mt-10 max-w-[1200px]">
                <p
                  className="font-light leading-[1.1] text-foreground"
                  style={{ fontSize: "clamp(2rem, 4vw, 4.5rem)" }}
                >
                  Rua Vicente Linhares, 521
                </p>
                <p className="mt-6 text-body-lg leading-[1.5] text-muted-foreground">
                  Ed. Humberto Santana Business
                  <br />
                  Fortaleza, CE
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
