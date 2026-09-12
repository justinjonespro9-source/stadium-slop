/**
 * Upsert the 2026 NFL regular-season schedule.
 *
 * Usage:
 *   npm run sync:nfl-schedule
 *   npm run sync:nfl-schedule -- --apply
 *   npm run sync:nfl-schedule -- --live --apply
 *
 * Default: dry-run from data/nfl/2026-regular-season.json.
 * `--live` refetches ESPN weeks 1–18, then maps the same way.
 *
 * Does not delete Game rows. Upserts only `externalId` `nfl-{espnEventId}`.
 * Unrelated leagues/seasons are not touched.
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { fetchEspnNflRegularSeason } from "../lib/schedules/nfl-espn";
import {
  loadMappedNflSchedule,
  mapNflScheduleFile,
  nflMappedGameToPrismaData,
  NFL_LEAGUE,
  NFL_SEASON
} from "../lib/schedules/nfl-schedule";
import { ensureNflScheduleVenues } from "../lib/schedules/nfl-schedule-venues";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const apply = process.argv.includes("--apply");
  const live = process.argv.includes("--live");

  console.log(`\n  NFL ${NFL_SEASON} regular-season schedule sync`);
  console.log(`  Mode: ${apply ? "APPLY" : "DRY RUN"}`);
  console.log(`  Source: ${live ? "ESPN live scoreboard" : "data/nfl/2026-regular-season.json"}\n`);

  const venueEnsure = await ensureNflScheduleVenues(prisma, apply);
  console.log("  Venues");
  for (const row of venueEnsure) {
    console.log(`    ${row.slug.padEnd(36)} ${row.action}`);
  }

  const { parsed, mapped, skipped } = live
    ? mapNflScheduleFile(await fetchEspnNflRegularSeason(NFL_SEASON))
    : loadMappedNflSchedule();

  console.log(`\n  Events parsed: ${parsed}`);
  console.log(`  Mapped:        ${mapped.length}`);
  console.log(`  Skipped:       ${skipped.length}`);

  const venueRows = await prisma.venue.findMany({
    select: { id: true, slug: true }
  });
  const venueIdBySlug = new Map(venueRows.map((v) => [v.slug, v.id]));

  const existingNfl = await prisma.game.findMany({
    where: { league: NFL_LEAGUE, season: NFL_SEASON },
    select: { id: true, externalId: true }
  });
  const existingByExternal = new Map(
    existingNfl.filter((g) => g.externalId).map((g) => [g.externalId!, g.id])
  );

  let created = 0;
  let updated = 0;
  let skippedNoVenue = 0;
  let tbd = 0;
  const venueSlugsCovered = new Set<string>();
  const syncNow = new Date();

  for (const game of mapped) {
    if (game.kickoffTbd) tbd += 1;
    venueSlugsCovered.add(game.venueSlug);
    const venueId = venueIdBySlug.get(game.venueSlug);
    if (!venueId) {
      skippedNoVenue += 1;
      console.warn(`  MISSING VENUE ${game.venueSlug} · ${game.externalId}`);
      continue;
    }

    const data = nflMappedGameToPrismaData(game, venueId);
    const existed = existingByExternal.has(game.externalId);
    if (existed) updated += 1;
    else created += 1;

    if (apply) {
      await prisma.game.upsert({
        where: { externalId: game.externalId },
        create: data,
        update: { ...data, updatedAt: syncNow }
      });
    }
  }

  for (const row of skipped) {
    console.warn(
      `  Skip nfl-${row.eventId}: ${row.reason} · ${row.awayTeamName ?? "?"} @ ${row.homeTeamName ?? "?"} · ${row.venueName ?? "—"} · ${row.startsAt}`
    );
  }

  const first = mapped[0];
  const last = mapped[mapped.length - 1];

  console.log("\n── Results ──────────────────────────────────────────");
  console.log(`  Existing NFL ${NFL_SEASON} rows before sync: ${existingNfl.length}`);
  console.log(`  Would create / created:  ${created}`);
  console.log(`  Would update / updated:  ${updated}`);
  console.log(`  Deleted/deactivated:     0 (importer never deletes)`);
  console.log(`  TBD kickoffs (closed window): ${tbd}`);
  console.log(`  Skipped (mapping):       ${skipped.length}`);
  console.log(`  Skipped (venue in DB):   ${skippedNoVenue}`);
  console.log(`  Venues covered:          ${venueSlugsCovered.size}`);
  if (first) console.log(`  First kickoff:           ${first.startsAt.toISOString()}`);
  if (last) console.log(`  Last kickoff:            ${last.startsAt.toISOString()}`);

  if (!apply) {
    console.log("\n  Dry run only. Re-run with --apply to write.\n");
  } else {
    const after = await prisma.game.count({
      where: { league: NFL_LEAGUE, season: NFL_SEASON }
    });
    console.log(`\n  Done. NFL ${NFL_SEASON} Game rows now: ${after}\n`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
