/**
 * QA helper: list MSP Mag would-add rows (dry-run, no writes).
 *   npx tsx scripts/qa-mspmag-would-add.ts
 */

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { parseMinnesotaStateFairMspMag2025 } from "../lib/fair-import/parsers/minnesota-state-fair-mspmag-2025";
import { applyVenueMenuImport } from "../lib/venue-menu-import/apply";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public"
  )
});

async function main() {
  const parseResult = await parseMinnesotaStateFairMspMag2025();
  const summary = await applyVenueMenuImport(prisma, parseResult, {
    dryRun: true,
    assumeNewVenue: false
  });

  const wouldAdd = summary.rows
    .filter((r) => r.action === "added")
    .sort((a, b) => a.name.localeCompare(b.name));

  const rows = wouldAdd.map((row) => {
    const item = parseResult.items.find((i) => i.name === row.name);
    return {
      name: row.name,
      vendor: item?.vendorName ?? row.vendorName,
      location: item?.vendorLocationHint ?? "",
      price: item?.price ?? null,
      description: item?.description ?? "",
      tags: item?.importTags ?? [],
      category: item?.category,
      ageRestricted: item?.category === "Alcoholic Drink"
    };
  });

  console.log(JSON.stringify({ count: rows.length, rows }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
