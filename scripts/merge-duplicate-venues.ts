/**
 * Merge duplicate venue rows into canonical slugs (safe migration before delete).
 *
 * Usage:
 *   npm run merge:duplicate-venues              # dry-run (default)
 *   npm run merge:duplicate-venues -- --apply   # write changes
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  DEFAULT_MERGE_PAIRS,
  formatChildCounts,
  runVenueMerges,
  type MergePairResult
} from "../lib/merge-duplicate-venues";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

const apply = process.argv.includes("--apply");

function printMoves(result: MergePairResult) {
  const m = result.moved;
  console.log(
    `  Records to move: vendors=${m.vendorsMoved} (merged=${m.vendorsMerged}), ` +
      `items=${m.itemsMoved} (merged=${m.itemsMerged}), photos=${m.photosMoved}, ` +
      `reviews=${m.reviewsMoved}, priceReports=${m.priceReportsMoved}, ` +
      `suggestedItems=${m.suggestedItemsMoved}, games=${m.gamesMoved}, ` +
      `homeUsers=${m.homeUsersMoved}`
  );
}

function printResult(result: MergePairResult) {
  console.log(`\n${result.pair.label}`);
  console.log(`  ${result.pair.aliasSlug} → ${result.pair.canonicalSlug}`);

  if (result.error) {
    console.log(`  ERROR: ${result.error}`);
    return;
  }

  console.log(
    `  Before — alias: ${formatChildCounts(result.before.alias)}, ` +
      `canonical: ${formatChildCounts(result.before.canonical)}`
  );
  printMoves(result);

  if (result.conflicts.length > 0) {
    console.log(`  Conflicts (${result.conflicts.length}):`);
    for (const c of result.conflicts) {
      console.log(`    · [${c.kind}] ${c.slug}: ${c.message}`);
    }
  } else {
    console.log("  Conflicts: none");
  }

  if (apply) {
    console.log(
      `  Alias deleted: ${result.aliasDeleted ? "yes" : "no"}` +
        (result.aliasRemaining
          ? ` — remaining: ${formatChildCounts(result.aliasRemaining)}`
          : "")
    );
  } else {
    const remaining = result.aliasRemaining;
    const wouldDelete =
      remaining === null || (remaining ? formatChildCounts(remaining) === "empty" : true);
    console.log(
      `  Alias would delete: ${wouldDelete ? "yes (after migration)" : "no — children remain"}`
    );
    if (remaining && !wouldDelete) {
      console.log(`  Projected alias remaining: ${formatChildCounts(remaining)}`);
    }
  }
}

async function main() {
  console.log(apply ? "APPLY — migrating and deleting aliases\n" : "DRY RUN — no writes\n");

  const results = await runVenueMerges(prisma, DEFAULT_MERGE_PAIRS, apply);

  for (const result of results) {
    printResult(result);
  }

  const totalMoved = results.reduce(
    (acc, r) => {
      acc.vendorsMoved += r.moved.vendorsMoved;
      acc.itemsMoved += r.moved.itemsMoved;
      acc.reviewsMoved += r.moved.reviewsMoved;
      acc.homeUsersMoved += r.moved.homeUsersMoved;
      return acc;
    },
    { vendorsMoved: 0, itemsMoved: 0, reviewsMoved: 0, homeUsersMoved: 0 }
  );

  const errors = results.filter((r) => r.error);
  const notDeleted = apply
    ? results.filter((r) => !r.error && !r.aliasDeleted)
    : [];

  console.log("\nSummary");
  console.log("-------");
  console.log(`Pairs processed: ${results.length}`);
  console.log(`Errors: ${errors.length}`);
  if (apply) {
    console.log(`Aliases deleted: ${results.filter((r) => r.aliasDeleted).length}`);
    console.log(`Aliases not deleted: ${notDeleted.length}`);
  }
  console.log(
    `Total moves (reported): vendors=${totalMoved.vendorsMoved}, items=${totalMoved.itemsMoved}, ` +
      `reviews=${totalMoved.reviewsMoved}, homeUsers=${totalMoved.homeUsersMoved}`
  );

  const safeToApply =
    !apply &&
    errors.length === 0 &&
    results.every(
      (r) =>
        !r.error &&
        (formatChildCounts(r.before.alias) !== "empty" ||
          r.before.alias.homeUsers > 0)
    );

  console.log("");
  if (apply) {
    console.log("Apply complete.");
  } else if (safeToApply) {
    console.log("Safe to run: npm run merge:duplicate-venues -- --apply");
  } else {
    console.log("Resolve errors before running with --apply.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
