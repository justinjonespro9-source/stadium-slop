import type { FoodItem } from "@/lib/sample-data";

export type FairFoodImportBadgeLabel = "New Food" | "Fair Classic";

/**
 * At most one import-source badge per item (plus separate 21+ on the row).
 * Tags come from fair menu import (`2025-preview`, `core-catalog`, etc.).
 */
export function getFairFoodImportBadge(item: FoodItem): FairFoodImportBadgeLabel | null {
  const tags = new Set((item.tags ?? []).map((tag) => tag.toLowerCase()));

  if (tags.has("2025-preview")) {
    return "New Food";
  }

  if (tags.has("core-catalog")) {
    return "Fair Classic";
  }

  return null;
}
