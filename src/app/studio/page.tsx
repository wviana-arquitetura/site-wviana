"use client";

import { useRef } from "react";
import Image from "next/image";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";

const capabilities = [
  {
    title: "Projeto Arquitetônico",
    description:
      "Concepção espacial, partido arquitetônico, estudos preliminares e projeto executivo completo, traduzindo o estilo de vida do cliente em soluções funcionais e atemporais.",
  },
  {
    title: "Interiores & Materialidade",
    description:
      "Curadoria de materiais, acabamentos, mobiliário e iluminação. Projetos de interiores com identidade própria, equilibrando conforto, estética e propósito.",
  },
];

export default function StudioPage() {
  const rootRef = useRef<HTMLElement>(null);
  useArchitecturalReveal(rootRef);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main ref={rootRef}>
        {/* 1. Hero — desktop: foto horizontal + texto na parede / mobile: foto recortada + texto + W watermark */}
        <section className="relative flex flex-col overflow-hidden md:h-[var(--svh)]">
          {/* DESKTOP: Foto de fundo full-bleed */}
          <div className="absolute inset-0 z-0 hidden md:block">
            <Image
              src="/images/team/wellington-viana/Gemini_Generated_Image_3ecq1a3ecq1a3ecq.png"
              alt="Wellington Viana"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* DESKTOP: Marca d'água brand-7 atrás do texto */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-4%] bottom-[10%] z-10 hidden select-none md:block"
            style={{
              width: "clamp(18rem, 32vw, 44rem)",
              opacity: 0.35,
              filter:
                "brightness(0) saturate(100%) invert(38%) sepia(15%) saturate(450%) hue-rotate(355deg) brightness(95%) contrast(85%)",
            }}
          >
            <Image
              src="/images/logos/brand/brand-7.svg"
              alt=""
              width={1000}
              height={1000}
              className="h-auto w-full"
            />
          </div>

          {/* MOBILE: Foto vertical full-bleed — Wellington embaixo, espaço pra texto acima */}
          <div className="absolute inset-0 z-0 md:hidden">
            <Image
              src="/images/team/wellington-viana/capa-vertical.png"
              alt="Wellington Viana"
              fill
              priority
              sizes="100vw"
              className="object-cover object-bottom"
            />
          </div>

          {/* MOBILE: Marca d'água brand-7 ancorada ao centro-direita, atrás do texto */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-12%] top-[20%] z-10 -translate-y-1/2 select-none md:hidden"
            style={{
              width: "clamp(14rem, 70vw, 22rem)",
              opacity: 0.22,
              filter:
                "brightness(0) saturate(100%) invert(38%) sepia(15%) saturate(450%) hue-rotate(355deg) brightness(95%) contrast(85%)",
            }}
          >
            <Image
              src="/images/logos/brand/brand-7.svg"
              alt=""
              width={1000}
              height={1000}
              className="h-auto w-full"
            />
          </div>

          {/* Conteúdo de texto */}
          <div className="relative z-20 flex min-h-[var(--svh)] flex-col px-6 pb-12 pt-24 md:min-h-0 md:flex-1 md:items-center md:justify-end md:px-12 md:pb-0 md:pt-0 md:py-20 lg:px-16">
            <div className="relative w-full md:ml-auto md:flex md:items-center md:max-w-[55%] md:pl-8 lg:max-w-[50%]">
              <div className="relative z-10 [&_*]:[text-shadow:0_1px_12px_rgba(242,242,242,0.6),0_0_4px_rgba(242,242,242,0.4)] md:[&_*]:[text-shadow:none]">
                <span
                  className="reveal-illuminate text-micro uppercase tracking-[0.22em] [color:hsl(27,38%,22%)] md:[color:hsl(27,22%,38%)]"
                >
                  Sobre
                </span>
                <h1
                  className="reveal-rise mt-2 font-extralight leading-[0.95] tracking-tight text-foreground"
                  style={{ fontSize: "clamp(2rem, 4vw, 4.5rem)" }}
                >
                  Wellington Viana
                </h1>
                <p
                  className="reveal-illuminate mt-2 text-micro uppercase tracking-[0.22em] [color:hsl(27,32%,30%)] md:[color:hsl(27,20%,45%)]"
                >
                  Fundador
                </p>
                <div
                  className="reveal-draw mt-4 h-px w-20 [background:hsl(27,28%,38%)] md:[background:hsl(27,18%,50%)]"
                />
                <div className="mt-4 flex flex-col gap-3 md:mt-5 md:gap-4">
                  <p
                    className="reveal-illuminate leading-[1.55] text-foreground/80"
                    style={{ fontSize: "clamp(0.95rem, 1.15vw, 1.2rem)" }}
                  >
                    Formado em Arquitetura e Urbanismo pela Universidade de
                    Fortaleza, Wellington Viana atua há mais de 8 anos
                    transformando espaços em experiências únicas. À frente do
                    seu escritório, construiu uma trajetória marcada pela
                    sensibilidade estética e pela criação de projetos que
                    refletem, de forma autêntica, a essência de cada cliente.
                  </p>
                  <p
                    className="reveal-illuminate leading-[1.55] text-foreground/80"
                    style={{ fontSize: "clamp(0.95rem, 1.15vw, 1.2rem)" }}
                  >
                    Com assinatura contemporânea, elegante e atemporal,
                    acredita que a arquitetura precisa traduzir personalidade,
                    despertar sensações e proporcionar bem-estar em cada
                    ambiente.
                  </p>
                  <p
                    className="reveal-illuminate leading-[1.55] text-foreground/80"
                    style={{ fontSize: "clamp(0.95rem, 1.15vw, 1.2rem)" }}
                  >
                    Mais do que projetar espaços, entrega arquitetura com
                    propósito — ambientes que contam histórias, valorizam
                    vivências e permanecem atuais ao longo do tempo.
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
                  style={
                    i > 0
                      ? { borderColor: "hsl(var(--accent) / 0.2)" }
                      : undefined
                  }
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
                <div
                  key={cap.title}
                  className="reveal-rise flex flex-col gap-6"
                >
                  <h2
                    className="font-light leading-[1.05] text-foreground"
                    style={{ fontSize: "clamp(2rem, 3.5vw, 3.5rem)" }}
                  >
                    {cap.title}
                  </h2>
                  <div
                    className="h-px w-16"
                    style={{ background: "hsl(var(--accent) / 0.4)" }}
                  />
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
      <SiteFooter />
    </div>
  );
}
