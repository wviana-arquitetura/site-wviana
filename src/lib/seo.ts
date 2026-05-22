import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import type { Project } from "@/types/project";

/** Metadados e URLs absolutas para SEO (canonical, OG, JSON-LD). */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = BRAND.siteUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export const defaultDescription =
  "W.VIANA é um escritório de arquitetura e interiores em Fortaleza, CE, com projetos residenciais e comerciais autorais.";

export const defaultOgDescription =
  "Arquitetura e interiores em Fortaleza com método claro, materialidade precisa e projetos residenciais e comerciais sob medida.";

export const defaultOgImagePath = "/og/default";

export const defaultOgImageAlt =
  "W.VIANA — Arquitetura e interiores em Fortaleza";

export const privateRouteRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function compactDescription(description: string, maxLength = 155): string {
  const clean = description.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  const sliced = clean.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const body = lastSpace > 90 ? sliced.slice(0, lastSpace) : sliced;
  return `${body.trim()}…`;
}

export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
  socialTitle?: string;
  ogDescription?: string;
  ogImagePath?: string;
  imageAlt?: string;
  ogType?: "website" | "article";
  absoluteCanonical?: string;
  robots?: Metadata["robots"];
  /** Evita aplicar `title.template` do layout (ex.: home com título completo). */
  absoluteTitle?: boolean;
}): Metadata {
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const imagePath = input.ogImagePath ?? defaultOgImagePath;
  const description = compactDescription(input.description);
  const ogDesc = compactDescription(input.ogDescription ?? description, 200);
  const socialTitle = input.socialTitle ?? input.title;
  const canonical = input.absoluteCanonical ?? absoluteUrl(path);
  const imageAlt = input.imageAlt ?? defaultOgImageAlt;
  // Rotas OG geradas pelo proprio site (defaultOgImagePath ou /og/*) tem 1200x630 PNG.
  const isGeneratedOgImage = imagePath === defaultOgImagePath || imagePath.startsWith("/og/");

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description,
    alternates: { canonical },
    robots: input.robots,
    openGraph: {
      type: input.ogType ?? "website",
      locale: "pt_BR",
      url: canonical,
      siteName: BRAND.name,
      title: socialTitle,
      description: ogDesc,
      images: [
        {
          url: absoluteUrl(imagePath),
          alt: imageAlt,
          ...(isGeneratedOgImage
            ? { width: 1200, height: 630, type: "image/png" }
            : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: ogDesc,
      images: [absoluteUrl(imagePath)],
    },
  };
}

/** Checklist: Search Console (inspeção de URL), teste de resultados enriquecidos (JSON-LD), Lighthouse mobile (LCP/INP). */

export function getOrganizationAndWebsiteJsonLd() {
  const organizationId = `${BRAND.siteUrl}/#organization`;
  const websiteId = `${BRAND.siteUrl}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": organizationId,
        name: BRAND.name,
        alternateName: ["W.VIANA", "W.Viana Arquitetura"],
        description: defaultDescription,
        url: BRAND.siteUrl,
        email: BRAND.email,
        telephone: BRAND.whatsappPhoneFormatted,
        priceRange: "Sob consulta",
        image: absoluteUrl(defaultOgImagePath),
        logo: absoluteUrl("/images/logos/brand/marca-logotipo-principal.svg"),
        sameAs: [BRAND.instagramUrl, BRAND.pinterestUrl],
        areaServed: [
          { "@type": "City", name: "Fortaleza" },
          { "@type": "AdministrativeArea", name: "Ceará" },
          { "@type": "Country", name: "Brasil" },
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: "Rua Vicente Linhares, 521",
          addressLocality: "Fortaleza",
          addressRegion: "CE",
          addressCountry: "BR",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Atendimento comercial",
          email: BRAND.email,
          telephone: BRAND.whatsappPhoneFormatted,
          areaServed: "BR",
          availableLanguage: ["pt-BR"],
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: BRAND.siteUrl,
        name: BRAND.name,
        inLanguage: "pt-BR",
        publisher: { "@id": organizationId },
      },
    ],
  };
}

export function getBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getProjectsItemListJsonLd(projects: Project[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Projetos de arquitetura e interiores W.VIANA",
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/projetos/${project.slug}`),
      name: project.title,
      description: compactDescription(project.seoDescription ?? project.summary, 180),
    })),
  };
}

export function getFaqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getContactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contato W.VIANA",
    url: absoluteUrl("/contato"),
    about: { "@id": `${BRAND.siteUrl}/#organization` },
    mainEntity: {
      "@type": "ProfessionalService",
      "@id": `${BRAND.siteUrl}/#organization`,
      name: BRAND.name,
      email: BRAND.email,
      telephone: BRAND.whatsappPhoneFormatted,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua Vicente Linhares, 521",
        addressLocality: "Fortaleza",
        addressRegion: "CE",
        addressCountry: "BR",
      },
    },
  };
}

export function getAboutPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Sobre Wellington Viana e o escritório W.VIANA",
    url: absoluteUrl("/sobre"),
    about: {
      "@type": "Person",
      name: "Wellington Viana",
      jobTitle: "Arquiteto e Urbanista",
      worksFor: { "@id": `${BRAND.siteUrl}/#organization` },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Fortaleza",
        addressRegion: "CE",
        addressCountry: "BR",
      },
    },
  };
}

export function getProjectCreativeWorkJsonLd(project: Project) {
  const projectUrl = absoluteUrl(`/projetos/${project.slug}`);
  const description = compactDescription(project.seoDescription ?? project.summary, 220);

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${projectUrl}#creative-work`,
    name: project.title,
    headline: project.seoTitle ?? project.title,
    description,
    image: absoluteUrl(project.ogImageSrc ?? project.imageSrc),
    url: projectUrl,
    inLanguage: "pt-BR",
    genre: project.typology,
    keywords: [
      project.typology,
      ...project.scope,
      ...(project.services ?? []),
      project.location,
      "arquitetura",
      "interiores",
    ],
    contentLocation: {
      "@type": "Place",
      name: `${project.location}, ${project.country}`,
    },
    spatialCoverage: project.areaServed?.length
      ? project.areaServed.join(", ")
      : `${project.location}, ${project.country}`,
    creator: {
      "@id": `${BRAND.siteUrl}/#organization`,
    },
    provider: {
      "@id": `${BRAND.siteUrl}/#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": projectUrl,
    },
  };
}
