import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { ThresholdHero } from "@/components/sections/threshold-hero";
import { StatementSection } from "@/components/sections/statement-section";
import { GalleryWalkSection } from "@/components/sections/gallery-walk-section";
import { HorizonSection } from "@/components/sections/horizon-section";
import { Void } from "@/components/ui/void";
import {
  defaultOgDescription,
  getOrganizationAndWebsiteJsonLd,
  pageMeta,
} from "@/lib/seo";
import { getAllProjects } from "@/services/projects.service";

export const metadata: Metadata = pageMeta({
  title: "W.VIANA — Arquitetura | Interiores",
  description:
    "Escritório de arquitetura e interiores em Fortaleza, CE, para projetos residenciais e comerciais com método, autoria e precisão.",
  path: "/",
  socialTitle: "W.VIANA — Arquitetura e interiores em Fortaleza",
  ogDescription: defaultOgDescription,
  imageAlt: "Projeto residencial de interiores assinado pelo escritório W.VIANA",
  absoluteTitle: true,
});

// Lido uma vez no servidor e embutido no HTML — evita o fetch client-side do
// logo (404KB→97KB) que atrasava o LCP da home.
const HERO_LOGO_PATH = path.join(
  process.cwd(),
  "public/images/logos/brand/marca-variacao-02.svg",
);

export default async function Home() {
  const jsonLd = getOrganizationAndWebsiteJsonLd();

  // Pega os 3 primeiros (que vêm dos featured da home, controlados em /admin/home).
  const [featuredProjects, heroLogoSvg] = await Promise.all([
    getAllProjects().then((projects) => projects.slice(0, 3)),
    readFile(HERO_LOGO_PATH, "utf-8"),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground">
        <main>
          <ThresholdHero logoSvg={heroLogoSvg} />
          <StatementSection />
          <Void height="15vh" />
          <GalleryWalkSection projects={featuredProjects} />
          <Void height="15vh" />
          <HorizonSection />
        </main>
      </div>
    </>
  );
}
