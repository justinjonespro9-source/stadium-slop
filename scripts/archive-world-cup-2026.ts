/**
 * Mark all World Cup 2026 Game rows FINAL (archive competition without deleting).
 *
 *   npx tsx scripts/archive-world-cup-2026.ts --dry-run
 *   npx tsx scripts/archive-world-cup-2026.ts --apply
 *   npm run archive:world-cup-2026
 */

import "dotenv/config";

import { GameStatus, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { WORLD_CUP_LEAGUE } from "../lib/schedules/world-cup-schedule";
import { WORLD_CUP_2026_ARCHIVED } from "../lib/world-cup-archive";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function main() {
  const apply = process.argv.includes("--apply");
  const dryRun = !apply;

  console.log(`\n  Archive World Cup 2026 games`);
  console.log(`  Archive flag: ${WORLD_CUP_2026_ARCHIVED}`);
  console.log(`  Mode: ${dryRun ? "DRY RUN" : "APPLY"}\n`);

  const where = {
    OR: [{ league: WORLD_CUP_LEAGUE }, { externalId: { startsWith: "wc26-" } }]
  };

  const games = await prisma.game.findMany({
    where,
    select: { id: true, status: true, externalId: true, startsAt: true }
  });

  const byStatus: Record<string, number> = {};
  for (const g of games) {
    byStatus[g.status] = (byStatus[g.status] ?? 0) + 1;
  }

  const toFinalize = games.filter((g) => g.status !== GameStatus.FINAL);
  console.log(`  Total World Cup games: ${games.length}`);
  console.log(`  By status: ${JSON.stringify(byStatus)}`);
  console.log(`  To mark FINAL: ${toFinalize.length}`);

  if (dryRun) {
    console.log(`\n  Dry run — no writes.\n`);
    return;
  }

  if (toFinalize.length === 0) {
    console.log(`\n  Already archived.\n`);
    return;
  }

  const result = await prisma.game.updateMany({
    where: {
      ...where,
      status: { not: GameStatus.FINAL }
    },
    data: { status: GameStatus.FINAL }
  });

  console.log(`\n  Updated ${result.count} game(s) → FINAL\n`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
