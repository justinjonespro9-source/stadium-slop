#!/usr/bin/env npx tsx
/**
 * Regression check: Napkin Rating eligibility for representative venue/item shapes.
 * Run: npx tsx scripts/verify-review-signal-fields.ts
 */

import { ItemCategory, ItemType } from "@prisma/client";

import { verifyReviewSignalFieldFixtures } from "../lib/item-eligibility";
import {
  inferItemTypeFromImport,
  looksLikeFoodItemName,
  shouldReclassifyMisclassifiedDrinkAsFood
} from "../lib/item-type-classification";

const result = verifyReviewSignalFieldFixtures();
const classificationFailures: string[] = [];

if (
  inferItemTypeFromImport("Drinks/Social", "Loaded Beef Birria Nachos") !== ItemType.FOOD
) {
  classificationFailures.push(
    "Drinks/Social + birria nachos should import as FOOD"
  );
}

if (
  inferItemTypeFromImport("Drinks/Social", "North Loop Old Fashioned") !==
  ItemType.ALCOHOLIC_DRINK
) {
  classificationFailures.push(
    "Drinks/Social + Old Fashioned should import as ALCOHOLIC_DRINK"
  );
}

if (!looksLikeFoodItemName("Loaded Beef Birria Nachos")) {
  classificationFailures.push("birria nachos should match food heuristic");
}

if (looksLikeFoodItemName("North Loop Old Fashioned")) {
  classificationFailures.push("Old Fashioned should not match food heuristic");
}

if (
  !shouldReclassifyMisclassifiedDrinkAsFood({
    name: "Loaded Beef Birria Nachos",
    itemType: ItemType.NON_ALCOHOLIC_DRINK,
    category: ItemCategory.BEVERAGE,
    customCategoryLabel: "Drinks/Social"
  })
) {
  classificationFailures.push("birria nachos misclassified drink should be flagged for reclassify");
}

if (
  shouldReclassifyMisclassifiedDrinkAsFood({
    name: "North Loop Old Fashioned",
    itemType: ItemType.ALCOHOLIC_DRINK,
    category: ItemCategory.ALCOHOLIC_BEVERAGE,
    customCategoryLabel: "Drinks/Social"
  })
) {
  classificationFailures.push("Old Fashioned should not be flagged for reclassify");
}

const failures = [...result.failures, ...classificationFailures];

if (failures.length === 0) {
  console.log("Review signal field fixtures: OK");
  process.exit(0);
}

console.error("Review signal field fixtures: FAILED");
for (const failure of failures) {
  console.error(`  - ${failure}`);
}
process.exit(1);
