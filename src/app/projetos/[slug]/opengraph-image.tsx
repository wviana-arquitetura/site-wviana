import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/services/projects.service";
import {
  OG_FONT,
  OG_SIZE,
  imageResponseToJpeg,
  loadCoverAsDataUrl,
  loadLogoAsDataUrl,
  loadOgFonts,
} from "@/lib/og-shared";

export const runtime = "nodejs";
export const contentType = "image/jpeg";
export const size = OG_SIZE;

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

const COLORS = {
  background: "#000000",
  foreground: "#F2F2F2",
  muted: "rgba(242,242,242,0.76)",
  accent: "#BAAEA4",
  line: "rgba(242,242,242,0.24)",
} as const;

const OG = {
  site: "wvianaarquitetura.com.br",
  label: "Portfólio de projetos",
} as const;

const LOGO_WIDTH = 300;
const LOGO_HEIGHT = 68;

type Props = {
  params: Promise<{ slug: string }>;
};

export const alt = "Projeto — W.VIANA Arquitetura";

export default async function OpengraphImage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const coverSrc = project.ogImageSrc ?? project.imageSrc;

  const [backgroundUrl, logoUrl, fonts] = await Promise.all([
    loadCoverAsDataUrl(coverSrc),
    loadLogoAsDataUrl(COLORS.foreground),
    loadOgFonts(),
  ]);

  const meta = [
    project.typology,
    [project.location, project.country].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" · ");

  const titleFontSize =
    project.title.length > 42 ? 58 : project.title.length > 28 ? 64 : 72;

  const image = new ImageResponse(
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
        {backgroundUrl ? (
           
          <img
            src={backgroundUrl}
            alt=""
            width={OG_SIZE.width}
            height={OG_SIZE.height}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.64) 38%, rgba(0,0,0,0.28) 70%, rgba(0,0,0,0.16) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 42%, rgba(0,0,0,0.88) 100%)",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
            padding: "56px 72px 52px",
          }}
        >
          <div
            style={{
              width: "100%",
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
                  fontSize: 48,
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: 6,
                  color: COLORS.foreground,
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
                marginTop: 6,
                fontSize: 17,
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
              {OG.label}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 900,
            }}
          >
            <div
              style={{
                width: 96,
                height: 4,
                background: COLORS.accent,
                marginBottom: 28,
              }}
            />

            <div
              style={{
                fontFamily: OG_FONT.display,
                fontSize: titleFontSize,
                fontWeight: 800,
                lineHeight: 0.98,
                letterSpacing: "-0.04em",
                color: COLORS.foreground,
                maxWidth: 900,
              }}
            >
              {project.title}
            </div>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  lineHeight: 1.25,
                  letterSpacing: 2.6,
                  textTransform: "uppercase",
                  color: COLORS.accent,
                }}
              >
                {meta}
              </div>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 42,
              borderTop: `1px solid ${COLORS.line}`,
              paddingTop: 22,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 400,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: COLORS.muted,
              }}
            >
              Arquitetura e Interiores
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
    ),
    { ...OG_SIZE, fonts },
  );

  return imageResponseToJpeg(image);
}
