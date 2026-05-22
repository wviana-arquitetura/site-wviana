import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/services/projects.service";

export const runtime = "nodejs";
export const contentType = "image/png";

/**
 * `next/og` (Satori) so suporta decodificar JPEG, PNG e GIF.
 * As fotos dos projetos estao em WebP — precisamos pre-converter
 * para JPEG e embedar como data URL.
 */
async function loadProjectImageAsDataUrl(relativeSrc: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), "public", relativeSrc.replace(/^\//, ""));
    const buffer = await readFile(filePath);
    const jpeg = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

const SIZE = { width: 1200, height: 630 } as const;

const COLORS = {
  background: "#000000",
  foreground: "#F2F2F2",
  accent: "#BAAEA4",
} as const;

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return new Response(null, { status: 404 });
  }

  const backgroundUrl = await loadProjectImageAsDataUrl(project.imageSrc);
  const meta = `${project.typology} | ${project.location}, ${project.country}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: COLORS.background,
          color: COLORS.foreground,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {backgroundUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundUrl}
            alt=""
            width={SIZE.width}
            height={SIZE.height}
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
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.30) 30%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.92) 100%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "72px 80px",
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
                opacity: 0.85,
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
              {project.title}
            </div>
            <div
              style={{
                fontSize: 26,
                color: COLORS.accent,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {meta}
            </div>
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}
