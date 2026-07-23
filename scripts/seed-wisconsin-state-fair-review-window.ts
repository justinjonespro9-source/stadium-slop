/**
 * Upsert the continuous Wisconsin State Fair 2026 certified review window.
 *
 * Window (America/Chicago):
 *   Opens:  2026-08-06 00:00 (inclusive)
 *   Closes: 2026-08-17 00:00 (exclusive) — covers all of Aug 6–16
 *
 * Usage:
 *   npx tsx scripts/seed-wisconsin-state-fair-review-window.ts
 *   npx tsx scripts/seed-wisconsin-state-fair-review-window.ts --dry-run
 *   npm run seed:wisconsin-state-fair-review-window
 */

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  WISCONSIN_STATE_FAIR_2026_WINDOW,
  buildFairEventGameData,
  formatFairEventDateRange
} from "../lib/schedules/fair-event-window";
import { FAIR_VENUE_TIMEZONE } from "../lib/fair-venue-geo";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const spec = WISCONSIN_STATE_FAIR_2026_WINDOW;
  const timeZone = spec.timeZone ?? FAIR_VENUE_TIMEZONE[spec.venueSlug];
  const data = buildFairEventGameData(spec);

  console.log(`\n  Wisconsin State Fair Review Window`);
  console.log(`  Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`  External ID: ${data.externalId}`);
  console.log(`  Time zone: ${timeZone}`);
  console.log(
    `  Local range: ${spec.opensLocalDate} 00:00 → ${spec.closesLocalDate} 00:00 (exclusive close)`
  );
  console.log(`  Opens UTC:  ${data.pollingOpensAt.toISOString()}`);
  console.log(`  Closes UTC: ${data.pollingClosesAt.toISOString()}`);
  console.log(
    `  Display:    ${formatFairEventDateRange(data.pollingOpensAt, data.pollingClosesAt, timeZone)}`
  );

  const venue = await prisma.venue.findFirst({
    where: { slug: { equals: spec.venueSlug, mode: "insensitive" } },
    select: {
      id: true,
      slug: true,
      name: true,
      timeZone: true,
      latitude: true,
      longitude: true,
      reviewRadiusMeters: true,
      status: true
    }
  });

  if (!venue) {
    throw new Error(
      `Venue "${spec.venueSlug}" not found. Run ensure:fair-venues first.`
    );
  }

  console.log(
    `  Venue: ${venue.name} (${venue.slug}) · radius ${venue.reviewRadiusMeters}m · status ${venue.status}`
  );

  if (dryRun) {
    const existing = await prisma.game.findUnique({
      where: { externalId: data.externalId },
      select: { id: true }
    });
    console.log(
      `\n  Would ${existing ? "update" : "create"} Game row (no writes).`
    );
    console.log(`  Would set venue.timeZone = ${timeZone} if missing/different.\n`);
    return;
  }

  if (venue.timeZone !== timeZone) {
    await prisma.venue.update({
      where: { id: venue.id },
      data: { timeZone }
    });
    console.log(`  Updated venue.timeZone → ${timeZone}`);
  }

  const game = await prisma.game.upsert({
    where: { externalId: data.externalId },
    create: {
      ...data,
      venueId: venue.id
    },
    update: {
      ...data,
      venueId: venue.id,
      updatedAt: new Date()
    }
  });

  console.log(`\n  Upserted game id=${game.id}`);
  console.log(
    `  Reviews during this window associate via Review.gameId → ${game.id}`
  );
  console.log(
    `  Geofence unchanged: (${venue.latitude}, ${venue.longitude}) · ${venue.reviewRadiusMeters}m\n`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
