import type { PrismaClient } from "@prisma/client";

import {
  getNbaNhlVenueGeo,
  NBA_NHL_VENUE_SLUGS
} from "@/lib/nba-nhl-venue-geo";
import { isValidVenueCoordinate } from "@/lib/mls-nwsl-venue-geo";

const COORD_EPSILON = 0.00015;

function coordinatesMatchRegistry(slug: string, lat: number, lng: number): boolean {
  const geo = getNbaNhlVenueGeo(slug);
  if (!geo) return false;
  return (
    Math.abs(lat - geo.latitude) <= COORD_EPSILON &&
    Math.abs(lng - geo.longitude) <= COORD_EPSILON
  );
}

export type ApplyNbaNhlVenueGeoStats = {
  updated: number;
  skipped: number;
  notInDb: string[];
};

/**
 * Idempotent geo apply for NBA/NHL/WNBA arenas.
 * Updates lat/lng (+ city/state/country from registry).
 * Preserves existing reviewRadiusMeters unless it is missing/invalid.
 */
export async function applyNbaNhlVenueGeo(
  prisma: PrismaClient,
  apply: boolean
): Promise<ApplyNbaNhlVenueGeoStats> {
  const stats: ApplyNbaNhlVenueGeoStats = {
    updated: 0,
    skipped: 0,
    notInDb: []
  };

  for (const slug of NBA_NHL_VENUE_SLUGS) {
    const geo = getNbaNhlVenueGeo(slug)!;
    const existing = await prisma.venue.findUnique({ where: { slug } });

    if (!existing) {
      stats.notInDb.push(slug);
      continue;
    }

    const radiusOk =
      Number.isFinite(existing.reviewRadiusMeters) && existing.reviewRadiusMeters > 0;
    const needsUpdate =
      !isValidVenueCoordinate(existing.latitude, existing.longitude) ||
      !coordinatesMatchRegistry(slug, existing.latitude, existing.longitude) ||
      existing.city !== geo.city ||
      existing.state !== geo.state ||
      existing.country !== geo.country ||
      !radiusOk;

    if (!needsUpdate) {
      stats.skipped += 1;
      continue;
    }

    if (apply) {
      await prisma.venue.update({
        where: { slug },
        data: {
          city: geo.city,
          state: geo.state,
          country: geo.country,
          latitude: geo.latitude,
          longitude: geo.longitude,
          // Preserve existing radius when valid; only fill from registry if broken.
          ...(radiusOk ? {} : { reviewRadiusMeters: geo.reviewRadiusMeters })
        }
      });
    }
    stats.updated += 1;
  }

  return stats;
}
