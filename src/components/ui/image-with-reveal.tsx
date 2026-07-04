"use client";

import { forwardRef, useCallback, useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * Wrapper sobre next/image que usa BlurHash decodado (data:image/png) como
 * placeholder progressivo via `placeholder="blur"` nativo do Next. A foto
 * "nasce" com cores e formas reais (não com placeholder genérico) e cresce
 * em nitidez quando o arquivo full carrega.
 *
 * Fallback elegante: se `blurDataURL` não vier (imagem legada sem backfill,
 * ou geração falhou no upload), renderiza um fundo neutro de marca pra não
 * mostrar vazio puro.
 *
 * O blurDataURL é gerado no servidor (lib/blurhash-server.ts), preferencialmente
 * dentro de um cache (ver projects.service.ts) — decodificar no client não
 * serviria: o placeholder só apareceria após a hidratação.
 */
type ImageWithRevealProps = Omit<ImageProps, "onLoad" | "placeholder"> & {
  /** data:image/png decodado de BlurHash (32x32). Quando ausente, mostra
   *  fundo neutro. */
  blurDataURL?: string;
  /** Callback quando a foto termina de carregar. */
  onLoaded?: () => void;
};

export const ImageWithReveal = forwardRef<HTMLImageElement, ImageWithRevealProps>(
  function ImageWithReveal(
    { blurDataURL, onLoaded, className, style, ...imageProps },
    ref,
  ) {
    const [loaded, setLoaded] = useState(false);

    const handleLoad = useCallback(() => {
      setLoaded(true);
      onLoaded?.();
    }, [onLoaded]);

    // Sem blurDataURL: pinta o fundo da marca como rede de segurança.
    const showFallback = !blurDataURL && !loaded;

    return (
      <>
        {showFallback && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundColor: "hsl(var(--accent))",
              transition: "opacity 400ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        )}

        {/* alt vem via ...imageProps (obrigatório por tipo ImageProps). */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          ref={ref}
          {...imageProps}
          onLoad={handleLoad}
          // O placeholder="blur" do next/image pinta o blurDataURL ATRÁS do
          // <img> e dispara um fade in nativo quando o arquivo chega. É o
          // que faz o efeito acontecer antes mesmo da hidratação.
          {...(blurDataURL
            ? { placeholder: "blur" as const, blurDataURL }
            : {})}
          className={className}
          style={style}
        />
      </>
    );
  },
);
