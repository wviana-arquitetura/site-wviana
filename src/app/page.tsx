import type { Metadata } from "next";
import { ThresholdHero } from "@/components/sections/v2/threshold-hero";
import { StatementSection } from "@/components/sections/v2/statement-section";
import { GalleryWalkSection } from "@/components/sections/v2/gallery-walk-section";
import { HorizonSection } from "@/components/sections/v2/horizon-section";
import { Void } from "@/components/ui/void";
import {
  defaultDescription,
  defaultOgDescription,
  defaultOgImagePath,
  getOrganizationAndWebsiteJsonLd,
  pageMeta,
} from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "W.VIANA — Arquitetura | Interiores",
  description: defaultDescription,
  path: "/",
  ogDescription: defaultOgDescription,
  ogImagePath: defaultOgImagePath,
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
