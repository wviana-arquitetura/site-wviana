"use client";

import { useEffect, useRef } from "react";
import gsap from "@/lib/gsap";
import { ImageWithReveal } from "@/components/ui/image-with-reveal";
import type { ProjectGalleryItem } from "@/types/project";

type ProjectDocumentationProps = {
  gallery: ProjectGalleryItem[];
  slug: string;
};

// Pattern editorial — repete a cada 8 fotos
// "wide-narrow" e "narrow-wide" alternam; "trio" são 3 colunas iguais; "full" é uma só
type LayoutSlot =
  | { kind: "wide-narrow"; count: 2 }
  | { kind: "narrow-wide"; count: 2 }
  | { kind: "trio"; count: 3 }
  | { kind: "full"; count: 1 };

const PATTERN: LayoutSlot[] = [
  { kind: "wide-narrow", count: 2 },
  { kind: "narrow-wide", count: 2 },
  { kind: "trio", count: 3 },
  { kind: "full", count: 1 },
];

// Quebra a galeria em linhas seguindo o pattern, ciclando até consumir todas as fotos
function buildRows(gallery: ProjectGalleryItem[]): {
  slot: LayoutSlot;
  items: ProjectGalleryItem[];
}[] {
  const rows: { slot: LayoutSlot; items: ProjectGalleryItem[] }[] = [];
  let i = 0;
  let p = 0;
  while (i < gallery.length) {
    const slot = PATTERN[p % PATTERN.length];
    const remaining = gallery.length - i;
    // Se não cabe a linha do pattern, encaixa em "wide-narrow" (2) ou "full" (1)
    if (remaining < slot.count) {
      const fallback: LayoutSlot =
        remaining === 2
          ? { kind: "wide-narrow", count: 2 }
          : { kind: "full", count: 1 };
      rows.push({ slot: fallback, items: gallery.slice(i, i + fallback.count) });
      i += fallback.count;
    } else {
      rows.push({ slot, items: gallery.slice(i, i + slot.count) });
      i += slot.count;
    }
    p++;
  }
  return rows;
}

export function ProjectDocumentation({ gallery, slug }: ProjectDocumentationProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rows = buildRows(gallery);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tiles = section.querySelectorAll<HTMLElement>("[data-gallery-tile]");
      tiles.forEach((tile, i) => {
        gsap.fromTo(
          tile,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            delay: (i % 3) * 0.08,
            scrollTrigger: {
              trigger: tile,
              start: "top 88%",
              once: true,
            },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, [slug]);

  return (
    <section ref={sectionRef} className="bg-background">
      <div className="px-8 pb-8 md:px-16 md:pb-12 lg:px-24">
        <div className="mx-auto max-w-[1800px]">
          <span
            className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            Galeria
          </span>
        </div>
      </div>

      <div className="px-8 pb-16 md:px-16 md:pb-24 lg:px-24">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-3 md:gap-4">
          {rows.map((row, rowIdx) => (
            <Row key={`${slug}-row-${rowIdx}`} slot={row.slot} items={row.items} slug={slug} rowIdx={rowIdx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({
  slot,
  items,
  slug,
  rowIdx,
}: {
  slot: LayoutSlot;
  items: ProjectGalleryItem[];
  slug: string;
  rowIdx: number;
}) {
  if (slot.kind === "full") {
    return (
      <Tile
        item={items[0]}
        keyId={`${slug}-r${rowIdx}-0`}
        wrapperClass="w-full"
        // full-width pede uma proporção mais editorial — mantém a foto inteira mas com mais largura
        aspectClass="aspect-[3/2] md:aspect-[16/9]"
        sizes="100vw"
      />
    );
  }

  if (slot.kind === "trio") {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        {items.map((item, i) => (
          <Tile
            key={`${slug}-r${rowIdx}-${i}`}
            keyId={`${slug}-r${rowIdx}-${i}`}
            item={item}
            wrapperClass="w-full"
            aspectClass="aspect-[2/3]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ))}
      </div>
    );
  }

  // wide-narrow ou narrow-wide
  const reverse = slot.kind === "narrow-wide";
  return (
    <div className={`grid grid-cols-1 gap-3 md:gap-4 ${reverse ? "md:grid-cols-[35%_1fr]" : "md:grid-cols-[1fr_35%]"}`}>
      {items.map((item, i) => {
        // No "wide-narrow": item 0 é wide; no "narrow-wide": item 0 é narrow (porque grid coloca narrow primeiro)
        const isWide = reverse ? i === 1 : i === 0;
        return (
          <Tile
            key={`${slug}-r${rowIdx}-${i}`}
            keyId={`${slug}-r${rowIdx}-${i}`}
            item={item}
            wrapperClass="w-full"
            aspectClass={isWide ? "aspect-[3/4] md:aspect-[4/5]" : "aspect-[2/3]"}
            sizes={isWide ? "(max-width: 768px) 100vw, 65vw" : "(max-width: 768px) 100vw, 35vw"}
          />
        );
      })}
    </div>
  );
}

function Tile({
  item,
  keyId,
  wrapperClass,
  aspectClass,
  sizes,
}: {
  item: ProjectGalleryItem;
  keyId: string;
  wrapperClass: string;
  aspectClass: string;
  sizes: string;
}) {
  return (
    <div
      data-gallery-tile
      data-key={keyId}
      className={`relative overflow-hidden ${wrapperClass} ${aspectClass}`}
    >
      <ImageWithReveal
        src={item.src}
        alt={item.alt}
        fill
        sizes={sizes}
        quality={85}
        blurDataURL={item.blurDataURL}
        className="object-cover object-center"
      />
    </div>
  );
}
