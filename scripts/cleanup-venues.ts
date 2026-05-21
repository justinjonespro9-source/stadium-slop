/**
 * Admin-safe venue duplicate audit and shared-arena metadata cleanup.
 *
 * Usage:
 *   npm run cleanup:venues
 *   npm run cleanup:venues -- --dry-run
 *
 * - Merges teams/leagues on shared NBA/NHL (and configured) arenas
 * - Deletes empty duplicate venue rows only (never auto-deletes venues with children)
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  buildSharedVenueUpdate,
  findDuplicateGroupsByName,
  formatChildCounts,
  isVenueEmpty,
  KNOWN_DUPLICATE_GROUPS,
  type VenueChildCounts,
  type VenueCleanupRow
} from "../lib/venue-cleanup";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

const dryRun = process.argv.includes("--dry-run");

async function childCounts(venueId: string): Promise<VenueChildCounts> {
  const counts = await prisma.venue.findUnique({
    where: { id: venueId },
    select: {
      _count: {
        select: {
          vendors: true,
          items: true,
          photos: true,
          games: true,
          reviews: true,
          priceReports: true,
          suggestedItems: true,
          homeUsers: true
        }
      }
    }
  });
  return counts?._count ?? {
    vendors: 0,
    items: 0,
    photos: 0,
    games: 0,
    reviews: 0,
    priceReports: 0,
    suggestedItems: 0,
    homeUsers: 0
  };
}

async function main() {
  const venues = await prisma.venue.findMany({
    orderBy: { slug: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      leagues: true,
      teams: true
    }
  });

  const stats = {
    venuesUpdated: 0,
    teamsAdded: 0,
    duplicatesFound: 0,
    duplicatesDeleted: 0,
    duplicatesRequiringManualMerge: 0
  };

  console.log(dryRun ? "DRY RUN — no writes\n" : "Applying venue cleanup…\n");

  // --- Shared arena metadata (teams + leagues) ---
  console.log("Shared arena metadata");
  console.log("---------------------");
  for (const venue of venues) {
    const patch = buildSharedVenueUpdate(venue as VenueCleanupRow);
    if (!patch) continue;

    console.log(
      `Update ${venue.slug}: leagues [${patch.leagues.join(", ")}], teams [${patch.teams.join(", ")}]` +
        (patch.teamsAdded.length
          ? ` (+${patch.teamsAdded.join(", ")})`
          : "")
    );

    if (!dryRun) {
      await prisma.venue.update({
        where: { id: venue.id },
        data: {
          leagues: patch.leagues,
          teams: patch.teams
        }
      });
    }
    stats.venuesUpdated += 1;
    stats.teamsAdded += patch.teamsAdded.length;
  }

  // --- Audit: all duplicate name groups ---
  console.log("\nDuplicate audit (normalized name)");
  console.log("--------------------------------");
  const byName = findDuplicateGroupsByName(venues as VenueCleanupRow[]);
  for (const [key, group] of byName) {
    if (group.length < 2) continue;
    stats.duplicatesFound += group.length;
    console.log(`\n${key} (${group.length} rows):`);
    for (const v of group) {
      const counts = await childCounts(v.id);
      console.log(`  · ${v.slug} — ${v.name} [${formatChildCounts(counts)}]`);
    }
  }

  // --- Known duplicate groups: delete empty alias or flag manual merge ---
  console.log("\nKnown duplicate resolution");
  console.log("---------------------------");
  const venueBySlug = new Map(venues.map((v) => [v.slug, v]));

  for (const group of KNOWN_DUPLICATE_GROUPS) {
    const canonical = venueBySlug.get(group.canonicalSlug);
    if (!canonical) {
      console.warn(`Canonical missing: ${group.canonicalSlug}`);
      continue;
    }

    console.log(`\n${group.label}`);
    console.log(`  Canonical: ${group.canonicalSlug}`);

    for (const aliasSlug of group.aliasSlugs) {
      const alias = venueBySlug.get(aliasSlug);
      if (!alias) {
        console.log(`  Alias ${aliasSlug}: not in database`);
        continue;
      }

      const counts = await childCounts(alias.id);
      if (isVenueEmpty(counts)) {
        console.log(`  Delete empty alias: ${aliasSlug}`);
        if (!dryRun) {
          await prisma.venue.delete({ where: { id: alias.id } });
        }
        stats.duplicatesDeleted += 1;
        continue;
      }

      stats.duplicatesRequiringManualMerge += 1;
      console.log(
        `  MANUAL MERGE REQUIRED: ${aliasSlug} → ${group.canonicalSlug}`
      );
      console.log(`    Child records: ${formatChildCounts(counts)}`);
      console.log(
        `    Suggested: re-point vendors/items/photos/reviews/games from venue id ${alias.id} to ${canonical.id}, then delete ${aliasSlug}`
      );
    }
  }

  console.log("\nCleanup summary");
  console.log("---------------");
  console.log(`Venues updated:              ${stats.venuesUpdated}`);
  console.log(`Teams added:                 ${stats.teamsAdded}`);
  console.log(`Duplicates found (by name):  ${stats.duplicatesFound}`);
  console.log(`Duplicates deleted:          ${stats.duplicatesDeleted}`);
  console.log(
    `Duplicates requiring manual: ${stats.duplicatesRequiringManualMerge}`
  );

  if (dryRun) {
    console.log("\nRe-run without --dry-run to apply updates/deletes.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
