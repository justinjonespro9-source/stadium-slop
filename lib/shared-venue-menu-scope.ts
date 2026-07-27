/**
 * Tenant-aware menu presentation for NFL/college shared stadiums.
 *
 * Preserves all FoodItem rows; scopes what standings show when a college
 * tenant (or explicit ?team=) is the menu context.
 */

import { teamSlugFromImport } from "./import-slugs";
import { isNcaaMenuPendingVenue } from "./venue-empty-menu";

export type SharedMenuTenantScope =
  | "shared"
  | "nfl-only"
  | "college-confirmed"
  | "unknown";

export type MenuTaggedItem = {
  name: string;
  slug: string;
  tags: string[];
  description?: string | null;
};

/** College tenants that share NFL stadiums in the ACC rollout. */
export const SHARED_NFL_COLLEGE_TENANT_SLUGS: Record<string, string> = {
  "acrisure-stadium": "pittsburgh-panthers",
  "hard-rock-stadium": "miami-hurricanes"
};

/** NFL primary tenants for the same buildings (for framing / contrast). */
export const SHARED_NFL_PRIMARY_TENANT_SLUGS: Record<string, string> = {
  "acrisure-stadium": "pittsburgh-steelers",
  "hard-rock-stadium": "miami-dolphins"
};

/**
 * Acrisure Stadium — curated scope for the 19 ACTIVE NFL import rows.
 * Keys are FoodItem.slug (stable). Unknown if missing from both sets.
 */
export const ACRISURE_SHARED_ITEM_SLUGS = new Set([
  "auntie-anne-s-auntie-anne-s",
  "bud-light-deck-bud-light-deck",
  "caliente-pizza-draft-house-caliente-pizza-draft-house",
  "dianoia-s-eatery-dianoia-s-eatery",
  "eat-fit-pittsburgh-eat-fit-pittsburgh",
  "primanti-bros-primanti-bros",
  "pulled-pork-nachos-pulled-pork-nachos",
  "steel-city-markets-steel-city-markets",
  "bridges-n-at-the-pierogi-pileup",
  "walk-thru-bru-walk-thru-bru"
]);

export const ACRISURE_STEELERS_ONLY_ITEM_SLUGS = new Set([
  "pick-6-sammies-pick-6-sammies",
  "pulled-pork-nachos-exclusive-menu",
  "pulled-pork-nachos-speakeasy-vibes",
  "pulled-pork-nachos-the-tunnel-walk",
  "steel-city-burger-steel-city-burger",
  "the-50th-anniversary-terrible-towel-kios-the-50th-anniversary-terrible-towel-kio",
  "the-franco-pizza-the-franco-pizza",
  "the-ireland-collection-the-ireland-collection",
  "dianoia-s-the-primo-pick-margarita"
]);

const COLLEGE_CONFIRMED_TAG = "college-confirmed";
const SHARED_VENUE_TAG = "shared-venue";
const NCAA_TAG_RE = /^(ncaa|college-football)$/i;
const NFL_TAG_RE = /^nfl$/i;

function normalizeTags(tags: string[]): string[] {
  return tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
}

function hasTenantTag(tags: string[], tenantSlug: string): boolean {
  const needle = `tenant:${tenantSlug}`.toLowerCase();
  return tags.some((t) => t === needle);
}

function isCollegeConfirmedTags(tags: string[]): boolean {
  return (
    tags.includes(COLLEGE_CONFIRMED_TAG) ||
    tags.some((t) => t.startsWith("tenant:") && /hurricanes|panthers|wildcats|aztecs/i.test(t)) ||
    tags.some((t) => NCAA_TAG_RE.test(t))
  );
}

function isExplicitSharedTags(tags: string[]): boolean {
  return tags.includes(SHARED_VENUE_TAG) || tags.includes("tenant-scope:shared");
}

function isExplicitNflOnlyTags(tags: string[]): boolean {
  return (
    tags.includes("tenant-scope:nfl-only") ||
    tags.some((t) => t === "tenant:pittsburgh-steelers" || t === "tenant:miami-dolphins")
  );
}

/** Classify a single item for audit / filtering at a known shared venue. */
export function classifySharedVenueMenuItem(
  venueSlug: string,
  item: MenuTaggedItem
): SharedMenuTenantScope {
  const slug = venueSlug.trim().toLowerCase();
  const tags = normalizeTags(item.tags);

  if (isCollegeConfirmedTags(tags) && !isExplicitNflOnlyTags(tags)) {
    return "college-confirmed";
  }
  if (isExplicitSharedTags(tags)) {
    return "shared";
  }
  if (isExplicitNflOnlyTags(tags)) {
    return "nfl-only";
  }

  if (slug === "acrisure-stadium") {
    if (ACRISURE_SHARED_ITEM_SLUGS.has(item.slug)) return "shared";
    if (ACRISURE_STEELERS_ONLY_ITEM_SLUGS.has(item.slug)) return "nfl-only";
    return "unknown";
  }

  if (slug === "hard-rock-stadium") {
    if (tags.some((t) => NFL_TAG_RE.test(t)) && !isCollegeConfirmedTags(tags)) {
      return "nfl-only";
    }
    // Untagged concourse fare at Hard Rock is treated as permanent stadium
    // inventory (not Dolphins-exclusive) unless explicitly NFL-tagged.
    if (!tags.some((t) => NFL_TAG_RE.test(t))) {
      return "shared";
    }
    return "unknown";
  }

  if (tags.some((t) => NFL_TAG_RE.test(t)) && !isCollegeConfirmedTags(tags)) {
    return "nfl-only";
  }
  return "unknown";
}

export function summarizeSharedVenueMenuScopes(
  venueSlug: string,
  items: MenuTaggedItem[]
): Record<SharedMenuTenantScope, number> {
  const counts: Record<SharedMenuTenantScope, number> = {
    shared: 0,
    "nfl-only": 0,
    "college-confirmed": 0,
    unknown: 0
  };
  for (const item of items) {
    counts[classifySharedVenueMenuItem(venueSlug, item)] += 1;
  }
  return counts;
}

/** Tags to merge onto an item for durable DB scope (idempotent). */
export function scopeTagsForAcrisureItem(itemSlug: string): string[] {
  if (ACRISURE_SHARED_ITEM_SLUGS.has(itemSlug)) {
    return [SHARED_VENUE_TAG, "tenant-scope:shared"];
  }
  if (ACRISURE_STEELERS_ONLY_ITEM_SLUGS.has(itemSlug)) {
    return ["tenant:pittsburgh-steelers", "tenant-scope:nfl-only"];
  }
  return ["tenant-scope:unknown"];
}

export type CollegeMenuContext = {
  venueSlug: string;
  /** Requested or active college tenant slug, e.g. pittsburgh-panthers */
  collegeTenantSlug: string;
};

/**
 * Resolve college menu context from ?team= and/or the active game only.
 * Upcoming games alone must not force college filtering (Steelers season
 * visitors would otherwise see a Pitt-filtered board all summer).
 */
export function resolveCollegeMenuContext(args: {
  venueSlug: string;
  teamQuery?: string | null;
  activeHomeTeamSlug?: string | null;
  activeLeague?: string | null;
}): CollegeMenuContext | null {
  const venueSlug = args.venueSlug.trim().toLowerCase();
  const collegeTenant = SHARED_NFL_COLLEGE_TENANT_SLUGS[venueSlug];
  if (!collegeTenant) return null;

  const fromQuery = (args.teamQuery ?? "").trim();
  if (fromQuery) {
    const q = teamSlugFromImport(fromQuery);
    const pittAliases = new Set([
      "pittsburgh-panthers",
      "pitt",
      "pitt-panthers",
      "panthers-pitt"
    ]);
    const miamiAliases = new Set([
      "miami-hurricanes",
      "hurricanes",
      "canes",
      "miami-canes"
    ]);
    if (collegeTenant === "pittsburgh-panthers" && (q === collegeTenant || pittAliases.has(q))) {
      return { venueSlug, collegeTenantSlug: collegeTenant };
    }
    if (collegeTenant === "miami-hurricanes" && (q === collegeTenant || miamiAliases.has(q))) {
      return { venueSlug, collegeTenantSlug: collegeTenant };
    }
    // Explicit NFL / other team → do not apply college filter
    return null;
  }

  const active = (args.activeHomeTeamSlug ?? "").trim().toLowerCase();
  const league = (args.activeLeague ?? "").toLowerCase();
  if (
    active === collegeTenant &&
    (league.includes("ncaa") || league.includes("college") || !league)
  ) {
    return { venueSlug, collegeTenantSlug: collegeTenant };
  }

  return null;
}

/** Whether an item may appear under a college-tenant menu context. */
export function itemEligibleForCollegeMenuContext(
  venueSlug: string,
  item: MenuTaggedItem,
  collegeTenantSlug: string
): boolean {
  const tags = normalizeTags(item.tags);
  if (hasTenantTag(tags, collegeTenantSlug) || tags.includes(COLLEGE_CONFIRMED_TAG)) {
    return true;
  }
  const scope = classifySharedVenueMenuItem(venueSlug, item);
  return scope === "shared" || scope === "college-confirmed";
}

export function filterItemsForCollegeMenuContext<T extends MenuTaggedItem>(
  venueSlug: string,
  items: T[],
  collegeTenantSlug: string
): T[] {
  return items.filter((item) =>
    itemEligibleForCollegeMenuContext(venueSlug, item, collegeTenantSlug)
  );
}

/** Empty-state copy when college context filters the board to zero. */
export function collegeMenuPendingMessage(
  venueSlug: string,
  collegeTenantSlug: string
): string {
  if (venueSlug === "acrisure-stadium" || collegeTenantSlug === "pittsburgh-panthers") {
    return "Pitt menu still being verified. Steelers-season concessions stay listed for general stadium visits — suggest a Panthers game-day item below or check back after the college food guide is confirmed.";
  }
  if (venueSlug === "hard-rock-stadium" || collegeTenantSlug === "miami-hurricanes") {
    return "Hurricanes menu still being verified for this view. Dolphins-only specials are hidden here — suggest a Miami game-day item below or check back after more college-confirmed dishes are published.";
  }
  if (isNcaaMenuPendingVenue(venueSlug)) {
    return "College menu still being verified for this stadium. Suggest an item below or check back after the season food guide is published.";
  }
  return "No concessions are confirmed for this team at this stadium yet. Suggest an item below or check back later.";
}

/** Notice for general visitors on shared stadiums with a pending college menu. */
export function sharedStadiumCollegePendingNotice(venueSlug: string): string | null {
  const college = SHARED_NFL_COLLEGE_TENANT_SLUGS[venueSlug.trim().toLowerCase()];
  if (!college || !isNcaaMenuPendingVenue(venueSlug)) return null;
  if (college === "pittsburgh-panthers") {
    return "Pittsburgh Panthers game-day concessions are still being verified. Listings below are stadium / Steelers-season inventory — not Pitt-verified.";
  }
  return null;
}
