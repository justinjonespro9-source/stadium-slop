/**
 * Hide generic concession items (water, domestic beer, value popcorn, etc.) from public rankings.
 * Does not delete rows — sets FoodItem.status to HIDDEN.
 *
 * Usage:
 *   npm run cleanup:generic-items -- --dry-run
 *   npm run cleanup:generic-items -- --apply
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  applyGenericFoodItemCleanup,
  auditGenericFoodItems
} from "../lib/apply-generic-food-item-cleanup";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;

async function main() {
  console.log(dryRun ? "DRY RUN — generic item cleanup\n" : "APPLY — hiding generic items\n");

  const audit = await auditGenericFoodItems(prisma);

  console.log(`Scanned:        ${audit.rows.length} active/hidden items`);
  console.log(`Would hide:     ${audit.toHide.length}`);
  console.log(`Already hidden: ${audit.alreadyHidden}`);
  console.log(`Not generic:    ${audit.skippedNotGeneric}`);

  if (audit.toHide.length === 0) {
    console.log("\nNo generic items to hide.");
    return;
  }

  console.log("\nVenue · Item · Reason · Action");
  console.log("--------------------------------");

  for (const row of audit.toHide) {
    const action = dryRun ? "would hide (HIDDEN)" : "hide (HIDDEN)";
    const reviews =
      row.reviewCount > 0 ? ` · ${row.reviewCount} review(s) kept` : "";
    console.log(
      `${row.venueSlug} · ${row.itemName} · ${row.classification.reason ?? "generic"} · ${action}${reviews}`
    );
  }

  if (dryRun) {
    console.log(`\n${audit.toHide.length} item(s) would be hidden.`);
    console.log("Run: npm run cleanup:generic-items -- --apply");
    return;
  }

  const stats = await applyGenericFoodItemCleanup(prisma, true);
  console.log(`\nDone. ${stats.hidden} item(s) set to HIDDEN.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
