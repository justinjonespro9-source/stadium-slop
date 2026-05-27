/**
 * Clean NFL-import quoted FoodItem names at Hard Rock Stadium.
 *
 * Fixes display names like `The "Beef Hammer"` → `The Beef Hammer` and
 * doubled slugs (`the-beef-hammer-the-beef-hammer` → `the-beef-hammer`).
 * Hides known drink headline rows. Does not delete rows.
 *
 * Usage:
 *   npx tsx scripts/audit-hard-rock-stadium-legacy.ts --dry-run
 *   npx tsx scripts/audit-hard-rock-stadium-legacy.ts --apply
 */

import "dotenv/config";

import { EntityStatus, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  normalizeMenuItemName,
  slugifyMenuItemName
} from "../lib/venue-menu-import/normalize";

const VENUE_SLUG = "hard-rock-stadium";

/** Normalized NFL headline names → canonical display names. */
const CANONICAL_DISPLAY_NAME: Record<string, string> = {
  "the beef hammer": "The Beef Hammer",
  "the miami daydream": "The Miami Daydream"
};

/** Drink headline rows from NFL import — hide, do not delete. */
const HIDE_DRINK_NAMES = new Set(
  ["the miami daydream"].map((n) => normalizeMenuItemName(n))
);

function canonicalDisplayName(rawName: string): string | null {
  return CANONICAL_DISPLAY_NAME[normalizeMenuItemName(rawName)] ?? null;
}

function canonicalSlugForName(displayName: string): string {
  return slugifyMenuItemName(displayName);
}

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const apply = process.argv.includes("--apply");
  const dryRun = !apply;

  const venue = await prisma.venue.findFirst({ where: { slug: VENUE_SLUG } });
  if (!venue) {
    console.error(`Venue not found: ${VENUE_SLUG}`);
    process.exit(1);
  }

  const items = await prisma.foodItem.findMany({
    where: { venueId: venue.id },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      _count: { select: { reviews: true, photos: true } }
    },
    orderBy: { name: "asc" }
  });

  console.log(
    dryRun
      ? "DRY RUN — Hard Rock Stadium legacy name cleanup\n"
      : "APPLY — Hard Rock Stadium legacy name cleanup\n"
  );

  type Action =
    | { type: "rename"; id: string; from: string; to: string; slug: string }
    | { type: "hide"; id: string; name: string; reason: string };

  const actions: Action[] = [];

  for (const item of items) {
    const norm = normalizeMenuItemName(item.name);
    const canonical = canonicalDisplayName(item.name);
    const targetSlug = canonical ? canonicalSlugForName(canonical) : null;

    if (HIDE_DRINK_NAMES.has(norm) && item.status === EntityStatus.ACTIVE) {
      actions.push({
        type: "hide",
        id: item.id,
        name: item.name,
        reason: "NFL headline drink row"
      });
      continue;
    }

    if (!canonical) continue;

    const needsRename = item.name !== canonical;
    const needsSlug = targetSlug && item.slug !== targetSlug;
    if (!needsRename && !needsSlug) continue;

    if (item._count.reviews > 0 || item._count.photos > 0) {
      if (needsRename) {
        actions.push({
          type: "rename",
          id: item.id,
          from: item.name,
          to: canonical,
          slug: item.slug
        });
      }
      continue;
    }

    if (targetSlug) {
      const slugTaken = items.some(
        (other) => other.id !== item.id && other.slug === targetSlug
      );
      actions.push({
        type: "rename",
        id: item.id,
        from: item.name,
        to: canonical,
        slug: slugTaken ? item.slug : targetSlug
      });
    }
  }

  for (const action of actions) {
    if (action.type === "hide") {
      console.log(`HIDE  ${action.name}  (${action.reason})`);
      if (apply) {
        await prisma.foodItem.update({
          where: { id: action.id },
          data: { status: EntityStatus.HIDDEN }
        });
      }
      continue;
    }

    const slugNote =
      action.slug !== canonicalSlugForName(action.to)
        ? `  slug unchanged: ${action.slug}`
        : `  slug → ${action.slug}`;
    console.log(`RENAME  "${action.from}"  →  ${action.to}${slugNote}`);
    if (apply) {
      await prisma.foodItem.update({
        where: { id: action.id },
        data: { name: action.to, slug: action.slug }
      });
    }
  }

  if (actions.length === 0) {
    console.log("\nNo legacy rows need cleanup.");
  } else if (dryRun) {
    console.log(`\n${actions.length} action(s) would run. Re-run with --apply.`);
  } else {
    console.log(`\nDone. ${actions.length} action(s) applied.`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
