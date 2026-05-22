import { ImageResponse } from "next/og";
import {
  OG_FONT,
  OG_SIZE,
  OG_CONTENT_TYPE,
  loadAboutImageAsDataUrl,
  loadLogoAsDataUrl,
  loadMarkAsDataUrl,
  loadOgFonts,
} from "@/lib/og-shared";

export const runtime = "nodejs";
export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Wellington Viana — Fundador da W.VIANA";

const COLORS = {
  background: "#F2F2F2",
  foreground: "#111111",
  muted: "#6F6A66",
  accent: "#BAAEA4",
  line: "#D8D2CD",
  soft: "#E4DDD7",
} as const;

const OG = {
  eyebrow: "Sobre",
  title: "Wellington Viana",
  role: "Fundador",
  subtitle:
    "Arquitetura contemporânea, elegante e atemporal, com projetos que unem estética, funcionalidade e identidade.",
  site: "wvianaarquitetura.com.br",
  stats: [
    { value: "2018", label: "Fundação" },
    { value: "250+", label: "Projetos" },
    { value: "Brasil", label: "Atuação" },
  ],
} as const;

const LOGO_WIDTH = 300;
const LOGO_HEIGHT = 68;
const MARK_WIDTH = 300;
const MARK_HEIGHT = 300;
const ABOUT_PANEL_WIDTH = 470;

const ABOUT_IMAGE_CANDIDATES = [
  "/images/sobre/wellington-viana.webp",
  "/images/sobre/wellington-viana.jpg",
  "/images/sobre/sobre-wellington-viana.webp",
  "/images/sobre/sobre-wellington-viana.jpg",
  "/images/about/wellington-viana.webp",
  "/images/about/wellington-viana.jpg",
  "/images/about/sobre-wellington-viana.webp",
  "/images/about/sobre-wellington-viana.jpg",
  "/images/wellington-viana.webp",
  "/images/wellington-viana.jpg",
  "/images/team/wellington-viana/sobre-desktop.webp",
  "/images/team/wellington-viana/sobre-desktop-2.webp",
] as const;

export default async function OpengraphImage() {
  const [logoUrl, aboutImageUrl, markUrl, fonts] = await Promise.all([
    loadLogoAsDataUrl(COLORS.foreground),
    loadAboutImageAsDataUrl(ABOUT_IMAGE_CANDIDATES, ABOUT_PANEL_WIDTH),
    loadMarkAsDataUrl(COLORS.foreground),
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
            right: 84,
            bottom: 76,
            width: 250,
            height: 250,
            border: `1px solid ${COLORS.line}`,
            opacity: 0.55,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 146,
            bottom: 138,
            width: 250,
            height: 250,
            border: `1px solid ${COLORS.line}`,
            opacity: 0.35,
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: ABOUT_PANEL_WIDTH,
              height: "100%",
              display: "flex",
              position: "relative",
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              background: COLORS.soft,
              borderRight: `1px solid ${COLORS.line}`,
            }}
          >
            {aboutImageUrl ? (
               
              <img
                src={aboutImageUrl}
                alt=""
                width={ABOUT_PANEL_WIDTH}
                height={OG_SIZE.height}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  opacity: 0.92,
                }}
              />
            ) : markUrl ? (
               
              <img
                src={markUrl}
                alt=""
                width={MARK_WIDTH}
                height={MARK_HEIGHT}
                style={{
                  width: MARK_WIDTH,
                  height: MARK_HEIGHT,
                  objectFit: "contain",
                  opacity: 0.16,
                }}
              />
            ) : (
              <div
                style={{
                  fontFamily: OG_FONT.display,
                  fontSize: 360,
                  fontWeight: 300,
                  color: COLORS.foreground,
                  opacity: 0.12,
                  letterSpacing: "-0.08em",
                }}
              >
                W
              </div>
            )}

            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(180deg, rgba(242,242,242,0.16) 0%, rgba(242,242,242,0.02) 42%, rgba(17,17,17,0.20) 100%)",
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "56px 72px 52px 64px",
            }}
          >
            <div
              style={{
                width: "100%",
                height: 78,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              {logoUrl ? (
                 
                <img
                  src={logoUrl}
                  alt=""
                  width={LOGO_WIDTH}
                  height={LOGO_HEIGHT}
                  style={{ objectFit: "contain", objectPosition: "left top" }}
                />
              ) : (
                <div
                  style={{
                    fontFamily: OG_FONT.display,
                    fontSize: 44,
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
                  fontSize: 17,
                  fontWeight: 400,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: COLORS.muted,
                }}
              >
                <span style={{ width: 42, height: 1, background: COLORS.accent }} />
                {OG.eyebrow}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 74,
                maxWidth: 620,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 400,
                  letterSpacing: 5,
                  textTransform: "uppercase",
                  color: COLORS.muted,
                  marginBottom: 18,
                }}
              >
                {OG.role}
              </div>

              <div
                style={{
                  width: 100,
                  height: 4,
                  background: COLORS.accent,
                  marginBottom: 30,
                }}
              />

              <div
                style={{
                  fontFamily: OG_FONT.display,
                  fontSize: 78,
                  fontWeight: 300,
                  lineHeight: 0.95,
                  letterSpacing: "-0.035em",
                  color: COLORS.foreground,
                }}
              >
                {OG.title}
              </div>

              <div
                style={{
                  maxWidth: 620,
                  marginTop: 28,
                  fontSize: 27,
                  fontWeight: 400,
                  lineHeight: 1.25,
                  color: COLORS.muted,
                }}
              >
                {OG.subtitle}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            <div
              style={{
                display: "flex",
                gap: 30,
                borderTop: `1px solid ${COLORS.line}`,
                paddingTop: 22,
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: 34 }}>
                {OG.stats.map((item) => (
                  <div
                    key={item.label}
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 400,
                        color: COLORS.foreground,
                        lineHeight: 1,
                      }}
                    >
                      {item.value}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        color: COLORS.muted,
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontSize: 22,
                  color: COLORS.foreground,
                  fontWeight: 500,
                }}
              >
                {OG.site}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
