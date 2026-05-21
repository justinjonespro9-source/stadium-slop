/**
 * Upsert real NWSL home games from the FixtureDownload JSON feed.
 *
 * Usage:
 *   npm run sync:nwsl-schedule
 *   npm run sync:nwsl-schedule -- --days=45
 *   npm run sync:nwsl-schedule -- --start=2026-05-20 --end=2026-07-04
 *
 * Default: today through 45 days ahead (UTC filter on fixture kickoff).
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  fetchNwslSchedule,
  nwslMappedGameToPrismaData
} from "../lib/schedules/nwsl-schedule";
import { parseScheduleSyncCliRange } from "../lib/schedules/schedule-sync-range";

const DEFAULT_DAYS = 45;

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const range = parseScheduleSyncCliRange(process.argv.slice(2), DEFAULT_DAYS);
  console.log(`NWSL schedule sync · ${range.startDate} → ${range.endDate}`);

  const { mapped, skipped } = await fetchNwslSchedule(range);
  console.log(
    `Fetched ${mapped.length + skipped.length} home fixtures in window · ${mapped.length} mappable · ${skipped.length} skipped (mapping)`
  );

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

    const data = nwslMappedGameToPrismaData(game, venueId);
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
      `Skip nwsl-${row.matchNumber}: ${row.reason} · home=${row.homeTeamName ?? "?"} · stadium=${row.stadiumName ?? "—"} · ${row.startsAt}`
    );
  }

  console.log(
    `Done. ${upserted} upserted, ${skippedNoVenue} skipped (venue missing in DB), ${skipped.length} skipped (team/stadium mapping).`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
