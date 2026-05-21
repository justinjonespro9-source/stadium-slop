/**
 * Merge legacy MLS/NWSL orphan venue slugs into canonical venues, then delete aliases.
 *
 * Usage:
 *   npm run cleanup:mls-nwsl-orphans              # dry-run (default)
 *   npm run cleanup:mls-nwsl-orphans -- --apply   # migrate and delete orphans
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  formatChildCounts,
  runVenueMerges,
  type MergePair,
  type MergePairResult
} from "../lib/merge-duplicate-venues";
import { MLS_NWSL_ORPHAN_VENUE_MERGES } from "../lib/mls-nwsl-venue-registry";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

const ORPHAN_PAIRS: MergePair[] = MLS_NWSL_ORPHAN_VENUE_MERGES.map((p) => ({
  label: p.label,
  aliasSlug: p.aliasSlug,
  canonicalSlug: p.canonicalSlug
}));

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
      remaining === null ||
      (remaining !== null && formatChildCounts(remaining) === "empty");
    console.log(
      `  Alias would delete: ${wouldDelete ? "yes (after migration)" : "no — children remain"}`
    );
    if (remaining && !wouldDelete) {
      console.log(`  Projected alias remaining: ${formatChildCounts(remaining)}`);
    }
  }
}

async function main() {
  console.log(
    apply
      ? "APPLY — migrating MLS/NWSL orphan venues into canonical slugs\n"
      : "DRY RUN — MLS/NWSL orphan venue cleanup (no writes)\n"
  );

  const results = await runVenueMerges(prisma, ORPHAN_PAIRS, apply);

  for (const result of results) {
    printResult(result);
  }

  const errors = results.filter((r) => r.error);
  const notFound = results.filter((r) => r.error?.includes("not found"));
  const deleted = results.filter((r) => r.aliasDeleted);

  console.log("\nSummary");
  console.log("-------");
  console.log(`Orphan pairs: ${ORPHAN_PAIRS.length}`);
  console.log(`Errors: ${errors.length}`);
  if (notFound.length > 0) {
    console.log(`  (not found — may already be cleaned up: ${notFound.length})`);
  }
  if (apply) {
    console.log(`Aliases deleted: ${deleted.length}`);
    console.log(`Aliases not deleted: ${results.filter((r) => !r.error && !r.aliasDeleted).length}`);
  } else {
    const safe = errors.length === 0 && results.every((r) => {
      if (r.error) return false;
      const remaining = r.aliasRemaining;
      return (
        remaining === null ||
        (remaining !== null && formatChildCounts(remaining) === "empty")
      );
    });
    console.log("");
    if (safe) {
      console.log("Safe to run: npm run cleanup:mls-nwsl-orphans -- --apply");
    } else {
      console.log("Review output before running with --apply.");
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
