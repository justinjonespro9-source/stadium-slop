/**
 * Ensure Nissan Stadium + 2026 NFL International Series venues exist.
 *
 * Never duplicates an existing slug. Estadio Azteca is merged (NFL league tag)
 * rather than created.
 */

import { EntityStatus, type PrismaClient, VenueType } from "@prisma/client";

import { getNflVenueGeo } from "@/lib/nfl-venue-geo";
import {
  NFL_INTERNATIONAL_VENUE_GEO,
  NFL_MEXICO_CITY_VENUE_SLUG
} from "@/lib/schedules/nfl-international-venue-geo";
import { mergeUniqueStrings } from "@/lib/venue-cleanup";
import { resolveVenueTeams } from "@/lib/venue-teams";

export type EnsureNflScheduleVenueRow = {
  slug: string;
  action: "created" | "updated" | "exists" | "missing";
};

const NFL_INTERNATIONAL_EVENT = "NFL International Series";

export async function ensureNflScheduleVenues(
  prisma: PrismaClient,
  apply: boolean
): Promise<EnsureNflScheduleVenueRow[]> {
  const rows: EnsureNflScheduleVenueRow[] = [];

  const nissanGeo = getNflVenueGeo("nissan-stadium");
  if (!nissanGeo) {
    throw new Error("Missing nissan-stadium in NFL_VENUE_GEO");
  }

  rows.push(
    await ensureVenue(prisma, apply, {
      slug: "nissan-stadium",
      name: nissanGeo.name,
      city: nissanGeo.city,
      state: nissanGeo.state,
      country: nissanGeo.country,
      region: "North America",
      leagues: ["NFL"],
      teams: ["Tennessee Titans"],
      sports: ["Football"],
      primarySport: "Football",
      recurringEvents: [],
      latitude: nissanGeo.latitude,
      longitude: nissanGeo.longitude,
      reviewRadiusMeters: nissanGeo.reviewRadiusMeters,
      timeZone: nissanGeo.timeZone
    })
  );

  for (const [slug, geo] of Object.entries(NFL_INTERNATIONAL_VENUE_GEO)) {
    rows.push(
      await ensureVenue(prisma, apply, {
        slug,
        name: geo.name,
        city: geo.city,
        state: geo.state,
        country: geo.country,
        region: geo.region,
        leagues: ["NFL"],
        teams: [],
        sports: ["Football"],
        primarySport: "Football",
        recurringEvents: [NFL_INTERNATIONAL_EVENT],
        latitude: geo.latitude,
        longitude: geo.longitude,
        reviewRadiusMeters: geo.reviewRadiusMeters,
        timeZone: geo.timeZone
      })
    );
  }

  rows.push(await mergeNflOntoExistingVenue(prisma, apply, NFL_MEXICO_CITY_VENUE_SLUG));

  return rows;
}

async function mergeNflOntoExistingVenue(
  prisma: PrismaClient,
  apply: boolean,
  slug: string
): Promise<EnsureNflScheduleVenueRow> {
  const existing = await prisma.venue.findUnique({ where: { slug } });
  if (!existing) {
    return { slug, action: "missing" };
  }

  const leagues = mergeUniqueStrings(existing.leagues, ["NFL"]);
  const sports = mergeUniqueStrings(existing.sports, ["Football"]);
  const recurringEvents = mergeUniqueStrings(existing.recurringEvents, [
    NFL_INTERNATIONAL_EVENT
  ]);
  const unchanged =
    leagues.length === existing.leagues.length &&
    sports.length === existing.sports.length &&
    recurringEvents.length === existing.recurringEvents.length;

  if (unchanged) {
    return { slug, action: "exists" };
  }

  if (apply) {
    await prisma.venue.update({
      where: { slug },
      data: { leagues, sports, recurringEvents }
    });
  }
  return { slug, action: "updated" };
}

async function ensureVenue(
  prisma: PrismaClient,
  apply: boolean,
  data: {
    slug: string;
    name: string;
    city: string;
    state: string;
    country: string;
    region: string;
    leagues: string[];
    teams: string[];
    sports: string[];
    primarySport: string;
    recurringEvents: string[];
    latitude: number;
    longitude: number;
    reviewRadiusMeters: number;
    timeZone: string;
  }
): Promise<EnsureNflScheduleVenueRow> {
  const existing = await prisma.venue.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { slug: data.slug, action: "exists" };
  }

  if (!apply) {
    return { slug: data.slug, action: "missing" };
  }

  await prisma.venue.create({
    data: {
      slug: data.slug,
      name: data.name,
      city: data.city,
      state: data.state,
      country: data.country,
      region: data.region,
      leagues: data.leagues,
      teams: resolveVenueTeams(data.slug, data.teams),
      sports: data.sports,
      primarySport: data.primarySport,
      recurringEvents: data.recurringEvents,
      latitude: data.latitude,
      longitude: data.longitude,
      reviewRadiusMeters: data.reviewRadiusMeters,
      timeZone: data.timeZone,
      venueType: VenueType.STADIUM,
      status: EntityStatus.ACTIVE
    }
  });

  return { slug: data.slug, action: "created" };
}
