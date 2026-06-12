/**
 * IANA time zones for FIFA World Cup 2026 host venues.
 */

import { WORLD_CUP_HOST_VENUE_GEO } from "@/lib/world-cup-venue-geo";
import type { WorldCupVenueSlug } from "@/lib/schedules/world-cup-venue-map";

export const WORLD_CUP_VENUE_TIME_ZONES: Record<WorldCupVenueSlug, string> =
  Object.fromEntries(
    Object.entries(WORLD_CUP_HOST_VENUE_GEO).map(([slug, geo]) => [
      slug,
      geo.timeZone
    ])
  ) as Record<WorldCupVenueSlug, string>;

export function getWorldCupVenueTimeZone(slug: WorldCupVenueSlug): string {
  return WORLD_CUP_VENUE_TIME_ZONES[slug];
}
