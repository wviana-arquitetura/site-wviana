import { ThresholdHero } from "@/components/sections/v2/threshold-hero";
import { StatementSection } from "@/components/sections/v2/statement-section";
import { GalleryWalkSection } from "@/components/sections/v2/gallery-walk-section";
import { HorizonSection } from "@/components/sections/v2/horizon-section";
import { Void } from "@/components/ui/void";

export default function Home() {
  return (
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
  );
}
