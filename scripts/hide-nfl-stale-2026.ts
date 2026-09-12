/**
 * Hide the 42 STALE_REVIEW NFL items from the 2026 coverage report.
 *
 * Does not delete. Constrained to explicit venue+slug pairs in
 * data/nfl/2026-stale-hide.json. Skips any row that is no longer ACTIVE,
 * has a public review, or no longer matches the queued slug/venue.
 *
 *   npm run hide:nfl-stale-2026 -- --dry-run
 *   npm run hide:nfl-stale-2026 -- --apply
 */

import "dotenv/config";

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { EntityStatus, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const QUEUE_FILE = resolve("data/nfl/2026-stale-hide.json");
const HIDE_TAG = "hidden-stale-2026";

type QueueItem = { slug: string; name: string };
type QueueVenue = { venueSlug: string; venueName: string; items: QueueItem[] };
type Queue = { venues: QueueVenue[] };

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

type Candidate = {
  venueSlug: string;
  venueName: string;
  expectedName: string;
  slug: string;
  itemId: string | null;
  status: string | null;
  publicReviews: number;
  action: "hide" | "skip";
  skipReason?: string;
};

function pad(value: string | number, width: number): string {
  return String(value).padStart(width);
}

async function plan(): Promise<{
  candidates: Candidate[];
  nflVenueIds: string[];
}> {
  const queue = JSON.parse(readFileSync(QUEUE_FILE, "utf8")) as Queue;
  const expectedCount = queue.venues.reduce((sum, venue) => sum + venue.items.length, 0);
  if (expectedCount !== 42) {
    throw new Error(`Stale queue must contain exactly 42 items, found ${expectedCount}`);
  }

  const nflVenueIds = (
    await prisma.game.findMany({
      where: { league: "NFL", season: 2026 },
      select: { venueId: true },
      distinct: ["venueId"]
    })
  ).map((row) => row.venueId);

  const candidates: Candidate[] = [];

  for (const venue of queue.venues) {
    const dbVenue = await prisma.venue.findFirst({
      where: { slug: venue.venueSlug },
      select: { id: true, name: true, slug: true }
    });
    if (!dbVenue) {
      for (const item of venue.items) {
        candidates.push({
          venueSlug: venue.venueSlug,
          venueName: venue.venueName,
          expectedName: item.name,
          slug: item.slug,
          itemId: null,
          status: null,
          publicReviews: 0,
          action: "skip",
          skipReason: "venue not found"
        });
      }
      continue;
    }

    for (const item of venue.items) {
      const row = await prisma.foodItem.findFirst({
        where: { venueId: dbVenue.id, slug: item.slug },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          venue: { select: { slug: true } },
          reviews: {
            where: { status: EntityStatus.ACTIVE, isTestReview: false },
            select: { id: true }
          }
        }
      });

      if (!row) {
        candidates.push({
          venueSlug: venue.venueSlug,
          venueName: venue.venueName,
          expectedName: item.name,
          slug: item.slug,
          itemId: null,
          status: null,
          publicReviews: 0,
          action: "skip",
          skipReason: "item slug not found at venue"
        });
        continue;
      }

      const publicReviews = row.reviews.length;
      let action: Candidate["action"] = "hide";
      let skipReason: string | undefined;
      if (row.venue.slug !== venue.venueSlug) {
        action = "skip";
        skipReason = `venue mismatch (${row.venue.slug})`;
      } else if (row.status !== EntityStatus.ACTIVE) {
        action = "skip";
        skipReason = `status is ${row.status}`;
      } else if (publicReviews > 0) {
        action = "skip";
        skipReason = `${publicReviews} public review(s)`;
      }

      candidates.push({
        venueSlug: venue.venueSlug,
        venueName: venue.venueName,
        expectedName: item.name,
        slug: item.slug,
        itemId: row.id,
        status: row.status,
        publicReviews,
        action,
        skipReason
      });
    }
  }

  return { candidates, nflVenueIds };
}

async function countsFor(venueSlugs: string[]) {
  const venues = await prisma.venue.findMany({
    where: { slug: { in: venueSlugs } },
    select: { slug: true, id: true }
  });
  const rows: Record<string, { active: number; hidden: number }> = {};
  for (const venue of venues) {
    const active = await prisma.foodItem.count({
      where: { venueId: venue.id, status: EntityStatus.ACTIVE }
    });
    const hidden = await prisma.foodItem.count({
      where: { venueId: venue.id, status: EntityStatus.HIDDEN }
    });
    rows[venue.slug] = { active, hidden };
  }
  return rows;
}

async function nflActiveItemCount(nflVenueIds: string[]) {
  return prisma.foodItem.count({
    where: { venueId: { in: nflVenueIds }, status: EntityStatus.ACTIVE }
  });
}

async function main() {
  const apply = process.argv.includes("--apply");
  const dryRun = !apply;

  console.log("\n  Hide 2026 NFL STALE_REVIEW items");
  console.log(`  Queue: ${QUEUE_FILE}`);
  console.log(`  Mode: ${dryRun ? "DRY RUN (no changes)" : "APPLY"}\n`);

  const { candidates, nflVenueIds } = await plan();
  const venueSlugs = [...new Set(candidates.map((row) => row.venueSlug))];
  const beforeVenue = await countsFor(venueSlugs);
  const beforeNfl = await nflActiveItemCount(nflVenueIds);
  const beforeVendors = await prisma.vendor.count();
  const beforeItems = await prisma.foodItem.count();
  const beforeGames = await prisma.game.count({ where: { league: "NFL", season: 2026 } });

  const byVenue = new Map<string, Candidate[]>();
  for (const row of candidates) {
    const list = byVenue.get(row.venueSlug) ?? [];
    list.push(row);
    byVenue.set(row.venueSlug, list);
  }

  console.log(
    `${"Venue".padEnd(22)} ${pad("Candidates", 11)} ${pad("Still Active", 13)} ${pad("Public Reviews", 15)} ${pad("To Hide", 8)} ${pad("Skipped", 8)}`
  );
  console.log("-".repeat(80));
  let totalHide = 0;
  let totalSkip = 0;
  for (const slug of venueSlugs) {
    const rows = byVenue.get(slug) ?? [];
    const stillActive = rows.filter((row) => row.status === EntityStatus.ACTIVE).length;
    const reviews = rows.reduce((sum, row) => sum + row.publicReviews, 0);
    const hide = rows.filter((row) => row.action === "hide").length;
    const skip = rows.filter((row) => row.action === "skip").length;
    totalHide += hide;
    totalSkip += skip;
    const name = rows[0]?.venueName ?? slug;
    console.log(
      `${name.padEnd(22)} ${pad(rows.length, 11)} ${pad(stillActive, 13)} ${pad(reviews, 15)} ${pad(hide, 8)} ${pad(skip, 8)}`
    );
  }
  console.log("-".repeat(80));
  console.log(
    `${"TOTAL".padEnd(22)} ${pad(candidates.length, 11)} ${pad(
      candidates.filter((row) => row.status === EntityStatus.ACTIVE).length,
      13
    )} ${pad(
      candidates.reduce((sum, row) => sum + row.publicReviews, 0),
      15
    )} ${pad(totalHide, 8)} ${pad(totalSkip, 8)}`
  );

  const skipped = candidates.filter((row) => row.action === "skip");
  if (skipped.length > 0) {
    console.log("\n── Skipped ──────────────────────────────────────────");
    for (const row of skipped) {
      console.log(`  ${row.venueSlug}  ${row.slug}  -- ${row.skipReason}`);
    }
  }

  const toHide = candidates.filter((row) => row.action === "hide" && row.itemId);
  console.log("\n── Hide plan ────────────────────────────────────────");
  for (const row of toHide) {
    console.log(`  HIDDEN  ${row.venueSlug.padEnd(22)} ${row.slug}`);
  }

  console.log("\n── Before ───────────────────────────────────────────");
  for (const slug of venueSlugs) {
    const counts = beforeVenue[slug];
    console.log(`  ${slug}: active ${counts?.active ?? 0}  hidden ${counts?.hidden ?? 0}`);
  }
  console.log(`  NFL 2026 venues active items: ${beforeNfl}`);

  if (dryRun) {
    console.log("\n  Dry run only. Re-run with --apply to hide matching rows.\n");
    return;
  }

  const hideIds = toHide.map((row) => row.itemId as string);
  const hideIdSet = new Set(hideIds);

  await prisma.$transaction(
    async (tx) => {
      const otherItemsBefore = await tx.foodItem.count({
        where: { id: { notIn: hideIds } }
      });
      const vendorsBefore = await tx.vendor.count();
      const gamesBefore = await tx.game.count({ where: { league: "NFL", season: 2026 } });

      for (const row of toHide) {
        const existing = await tx.foodItem.findUnique({
          where: { id: row.itemId! },
          select: {
            id: true,
            slug: true,
            status: true,
            tags: true,
            venue: { select: { slug: true } },
            reviews: {
              where: { status: EntityStatus.ACTIVE, isTestReview: false },
              select: { id: true }
            }
          }
        });
        if (!existing) throw new Error(`Item ${row.itemId} disappeared`);
        if (existing.venue.slug !== row.venueSlug) {
          throw new Error(`Venue changed for ${row.slug}`);
        }
        if (existing.slug !== row.slug) throw new Error(`Slug changed for ${row.itemId}`);
        if (existing.status !== EntityStatus.ACTIVE) {
          throw new Error(`${row.slug} is no longer ACTIVE`);
        }
        if (existing.reviews.length > 0) {
          throw new Error(`${row.slug} gained a public review`);
        }
        await tx.foodItem.update({
          where: { id: existing.id },
          data: {
            status: EntityStatus.HIDDEN,
            tags: [...new Set([...existing.tags, HIDE_TAG])]
          }
        });
      }

      const hiddenNow = await tx.foodItem.findMany({
        where: { id: { in: hideIds } },
        select: { id: true, status: true, slug: true }
      });
      if (hiddenNow.some((row) => row.status !== EntityStatus.HIDDEN)) {
        throw new Error("Not all intended rows are HIDDEN after update");
      }
      if (hiddenNow.length !== hideIds.length) {
        throw new Error("Hide set size mismatch");
      }

      const otherItemsAfter = await tx.foodItem.count({
        where: { id: { notIn: hideIds } }
      });
      const vendorsAfter = await tx.vendor.count();
      const gamesAfter = await tx.game.count({ where: { league: "NFL", season: 2026 } });
      if (otherItemsAfter !== otherItemsBefore) {
        throw new Error("A FoodItem outside the hide set changed; aborting");
      }
      if (vendorsAfter !== vendorsBefore) {
        throw new Error("Vendor count changed; aborting");
      }
      if (gamesAfter !== gamesBefore) {
        throw new Error("NFL 2026 game count changed; aborting");
      }
    },
    { maxWait: 15_000, timeout: 60_000 }
  );

  const afterVenue = await countsFor(venueSlugs);
  const afterNfl = await nflActiveItemCount(nflVenueIds);
  const afterVendors = await prisma.vendor.count();
  const afterItems = await prisma.foodItem.count();
  const afterGames = await prisma.game.count({ where: { league: "NFL", season: 2026 } });

  console.log("\n── After ────────────────────────────────────────────");
  for (const slug of venueSlugs) {
    const before = beforeVenue[slug];
    const after = afterVenue[slug];
    console.log(
      `  ${slug}: active ${before?.active ?? 0} → ${after?.active ?? 0}  hidden ${before?.hidden ?? 0} → ${after?.hidden ?? 0}`
    );
  }
  console.log(`  NFL 2026 venues active items: ${beforeNfl} → ${afterNfl}`);
  console.log(`  Hidden this run: ${toHide.length}`);
  console.log(`  Delta active NFL items: ${afterNfl - beforeNfl}`);

  if (afterNfl !== beforeNfl - toHide.length) {
    throw new Error("NFL active-item count did not drop by the hide count");
  }
  if (afterVendors !== beforeVendors) throw new Error("Vendor count changed after apply");
  if (afterItems !== beforeItems) throw new Error("FoodItem row count changed (delete detected)");
  if (afterGames !== beforeGames) throw new Error("NFL 2026 schedule changed");

  const leaked = await prisma.foodItem.findMany({
    where: { id: { in: [...hideIdSet] }, status: EntityStatus.ACTIVE },
    select: { slug: true }
  });
  if (leaked.length > 0) {
    throw new Error(`Still ACTIVE: ${leaked.map((row) => row.slug).join(", ")}`);
  }

  console.log("\n  Applied. No deletes, vendor writes, or schedule changes.\n");
}

main()
  .catch((error) => {
    console.error("Hide failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
