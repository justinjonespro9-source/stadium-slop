import { WorldCupStadiumFoodGuideShell } from "@/components/world-cup-stadium-food-guide-shell";
import { getWorldCupGuideContent } from "@/lib/world-cup-stadium-food-guide-content";
import { loadWorldCupGuideHosts } from "@/lib/world-cup-stadium-food-guide-load";
import { buildWorldCupGuideMetadata } from "@/lib/world-cup-stadium-food-guide-metadata";
import { withPublicRouteTiming } from "@/lib/route-timing";

/** Cached public read — menu counts refresh every few minutes. */
export const revalidate = 300;

export const metadata = buildWorldCupGuideMetadata("en");

export default async function WorldCupStadiumFoodGuidePage() {
  return withPublicRouteTiming("world-cup-guide", async () => {
    const hosts = await loadWorldCupGuideHosts();
    const content = getWorldCupGuideContent("en");

    return <WorldCupStadiumFoodGuideShell content={content} hosts={hosts} />;
  });
}
