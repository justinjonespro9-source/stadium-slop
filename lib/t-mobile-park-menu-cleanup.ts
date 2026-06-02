/**
 * T-Mobile Park menu cleanup heuristics.
 *
 * Stand-level rows from lib/venue-menu-import/t-mobile-park.ts overlap wave-4
 * named seed items. Hide vendor-label and generic concession pours; keep
 * named specialties (churros, piroshky, Ivar's dishes, etc.).
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction
} from "./venue-menu-quality-audit";

export const T_MOBILE_PARK_VENUE_SLUG = "t-mobile-park";

export type TMobileCleanupAction = MenuQualityAction;

/** Named dishes that match vendor title — still reviewable (keep). */
export const T_MOBILE_CANONICAL_STAND_DISH_SLUGS = new Set<string>([]);

/** Import stand rows superseded by named items at the same vendor. */
export const T_MOBILE_REDUNDANT_STAND_LABEL_SLUGS = new Set<string>([]);

export type TMobileCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const T_MOBILE_CURATED_CLEANUP_GROUPS: TMobileCuratedGroupSpec[] = [
  {
    id: "ube-krispie",
    label: "Ube coconut rice krispie naming",
    canonicalName: "Ube Coconut Rice Krispie Treat",
    notes: "Menu import short name vs wave-4 canonical treat name.",
    treatAsDuplicate: true,
    matchName: (n) => /ube coconut rice krispie/i.test(n)
  },
  {
    id: "ivars-fish-chips",
    label: "Ivar's fish & chips duplicate rows",
    canonicalName: "Fish & Chips",
    notes: "ivars-fish-and-chips legacy row vs seed Fish & Chips.",
    treatAsDuplicate: true,
    matchName: (n) =>
      /^fish & chips$/i.test(n.trim()) || /^ivar.?s fish & chips$/i.test(n.trim())
  }
];

/** Untyped general-concession rows (General Concessions vendor). */
export const T_MOBILE_GENERIC_CONCESSION_SLUGS = new Set([
  "french-fries",
  "hot-dog",
  "pretzels",
  "garlic-fries",
  "chicken-tenders",
  "ballpark-salad",
  "nachos",
  "value-nachos",
  "wings",
  "churros"
]);

const GENERIC_BEVERAGE_RE =
  /^(bar drinks?|value beer|gluten[- ]free beer|rotating craft cocktail|local craft beer|craft beer|hard seltzer|premium bar drinks?|silver bullet bar|draft beer)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go|counter pick|bar drinks?|value soda|value water)$/i;

export function isTMobileVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (T_MOBILE_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  if (name === vendor) {
    return true;
  }
  // Ballard Pizza Co stand vs Ballard Pizza vendor for named slice
  if (name === "ballard pizza co" && vendor === "ballard pizza co") {
    return true;
  }
  return false;
}

export function isTMobileGenericConcessionRow(slug: string, name: string): boolean {
  if (T_MOBILE_GENERIC_CONCESSION_SLUGS.has(slug)) {
    return true;
  }
  return /^(french fries|hot dog|pretzels?|garlic fries|chicken tenders|ballpark salad|nachos|value nachos|wings)$/i.test(
    name.trim()
  );
}

export function isTMobileGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isTMobileVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type TMobileRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyTMobileParkRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): TMobileRowClassification {
  if (
    !opts?.skipEngagementGuard &&
    (item.reviewCount > 0 || item.photoCount > 0)
  ) {
    return {
      kind: "manual",
      action: "manual-review",
      reason: "Has reviews or photos — do not auto-hide"
    };
  }

  if (T_MOBILE_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — named menu items cover this vendor"
    };
  }

  if (isTMobileVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists or stand is not reviewable alone"
    };
  }

  if (isTMobileGenericConcessionRow(item.slug, item.name)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic ballpark concession category — not a named specialty dish"
    };
  }

  if (isTMobileGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic bar beer/cocktail category — not a named specialty pour"
    };
  }

  if (isTMobileVaguePlaceholderRow(item.name)) {
    return {
      kind: "vague",
      action: "hide-generic",
      reason: "Vague placeholder — not a specific reviewable dish"
    };
  }

  return {
    kind: "keep",
    action: "keep-canonical",
    reason: "Named specialty or menu item — keep active"
  };
}

export function buildTMobileCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: TMobileCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of T_MOBILE_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function recommendCuratedMemberAction<
  T extends {
    name: string;
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(member: T, keep: T, spec: TMobileCuratedGroupSpec): TMobileCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
