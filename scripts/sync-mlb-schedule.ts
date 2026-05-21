/**
 * Upsert real MLB home games from the public MLB Stats API.
 *
 * Usage:
 *   npm run sync:mlb-schedule
 *   npm run sync:mlb-schedule -- --days=14
 *   npm run sync:mlb-schedule -- --start=2026-05-20 --end=2026-06-03
 *
 * Default: today through 14 days ahead (local calendar dates).
 * Skips games when the home ballpark is not in our DB yet.
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  fetchMlbSchedule,
  mlbMappedGameToPrismaData,
  type MlbScheduleDateRange
} from "../lib/schedules/mlb-stats-api";

const DEFAULT_DAYS = 14;

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addLocalDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function parsePositiveInt(raw: string | undefined, fallback: number) {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseCliRange(argv: string[]): MlbScheduleDateRange {
  let days = DEFAULT_DAYS;
  let start: string | undefined;
  let end: string | undefined;

  for (const arg of argv) {
    if (arg.startsWith("--days=")) {
      days = parsePositiveInt(arg.slice("--days=".length), DEFAULT_DAYS);
    } else if (arg.startsWith("--start=")) {
      start = arg.slice("--start=".length).trim();
    } else if (arg.startsWith("--end=")) {
      end = arg.slice("--end=".length).trim();
    }
  }

  const today = new Date();
  const startDate = start ?? localDateKey(today);
  const endDate = end ?? localDateKey(addLocalDays(today, days));

  return { startDate, endDate };
}

async function main() {
  const range = parseCliRange(process.argv.slice(2));
  console.log(`MLB schedule sync · ${range.startDate} → ${range.endDate}`);

  const { mapped, skipped } = await fetchMlbSchedule(range);
  console.log(
    `Fetched ${mapped.length + skipped.length} games · ${mapped.length} mappable · ${skipped.length} skipped (unmapped home team)`
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
        `Skip mlb-${game.gamePk}: venue "${game.venueSlug}" not in DB (home: ${game.homeTeamName})`
      );
      continue;
    }

    const data = mlbMappedGameToPrismaData(game, venueId);
    await prisma.game.upsert({
      where: { externalId: game.externalId },
      create: data,
      update: {
        ...data,
        updatedAt: syncNow
      }
    });
    upserted += 1;
    console.log(
      `Upserted ${game.externalId} @ ${game.venueSlug} — ${game.awayTeamName} @ ${game.homeTeamSlug} (${game.startsAt.toISOString()}) · ${game.status}`
    );
  }

  for (const row of skipped) {
    console.warn(
      `Skip mlb-${row.gamePk}: ${row.reason} · home=${row.homeTeamName ?? row.homeTeamId ?? "?"} (${row.homeAbbreviation ?? "—"}) · venue=${row.venueName ?? "—"} · ${row.startsAt}`
    );
  }

  console.log(
    `Done. ${upserted} upserted, ${skippedNoVenue} skipped (venue missing in DB), ${skipped.length} skipped (team mapping).`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
