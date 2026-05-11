import Image from "next/image";

const BRAND_LOGOS = [
  { src: "/images/logos/brand/marca-variacao-01.svg", alt: "Variação 1 da marca W.VIANA" },
  { src: "/images/logos/brand/marca-variacao-02.svg", alt: "Variação 2 da marca W.VIANA" },
  { src: "/images/logos/brand/marca-variacao-03.svg", alt: "Variação 3 da marca W.VIANA" },
  { src: "/images/logos/brand/marca-variacao-04.svg", alt: "Variação 4 da marca W.VIANA" },
  { src: "/images/logos/brand/marca-variacao-05.svg", alt: "Variação 5 da marca W.VIANA" },
  { src: "/images/logos/brand/marca-variacao-06.svg", alt: "Variação 6 da marca W.VIANA" },
  { src: "/images/logos/brand/marca-variacao-07.svg", alt: "Variação 7 da marca W.VIANA" },
];

export function LogoWallSection() {
  return (
    <section className="bg-background px-8 md:px-16 lg:px-24">
      <div className="mx-auto w-full max-w-[1800px] border-y border-border/60 py-14 md:py-16">
        <p
          className="text-center text-micro uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Assinatura e variações da marca
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {BRAND_LOGOS.map((logo) => (
            <li
              key={logo.src}
              className="flex h-24 items-center justify-center rounded-sm border border-border/40 bg-background/70 px-4 md:h-28"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={1920}
                height={1080}
                className="h-10 w-auto opacity-90 transition-opacity duration-300 hover:opacity-100 md:h-12"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
