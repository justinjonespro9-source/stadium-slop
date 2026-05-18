import type { FoodItem } from "@/lib/sample-data";

/** Word-boundary alcohol signals (lowercase matching). */
const ALCOHOL_KEYWORD_RE =
  /\b(beer|wine|cocktail|bourbon|whiskey|whisky|tequila|vodka|rum|seltzer|brewery|taproom|draft|margarita)\b/i;

/** Standalone “bar” but not snackbar, salad bar as food-only, etc. */
const BAR_RE = /\b(?:sports\s+)?bar\b/i;

const NA_EXCEPTION_RE =
  /\b(mocktail|mocktails|non[-\s]?alcoholic|alcohol[-\s]?free|zero[-\s]?proof|virgin|sans\s+alcohol)\b/i;

const NA_ABBREV_RE = /\b(n\/a|na brew|na beer|na seltzer)\b/i;

function searchableBlob(
  item: FoodItem,
  extra?: { vendorName?: string; vendorSection?: string }
): string {
  return [
    item.name,
    item.description,
    item.category,
    item.location,
    item.itemType,
    item.beverageStyle ?? "",
    ...(item.tags ?? []),
    extra?.vendorName ?? "",
    extra?.vendorSection ?? ""
  ]
    .join(" ")
    .toLowerCase();
}

function hasNaException(blob: string): boolean {
  if (NA_EXCEPTION_RE.test(blob)) {
    return true;
  }
  if (/\bmocktail\b/.test(blob)) {
    return true;
  }
  if (NA_ABBREV_RE.test(blob)) {
    return true;
  }
  if (/\bna\b/.test(blob) && /\b(beer|seltzer|brew|drink)\b/.test(blob)) {
    return true;
  }
  return false;
}

function hasAlcoholKeywords(blob: string): boolean {
  if (ALCOHOL_KEYWORD_RE.test(blob)) {
    return true;
  }
  if (BAR_RE.test(blob) && !blob.includes("snackbar")) {
    return true;
  }
  return false;
}

export type AlcoholContentProbe = {
  item: FoodItem;
  vendorName?: string;
  vendorSection?: string;
};

/**
 * Fan honor-system gate — keyword + DB flags. Mocktails / NA drinks are excluded.
 */
export function isAlcoholRelatedFoodItem(
  item: FoodItem,
  vendor?: { name?: string; section?: string } | null
): boolean {
  if (item.itemType === "Non-Alcoholic Drink") {
    return false;
  }

  const blob = searchableBlob(item, {
    vendorName: vendor?.name,
    vendorSection: vendor?.section
  });

  if (hasNaException(blob)) {
    return false;
  }

  if (item.itemType === "Alcoholic Drink" || item.alcoholic || item.ageRestricted) {
    return true;
  }

  return hasAlcoholKeywords(blob);
}

export function listHasAlcoholRelatedItems(
  items: FoodItem[],
  vendorBySlug?: Map<string, { name?: string; section?: string }>
): boolean {
  return items.some((item) => {
    const vendor = vendorBySlug?.get(item.vendorSlug);
    return isAlcoholRelatedFoodItem(item, vendor);
  });
}
