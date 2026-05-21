/**
 * Upsert real MLS home games from the public MLS Stats API.
 *
 * Usage:
 *   npm run sync:mls-schedule
 *   npm run sync:mls-schedule -- --days=45
 *   npm run sync:mls-schedule -- --start=2026-05-20 --end=2026-07-04
 *
 * Default: today through 45 days ahead (local calendar dates).
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  fetchMlsSchedule,
  mlsMappedGameToPrismaData
} from "../lib/schedules/mls-schedule";
import {
  parseScheduleSyncCliRange,
  type ScheduleSyncDateRange
} from "../lib/schedules/schedule-sync-range";

const DEFAULT_DAYS = 45;

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function upsertMappedGames(
  range: ScheduleSyncDateRange,
  mapped: Awaited<ReturnType<typeof fetchMlsSchedule>>["mapped"],
  skipped: Awaited<ReturnType<typeof fetchMlsSchedule>>["skipped"]
) {
  const venueRows = await prisma.venue.findMany({
    select: { id: true, slug: true }
  });
  const venueIdBySlug = new Map(venueRows.map((v) => [v.slug, v.id]));

  const syncNow = new Date();
  let upserted = 0;
  let skippedNoVenue = 0;

  for (const game of mapped) {
    const venueId = venueIdBySlug.get(game.venueSlug);
    if (!venueId) {
      skippedNoVenue += 1;
      console.warn(
        `Skip ${game.externalId}: venue "${game.venueSlug}" not in DB (home: ${game.homeTeamName})`
      );
      continue;
    }

    const data = mlsMappedGameToPrismaData(game, venueId);
    await prisma.game.upsert({
      where: { externalId: game.externalId },
      create: data,
      update: { ...data, updatedAt: syncNow }
    });
    upserted += 1;
    console.log(
      `Upserted ${game.externalId} @ ${game.venueSlug} — ${game.awayTeamName} @ ${game.homeTeamSlug} (${game.startsAt.toISOString()}) · ${game.status}`
    );
  }

  for (const row of skipped) {
    console.warn(
      `Skip mls-${row.matchId}: ${row.reason} · home=${row.homeTeamName ?? "?"} · stadium=${row.stadiumName ?? "—"} · ${row.startsAt}`
    );
  }

  return { upserted, skippedNoVenue, skippedMapping: skipped.length };
}

async function main() {
  const range = parseScheduleSyncCliRange(process.argv.slice(2), DEFAULT_DAYS);
  console.log(`MLS schedule sync · ${range.startDate} → ${range.endDate}`);

  const { mapped, skipped } = await fetchMlsSchedule(range);
  console.log(
    `Fetched ${mapped.length + skipped.length} regular-season matches · ${mapped.length} mappable · ${skipped.length} skipped (mapping)`
  );

  const { upserted, skippedNoVenue, skippedMapping } = await upsertMappedGames(
    range,
    mapped,
    skipped
  );

  console.log(
    `Done. ${upserted} upserted, ${skippedNoVenue} skipped (venue missing in DB), ${skippedMapping} skipped (team/stadium mapping).`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
