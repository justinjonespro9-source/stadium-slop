import type { ItemCategory, ItemType } from "@prisma/client";

import type { FoodItem } from "./sample-data";

const DRINK_ITEM_TYPES = new Set<FoodItem["itemType"]>([
  "Alcoholic Drink",
  "Non-Alcoholic Drink"
]);

const DRINK_PRISMA_ITEM_TYPES = new Set<ItemType>([
  "ALCOHOLIC_DRINK",
  "NON_ALCOHOLIC_DRINK"
]);

const DRINK_PRISMA_CATEGORIES = new Set<ItemCategory>([
  "BEVERAGE",
  "ALCOHOLIC_BEVERAGE"
]);

/**
 * Napkin rating applies to food; hide only for drink item types and beverage categories.
 * Section labels like NHL/NBA "Drinks/Social" are concession taxonomy, not drink items.
 */
export function isNapkinEligibleItem(item: Pick<FoodItem, "itemType" | "category">) {
  return !DRINK_ITEM_TYPES.has(item.itemType);
}

export function isNapkinEligibleFromPrisma(row: {
  itemType: ItemType;
  category: ItemCategory;
  customCategoryLabel: string | null;
}) {
  if (DRINK_PRISMA_ITEM_TYPES.has(row.itemType)) {
    return false;
  }

  if (DRINK_PRISMA_CATEGORIES.has(row.category)) {
    return false;
  }

  return true;
}

/** Static fixtures for review-form signal regression checks (no DB). */
export const REVIEW_SIGNAL_FIELD_FIXTURES = [
  {
    label: "Rogers Place food (Drinks/Social import label)",
    item: { itemType: "Food" as const, category: "Drinks/Social" },
    expectNapkin: true
  },
  {
    label: "Target Field savory food",
    item: { itemType: "Food" as const, category: "Savory" },
    expectNapkin: true
  },
  {
    label: "Minnesota State Fair sweet",
    item: { itemType: "Food" as const, category: "Sweet" },
    expectNapkin: true
  },
  {
    label: "NBA arena food (Drinks/Social label)",
    item: { itemType: "Food" as const, category: "Drinks/Social" },
    expectNapkin: true
  },
  {
    label: "Alcoholic drink item type",
    item: { itemType: "Alcoholic Drink" as const, category: "Beverage" },
    expectNapkin: false
  },
  {
    label: "Non-alcoholic drink item type",
    item: { itemType: "Non-Alcoholic Drink" as const, category: "Beverage" },
    expectNapkin: false
  }
] as const;

export function verifyReviewSignalFieldFixtures(): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const fixture of REVIEW_SIGNAL_FIELD_FIXTURES) {
    const napkinEligible = isNapkinEligibleItem(fixture.item);
    if (napkinEligible !== fixture.expectNapkin) {
      failures.push(
        `${fixture.label}: expected napkinEligible=${fixture.expectNapkin}, got ${napkinEligible}`
      );
    }
  }

  const prismaFoodDrinksSocial = isNapkinEligibleFromPrisma({
    itemType: "FOOD",
    category: "SAVORY",
    customCategoryLabel: "Drinks/Social"
  });
  if (!prismaFoodDrinksSocial) {
    failures.push(
      "Prisma FOOD + Drinks/Social customCategoryLabel: expected napkinEligible=true"
    );
  }

  const prismaDrink = isNapkinEligibleFromPrisma({
    itemType: "ALCOHOLIC_DRINK",
    category: "ALCOHOLIC_BEVERAGE",
    customCategoryLabel: null
  });
  if (prismaDrink) {
    failures.push("Prisma ALCOHOLIC_DRINK: expected napkinEligible=false");
  }

  return { ok: failures.length === 0, failures };
}
