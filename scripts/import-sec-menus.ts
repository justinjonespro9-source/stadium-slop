#!/usr/bin/env npx tsx
/**
 * Batch-import SEC venue menus (verified parsers only).
 * Does not touch existing deep SEC menus (Bryant-Denny, Sanford, Tiger,
 * Neyland, DKR, Kyle Field).
 *
 *   npx tsx scripts/import-sec-menus.ts --apply
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { NCAA_MENU_PENDING_VENUE_SLUGS } from "../lib/venue-empty-menu";
import { applyVenueMenuImport } from "../lib/venue-menu-import/apply";
import { getVenueMenuParser } from "../lib/venue-menu-import/registry";
import { SEC_FOOTBALL_MENU_VENUE_SLUGS } from "../lib/venue-menu-import/sec-football-menus";

const MENU_PENDING_SLUGS = [...NCAA_MENU_PENDING_VENUE_SLUGS] as const;

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`\n  SEC menu import · ${apply ? "APPLY" : "DRY RUN"}\n`);
  console.log(
    `  Pending (no import): ${MENU_PENDING_SLUGS.filter((s) =>
      [
        "donald-w-reynolds-razorback-stadium",
        "ben-hill-griffin-stadium",
        "davis-wade-stadium",
        "williams-brice-stadium"
      ].includes(s)
    ).join(", ")}\n`
  );

  for (const slug of SEC_FOOTBALL_MENU_VENUE_SLUGS) {
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
