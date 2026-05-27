import {
  getPublicFoodItemsByVenueSlug,
  getPublicVenues
} from "@/lib/public-data";
import { resolveWorldCupHostVenues } from "@/lib/world-cup-stadium-food-guide";
import type { ResolvedWorldCupHostVenue } from "@/lib/world-cup-stadium-food-guide";

export async function loadWorldCupGuideHosts(): Promise<ResolvedWorldCupHostVenue[]> {
  const venues = await getPublicVenues();
  const hostsWithoutCounts = resolveWorldCupHostVenues(venues, {});
  const liveSlugs = [
    ...new Set(
      hostsWithoutCounts.map((h) => h.slug).filter((slug): slug is string => Boolean(slug))
    )
  ];

  const itemsByVenueSlug: Record<
    string,
    Awaited<ReturnType<typeof getPublicFoodItemsByVenueSlug>>
  > = {};

  await Promise.all(
    liveSlugs.map(async (slug) => {
      itemsByVenueSlug[slug] = await getPublicFoodItemsByVenueSlug(slug);
    })
  );

  return resolveWorldCupHostVenues(venues, itemsByVenueSlug);
}
