import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";

const SIZE = { width: 1200, height: 630 } as const;

const COLORS = {
  background: "#000000",
  foreground: "#F2F2F2",
  accent: "#BAAEA4",
} as const;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: COLORS.background,
          color: COLORS.foreground,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 64,
              letterSpacing: 6,
              fontWeight: 700,
              color: COLORS.accent,
              lineHeight: 1,
            }}
          >
            W.VIANA
          </div>
          <div
            style={{
              width: 1,
              height: 48,
              background: COLORS.accent,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.foreground,
              opacity: 0.75,
            }}
          >
            Arquitetura | Interiores
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              lineHeight: 1.15,
              maxWidth: 960,
              color: COLORS.foreground,
            }}
          >
            Projetos residenciais e comerciais autorais, com sede em Fortaleza.
          </div>
          <div
            style={{
              fontSize: 26,
              color: COLORS.accent,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            wvarq.com
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}
