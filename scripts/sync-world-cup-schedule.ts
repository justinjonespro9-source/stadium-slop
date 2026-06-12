/**
 * Upsert FIFA World Cup 2026 matches from data/world-cup/2026-fixtures.json.
 *
 * Usage:
 *   npm run sync:world-cup-schedule -- --dry-run
 *   npm run sync:world-cup-schedule -- --apply
 *   npm run sync:world-cup-schedule -- --apply --start=2026-06-01 --end=2026-07-31
 *
 * Default date window: full tournament (2026-06-01 → 2026-07-31).
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  fetchWorldCupSchedule,
  worldCupMappedGameToPrismaData,
  WORLD_CUP_LEAGUE
} from "../lib/schedules/world-cup-schedule";
import { parseScheduleSyncCliRange } from "../lib/schedules/schedule-sync-range";

const DEFAULT_RANGE = {
  startDate: "2026-06-01",
  endDate: "2026-07-31"
};

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

function parseCliRange() {
  const argv = process.argv.slice(2);
  const hasWindow =
    argv.some((a) => a.startsWith("--start=")) ||
    argv.some((a) => a.startsWith("--end=")) ||
    argv.some((a) => a.startsWith("--days="));

  if (!hasWindow) {
    return DEFAULT_RANGE;
  }

  return parseScheduleSyncCliRange(argv, 60);
}

async function main() {
  const dryRun = !process.argv.includes("--apply");
  const range = parseCliRange();

  console.log(`\n  World Cup Schedule Sync`);
  console.log(`  Mode: ${dryRun ? "DRY RUN (no changes)" : "APPLY (writing to DB)"}`);
  console.log(`  Window: ${range.startDate} → ${range.endDate}\n`);

  const { parsed, mapped, skipped } = fetchWorldCupSchedule(range);
  console.log(`  Fixtures parsed: ${parsed}`);
  console.log(`  Mappable in window: ${mapped.length}`);
  console.log(`  Skipped: ${skipped.length}`);

  const venueRows = await prisma.venue.findMany({
    select: { id: true, slug: true }
  });
  const venueIdBySlug = new Map(venueRows.map((v) => [v.slug, v.id]));

  let created = 0;
  let updated = 0;
  let skippedNoVenue = 0;

  const syncNow = new Date();
  const venueSlugsCovered = new Set<string>();

  for (const game of mapped) {
    const venueId = venueIdBySlug.get(game.venueSlug);
    if (!venueId) {
      skippedNoVenue += 1;
      console.warn(
        `  Skip ${game.externalId}: venue "${game.venueSlug}" not in DB`
      );
      continue;
    }

    venueSlugsCovered.add(game.venueSlug);
    const data = worldCupMappedGameToPrismaData(game, venueId);

    if (dryRun) {
      const existing = await prisma.game.findUnique({
        where: { externalId: game.externalId },
        select: { id: true }
      });
      if (existing) updated += 1;
      else created += 1;
      continue;
    }

    const existing = await prisma.game.findUnique({
      where: { externalId: game.externalId },
      select: { id: true }
    });

    await prisma.game.upsert({
      where: { externalId: game.externalId },
      create: data,
      update: { ...data, updatedAt: syncNow }
    });

    if (existing) updated += 1;
    else created += 1;
  }

  for (const row of skipped) {
    console.warn(
      `  Skip wc26-${row.matchId}: ${row.reason} · venue=${row.venueSlug ?? row.venueName ?? "—"} · ${row.startsAt}`
    );
  }

  const wcGames = await prisma.game.findMany({
    where: { league: WORLD_CUP_LEAGUE },
    select: {
      startsAt: true,
      pollingOpensAt: true,
      pollingClosesAt: true,
      venueId: true,
      venue: { select: { slug: true } }
    },
    orderBy: { startsAt: "asc" }
  });

  const inWindow = dryRun
    ? mapped.filter((g) => venueIdBySlug.has(g.venueSlug))
    : wcGames;

  const firstMatch = inWindow.length
    ? dryRun
      ? mapped[0]?.startsAt
      : wcGames[0]?.startsAt
    : null;
  const lastMatch = inWindow.length
    ? dryRun
      ? mapped[mapped.length - 1]?.startsAt
      : wcGames[wcGames.length - 1]?.startsAt
    : null;

  const withPolling = dryRun
    ? mapped.length
    : wcGames.filter((g) => g.pollingOpensAt && g.pollingClosesAt).length;

  console.log("\n── Results ──────────────────────────────────────────");
  console.log(`  Created:           ${created}`);
  console.log(`  Updated:           ${updated}`);
  console.log(`  Skipped (venue):   ${skippedNoVenue}`);
  console.log(`  Venues covered:    ${venueSlugsCovered.size}`);
  if (firstMatch) {
    console.log(`  First match:       ${firstMatch.toISOString()}`);
  }
  if (lastMatch) {
    console.log(`  Last match:        ${lastMatch.toISOString()}`);
  }
  console.log(`  Review windows:    ${withPolling} games with pollingOpensAt/ClosesAt`);

  if (dryRun) {
    console.log("\n─────────────────────────────────────────────────────");
    console.log("  This was a dry run. To apply, re-run with --apply.\n");
  } else {
    console.log(`\n  Done. ${created + updated} games written to DB.\n`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
