import { WorldCupStadiumFoodGuideShell } from "@/components/world-cup-stadium-food-guide-shell";
import { getWorldCupGuideContent } from "@/lib/world-cup-stadium-food-guide-content";
import { loadWorldCupGuideHosts } from "@/lib/world-cup-stadium-food-guide-load";
import { buildWorldCupGuideMetadata } from "@/lib/world-cup-stadium-food-guide-metadata";
import { withPublicRouteTiming } from "@/lib/route-timing";

/** Cached public read — same cadence as English guide. */
export const revalidate = 300;

export const metadata = buildWorldCupGuideMetadata("es");

export default async function GuiaComidaEstadiosMundial2026Page() {
  return withPublicRouteTiming("world-cup-guide-es", async () => {
    const hosts = await loadWorldCupGuideHosts();
    const content = getWorldCupGuideContent("es");

    return <WorldCupStadiumFoodGuideShell content={content} hosts={hosts} />;
  });
}
