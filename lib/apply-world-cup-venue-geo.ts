import type { PrismaClient } from "@prisma/client";

import { mergeUniqueStrings } from "@/lib/venue-cleanup";
import { isValidVenueCoordinate } from "@/lib/mls-nwsl-venue-geo";
import {
  WORLD_CUP_HOST_VENUE_GEO,
  WORLD_CUP_RECURRING_EVENT
} from "@/lib/world-cup-venue-geo";
import {
  WORLD_CUP_VENUE_SLUGS,
  type WorldCupVenueSlug
} from "@/lib/schedules/world-cup-venue-map";

const COORD_EPSILON = 0.00015;

export type ApplyWorldCupVenueGeoStats = {
  updated: number;
  skipped: number;
  notInDb: string[];
};

function coordinatesMatch(slug: WorldCupVenueSlug, lat: number, lng: number): boolean {
  const geo = WORLD_CUP_HOST_VENUE_GEO[slug];
  return (
    Math.abs(lat - geo.latitude) <= COORD_EPSILON &&
    Math.abs(lng - geo.longitude) <= COORD_EPSILON
  );
}

export async function applyWorldCupVenueGeo(
  prisma: PrismaClient,
  apply: boolean
): Promise<ApplyWorldCupVenueGeoStats> {
  const stats: ApplyWorldCupVenueGeoStats = {
    updated: 0,
    skipped: 0,
    notInDb: []
  };

  for (const slug of WORLD_CUP_VENUE_SLUGS) {
    const geo = WORLD_CUP_HOST_VENUE_GEO[slug];
    const existing = await prisma.venue.findUnique({ where: { slug } });

    if (!existing) {
      stats.notInDb.push(slug);
      continue;
    }

    const recurringEvents = mergeUniqueStrings(existing.recurringEvents ?? [], [
      WORLD_CUP_RECURRING_EVENT
    ]);
    const sports = mergeUniqueStrings(existing.sports ?? [], ["Soccer"]);

    const needsUpdate =
      !isValidVenueCoordinate(existing.latitude, existing.longitude) ||
      !coordinatesMatch(slug, existing.latitude, existing.longitude) ||
      existing.reviewRadiusMeters !== geo.reviewRadiusMeters ||
      existing.timeZone !== geo.timeZone ||
      existing.city !== geo.city ||
      existing.state !== geo.state ||
      existing.country !== geo.country ||
      !recurringEvents.includes(WORLD_CUP_RECURRING_EVENT) ||
      !sports.includes("Soccer");

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
          reviewRadiusMeters: geo.reviewRadiusMeters,
          timeZone: geo.timeZone,
          recurringEvents,
          sports,
          primarySport: existing.primarySport ?? "Soccer"
        }
      });
    }
    stats.updated += 1;
  }

  return stats;
}
