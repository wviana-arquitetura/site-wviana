/**
 * Decodifica um BlurHash em data:image/png URL pra uso como placeholder
 * do next/image (`placeholder="blur"` + `blurDataURL`).
 *
 * Roda no browser (canvas) com cache em memória pra evitar re-decodar a
 * mesma string múltiplas vezes (galerias longas, troca de slides etc.).
 *
 * Usado por src/components/ui/image-with-reveal.tsx.
 */

import { decode } from "blurhash";

// 32x32 é o suficiente — o navegador estica o blurDataURL e qualquer
// resolução acima disso é desperdício. Esse é o mesmo tamanho que o Next
// usa internamente quando gera blur via `placeholder="blur"`.
const SIZE = 32;

const cache = new Map<string, string>();

export function blurHashToDataURL(blurHash: string | null | undefined): string | undefined {
  if (!blurHash) return undefined;
  const cached = cache.get(blurHash);
  if (cached) return cached;

  // Em ambiente server (SSR), document não existe. next/image aceita
  // blurDataURL apenas no client após hidratação — então retornamos
  // undefined no server e o componente re-renderiza com o blur ao hidratar.
  if (typeof document === "undefined") return undefined;

  try {
    const pixels = decode(blurHash, SIZE, SIZE);
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    const imageData = ctx.createImageData(SIZE, SIZE);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    cache.set(blurHash, dataUrl);
    return dataUrl;
  } catch (error) {
    console.error("[blurhash-client] falhou:", error);
    return undefined;
  }
}
