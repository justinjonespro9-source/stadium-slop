#!/usr/bin/env npx tsx
/**
 * Batch-import Big 12 venue menus (verified parsers only).
 *
 *   npx tsx scripts/import-big-12-menus.ts --apply
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { NCAA_MENU_PENDING_VENUE_SLUGS } from "../lib/venue-empty-menu";
import { applyVenueMenuImport } from "../lib/venue-menu-import/apply";
import { getVenueMenuParser } from "../lib/venue-menu-import/registry";
import { BIG_12_FOOTBALL_MENU_VENUE_SLUGS } from "../lib/venue-menu-import/big-12-football-menus";

const BIG_12_PENDING = [
  "lavell-edwards-stadium",
  "jack-trice-stadium",
  "boone-pickens-stadium",
  "galaxy-stadium",
  "rice-eccles-stadium",
  "milan-puskar-stadium",
  "tdecu-stadium"
] as const;

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`\n  Big 12 menu import · ${apply ? "APPLY" : "DRY RUN"}\n`);
  console.log(
    `  Pending (no import): ${BIG_12_PENDING.filter((s) =>
      NCAA_MENU_PENDING_VENUE_SLUGS.has(s)
    ).join(", ")}\n`
  );

  for (const slug of BIG_12_FOOTBALL_MENU_VENUE_SLUGS) {
    const parser = await getVenueMenuParser(slug);
    if (!parser) {
      console.warn(`  NO PARSER ${slug}`);
      continue;
    }
    const parsed = await parser();
    const result = await applyVenueMenuImport(prisma, parsed, {
      dryRun: !apply
    });
    console.log(
      `  ${slug.padEnd(48)} items=${String(parsed.items.length).padStart(2)}  +${result.added} =${result.matched} skip=${result.skipped}`
    );
  }
  console.log("");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
