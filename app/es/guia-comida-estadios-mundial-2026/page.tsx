import { WorldCupStadiumFoodGuideShell } from "@/components/world-cup-stadium-food-guide-shell";
import { getWorldCupGuideContent } from "@/lib/world-cup-stadium-food-guide-content";
import { loadWorldCupGuideHosts } from "@/lib/world-cup-stadium-food-guide-load";
import { buildWorldCupGuideMetadata } from "@/lib/world-cup-stadium-food-guide-metadata";

/** Loads live venue and menu data from the database. */
export const dynamic = "force-dynamic";

export const metadata = buildWorldCupGuideMetadata("es");

export default async function GuiaComidaEstadiosMundial2026Page() {
  const hosts = await loadWorldCupGuideHosts();
  const content = getWorldCupGuideContent("es");

  return <WorldCupStadiumFoodGuideShell content={content} hosts={hosts} />;
}
