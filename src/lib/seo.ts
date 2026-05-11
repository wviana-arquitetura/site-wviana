import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

/**
 * Política de indexação: o HTML das rotas públicas continua protegido por cookie.
 * `robots.txt` e `sitemap.xml` são acessíveis sem auth (middleware) para crawlers.
 * Para ranqueamento pleno, o conteúdo precisaria ser legível sem cookie.
 */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = BRAND.siteUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export const defaultDescription =
  "Escritório de arquitetura e interiores fundado por Wellington Viana. Soluções personalizadas que elevam experiências e expectativas.";

export const defaultOgDescription =
  "Arquitetura sensorial, minimalista e autoral. Forma, luz e silêncio em projetos residenciais e interiores.";

export const defaultOgImagePath = "/apple-touch-icon.png";

export const privateRouteRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
  ogDescription?: string;
  ogImagePath?: string;
  /** Evita aplicar `title.template` do layout (ex.: home com título completo). */
  absoluteTitle?: boolean;
}): Metadata {
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const imagePath = input.ogImagePath ?? defaultOgImagePath;
  const ogDesc = input.ogDescription ?? input.description;
  return {
    title: input.absoluteTitle
      ? { absolute: input.title }
      : input.title,
    description: input.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: path,
      siteName: BRAND.name,
      title: input.title,
      description: ogDesc,
      images: [{ url: imagePath, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: ogDesc,
      images: [imagePath],
    },
  };
}

/** Checklist: Search Console (inspeção de URL), teste de resultados enriquecidos (JSON-LD), Lighthouse mobile (LCP/INP). */

export function getOrganizationAndWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${BRAND.siteUrl}/#organization`,
        name: BRAND.name,
        url: BRAND.siteUrl,
        email: BRAND.email,
        image: absoluteUrl(defaultOgImagePath),
        sameAs: [BRAND.instagramUrl, BRAND.pinterestUrl],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Fortaleza",
          addressRegion: "CE",
          addressCountry: "BR",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${BRAND.siteUrl}/#website`,
        url: BRAND.siteUrl,
        name: BRAND.name,
        inLanguage: "pt-BR",
        publisher: { "@id": `${BRAND.siteUrl}/#organization` },
      },
    ],
  };
}

export function getProjectCreativeWorkJsonLd(project: {
  slug: string;
  title: string;
  summary: string;
  imageSrc: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    image: absoluteUrl(project.imageSrc),
    url: absoluteUrl(`/projetos/${project.slug}`),
    creator: {
      "@type": "Organization",
      name: BRAND.name,
      url: BRAND.siteUrl,
    },
  };
}
