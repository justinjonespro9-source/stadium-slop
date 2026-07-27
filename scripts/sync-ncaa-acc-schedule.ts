/**
 * Upsert curated 2026 ACC football home games.
 *
 * Usage:
 *   npm run sync:ncaa-acc-schedule
 *   npm run sync:ncaa-acc-schedule -- --apply
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  mapAllAcc2026HomeGames,
  ncaaAccMappedGameToPrismaData
} from "../lib/schedules/ncaa-acc-schedule";
import { NCAA_ACC_2026_EXCLUDED_NEUTRALS } from "../lib/schedules/ncaa-acc-2026-data";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const apply = process.argv.includes("--apply");
  const mapped = mapAllAcc2026HomeGames();
  const venueRows = await prisma.venue.findMany({ select: { id: true, slug: true } });
  const venueIdBySlug = new Map(venueRows.map((v) => [v.slug, v.id]));

  console.log(`\n  NCAA ACC 2026 schedule sync`);
  console.log(`  Mode: ${apply ? "APPLY" : "DRY RUN"}\n`);
  console.log(`  Fixtures mapped: ${mapped.length}`);
  console.log(`  Excluded neutrals: ${NCAA_ACC_2026_EXCLUDED_NEUTRALS.length}`);
  for (const n of NCAA_ACC_2026_EXCLUDED_NEUTRALS) {
    console.log(`    - ${n.date} ${n.awayTeamName} @ ${n.homeTeamName} (${n.location})`);
  }

  const byVenue = new Map<string, number>();
  let missing = 0;
  let tbd = 0;
  for (const game of mapped) {
    byVenue.set(game.venueSlug, (byVenue.get(game.venueSlug) ?? 0) + 1);
    if (game.kickoffTbd) tbd += 1;
    const venueId = venueIdBySlug.get(game.venueSlug);
    if (!venueId) {
      console.warn(`  MISSING VENUE ${game.venueSlug} · ${game.externalId}`);
      missing += 1;
      continue;
    }
    if (apply) {
      await prisma.game.upsert({
        where: { externalId: game.externalId },
        create: ncaaAccMappedGameToPrismaData(game, venueId),
        update: ncaaAccMappedGameToPrismaData(game, venueId)
      });
    }
  }

  console.log("\n── By venue ─────────────────────────────────────────");
  for (const [slug, count] of [...byVenue.entries()].sort()) {
    console.log(`  ${slug.padEnd(48)} ${count}`);
  }
  console.log("\n── Summary ──────────────────────────────────────────");
  console.log(`  Would upsert / upserted: ${mapped.length - missing}`);
  console.log(`  TBD kickoffs:            ${tbd}`);
  console.log(`  Missing venues:          ${missing}`);
  console.log("\n  Done.\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
