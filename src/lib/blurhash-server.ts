/**
 * Geração de BlurHash no servidor a partir de um Buffer de imagem.
 *
 * BlurHash é uma codificação base83 (~20-30 chars) de uma versão minúscula
 * da imagem usando DCT. Decodada no front pra um SVG/canvas, dá um placeholder
 * progressivo com as cores e formas reais da foto — leve, sem rede.
 *
 * Usado por src/app/admin/_actions/upload.ts no fluxo de upload, e pelo
 * script de backfill (scripts/backfill-blurhash.ts).
 *
 * Falha silenciosamente: se algo der errado, devolve null e o front cai
 * pra fundo neutro. Não bloqueia upload nem quebra a página.
 */

import sharp from "sharp";
import { decode, encode } from "blurhash";

// Componentes 4x3 dão um equilíbrio bom entre fidelidade (~24 chars) e custo
// de decodificação. Valores recomendados pela própria lib.
const COMPONENTS_X = 4;
const COMPONENTS_Y = 3;

// Reduzimos a imagem de origem pra 32px no lado maior antes de codificar —
// a entrada do encode é o que ele "vê", não precisa de mais. Quanto menor,
// mais rápido.
const SAMPLE_MAX = 32;

/**
 * Decodifica um BlurHash em data:image/png URL diretamente no servidor (sharp).
 * Por rodar em Server Components, o blur entra no HTML inicial, antes da
 * hidratação. É o que faz o `placeholder="blur"` do next/image valer a pena.
 *
 * Síncrono o suficiente pra rodar em listas, mas usar com parcimônia: cada
 * chamada faz 1 decode + sharp raw → PNG. Em galerias longas, vale memoizar
 * por slug+hash em unstable_cache antes (já é o caso de getAllProjects).
 */
const decodeCache = new Map<string, string>();

export async function blurHashToDataURLServer(
  blurHash: string | null | undefined,
): Promise<string | undefined> {
  if (!blurHash) return undefined;
  const cached = decodeCache.get(blurHash);
  if (cached) return cached;

  try {
    // Mesmo tamanho do decoder de client — o navegador estica de qualquer jeito.
    const SIZE = 32;
    const pixels = decode(blurHash, SIZE, SIZE);
    // pixels é Uint8ClampedArray RGBA → reconstrói imagem com sharp e exporta PNG.
    const png = await sharp(Buffer.from(pixels), {
      raw: { width: SIZE, height: SIZE, channels: 4 },
    })
      .png()
      .toBuffer();
    const dataUrl = `data:image/png;base64,${png.toString("base64")}`;
    decodeCache.set(blurHash, dataUrl);
    return dataUrl;
  } catch (error) {
    console.error("[blurhash-server] decode falhou:", error);
    return undefined;
  }
}

export async function generateBlurHash(
  source: Buffer | sharp.Sharp,
): Promise<string | null> {
  try {
    const pipeline = (Buffer.isBuffer(source) ? sharp(source) : source.clone())
      .rotate()
      .resize({
        width: SAMPLE_MAX,
        height: SAMPLE_MAX,
        fit: "inside",
        withoutEnlargement: false,
      })
      .raw()
      .ensureAlpha();

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

    return encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      COMPONENTS_X,
      COMPONENTS_Y,
    );
  } catch (error) {
    console.error("[blurhash-server] falhou:", error);
    return null;
  }
}
