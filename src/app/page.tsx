import type { Metadata } from "next";
import { ThresholdHero } from "@/components/sections/v2/threshold-hero";
import { StatementSection } from "@/components/sections/v2/statement-section";
import { GalleryWalkSection } from "@/components/sections/v2/gallery-walk-section";
import { HorizonSection } from "@/components/sections/v2/horizon-section";
import { Void } from "@/components/ui/void";
import {
  defaultOgDescription,
  defaultOgImagePath,
  getOrganizationAndWebsiteJsonLd,
  pageMeta,
} from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "W.VIANA — Arquitetura | Interiores",
  description:
    "Escritório de arquitetura e interiores em Fortaleza, CE, para projetos residenciais e comerciais com método, autoria e precisão.",
  path: "/",
  socialTitle: "W.VIANA — Arquitetura e interiores em Fortaleza",
  ogDescription: defaultOgDescription,
  ogImagePath: defaultOgImagePath,
  imageAlt: "Projeto residencial de interiores assinado pelo escritório W.VIANA",
  absoluteTitle: true,
});

export default function Home() {
  const jsonLd = getOrganizationAndWebsiteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground">
        <main>
          <ThresholdHero />
          <StatementSection />
          <Void height="15vh" />
          <GalleryWalkSection />
          <Void height="15vh" />
          <HorizonSection />
        </main>
      </div>
    </>
  );
}
