#!/usr/bin/env npx tsx
/**
 * Tag Martin Stadium food items for shared vs tenant-specific discovery.
 * Does not delete historical rows.
 *
 *   npx tsx scripts/retag-martin-stadium-menu-tenants.ts --apply
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });

const NU_FOOTBALL_NAMES = new Set([
  "NU Stacked Smashburger",
  "Wildcat Melt",
  "Funnel Cake",
  "Candy Cup"
]);

/** Permanent trucks/concessions available across NWSL + Northwestern football. */
const SHARED_NAMES = new Set([
  "Soul & Smoke",
  "Soul & Smoke Pulled Pork Sandwich",
  "Soul & Smoke Brisket Plate",
  "La Cocinita",
  "La Cocinita Arepas",
  "Cheesie's Pub & Grub",
  "Cheesie’s Pub & Grub",
  "Cheesie's Signature Grilled Cheese",
  "Vienna Beef Hot Dogs",
  "Chicago-Style Vienna Beef Dog",
  "Serna's Italian Beef Sandwich",
  "Flash Taco Street Tacos",
  "Tacomotora Street Tacos",
  "Clucker's Fried Chicken Sandwich",
  "Billy Bricks Wood-Fired Pizza Slice",
  "Elephant and Vine",
  "Elephant and Vine Avocado Toast",
  "Rainbow Cone Ice Cream",
  "Stadium Chicken Tenders & Fries",
  "Loaded Nachos"
]);

function mergeTags(existing: string[], extra: string[]): string[] {
  const seen = new Set(existing.map((t) => t.toLowerCase()));
  const out = [...existing];
  for (const t of extra) {
    const key = t.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
  }
  return out;
}

function classify(name: string, tags: string[]): "nu" | "shared" | "nwsl-only" {
  if (NU_FOOTBALL_NAMES.has(name) || tags.some((t) => /college-football|tenant:northwestern/i.test(t))) {
    if (NU_FOOTBALL_NAMES.has(name)) return "nu";
  }
  if (NU_FOOTBALL_NAMES.has(name)) return "nu";
  const lower = tags.map((t) => t.toLowerCase());
  if (
    lower.includes("beer") ||
    /cocktail|brewing|carbliss|sketchbook/i.test(name) ||
    (lower.includes("import") && lower.includes("mls-nwsl") && !SHARED_NAMES.has(name))
  ) {
    // Import stubs / alcohol that are NWSL-framed, not NU football concessions
    if (!SHARED_NAMES.has(name) || /cocktail|brewing|carbliss|sketchbook/i.test(name)) {
      return "nwsl-only";
    }
  }
  if (SHARED_NAMES.has(name)) return "shared";
  // Default: keep as shared venue offering if it's food with nwsl tag only
  if (lower.includes("nwsl") && !/beer|cocktail/.test(lower.join(" "))) return "shared";
  return "nwsl-only";
}

async function main() {
  const apply = process.argv.includes("--apply");
  const venue = await prisma.venue.findUnique({
    where: { slug: "northwestern-medicine-field-at-martin-stadium" }
  });
  if (!venue) throw new Error("Martin Stadium venue missing");

  const items = await prisma.foodItem.findMany({
    where: { venueId: venue.id, status: "ACTIVE" }
  });

  const counts = { nu: 0, shared: 0, "nwsl-only": 0 };
  for (const item of items) {
    const kind = classify(item.name, item.tags);
    counts[kind] += 1;
    let next = item.tags;
    if (kind === "nu") {
      next = mergeTags(next, [
        "ncaa",
        "college-football",
        "tenant:northwestern-football"
      ]);
    } else if (kind === "shared") {
      next = mergeTags(next, ["shared-venue", "college-football", "nwsl"]);
    } else {
      next = mergeTags(next, ["tenant:nwsl", "nwsl"]);
    }
    console.log(`  [${kind}] ${item.name}`);
    if (apply && next.join("|") !== item.tags.join("|")) {
      await prisma.foodItem.update({
        where: { id: item.id },
        data: { tags: next }
      });
    }
  }

  console.log("\nCounts:", counts);
  console.log(apply ? "Applied tag updates." : "Dry run only (pass --apply).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
