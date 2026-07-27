#!/usr/bin/env npx tsx
/**
 * Batch-import Big Ten venue menus (verified parsers only).
 *
 *   npx tsx scripts/import-big-ten-menus.ts --apply
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { NCAA_MENU_PENDING_VENUE_SLUGS } from "../lib/venue-empty-menu";
import { applyVenueMenuImport } from "../lib/venue-menu-import/apply";
import { getVenueMenuParser } from "../lib/venue-menu-import/registry";

const BIG_TEN_MENU_SLUGS = [
  "michigan-stadium",
  "ohio-stadium",
  "beaver-stadium",
  "camp-randall-stadium",
  "huntington-bank-stadium",
  "memorial-stadium-illinois",
  "memorial-stadium-indiana",
  "kinnick-stadium",
  "secu-stadium",
  "spartan-stadium",
  "memorial-stadium-nebraska",
  "northwestern-medicine-field-at-martin-stadium",
  "autzen-stadium",
  "rose-bowl",
  "los-angeles-memorial-coliseum",
  "husky-stadium"
] as const;

/** Intentionally no menu parser yet (thin/unverified sources). */
const MENU_PENDING_SLUGS = [...NCAA_MENU_PENDING_VENUE_SLUGS] as const;

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`\n  Big Ten menu import · ${apply ? "APPLY" : "DRY RUN"}\n`);
  console.log(`  Pending (no import): ${MENU_PENDING_SLUGS.join(", ")}\n`);

  for (const slug of BIG_TEN_MENU_SLUGS) {
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
