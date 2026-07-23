/**
 * Wisconsin State Fair — archive unverified 2025 leftovers and confirm Fat Elvis rename.
 *
 * Actions:
 *   - Hide five 2025-only leftovers with no 2026 Food Finder / new-foods verification
 *   - Hide 2025 "A Hunk A Hunk Elvis…" when the confirmed 2026 Fat Elvis listing exists
 *     (same Badger Bites vendor; official Food Finder title is Fat Elvis)
 *
 *   npx tsx scripts/cleanup-wisconsin-state-fair-2025-leftovers.ts --dry-run
 *   npx tsx scripts/cleanup-wisconsin-state-fair-2025-leftovers.ts --apply
 */

import "dotenv/config";

import { EntityStatus, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const VENUE_SLUG = "wisconsin-state-fair";

/** Exact names of 2025 leftovers with no confirmed 2026 availability. */
const HIDE_UNVERIFIED_2025_NAMES = [
  "Brat Rangoon",
  "Crookie",
  "Bavarian Cream Bug Donut",
  "Blueberry Breakfast Bratwurst",
  "Wisconsin Old Fashioned Wings"
] as const;

const ELVIS_2025_NAME = "A Hunk A Hunk Elvis Donut Ice Cream Sandwich";
const FAT_ELVIS_2026_NAME = "A Hunk A Hunk Fat Elvis Donut Ice Cream Sandwich";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

type ActionRow = {
  action: string;
  name: string;
  slug: string;
  status: EntityStatus;
  reviews: number;
  photos: number;
  note?: string;
};

async function main() {
  const apply = process.argv.includes("--apply");
  const dryRun = !apply || process.argv.includes("--dry-run");

  console.log(`\n  Wisconsin State Fair 2025 leftover cleanup`);
  console.log(`  Mode: ${dryRun ? "DRY RUN" : "APPLY"}\n`);

  const venue = await prisma.venue.findFirst({
    where: { slug: { equals: VENUE_SLUG, mode: "insensitive" } },
    select: { id: true, name: true, slug: true }
  });
  if (!venue) throw new Error(`Venue ${VENUE_SLUG} not found`);

  const items = await prisma.foodItem.findMany({
    where: { venueId: venue.id },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      vendor: { select: { name: true } },
      _count: { select: { reviews: true, photos: true } }
    }
  });

  const byName = new Map(items.map((i) => [i.name.trim().toLowerCase(), i]));
  const actions: ActionRow[] = [];

  for (const name of HIDE_UNVERIFIED_2025_NAMES) {
    const item = byName.get(name.toLowerCase());
    if (!item) {
      actions.push({
        action: "missing",
        name,
        slug: "—",
        status: EntityStatus.ACTIVE,
        reviews: 0,
        photos: 0,
        note: "No DB row — nothing to archive"
      });
      continue;
    }
    if (item.status !== EntityStatus.ACTIVE) {
      actions.push({
        action: "already-inactive",
        name: item.name,
        slug: item.slug,
        status: item.status,
        reviews: item._count.reviews,
        photos: item._count.photos,
        note: "Already not ACTIVE"
      });
      continue;
    }
    actions.push({
      action: dryRun ? "would-hide" : "hide",
      name: item.name,
      slug: item.slug,
      status: item.status,
      reviews: item._count.reviews,
      photos: item._count.photos,
      note: "No 2026 Food Finder / new-foods listing (404); archive in place"
    });
    if (!dryRun) {
      await prisma.foodItem.update({
        where: { id: item.id },
        data: { status: EntityStatus.HIDDEN }
      });
    }
  }

  const elvis2025 = byName.get(ELVIS_2025_NAME.toLowerCase());
  const fatElvis = byName.get(FAT_ELVIS_2026_NAME.toLowerCase());

  if (elvis2025 && fatElvis) {
    const sameVendor =
      (elvis2025.vendor?.name ?? "").toLowerCase() ===
      (fatElvis.vendor?.name ?? "").toLowerCase();
    if (!sameVendor) {
      actions.push({
        action: "skip-elvis-merge",
        name: elvis2025.name,
        slug: elvis2025.slug,
        status: elvis2025.status,
        reviews: elvis2025._count.reviews,
        photos: elvis2025._count.photos,
        note: `Vendors differ (${elvis2025.vendor?.name} vs ${fatElvis.vendor?.name}); left untouched`
      });
    } else if (elvis2025.status === EntityStatus.ACTIVE) {
      actions.push({
        action: dryRun ? "would-hide-elvis-2025" : "hide-elvis-2025",
        name: elvis2025.name,
        slug: elvis2025.slug,
        status: elvis2025.status,
        reviews: elvis2025._count.reviews,
        photos: elvis2025._count.photos,
        note: `Corresponds to 2026 "${FAT_ELVIS_2026_NAME}" at ${fatElvis.vendor?.name}; keep Fat Elvis ACTIVE (${fatElvis.slug})`
      });
      if (!dryRun) {
        await prisma.foodItem.update({
          where: { id: elvis2025.id },
          data: { status: EntityStatus.HIDDEN }
        });
      }
      actions.push({
        action: "keep-fat-elvis",
        name: fatElvis.name,
        slug: fatElvis.slug,
        status: fatElvis.status,
        reviews: fatElvis._count.reviews,
        photos: fatElvis._count.photos,
        note: "Confirmed 2026 Food Finder / core-catalog listing"
      });
    } else {
      actions.push({
        action: "elvis-2025-already-inactive",
        name: elvis2025.name,
        slug: elvis2025.slug,
        status: elvis2025.status,
        reviews: elvis2025._count.reviews,
        photos: elvis2025._count.photos
      });
      actions.push({
        action: "keep-fat-elvis",
        name: fatElvis.name,
        slug: fatElvis.slug,
        status: fatElvis.status,
        reviews: fatElvis._count.reviews,
        photos: fatElvis._count.photos
      });
    }
  } else if (elvis2025 && !fatElvis) {
    // Rename in place to official 2026 title — preserve slug/reviews.
    actions.push({
      action: dryRun ? "would-rename-elvis" : "rename-elvis",
      name: elvis2025.name,
      slug: elvis2025.slug,
      status: elvis2025.status,
      reviews: elvis2025._count.reviews,
      photos: elvis2025._count.photos,
      note: `Rename to "${FAT_ELVIS_2026_NAME}" (Badger Bites Food Finder title)`
    });
    if (!dryRun) {
      await prisma.foodItem.update({
        where: { id: elvis2025.id },
        data: {
          name: FAT_ELVIS_2026_NAME,
          description:
            "Grebe's Bismarck donut filled with Fat Elvis ice cream (banana, peanut butter ripple, chocolate chips), pressed and finished with peanut butter, chocolate, bacon, and powdered sugar"
        }
      });
    }
  } else if (!elvis2025 && fatElvis) {
    actions.push({
      action: "keep-fat-elvis",
      name: fatElvis.name,
      slug: fatElvis.slug,
      status: fatElvis.status,
      reviews: fatElvis._count.reviews,
      photos: fatElvis._count.photos,
      note: "2025 Elvis row not present; Fat Elvis already canonical"
    });
  } else {
    actions.push({
      action: "elvis-missing",
      name: ELVIS_2025_NAME,
      slug: "—",
      status: EntityStatus.ACTIVE,
      reviews: 0,
      photos: 0,
      note: "Neither Elvis nor Fat Elvis found"
    });
  }

  for (const row of actions) {
    console.log(
      `  [${row.action}] ${row.name} (${row.slug}) · ${row.status} · reviews=${row.reviews} photos=${row.photos}`
    );
    if (row.note) console.log(`           ${row.note}`);
  }

  const activeAfter = await prisma.foodItem.count({
    where: {
      venueId: venue.id,
      status: dryRun ? undefined : EntityStatus.ACTIVE
    }
  });
  // When dry-run, compute projected active count.
  if (dryRun) {
    const activeNow = items.filter((i) => i.status === EntityStatus.ACTIVE).length;
    const wouldHide = actions.filter((a) =>
      a.action.startsWith("would-hide")
    ).length;
    console.log(`\n  Active now: ${activeNow}`);
    console.log(`  Projected active after hide: ${activeNow - wouldHide}`);
  } else {
    const active = await prisma.foodItem.count({
      where: { venueId: venue.id, status: EntityStatus.ACTIVE }
    });
    const hidden = await prisma.foodItem.count({
      where: { venueId: venue.id, status: EntityStatus.HIDDEN }
    });
    console.log(`\n  Active after: ${active}`);
    console.log(`  Hidden after: ${hidden}`);
    void activeAfter;
  }
  console.log("");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
