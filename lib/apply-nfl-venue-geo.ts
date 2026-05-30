import type { PrismaClient } from "@prisma/client";

import { getNflVenueGeo, NFL_VENUE_GEO } from "@/lib/nfl-venue-geo";
import { isValidVenueCoordinate } from "@/lib/mls-nwsl-venue-geo";

const COORD_EPSILON = 0.00015;

export const NFL_VENUE_SLUGS = Object.keys(NFL_VENUE_GEO).sort();

function coordinatesMatchNflRegistry(slug: string, lat: number, lng: number): boolean {
  const geo = getNflVenueGeo(slug);
  if (!geo) return false;
  return (
    Math.abs(lat - geo.latitude) <= COORD_EPSILON &&
    Math.abs(lng - geo.longitude) <= COORD_EPSILON
  );
}

export type ApplyNflVenueGeoStats = {
  updated: number;
  skipped: number;
  notInDb: string[];
};

export async function applyNflVenueGeo(
  prisma: PrismaClient,
  apply: boolean
): Promise<ApplyNflVenueGeoStats> {
  const stats: ApplyNflVenueGeoStats = {
    updated: 0,
    skipped: 0,
    notInDb: []
  };

  for (const slug of NFL_VENUE_SLUGS) {
    const geo = getNflVenueGeo(slug)!;
    const existing = await prisma.venue.findUnique({ where: { slug } });

    if (!existing) {
      stats.notInDb.push(slug);
      continue;
    }

    const needsUpdate =
      !isValidVenueCoordinate(existing.latitude, existing.longitude) ||
      !coordinatesMatchNflRegistry(slug, existing.latitude, existing.longitude) ||
      existing.reviewRadiusMeters !== geo.reviewRadiusMeters ||
      existing.city !== geo.city ||
      existing.state !== geo.state ||
      existing.country !== geo.country;

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
          reviewRadiusMeters: geo.reviewRadiusMeters
        }
      });
    }
    stats.updated += 1;
  }

  return stats;
}
