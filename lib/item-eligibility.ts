import type { ItemCategory, ItemType } from "@prisma/client";

import type { FoodItem } from "./sample-data";

function prismaCategoryLabel(
  category: ItemCategory,
  customCategoryLabel: string | null
) {
  if (customCategoryLabel?.trim()) {
    return customCategoryLabel.trim();
  }

  return category
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function prismaItemTypeLabel(itemType: ItemType): FoodItem["itemType"] {
  if (itemType === "ALCOHOLIC_DRINK") {
    return "Alcoholic Drink";
  }

  if (itemType === "NON_ALCOHOLIC_DRINK") {
    return "Non-Alcoholic Drink";
  }

  return "Food";
}

/**
 * Napkin rating applies to food and sweets; hide for drinks and beverage categories.
 */
export function isNapkinEligibleItem(item: Pick<FoodItem, "itemType" | "category">) {
  if (item.itemType === "Alcoholic Drink" || item.itemType === "Non-Alcoholic Drink") {
    return false;
  }

  const cat = item.category.toLowerCase();

  if (cat.includes("beverage") || cat.includes("drink")) {
    return false;
  }

  return true;
}

export function isNapkinEligibleFromPrisma(row: {
  itemType: ItemType;
  category: ItemCategory;
  customCategoryLabel: string | null;
}) {
  return isNapkinEligibleItem({
    itemType: prismaItemTypeLabel(row.itemType),
    category: prismaCategoryLabel(row.category, row.customCategoryLabel)
  });
}
