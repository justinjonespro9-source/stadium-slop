import type { FoodItem } from "@/lib/sample-data";
import { isFairVenueSlug } from "@/lib/fair-preview";

function formatFoodCount(count: number): string {
  return count === 1 ? "1 food tracked" : `${count} foods tracked`;
}

function sourceLabelFromItems(items: FoodItem[]): string {
  const tags = items.flatMap((item) => item.tags ?? []);
  const hasCore = tags.includes("core-catalog");
  const hasPreview = tags.includes("2025-preview");
  if (hasCore && hasPreview) {
    return "Preview + catalog sources";
  }
  if (hasCore) {
    return "Public catalog sources";
  }
  if (hasPreview) {
    return "Preview sources";
  }
  return "Public sources";
}

/** Compact status for fair venue menu sections (uses items already loaded on the page). */
export function getFairVenueGuideStatusLine(
  venueSlug: string,
  items: FoodItem[]
): string | null {
  if (!isFairVenueSlug(venueSlug)) {
    return null;
  }

  const count = items.length;
  if (count === 0) {
    return "Food listings in progress · Listings may change";
  }

  return `${formatFoodCount(count)} · ${sourceLabelFromItems(items)} · Listings may change`;
}
