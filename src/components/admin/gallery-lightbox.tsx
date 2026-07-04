"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "./gallery-editor";

type GalleryLightboxProps = {
  items: GalleryItem[];
  /** Índice da imagem aberta; null = fechado. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
};

/**
 * Lightbox de conferência da galeria do painel. Amplia a imagem clicada,
 * contida no maior retângulo que cabe na viewport, sobre fundo escuro. Permite
 * navegar por toda a galeria (setas na tela, ◀ ▶ no teclado, Esc pra fechar) e
 * mostra o alt text + posição.
 *
 * O "palco" é dimensionado ao retângulo EXATO da foto (calculado a partir do
 * espaço disponível + proporção real da imagem). Assim o crossfade, o loader e
 * o scrim ficam confinados à foto — não à tela inteira.
 *
 * Troca suave (crossfade com pré-carregamento): ao navegar, a imagem atual
 * PERMANECE na tela; a próxima carrega escondida e, só quando está pronta,
 * fazemos o fade de uma pra outra. Duas camadas:
 *  - `shownIndex`   → a imagem que está de fato na tela.
 *  - `incomingIndex` → o alvo sendo pré-carregado por baixo dos panos.
 * Contador e legenda seguem `shownIndex`, então tudo troca junto, no momento
 * certo.
 *
 * Usa as primitivas do Radix Dialog só pelo que dão de graça: portal, trava de
 * foco, Esc e travar o scroll do fundo. O layout é todo custom.
 */
export function GalleryLightbox({
  items,
  index,
  onIndexChange,
}: GalleryLightboxProps) {
  const open = index !== null;
  const total = items.length;

  const [shownIndex, setShownIndex] = useState(0);
  const [shownLoaded, setShownLoaded] = useState(false);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [incomingLoaded, setIncomingLoaded] = useState(false);
  const [prevIndex, setPrevIndex] = useState<number | null>(index);

  // Proporção (largura/altura) da imagem VISÍVEL — o palco é dimensionado por
  // ela. Capturada no onLoad. A da incoming fica guardada no ref e é promovida
  // junto com a imagem.
  const [aspect, setAspect] = useState<number | null>(null);
  const incomingAspectRef = useRef<number | null>(null);

  // Espaço disponível pro palco (área central, já descontado padding/setas).
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });

  // Ajuste de estado na fase de render (padrão do React p/ reagir a mudança de
  // prop sem flash): decide o que fazer quando o índice-alvo muda.
  if (index !== prevIndex) {
    setPrevIndex(index);
    if (index === null) {
      setIncomingIndex(null);
      setIncomingLoaded(false);
    } else if (prevIndex === null) {
      // Abrindo do zero: snap direto no alvo.
      setShownIndex(index);
      setShownLoaded(false);
      setIncomingIndex(null);
      setIncomingLoaded(false);
    } else if (index === shownIndex) {
      setIncomingIndex(null);
      setIncomingLoaded(false);
    } else {
      // Navegação: pré-carrega a próxima mantendo a atual visível.
      setIncomingIndex(index);
      setIncomingLoaded(false);
    }
  }

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setStage({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  // Navegação circular — sempre relativa à imagem VISÍVEL.
  const go = useCallback(
    (delta: number) => {
      if (total === 0) return;
      onIndexChange((shownIndex + delta + total) % total);
    },
    [shownIndex, total, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  // Fim do fade-in da incoming → promove a shown (imagem, proporção, contador,
  // legenda trocam juntos, sem piscar: a foto já está em cache).
  const promoteIncoming = () => {
    if (incomingIndex === null) return;
    setShownIndex(incomingIndex);
    setShownLoaded(true);
    if (incomingAspectRef.current) setAspect(incomingAspectRef.current);
    setIncomingIndex(null);
    setIncomingLoaded(false);
  };

  if (index === null) return null;

  const currentItem = items[shownIndex];
  if (!currentItem) return null;
  const incomingItem = incomingIndex !== null ? items[incomingIndex] : null;

  const showLoader =
    incomingIndex !== null ? !incomingLoaded : !shownLoaded;

  // Retângulo "contido": o maior box com a proporção da foto que cabe no palco.
  // Sem proporção ainda (1ª imagem carregando), usa o palco inteiro.
  let boxW = stage.w;
  let boxH = stage.h;
  if (aspect && stage.w > 0 && stage.h > 0) {
    if (stage.w / stage.h > aspect) {
      boxH = stage.h;
      boxW = stage.h * aspect;
    } else {
      boxW = stage.w;
      boxH = stage.w / aspect;
    }
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onIndexChange(null);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={() => onIndexChange(null)}
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">
            Visualização ampliada da imagem {shownIndex + 1} de {total}
          </DialogPrimitive.Title>

          {/* Barra superior: contador + fechar */}
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <span className="text-micro uppercase tracking-[0.18em] text-white/70">
              {shownIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => onIndexChange(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Área central: mede o espaço; o palco (box da foto) é centralizado */}
          <div
            ref={stageRef}
            className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-4"
          >
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/15 hover:text-white sm:left-4"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Palco: dimensionado ao retângulo EXATO da foto. Tudo (imagens,
                crossfade, loader, scrim) fica confinado aqui dentro. */}
            <div
              className="relative"
              style={{ width: boxW || "100%", height: boxH || "100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Camada base: imagem atual (some por fade só quando a próxima
                  já apareceu por cima). */}
              <Image
                key={currentItem.src}
                src={currentItem.src}
                alt={currentItem.alt || `Imagem ${shownIndex + 1}`}
                fill
                sizes="90vw"
                className="object-contain transition-opacity duration-500 ease-out"
                style={{
                  opacity: shownLoaded ? (incomingLoaded ? 0 : 1) : 0,
                }}
                priority
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalHeight > 0) {
                    setAspect(img.naturalWidth / img.naturalHeight);
                  }
                  setShownLoaded(true);
                }}
              />

              {/* Camada de cima: próxima imagem, pré-carregando escondida.
                  Fade-in quando pronta e, no fim, vira a nova base. */}
              {incomingItem && (
                <Image
                  key={incomingItem.src}
                  src={incomingItem.src}
                  alt=""
                  fill
                  sizes="90vw"
                  className="object-contain transition-opacity duration-500 ease-out"
                  style={{ opacity: incomingLoaded ? 1 : 0 }}
                  priority
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    incomingAspectRef.current =
                      img.naturalHeight > 0
                        ? img.naturalWidth / img.naturalHeight
                        : null;
                    setIncomingLoaded(true);
                  }}
                  onTransitionEnd={(e) => {
                    if (e.propertyName === "opacity" && incomingLoaded) {
                      promoteIncoming();
                    }
                  }}
                />
              )}

              {/* Loader delicado: logo oficial (invertida p/ branco) + barra
                  fina enchendo. Confinado ao retângulo da foto, sobre a imagem
                  atual (que continua ali). */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 transition-opacity duration-300 ease-out"
                style={{ opacity: showLoader ? 1 : 0 }}
              >
                <Image
                  src="/images/logos/brand/marca-variacao-07.svg"
                  alt=""
                  width={1920}
                  height={1080}
                  className="h-auto w-28 object-contain sm:w-32"
                  style={{ filter: "invert(1)", opacity: 0.85 }}
                  priority
                />
                <span className="h-px w-16 overflow-hidden bg-white/15">
                  <span className="wmark-bar block h-full w-full bg-white/70" />
                </span>
              </span>
            </div>

            {total > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/15 hover:text-white sm:right-4"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Legenda: alt text da imagem visível */}
          <div
            className="px-4 py-5 text-center sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mx-auto max-w-3xl text-caption leading-relaxed text-white/80">
              {currentItem.alt?.trim() || (
                <span className="text-white/40">Sem descrição (alt text)</span>
              )}
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
