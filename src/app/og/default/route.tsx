import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ImageResponse } from "next/og";
import { loadOgFonts, OG_FONT } from "@/lib/og-fonts";

export const runtime = "nodejs";
export const contentType = "image/png";

const SIZE = { width: 1200, height: 630 } as const;

const COLORS = {
  background: "#F2F2F2",
  foreground: "#111111",
  muted: "#6F6A66",
  accent: "#BAAEA4",
  line: "#D8D2CD",
  soft: "#E4DDD7",
} as const;

const OG = {
  title: "Arquitetura e Interiores",
  subtitle:
    "Projetos residenciais, comerciais e corporativos, com sede em Fortaleza.",
  site: "wvianaarquitetura.com.br",
} as const;

const LOGO_WIDTH = 720;
const LOGO_HEIGHT = 160;

async function loadLogoAsDataUrl(): Promise<string | null> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "images/logos/brand/marca-variacao-02.svg",
    );

    const svgText = await readFile(filePath, "utf-8");

    const recolored = svgText.replace(
      /\.cls-1\{[^}]*\}/,
      `.cls-1{stroke-width:0px;fill:${COLORS.foreground};}`,
    );

    const png = await sharp(Buffer.from(recolored), { density: 500 })
      .trim()
      .resize({
        width: LOGO_WIDTH * 2,
        withoutEnlargement: false,
      })
      .png()
      .toBuffer();

    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET() {
  const [logoUrl, { fonts }] = await Promise.all([
    loadLogoAsDataUrl(),
    loadOgFonts(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: COLORS.background,
          color: COLORS.foreground,
          fontFamily: OG_FONT.body,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -180,
            top: -240,
            width: 680,
            height: 680,
            borderRadius: 999,
            background: COLORS.soft,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 96,
            bottom: 138,
            width: 260,
            height: 260,
            border: `1px solid ${COLORS.line}`,
            opacity: 0.5,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 156,
            bottom: 78,
            width: 260,
            height: 260,
            border: `1px solid ${COLORS.line}`,
            opacity: 0.35,
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "64px 76px 54px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 14,
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.muted,
            }}
          >
            <span
              style={{
                width: 42,
                height: 1,
                background: COLORS.accent,
              }}
            />
            {OG.title}
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 20,
            }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              />
            ) : (
              <div
                style={{
                  fontFamily: OG_FONT.display,
                  fontSize: 118,
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: 10,
                }}
              >
                W.VIANA
              </div>
            )}
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: `1px solid ${COLORS.line}`,
              paddingTop: 24,
            }}
          >
            <div
              style={{
                maxWidth: 680,
                fontSize: 25,
                fontWeight: 400,
                lineHeight: 1.3,
                color: COLORS.muted,
              }}
            >
              {OG.subtitle}
            </div>

            <div
              style={{
                fontSize: 24,
                color: COLORS.foreground,
                fontWeight: 500,
              }}
            >
              {OG.site}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...SIZE, fonts },
  );
}