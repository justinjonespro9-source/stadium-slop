#!/usr/bin/env npx tsx
/**
 * Find FoodItems typed as drinks but named like food (e.g. NHL "Drinks/Social" imports).
 *
 *   npx tsx scripts/audit-misclassified-drink-items.ts --dry-run
 *   npx tsx scripts/audit-misclassified-drink-items.ts --apply
 */

import "dotenv/config";

import { EntityStatus, ItemType, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  foodCategoryAfterReclassify,
  shouldReclassifyMisclassifiedDrinkAsFood
} from "../lib/item-type-classification";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;

async function main() {
  const items = await prisma.foodItem.findMany({
    where: {
      status: EntityStatus.ACTIVE,
      itemType: { in: [ItemType.ALCOHOLIC_DRINK, ItemType.NON_ALCOHOLIC_DRINK] }
    },
    select: {
      id: true,
      slug: true,
      name: true,
      itemType: true,
      category: true,
      customCategoryLabel: true,
      venue: { select: { slug: true, name: true } },
      _count: { select: { reviews: true, photos: true } }
    },
    orderBy: [{ venue: { name: "asc" } }, { name: "asc" }]
  });

  const candidates = items.filter((item) =>
    shouldReclassifyMisclassifiedDrinkAsFood({
      name: item.name,
      itemType: item.itemType,
      category: item.category,
      customCategoryLabel: item.customCategoryLabel
    })
  );

  console.log(
    `${dryRun ? "DRY RUN" : "APPLY"} — misclassified drink→food candidates: ${candidates.length} / ${items.length} active drink-typed items`
  );
  console.log("");

  for (const item of candidates) {
    const proposedCategory = foodCategoryAfterReclassify(
      item.customCategoryLabel,
      item.category
    );
    console.log(
      [
        item.venue.name,
        item.name,
        `type=${item.itemType}`,
        `category=${item.category}`,
        `label=${item.customCategoryLabel ?? "—"}`,
        `→ FOOD / ${proposedCategory}`,
        `reviews=${item._count.reviews}`,
        `photos=${item._count.photos}`
      ].join(" | ")
    );
  }

  if (dryRun) {
    console.log("");
    console.log("No changes written. Re-run with --apply to update itemType to FOOD.");
    return;
  }

  let updated = 0;
  for (const item of candidates) {
    const category = foodCategoryAfterReclassify(
      item.customCategoryLabel,
      item.category
    );
    await prisma.foodItem.update({
      where: { id: item.id },
      data: {
        itemType: ItemType.FOOD,
        category,
        alcoholic: false,
        ageRestricted: false
      }
    });
    updated += 1;
  }

  console.log("");
  console.log(`Updated ${updated} food items to itemType=FOOD.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
