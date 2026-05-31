import { normalizeMenuItemName } from "@/lib/venue-menu-import/normalize";

/**
 * Canonical display names for Iowa finder variants that should collapse on import.
 * Keys use {@link normalizeIowaFoodDedupeKey}.
 */
export const IOWA_FOOD_NAME_ALIASES: Record<string, string> = {
  "apple egg roll": "Apple Egg Rolls",
  "shrimp taco": "Shrimp Tacos"
};

const TRAILING_SIZE_RE = /\s*[-–]\s*(small|medium|large|regular)\s*$/i;
/** Finder menu line prefixes, e.g. "(2) Shrimp Tacos". */
const LEADING_MENU_INDEX_RE = /^(?:\(\d+\)|\d+[.)])\s+/;

/** Aggressive dedupe key — not for display. */
export function normalizeIowaFoodDedupeKey(raw: string): string {
  let n = normalizeMenuItemName(raw.replace(/[\u2010-\u2015-]/g, " "));
  n = n.replace(LEADING_MENU_INDEX_RE, "");
  n = n.replace(TRAILING_SIZE_RE, "");
  n = n
    .replace(/\beggrolls?\b/g, "egg roll")
    .replace(/\bbarbecue\b/g, "bbq")
    .replace(/\bmacaroni and cheese\b/g, "mac and cheese")
    .replace(/\bmac n cheese\b/g, "mac and cheese")
    .replace(/\bon-a-stick\b/g, "on a stick")
    .replace(/\bdeep[- ]?fried\b/g, "fried");
  n = n
    .replace(/\btacos\b/g, "taco")
    .replace(/\brolls\b/g, "roll")
    .replace(/\bwings\b/g, "wing")
    .replace(/\bchips\b/g, "chip")
    .replace(/\bcookies\b/g, "cookie")
    .replace(/\bdogs\b/g, "dog")
    .replace(/\bsticks\b/g, "stick")
    .replace(/\bchurros\b/g, "churro")
    .replace(/\bpickles\b/g, "pickle");
  return n.replace(/\s+/g, " ").trim();
}

export function normalizeIowaFoodVendorKey(vendor: string): string {
  return normalizeMenuItemName(vendor.replace(/[\u2010-\u2015-]/g, " "));
}

export function iowaVendorItemDedupeKey(vendor: string, name: string): string {
  return `${normalizeIowaFoodVendorKey(vendor)}::${normalizeIowaFoodDedupeKey(name)}`;
}

function stripIowaMenuDecorations(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(LEADING_MENU_INDEX_RE, "")
    .replace(TRAILING_SIZE_RE, "");
}

/** Finder/import display name — alias map when known, else trimmed source. */
export function resolveIowaFoodCanonicalName(raw: string): string {
  const trimmed = stripIowaMenuDecorations(raw);
  const alias = IOWA_FOOD_NAME_ALIASES[normalizeIowaFoodDedupeKey(trimmed)];
  return alias ?? trimmed;
}

export function iowaFoodNamesNearDuplicate(a: string, b: string): boolean {
  return normalizeIowaFoodDedupeKey(a) === normalizeIowaFoodDedupeKey(b);
}
