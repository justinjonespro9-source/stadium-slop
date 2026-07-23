/**
 * Automated validation for Wisconsin State Fair review window + menu cleanup.
 *
 *   npx tsx scripts/validate-wisconsin-state-fair-review-flow.ts
 *
 * Covers logic + DB assertions. Browser geolocation UX remains manual.
 */

import "dotenv/config";
import assert from "node:assert/strict";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  getGameDayWindow,
  isGameDayActive,
  validateGameDayReviewSubmission,
  GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START,
  GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START
} from "../lib/game-day";
import {
  WISCONSIN_STATE_FAIR_2026_WINDOW,
  buildFairEventGameData,
  fairEventExternalId,
  formatFairEventDateRange
} from "../lib/schedules/fair-event-window";
import { WISCONSIN_2026_NEW_FOODS } from "../lib/fair-import/parsers/wisconsin-state-fair-2026-new-foods";
import { WISCONSIN_2026_CORE_CATALOG } from "../lib/fair-import/parsers/wisconsin-state-fair-core-catalog-data";
import { getFairVenueDefinition } from "../lib/fair-import/venues";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

const VENUE_SLUG = "wisconsin-state-fair";
const EXTERNAL_ID = fairEventExternalId(VENUE_SLUG, 2026);

function pass(label: string) {
  console.log(`  ✓ ${label}`);
}

async function main() {
  console.log("\n  Wisconsin State Fair review-flow validation\n");

  // --- Parser / seed constants ---
  const data = buildFairEventGameData(WISCONSIN_STATE_FAIR_2026_WINDOW);
  assert.equal(data.externalId, EXTERNAL_ID);
  assert.equal(data.pollingOpensAt.toISOString(), "2026-08-06T05:00:00.000Z");
  assert.equal(data.pollingClosesAt.toISOString(), "2026-08-17T05:00:00.000Z");
  assert.equal(
    formatFairEventDateRange(
      data.pollingOpensAt,
      data.pollingClosesAt,
      "America/Chicago"
    ),
    "Aug 6, 2026 – Aug 16, 2026"
  );
  pass("Fair window UTC/CT bounds");

  const before = new Date("2026-08-05T23:00:00.000Z"); // still Aug 5 evening CT
  const openInstant = new Date("2026-08-06T05:00:00.000Z");
  const midFair = new Date("2026-08-10T17:00:00.000Z");
  const lastMoment = new Date("2026-08-17T04:59:59.999Z");
  const closed = new Date("2026-08-17T05:00:00.000Z");

  assert.equal(isGameDayActive(data, before), false);
  assert.equal(isGameDayActive(data, openInstant), true);
  assert.equal(isGameDayActive(data, midFair), true);
  assert.equal(isGameDayActive(data, lastMoment), true);
  assert.equal(isGameDayActive(data, closed), false);
  pass("Certified window closed before Aug 6 and from Aug 17 00:00 CT");

  // Stadium default windows unchanged
  const kickoff = new Date("2026-06-01T23:10:00.000Z");
  const stadiumWindow = getGameDayWindow(kickoff);
  assert.equal(
    stadiumWindow.pollingOpensAt.getTime(),
    kickoff.getTime() - GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START * 60_000
  );
  assert.equal(
    stadiumWindow.pollingClosesAt.getTime(),
    kickoff.getTime() + GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START * 60_000
  );
  pass("Stadium getGameDayWindow ±90min / +5hr unchanged");

  const geo = getFairVenueDefinition(VENUE_SLUG);
  assert.ok(geo);
  assert.equal(geo.reviewRadiusMeters, 1200);

  const mockGame = {
    id: "test-game",
    ...data,
    venueId: "test-venue",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const inside = validateGameDayReviewSubmission({
    activeGame: mockGame,
    venueLatitude: geo.latitude,
    venueLongitude: geo.longitude,
    reviewRadiusMeters: geo.reviewRadiusMeters,
    location: { latitude: geo.latitude, longitude: geo.longitude }
  });
  assert.equal(inside.ok, true);

  const outside = validateGameDayReviewSubmission({
    activeGame: mockGame,
    venueLatitude: geo.latitude,
    venueLongitude: geo.longitude,
    reviewRadiusMeters: geo.reviewRadiusMeters,
    location: { latitude: geo.latitude + 0.05, longitude: geo.longitude }
  });
  assert.equal(outside.ok, false);
  if (!outside.ok) assert.equal(outside.code, "outside-radius");

  const noGame = validateGameDayReviewSubmission({
    activeGame: null,
    venueLatitude: geo.latitude,
    venueLongitude: geo.longitude,
    reviewRadiusMeters: geo.reviewRadiusMeters,
    location: { latitude: geo.latitude, longitude: geo.longitude }
  });
  assert.equal(noGame.ok, false);
  if (!noGame.ok) assert.equal(noGame.code, "no-active-game");
  pass("Geofence: inside OK, outside blocked, no-window blocked");

  // --- DB assertions ---
  const venue = await prisma.venue.findFirst({
    where: { slug: { equals: VENUE_SLUG, mode: "insensitive" } },
    select: {
      id: true,
      slug: true,
      latitude: true,
      longitude: true,
      reviewRadiusMeters: true,
      timeZone: true
    }
  });
  assert.ok(venue, "venue exists");
  assert.equal(venue.reviewRadiusMeters, 1200);
  assert.equal(venue.timeZone, "America/Chicago");
  pass("Venue geofence + timezone intact");

  const games = await prisma.game.findMany({
    where: { venueId: venue.id },
    select: {
      id: true,
      externalId: true,
      pollingOpensAt: true,
      pollingClosesAt: true,
      homeTeamName: true
    }
  });
  assert.equal(games.length, 1, `expected 1 fair event row, got ${games.length}`);
  assert.equal(games[0].externalId, EXTERNAL_ID);
  assert.equal(games[0].pollingOpensAt.toISOString(), "2026-08-06T05:00:00.000Z");
  assert.equal(games[0].pollingClosesAt.toISOString(), "2026-08-17T05:00:00.000Z");
  pass("Exactly one WI fair event row with correct timestamps");

  const activeItems = await prisma.foodItem.findMany({
    where: { venueId: venue.id, status: "ACTIVE" },
    select: { name: true, slug: true, tags: true }
  });
  const hiddenNames = [
    "Brat Rangoon",
    "Crookie",
    "Bavarian Cream Bug Donut",
    "Blueberry Breakfast Bratwurst",
    "Wisconsin Old Fashioned Wings",
    "A Hunk A Hunk Elvis Donut Ice Cream Sandwich"
  ];
  for (const name of hiddenNames) {
    assert.ok(
      !activeItems.some((i) => i.name === name),
      `${name} should not be ACTIVE`
    );
  }
  assert.ok(
    activeItems.some(
      (i) => i.name === "A Hunk A Hunk Fat Elvis Donut Ice Cream Sandwich"
    ),
    "Fat Elvis should remain ACTIVE"
  );
  assert.ok(
    activeItems.some((i) => /pork ['']?n['']? pine brat burger/i.test(i.name)),
    "Pork 'N' Pine Brat Burger should be ACTIVE"
  );
  pass(`Menu cleanup: leftovers hidden; Fat Elvis + Pork 'N' Pine active (${activeItems.length} ACTIVE)`);

  assert.equal(WISCONSIN_2026_NEW_FOODS.length, 84);
  assert.equal(WISCONSIN_2026_CORE_CATALOG.length, 84);
  assert.ok(
    WISCONSIN_2026_NEW_FOODS.some((i) => /pork ['']?n['']? pine/i.test(i.name))
  );
  pass("Parser catalogs: 84 new + 84 core");

  // Idempotent external id
  const extCount = await prisma.game.count({ where: { externalId: EXTERNAL_ID } });
  assert.equal(extCount, 1);
  pass("Fair event externalId is unique (idempotent seed)");

  console.log("\n  Manual still required:");
  console.log("  • Browser load of /venues/wisconsin-state-fair");
  console.log("  • Real device geolocation grant / deny UX during fair window");
  console.log("  • End-to-end signed-in submit with live GPS on grounds\n");
}

main()
  .catch((err) => {
    console.error("\n  VALIDATION FAILED\n");
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
