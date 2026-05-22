import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
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
  eyebrow: "Arquitetura e Interiores",
  title: "Vamos conversar sobre o seu projeto.",
  subtitle:
    "Projetos residenciais e comerciais pensados para rotina, materialidade e experiência.",
  site: "wvianaarquitetura.com.br",
} as const;

const LOGO_WIDTH = 390;
const LOGO_HEIGHT = 86;

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
            right: -190,
            top: -230,
            width: 640,
            height: 640,
            borderRadius: 999,
            background: COLORS.soft,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 92,
            bottom: 92,
            width: 250,
            height: 250,
            border: `1px solid ${COLORS.line}`,
            opacity: 0.75,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 154,
            bottom: 154,
            width: 250,
            height: 250,
            border: `1px solid ${COLORS.line}`,
            opacity: 0.45,
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "58px 76px 54px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "100%",
              height: 92,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
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
                  objectPosition: "left top",
                }}
              />
            ) : (
              <div
                style={{
                  fontFamily: OG_FONT.display,
                  fontSize: 46,
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: 6,
                }}
              >
                W.VIANA
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 4,
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
              {OG.eyebrow}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 800,
              marginTop: 42,
            }}
          >
            <div
              style={{
                width: 104,
                height: 4,
                background: COLORS.accent,
                marginBottom: 32,
              }}
            />

            <div
              style={{
                fontFamily: OG_FONT.display,
                fontSize: 76,
                fontWeight: 300,
                lineHeight: 0.96,
                letterSpacing: "-0.03em",
                color: COLORS.foreground,
              }}
            >
              {OG.title}
            </div>

            <div
              style={{
                maxWidth: 700,
                marginTop: 26,
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.24,
                color: COLORS.muted,
              }}
            >
              {OG.subtitle}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `1px solid ${COLORS.line}`,
              paddingTop: 22,
              fontSize: 21,
              fontWeight: 400,
              color: COLORS.muted,
            }}
          >
            <div>{BRAND.location}</div>

            <div
              style={{
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