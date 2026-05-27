/**
 * Shared slug rules for seed + league/CSV imports.
 * Keeps venue, vendor (stand), and item URLs stable across repeated imports.
 */

const SLUG_MAX = 80;

/** Lowercase kebab slug; empty input becomes "unknown". */
export function slugifyImportKey(raw: string, maxLen = SLUG_MAX): string {
  const base = raw
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const slug = base || "unknown";
  if (slug.length <= maxLen) {
    return slug;
  }
  return slug.slice(0, maxLen).replace(/-$/, "");
}

/** Canonical slugs when auto-slugify would split punctuation awkwardly. */
const VENUE_SLUG_BY_NAME: Record<string, string> = {
  "at&t stadium": "att-stadium",
  "att stadium": "att-stadium",
  "geha field at arrowhead stadium": "geha-field-at-arrowhead-stadium",
  "arrowhead stadium": "geha-field-at-arrowhead-stadium",
  "sofi stadium": "sofi-stadium",
  "hollywood park": "sofi-stadium",
  "metlife stadium": "metlife-stadium",
  "lincoln financial field": "lincoln-financial-field",
  "nrg stadium": "nrg-stadium",
  "reliant stadium": "nrg-stadium",
  "levi's stadium": "levis-stadium",
  "levis stadium": "levis-stadium",
  "hard rock stadium": "hard-rock-stadium"
};

/** Legacy / alias slugs → canonical venue slug (DB / import). */
const VENUE_SLUG_ALIASES: Record<string, string> = {
  "at-t-stadium": "att-stadium",
  "at&t-stadium": "att-stadium",
  "cowboys-stadium": "att-stadium",
  "arrowhead-stadium": "geha-field-at-arrowhead-stadium",
  "arrowhead": "geha-field-at-arrowhead-stadium",
  "so-fi-stadium": "sofi-stadium",
  "hollywood-park": "sofi-stadium",
  "hollywood-park-stadium": "sofi-stadium",
  "met-life-stadium": "metlife-stadium",
  "giants-stadium": "metlife-stadium",
  "jets-stadium": "metlife-stadium",
  "lincoln-financial": "lincoln-financial-field",
  "the-linc": "lincoln-financial-field",
  linc: "lincoln-financial-field",
  "reliant-stadium": "nrg-stadium",
  "houston-texans-stadium": "nrg-stadium",
  "levi-s-stadium": "levis-stadium",
  "levi-stadium": "levis-stadium",
  "san-francisco-49ers-stadium": "levis-stadium",
  "hardrock-stadium": "hard-rock-stadium",
  "dolphins-stadium": "hard-rock-stadium",
  "miami-dolphins-stadium": "hard-rock-stadium"
};

/** Venue URL segment — prefer explicit slug, else ballpark name. */
export function venueSlugFromImport(venueName: string, explicitSlug?: string): string {
  const trimmed = explicitSlug?.trim();
  if (trimmed) {
    const alias = VENUE_SLUG_ALIASES[slugifyImportKey(trimmed)] ?? slugifyImportKey(trimmed);
    return alias;
  }
  const byName = VENUE_SLUG_BY_NAME[venueName.trim().toLowerCase()];
  if (byName) {
    return byName;
  }
  const slug = slugifyImportKey(venueName);
  return VENUE_SLUG_ALIASES[slug] ?? slug;
}

/** Team dedupe key (stored on Venue.teams as display names, not slugs). */
export function teamSlugFromImport(teamName: string): string {
  return slugifyImportKey(teamName);
}

/** Stand segment when a row names a physical stand separately from brand/vendor. */
export function standSlugFromImport(standName: string): string {
  return slugifyImportKey(standName);
}

/**
 * Vendor slug scoped to a venue.
 * When stand_name is set, encodes both: `{vendor}--{stand}` (stand = location identity).
 */
export function vendorSlugFromImport(vendorName: string, standName?: string): string {
  const vendorPart = slugifyImportKey(vendorName);
  const stand = standName?.trim();
  if (!stand) {
    return vendorPart;
  }
  return slugifyImportKey(`${vendorPart}--${standSlugFromImport(stand)}`);
}

/** Human-readable vendor label for UI. */
export function vendorDisplayNameFromImport(vendorName: string, standName?: string): string {
  const stand = standName?.trim();
  if (!stand) {
    return vendorName.trim();
  }
  return `${vendorName.trim()} · ${stand}`;
}

/**
 * Item slug unique within a venue.
 * Prefixes with vendor slug so two stands can both sell a "Hot Dog" without colliding.
 */
export function foodItemSlugFromImport(itemName: string, vendorSlug: string): string {
  const itemPart = slugifyImportKey(itemName);
  const vendorPart = vendorSlug.slice(0, 40);
  return slugifyImportKey(`${vendorPart}-${itemPart}`, SLUG_MAX);
}
