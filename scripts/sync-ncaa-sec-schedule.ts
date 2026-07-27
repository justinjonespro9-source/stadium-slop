/**
 * Upsert curated 2026 SEC football home games.
 *
 * Usage:
 *   npm run sync:ncaa-sec-schedule
 *   npm run sync:ncaa-sec-schedule -- --apply
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  mapAllSec2026HomeGames,
  ncaaSecMappedGameToPrismaData
} from "../lib/schedules/ncaa-sec-schedule";
import { NCAA_SEC_2026_EXCLUDED_NEUTRALS } from "../lib/schedules/ncaa-sec-2026-data";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const apply = process.argv.includes("--apply");
  const mapped = mapAllSec2026HomeGames();
  const venueRows = await prisma.venue.findMany({ select: { id: true, slug: true } });
  const venueIdBySlug = new Map(venueRows.map((v) => [v.slug, v.id]));

  console.log(`\n  NCAA SEC 2026 schedule sync`);
  console.log(`  Mode: ${apply ? "APPLY" : "DRY RUN"}\n`);
  console.log(`  Fixtures mapped: ${mapped.length}`);
  console.log(`  Excluded neutrals: ${NCAA_SEC_2026_EXCLUDED_NEUTRALS.length}`);
  for (const n of NCAA_SEC_2026_EXCLUDED_NEUTRALS) {
    console.log(`    - ${n.date} ${n.awayTeamName} @ ${n.homeTeamName} (${n.location})`);
  }

  const byVenue = new Map<string, number>();
  let upserted = 0;
  let missingVenue = 0;
  let tbd = 0;

  const syncNow = new Date();
  for (const game of mapped) {
    if (game.kickoffTbd) tbd += 1;
    byVenue.set(game.venueSlug, (byVenue.get(game.venueSlug) ?? 0) + 1);
    const venueId = venueIdBySlug.get(game.venueSlug);
    if (!venueId) {
      missingVenue += 1;
      console.warn(`  MISSING VENUE ${game.venueSlug} · ${game.externalId}`);
      continue;
    }
    const data = ncaaSecMappedGameToPrismaData(game, venueId);
    if (apply) {
      await prisma.game.upsert({
        where: { externalId: game.externalId },
        create: data,
        update: { ...data, updatedAt: syncNow }
      });
    }
    upserted += 1;
  }

  console.log("\n── By venue ─────────────────────────────────────────");
  for (const [slug, count] of [...byVenue.entries()].sort()) {
    console.log(`  ${slug.padEnd(48)} ${count}`);
  }
  console.log("\n── Summary ──────────────────────────────────────────");
  console.log(`  Would upsert / upserted: ${upserted}`);
  console.log(`  TBD kickoffs:            ${tbd}`);
  console.log(`  Missing venues:          ${missingVenue}`);
  if (!apply) {
    console.log("\n  Dry run only. Re-run with --apply to write.\n");
  } else {
    console.log("\n  Done.\n");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
