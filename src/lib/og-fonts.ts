import { readFile } from "node:fs/promises";
import path from "node:path";

const FONTS_DIR = path.join(process.cwd(), "src/fonts");

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

type OgFontsResult = {
  fonts: OgFontEntry[];
};

let cached: OgFontsResult | null = null;

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

export async function loadOgFonts(): Promise<OgFontsResult> {
  if (cached) return cached;

  const [aeonikLight, aeonikRegular, aeonikBold, agrandir] =
    await Promise.all([
      readFile(path.join(FONTS_DIR, "AeonikTRIAL-Light.otf")),
      readFile(path.join(FONTS_DIR, "AeonikTRIAL-Regular.otf")),
      readFile(path.join(FONTS_DIR, "AeonikTRIAL-Bold.otf")),
      readFile(path.join(FONTS_DIR, "Agrandir-Narrow.otf")),
    ]);

  cached = {
    fonts: [
      {
        name: OG_FONT.body,
        data: bufferToArrayBuffer(aeonikLight),
        weight: 300,
        style: "normal",
      },
      {
        name: OG_FONT.body,
        data: bufferToArrayBuffer(aeonikRegular),
        weight: 400,
        style: "normal",
      },
      {
        name: OG_FONT.body,
        data: bufferToArrayBuffer(aeonikRegular),
        weight: 500,
        style: "normal",
      },
      {
        name: OG_FONT.body,
        data: bufferToArrayBuffer(aeonikBold),
        weight: 700,
        style: "normal",
      },
      {
        name: OG_FONT.display,
        data: bufferToArrayBuffer(agrandir),
        weight: 300,
        style: "normal",
      },
      {
        name: OG_FONT.display,
        data: bufferToArrayBuffer(agrandir),
        weight: 400,
        style: "normal",
      },
      {
        name: OG_FONT.display,
        data: bufferToArrayBuffer(agrandir),
        weight: 700,
        style: "normal",
      },
      {
        name: OG_FONT.display,
        data: bufferToArrayBuffer(agrandir),
        weight: 800,
        style: "normal",
      },
    ],
  };

  return cached;
}