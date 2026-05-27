/**
 * Name / slug normalization for menu item deduplication.
 *
 * Two items are considered a match when their normalized names produce
 * identical slugs. Normalization strips size qualifiers ("16oz"), trims
 * vendor prefixes that appear before a dash, and collapses whitespace.
 */

const SIZE_PATTERN = /\b\d+(\.\d+)?\s*(oz|fl\.?\s*oz|ml|ct|pk|pack)\b/gi;
const NON_ALPHANUM = /[^a-z0-9]+/g;

/** Decorative / CSV-escaped quotes (e.g. NFL import `The "Beef Hammer"`). */
const DECORATIVE_QUOTE_PATTERN = /[\u201c\u201d\u201e\u201f\u2033\u2036"'`"]/g;

export function normalizeMenuItemName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(SIZE_PATTERN, "")
    .replace(DECORATIVE_QUOTE_PATTERN, "")
    .replace(/&/g, "and")
    .trim()
    .replace(/\s+/g, " ");
}

export function slugifyMenuItemName(raw: string): string {
  return normalizeMenuItemName(raw)
    .replace(NON_ALPHANUM, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function fuzzyMenuNameMatch(a: string, b: string): boolean {
  return slugifyMenuItemName(a) === slugifyMenuItemName(b);
}

export function buildFoodItemTags(
  fare?: string,
  dietaryTags?: string[]
): string[] {
  const tags: string[] = [];
  if (fare) tags.push(fare);
  if (dietaryTags) tags.push(...dietaryTags);
  return tags;
}

export function inferItemType(
  category: string,
  fare?: string
): "Food" | "Alcoholic Drink" | "Non-Alcoholic Drink" {
  if (category === "Alcoholic Drink") return "Alcoholic Drink";
  if (category === "Non-Alcoholic Drink") return "Non-Alcoholic Drink";
  return "Food";
}
