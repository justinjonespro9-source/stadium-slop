/**
 * Ensure Mexico 2026 World Cup host venues exist with geo + event metadata.
 *
 * Usage: npx tsx scripts/ensure-world-cup-mexico-venues.ts
 */

import "dotenv/config";

import { EntityStatus, PrismaClient, VenueType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { mergeUniqueStrings } from "../lib/venue-cleanup";
import {
  getWorldCupMexicoVenueGeo,
  WORLD_CUP_MEXICO_VENUE_GEO
} from "../lib/world-cup-venue-geo";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function ensureVenue(slug: string) {
  const geo = getWorldCupMexicoVenueGeo(slug);
  if (!geo) {
    throw new Error(`No geo profile for slug: ${slug}`);
  }

  let venue = await prisma.venue.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" } }
  });

  const data = {
    name: geo.name,
    city: geo.city,
    state: geo.state,
    country: geo.country,
    region: "North America",
    leagues: mergeUniqueStrings(venue?.leagues ?? [], []),
    teams: venue?.teams ?? [],
    sports: mergeUniqueStrings(venue?.sports ?? [], ["Soccer"]),
    primarySport: "Soccer",
    recurringEvents: mergeUniqueStrings(venue?.recurringEvents ?? [], [
      "FIFA World Cup 2026"
    ]),
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
    console.log(`Updated venue: ${slug}`);
  } else {
    venue = await prisma.venue.create({
      data: { slug, ...data }
    });
    console.log(`Created venue: ${slug}`);
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
        country: final.country,
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

async function main() {
  for (const slug of Object.keys(WORLD_CUP_MEXICO_VENUE_GEO)) {
    await ensureVenue(slug);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
