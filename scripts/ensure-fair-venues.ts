/**
 * Ensure state fair venue shells exist in the database.
 *
 * Usage:
 *   npm run ensure:fair-venues -- --dry-run
 *   npm run ensure:fair-venues -- --apply
 *   npm run ensure:fair-venues -- --fair=minnesota-state-fair --apply
 */

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { ensureFairVenues } from "../lib/fair-import/ensure-venues";
import { getRegisteredFairSlugs } from "../lib/fair-import/registry";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public"
  })
});

async function main() {
  const argv = process.argv.slice(2);
  const isApply = argv.includes("--apply");
  const dryRun = !isApply;
  const fairArg = argv.find((a) => a.startsWith("--fair="))?.split("=")[1];
  const slugs = fairArg && fairArg !== "all" ? [fairArg] : undefined;

  console.log(`\n  Ensure fair venues — ${dryRun ? "DRY RUN" : "APPLY"}\n`);

  const summary = await ensureFairVenues(prisma, { dryRun, slugs });
  for (const row of summary.rows) {
    console.log(`  ${row.slug}: ${row.action}`);
  }

  if (dryRun) {
    console.log("\n  Re-run with --apply to write venues.\n");
  } else {
    console.log("\n  Done.\n");
  }

  if (fairArg && fairArg !== "all" && !getRegisteredFairSlugs().includes(fairArg)) {
    console.error(`Unknown fair slug: ${fairArg}`);
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
