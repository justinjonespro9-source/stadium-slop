/**
 * Ensure Grayson Stadium (Savannah Bananas) exists as active venue slug `grayson-stadium`.
 *
 * Usage: npx tsx scripts/ensure-grayson-stadium-venue.ts
 */

import "dotenv/config";

import { EntityStatus, PrismaClient, VenueType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const CANONICAL_SLUG = "grayson-stadium";

/** Grayson Stadium — 1401 E Victory Dr, Savannah, GA */
const VENUE_GEO = {
  name: "Grayson Stadium",
  city: "Savannah",
  state: "GA",
  country: "USA",
  latitude: 32.067083,
  longitude: -81.104722,
  reviewRadiusMeters: 400,
  timeZone: "America/New_York"
} as const;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function main() {
  let venue = await prisma.venue.findFirst({
    where: { slug: { equals: CANONICAL_SLUG, mode: "insensitive" } }
  });

  const data = {
    name: VENUE_GEO.name,
    city: VENUE_GEO.city,
    state: VENUE_GEO.state,
    country: VENUE_GEO.country,
    region: "North America",
    leagues: ["Banana Ball"],
    teams: ["Savannah Bananas"],
    sports: ["Baseball", "Entertainment Baseball"],
    primarySport: "Baseball",
    recurringEvents: ["Banana Ball"],
    latitude: VENUE_GEO.latitude,
    longitude: VENUE_GEO.longitude,
    reviewRadiusMeters: VENUE_GEO.reviewRadiusMeters,
    timeZone: VENUE_GEO.timeZone,
    venueType: VenueType.BALLPARK,
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
        primarySport: final.primarySport,
        recurringEvents: final.recurringEvents,
        latitude: final.latitude,
        longitude: final.longitude,
        timeZone: final.timeZone,
        reviewRadiusMeters: final.reviewRadiusMeters,
        venueType: final.venueType,
        status: final.status,
        menuSourceUrl: "https://thesavannahbananas.com/concessions-menu/",
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
