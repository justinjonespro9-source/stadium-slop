/** Fair venue page — menu section (stadium venues use default copy). */
export const FAIR_VENUE_MENU_EYEBROW = "Fair foods";

/** Shorten long vendor labels for mobile standings (full name stays in DB / vendor page). */
export function formatFairVendorDisplayName(vendorName: string): string {
  const trimmed = vendorName.trim();
  const parenMatch = trimmed.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!parenMatch) {
    return trimmed;
  }
  const primary = parenMatch[1].trim();
  if (trimmed.length <= 40 || primary.length >= 12) {
    return primary;
  }
  return trimmed;
}

export const FAIR_VENUE_MENU_HEADING = "Fair Food Guide";
export const FAIR_VENUE_MENU_SUBCOPY =
  "Browse preview foods, vendor classics, deep-fried drops, sweets, and fan rankings as this guide grows.";
