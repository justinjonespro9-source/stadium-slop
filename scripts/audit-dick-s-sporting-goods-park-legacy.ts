/**
 * Audit DICK'S Sporting Goods Park legacy vendor/drink FoodItem rows after iMenuPro import.
 * Usage:
 *   npx tsx scripts/audit-dick-s-sporting-goods-park-legacy.ts --dry-run
 *   npx tsx scripts/audit-dick-s-sporting-goods-park-legacy.ts --apply
 */

import "dotenv/config";

import { EntityStatus, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const VENUE_SLUG = "dick-s-sporting-goods-park";

/** MLS docx import rows that are stands/bars, not reviewable food items. */
const KNOWN_VENDOR_OR_DRINK_NAMES = new Set(
  [
    "Chillco Drinks",
    "Eighteen76 & Dale's Bar",
    "Big Belly Brothers BBQ",
    "GB Fish & Chips",
    "Infinitus Pie",
    "Maria Empanada & Taco Bron",
    "Jake's Baby D's Mini Donuts",
    "Jake's Baby D Mini Donuts"
  ].map(normalizeName)
);

const DRINK_STAND_RE =
  /\b(drinks?|bar|cantina|brew|cocktail|slush|daiquiri|margarita|beer|wine)\b/i;

const FOOD_KEYWORD_RE =
  /\b(taco|nachos?|sandwich|burger|fries|pie|bowl|mac|cheese|wings|tenders|empanada|donuts?|pack|churro|brisket|pork|chicken|beef|pot\s+pie|chips|pizza|curds|concrete|cookie|pudding|hot\s+dog|wrap|salad|elote|links|poblano)\b/i;

function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['\u2019]/g, "'")
    .replace(/\s+/g, " ");
}

function classifyLegacyRow(
  name: string,
  vendorName: string
): { legacyBad: boolean; reason: string } {
  const n = normalizeName(name);
  if (KNOWN_VENDOR_OR_DRINK_NAMES.has(n)) {
    return { legacyBad: true, reason: "known-vendor-or-drink-name" };
  }
  if (DRINK_STAND_RE.test(name) && !/\b(nachos?|fries|sandwich|taco|pie|bowl|mac)\b/i.test(name)) {
    return { legacyBad: true, reason: "drink-stand-name" };
  }
  const vn = normalizeName(vendorName);
  if (vn && n === vn) {
    return { legacyBad: true, reason: "name-equals-vendor" };
  }
  if (
    vn &&
    vn.length > 8 &&
    n.includes(vn) &&
    !FOOD_KEYWORD_RE.test(name)
  ) {
    return { legacyBad: true, reason: "vendor-name-without-food-keyword" };
  }
  return { legacyBad: false, reason: "" };
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
      vendor: { select: { name: true } },
      _count: { select: { reviews: true, photos: true } }
    },
    orderBy: { name: "asc" }
  });

  console.log(
    dryRun
      ? "DRY RUN — DICK'S Sporting Goods Park legacy audit\n"
      : "APPLY — hiding legacy vendor/drink-only rows\n"
  );
  console.log(`Venue: ${venue.name} (${VENUE_SLUG})`);
  console.log(`Total rows: ${items.length}`);
  console.log(
    `ACTIVE: ${items.filter((i) => i.status === EntityStatus.ACTIVE).length}`
  );
  console.log(
    `HIDDEN: ${items.filter((i) => i.status === EntityStatus.HIDDEN).length}\n`
  );

  const toHide: typeof items = [];
  const manualReview: typeof items = [];
  let alreadyHidden = 0;

  for (const item of items) {
    const { legacyBad, reason } = classifyLegacyRow(
      item.name,
      item.vendor.name
    );
    if (!legacyBad) continue;

    const reviews = item._count.reviews;
    const photos = item._count.photos;

    if (item.status === EntityStatus.HIDDEN) {
      alreadyHidden += 1;
      continue;
    }

    if (reviews > 0 || photos > 0) {
      manualReview.push(item);
      continue;
    }

    toHide.push(item);
    console.log(
      `${dryRun ? "WOULD HIDE" : "HIDING"}: "${item.name}" (${item.slug}) — ${reason} · vendor=${item.vendor.name}`
    );
  }

  console.log("\n── Summary ─────────────────────────────────────────");
  console.log(`Would hide / hidden:  ${toHide.length}`);
  console.log(`Already hidden:       ${alreadyHidden}`);
  console.log(`Manual review needed: ${manualReview.length}`);

  if (manualReview.length > 0) {
    console.log("\n── Manual merge decision (reviews/photos present) ──");
    for (const item of manualReview) {
      console.log(
        `  "${item.name}" (${item.slug}) — reviews=${item._count.reviews}, photos=${item._count.photos}, vendor=${item.vendor.name}`
      );
    }
  }

  const activeItemLevel = items.filter((item) => {
    if (item.status !== EntityStatus.ACTIVE) return false;
    return !classifyLegacyRow(item.name, item.vendor.name).legacyBad;
  });
  console.log(`\nACTIVE item-level rows (post-audit): ${activeItemLevel.length}`);

  if (dryRun) {
    if (toHide.length === 0) {
      console.log("\nNo legacy vendor/drink ACTIVE rows to hide.");
    } else {
      console.log(`\n${toHide.length} row(s) would be set to HIDDEN.`);
      console.log(
        "Run: npx tsx scripts/audit-dick-s-sporting-goods-park-legacy.ts --apply"
      );
    }
    return;
  }

  for (const item of toHide) {
    await prisma.foodItem.update({
      where: { id: item.id },
      data: { status: EntityStatus.HIDDEN }
    });
  }
  console.log(`\nDone. ${toHide.length} row(s) set to HIDDEN.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
