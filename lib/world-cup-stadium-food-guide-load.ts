import { getPublicVenues } from "@/lib/public-data";
import { resolveWorldCupHostVenues } from "@/lib/world-cup-stadium-food-guide";
import type { ResolvedWorldCupHostVenue } from "@/lib/world-cup-stadium-food-guide";
import { getVenueFoodItemCountsForSlugs } from "@/lib/venue-browse-data";

export async function loadWorldCupGuideHosts(): Promise<ResolvedWorldCupHostVenue[]> {
  const venues = await getPublicVenues();
  const hostsWithoutCounts = resolveWorldCupHostVenues(venues, {});
  const liveSlugs = [
    ...new Set(
      hostsWithoutCounts.map((h) => h.slug).filter((slug): slug is string => Boolean(slug))
    )
  ];

  const foodItemCountsByVenueSlug = await getVenueFoodItemCountsForSlugs(liveSlugs);

  return resolveWorldCupHostVenues(venues, foodItemCountsByVenueSlug);
}
