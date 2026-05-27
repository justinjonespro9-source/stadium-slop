/**
 * Audit PayPal Park legacy vendor-only FoodItem rows after corrected importer.
 * Usage:
 *   npx tsx scripts/audit-paypal-park-legacy.ts --dry-run
 *   npx tsx scripts/audit-paypal-park-legacy.ts --apply
 */

import "dotenv/config";

import { EntityStatus, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const VENUE_SLUG = "paypal-park";

/** Names from MLS docx import that are vendors/stands, not food items. */
const KNOWN_VENDOR_ONLY_NAMES = new Set(
  [
    "Big Chicken",
    "Bibo's NY Pizza",
    "Korean BBQ & Fusion",
    "Global Street Fuel",
    "Arteaga's Food Center",
    "The BBQ Cart",
    "The Comfort Heavyweights",
    "The Carvery",
    "Stand 10 Steep Boba Drinks",
    "OVG",
    "OVG Hospitality"
  ].map(normalizeName)
);

function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['\u2019]/g, "'")
    .replace(/\s+/g, " ");
}

function classifyLegacyRow(name: string, vendorName: string): {
  vendorOnly: boolean;
  reason: string;
} {
  const n = normalizeName(name);
  if (KNOWN_VENDOR_ONLY_NAMES.has(n)) {
    return { vendorOnly: true, reason: "known-vendor-only-name" };
  }
  if (/^(the\s+)?(bbq|carvery)\s+cart$/i.test(name.trim())) {
    return { vendorOnly: true, reason: "cart-vendor-label" };
  }
  if (/boba\s+drinks?$/i.test(name)) {
    return { vendorOnly: true, reason: "drink-stand-name" };
  }
  if (/^ovg\b/i.test(name) || /\bovg\s+hospitality\b/i.test(name)) {
    return { vendorOnly: true, reason: "service-provider" };
  }
  if (/map|restroom|merch|guest\s+services/i.test(name)) {
    return { vendorOnly: true, reason: "service-location" };
  }

  const vn = normalizeName(vendorName);
  if (vn && n === vn) {
    return { vendorOnly: true, reason: "name-equals-vendor" };
  }

  return { vendorOnly: false, reason: "" };
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

  console.log(dryRun ? "DRY RUN — PayPal Park legacy audit\n" : "APPLY — hiding legacy vendor-only rows\n");
  console.log(`Venue: ${venue.name} (${VENUE_SLUG})`);
  console.log(`Total rows: ${items.length}`);
  console.log(`ACTIVE: ${items.filter((i) => i.status === EntityStatus.ACTIVE).length}`);
  console.log(`HIDDEN: ${items.filter((i) => i.status === EntityStatus.HIDDEN).length}\n`);

  const toHide: typeof items = [];
  const manualReview: typeof items = [];
  let alreadyHidden = 0;

  for (const item of items) {
    const { vendorOnly, reason } = classifyLegacyRow(item.name, item.vendor.name);
    if (!vendorOnly) continue;

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

  const activeCorrected = items.filter((item) => {
    if (item.status !== EntityStatus.ACTIVE) return false;
    return !classifyLegacyRow(item.name, item.vendor.name).vendorOnly;
  });
  console.log(`\nACTIVE item-level rows (post-audit target): ${activeCorrected.length}`);

  if (dryRun) {
    if (toHide.length === 0) {
      console.log("\nNo legacy vendor-only ACTIVE rows to hide.");
    } else {
      console.log(`\n${toHide.length} row(s) would be set to HIDDEN.`);
      console.log("Run: npx tsx scripts/audit-paypal-park-legacy.ts --apply");
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
