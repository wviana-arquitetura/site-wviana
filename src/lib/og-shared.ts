import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { ImageResponse } from "next/og";

/**
 * Converte o PNG do `ImageResponse` em JPEG mais leve. Crawlers (Twitter/LinkedIn/WhatsApp)
 * preferem preview <500KB; fotos viram PNG enorme (1MB+), JPEG resolve.
 */
export async function imageResponseToJpeg(
  response: ImageResponse,
  quality = 84,
): Promise<Response> {
  const pngBuffer = Buffer.from(await response.arrayBuffer());
  const jpeg = await sharp(pngBuffer)
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}

const FONTS_DIR = path.join(process.cwd(), "src/fonts");
const PUBLIC_DIR = path.join(process.cwd(), "public");

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

export const OG_FONT = {
  body: "Aeonik",
  display: "Agrandir Narrow",
} as const;

type OgFontWeight = 300 | 400 | 500 | 700 | 800;

type OgFontEntry = {
  name: string;
  data: ArrayBuffer;
  weight: OgFontWeight;
  style: "normal";
};

let cachedFonts: OgFontEntry[] | null = null;

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

export async function loadOgFonts(): Promise<OgFontEntry[]> {
  if (cachedFonts) return cachedFonts;

  const [aeonikLight, aeonikRegular, aeonikBold, agrandir] = await Promise.all([
    readFile(path.join(FONTS_DIR, "AeonikTRIAL-Light.otf")),
    readFile(path.join(FONTS_DIR, "AeonikTRIAL-Regular.otf")),
    readFile(path.join(FONTS_DIR, "AeonikTRIAL-Bold.otf")),
    readFile(path.join(FONTS_DIR, "Agrandir-Narrow.otf")),
  ]);

  cachedFonts = [
    { name: OG_FONT.body, data: bufferToArrayBuffer(aeonikLight), weight: 300, style: "normal" },
    { name: OG_FONT.body, data: bufferToArrayBuffer(aeonikRegular), weight: 400, style: "normal" },
    { name: OG_FONT.body, data: bufferToArrayBuffer(aeonikRegular), weight: 500, style: "normal" },
    { name: OG_FONT.body, data: bufferToArrayBuffer(aeonikBold), weight: 700, style: "normal" },
    { name: OG_FONT.display, data: bufferToArrayBuffer(agrandir), weight: 300, style: "normal" },
    { name: OG_FONT.display, data: bufferToArrayBuffer(agrandir), weight: 400, style: "normal" },
    { name: OG_FONT.display, data: bufferToArrayBuffer(agrandir), weight: 700, style: "normal" },
    { name: OG_FONT.display, data: bufferToArrayBuffer(agrandir), weight: 800, style: "normal" },
  ];

  return cachedFonts;
}

const logoCache = new Map<string, string>();

export async function loadLogoAsDataUrl(fillColor: string): Promise<string | null> {
  const cached = logoCache.get(fillColor);
  if (cached) return cached;

  try {
    const filePath = path.join(PUBLIC_DIR, "images/logos/brand/marca-variacao-02.svg");
    const svgText = await readFile(filePath, "utf-8");

    const recolored = svgText.replace(
      /\.cls-1\{[^}]*\}/,
      `.cls-1{stroke-width:0px;fill:${fillColor};}`,
    );

    const png = await sharp(Buffer.from(recolored), { density: 400 })
      .trim()
      .png()
      .toBuffer();

    const dataUrl = `data:image/png;base64,${png.toString("base64")}`;
    logoCache.set(fillColor, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

export async function loadCoverAsDataUrl(relativeSrc: string): Promise<string | null> {
  try {
    const filePath = path.join(PUBLIC_DIR, relativeSrc.replace(/^\//, ""));
    const buffer = await readFile(filePath);

    const jpeg = await sharp(buffer)
      .resize(OG_SIZE.width, OG_SIZE.height, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function loadAboutImageAsDataUrl(
  candidates: readonly string[],
  cropWidth: number,
): Promise<string | null> {
  for (const src of candidates) {
    try {
      const filePath = path.join(PUBLIC_DIR, src.replace(/^\//, ""));
      const buffer = await readFile(filePath);

      const jpeg = await sharp(buffer)
        .resize(cropWidth, OG_SIZE.height, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: 84, mozjpeg: true })
        .toBuffer();

      return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
    } catch {
      continue;
    }
  }

  return null;
}

export async function loadMarkAsDataUrl(fillColor: string): Promise<string | null> {
  try {
    const filePath = path.join(PUBLIC_DIR, "images/logos/brand/marca-variacao-07.svg");
    const svgText = await readFile(filePath, "utf-8");

    const recolored = svgText.replace(
      /<svg\b([^>]*)>/,
      `<svg$1><style>*{fill:${fillColor}!important;stroke:${fillColor}!important;}</style>`,
    );

    const png = await sharp(Buffer.from(recolored), { density: 400 })
      .trim()
      .png()
      .toBuffer();

    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}
