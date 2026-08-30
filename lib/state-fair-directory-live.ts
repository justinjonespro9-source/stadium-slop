import "server-only";

import { FAIR_VENUE_SLUGS } from "@/lib/fair-import/venues";
import { prisma } from "@/lib/prisma";
import { cachePublicRead } from "@/lib/public-read-cache";
import {
  applyLiveTrackedFoodCounts,
  STATE_FAIR_DIRECTORY_ENTRIES,
  type StateFairDirectoryEntry
} from "@/lib/state-fair-directory";

async function loadFairVenueActiveItemCounts(): Promise<Record<string, number>> {
  const venues = await prisma.venue.findMany({
    where: { slug: { in: [...FAIR_VENUE_SLUGS] }, status: "ACTIVE" },
    select: {
      slug: true,
      _count: { select: { items: { where: { status: "ACTIVE" } } } }
    }
  });
  return Object.fromEntries(venues.map((venue) => [venue.slug, venue._count.items]));
}

const getFairVenueActiveItemCountsCached = cachePublicRead(
  ["fair-venue-active-item-counts", "v1"],
  loadFairVenueActiveItemCounts
);

/** Public directory rows with ACTIVE catalog counts when the database is reachable. */
export async function getLiveStateFairDirectoryEntries(): Promise<StateFairDirectoryEntry[]> {
  try {
    const counts = await getFairVenueActiveItemCountsCached();
    return applyLiveTrackedFoodCounts(STATE_FAIR_DIRECTORY_ENTRIES, counts);
  } catch (error) {
    console.warn("state-fair-directory: falling back to static food counts", error);
    return STATE_FAIR_DIRECTORY_ENTRIES;
  }
}
