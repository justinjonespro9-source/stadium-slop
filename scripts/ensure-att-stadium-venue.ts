/**
 * Ensure AT&T Stadium exists as active venue slug `att-stadium`.
 * Merges from legacy import slug `at-t-stadium` if present (no duplicate venue).
 *
 * Usage: npx tsx scripts/ensure-att-stadium-venue.ts
 */

import "dotenv/config";

import { EntityStatus, PrismaClient, VenueType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getNflVenueGeo } from "../lib/nfl-venue-geo";
import { mergeUniqueStrings } from "../lib/venue-cleanup";
import { resolveVenueTeams } from "../lib/venue-teams";

const CANONICAL_SLUG = "att-stadium";
const LEGACY_IMPORT_SLUG = "at-t-stadium";
const geo = getNflVenueGeo(CANONICAL_SLUG)!;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function main() {
  const legacy = await prisma.venue.findFirst({
    where: { slug: { equals: LEGACY_IMPORT_SLUG, mode: "insensitive" } },
    include: {
      _count: {
        select: {
          items: true,
          vendors: true,
          reviews: true,
          photos: true,
          games: true
        }
      }
    }
  });

  let venue = await prisma.venue.findFirst({
    where: { slug: { equals: CANONICAL_SLUG, mode: "insensitive" } }
  });

  if (!venue && legacy) {
    const childTotal = Object.values(legacy._count).reduce((a, b) => a + b, 0);
    venue = await prisma.venue.update({
      where: { id: legacy.id },
      data: { slug: CANONICAL_SLUG }
    });
    console.log(
      `Renamed legacy venue ${LEGACY_IMPORT_SLUG} → ${CANONICAL_SLUG}` +
        (childTotal > 0 ? ` (preserved ${childTotal} child records)` : "")
    );
  }

  const baseTeams = venue?.teams ?? legacy?.teams ?? [];
  const baseLeagues = venue?.leagues ?? legacy?.leagues ?? [];
  const baseSports = venue?.sports ?? legacy?.sports ?? [];
  const baseEvents = venue?.recurringEvents ?? legacy?.recurringEvents ?? [];

  const data = {
    name: geo.name,
    city: geo.city,
    state: geo.state,
    country: geo.country,
    region: "North America",
    leagues: mergeUniqueStrings(baseLeagues, ["NFL"]),
    teams: resolveVenueTeams(CANONICAL_SLUG, [...baseTeams, "Dallas Cowboys"]),
    sports: mergeUniqueStrings(baseSports, ["Football"]),
    primarySport: "Football",
    recurringEvents: mergeUniqueStrings(baseEvents, ["FIFA World Cup 2026"]),
    latitude: geo.latitude,
    longitude: geo.longitude,
    reviewRadiusMeters: geo.reviewRadiusMeters,
    venueType: VenueType.STADIUM,
    status: EntityStatus.ACTIVE
  };

  if (venue) {
    venue = await prisma.venue.update({
      where: { id: venue.id },
      data
    });
    console.log(`Updated venue: ${CANONICAL_SLUG}`);
  } else {
    venue = await prisma.venue.create({
      data: { slug: CANONICAL_SLUG, ...data }
    });
    console.log(`Created venue: ${CANONICAL_SLUG}`);
  }

  const final = await prisma.venue.findUniqueOrThrow({
    where: { id: venue.id },
    include: { _count: { select: { items: true, vendors: true, reviews: true } } }
  });

  console.log(
    JSON.stringify(
      {
        slug: final.slug,
        name: final.name,
        city: final.city,
        state: final.state,
        leagues: final.leagues,
        teams: final.teams,
        sports: final.sports,
        recurringEvents: final.recurringEvents,
        latitude: final.latitude,
        longitude: final.longitude,
        timeZone: geo.timeZone,
        status: final.status,
        counts: final._count
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
