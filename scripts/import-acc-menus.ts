#!/usr/bin/env npx tsx
/**
 * Batch-import ACC venue menus (verified parsers only).
 * Hard Rock uses the ACC college-confirmed parser — does not replace the NFL menu parser.
 *
 *   npx tsx scripts/import-acc-menus.ts --apply
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { NCAA_MENU_PENDING_VENUE_SLUGS } from "../lib/venue-empty-menu";
import { applyVenueMenuImport } from "../lib/venue-menu-import/apply";
import {
  ACC_FOOTBALL_MENU_VENUE_SLUGS,
  parseAlumniStadiumMenu,
  parseBobbyDoddStadiumAtHyundaiFieldMenu,
  parseCarterFinleyStadiumMenu,
  parseDoakCampbellStadiumMenu,
  parseGeraldJFordStadiumMenu,
  parseHardRockStadiumAccMenu,
  parseJmaWirelessDomeMenu,
  parseKenanMemorialStadiumMenu,
  parseLaneStadiumMenu,
  parseLnFederalCreditUnionStadiumMenu,
  parseMemorialStadiumClemsonMenu,
  parseScottStadiumMenu,
  parseStanfordStadiumMenu
} from "../lib/venue-menu-import/acc-football-menus";
import type { VenueMenuParser } from "../lib/venue-menu-import/types";

const ACC_PENDING = [
  "california-memorial-stadium",
  "wallace-wade-stadium",
  "acrisure-stadium",
  "allegacy-federal-credit-union-stadium"
] as const;

const PARSERS: Record<string, VenueMenuParser> = {
  "alumni-stadium": parseAlumniStadiumMenu,
  "memorial-stadium-clemson": parseMemorialStadiumClemsonMenu,
  "doak-campbell-stadium": parseDoakCampbellStadiumMenu,
  "bobby-dodd-stadium-at-hyundai-field": parseBobbyDoddStadiumAtHyundaiFieldMenu,
  "ln-federal-credit-union-stadium": parseLnFederalCreditUnionStadiumMenu,
  "hard-rock-stadium": parseHardRockStadiumAccMenu,
  "kenan-memorial-stadium": parseKenanMemorialStadiumMenu,
  "carter-finley-stadium": parseCarterFinleyStadiumMenu,
  "gerald-j-ford-stadium": parseGeraldJFordStadiumMenu,
  "stanford-stadium": parseStanfordStadiumMenu,
  "jma-wireless-dome": parseJmaWirelessDomeMenu,
  "scott-stadium": parseScottStadiumMenu,
  "lane-stadium": parseLaneStadiumMenu
};

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`\n  ACC menu import · ${apply ? "APPLY" : "DRY RUN"}\n`);
  console.log(
    `  Pending (no import): ${ACC_PENDING.filter((s) =>
      NCAA_MENU_PENDING_VENUE_SLUGS.has(s)
    ).join(", ")}\n`
  );

  for (const slug of ACC_FOOTBALL_MENU_VENUE_SLUGS) {
    const parser = PARSERS[slug];
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
