/**
 * Angel Stadium menu cleanup heuristics.
 *
 * PDF/import created stand-level rows (name = vendor) alongside wave-2 seed
 * Angels/SoCal specialties. Hide stand labels and import dupes; keep helmet
 * nachos, Cali Dog, La Caguama, Pac-Man items, Chronic Tacos builds, etc.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction
} from "./venue-menu-quality-audit";

export const ANGEL_STADIUM_VENUE_SLUG = "angel-stadium";

export type AngelStadiumCleanupAction = MenuQualityAction;

/** Named dishes where item title matches vendor/stand name — keep active. */
export const ANGEL_STADIUM_CANONICAL_STAND_DISH_SLUGS = new Set<string>([]);

/** Import stand rows superseded by wave-2 named menu items at the same concept. */
export const ANGEL_STADIUM_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "cathys-cookies",
  "thrifty-ice-cream",
  "walk-off-waffles",
  "wetzels-pretzels"
]);

export type AngelStadiumCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const ANGEL_STADIUM_CURATED_CLEANUP_GROUPS: AngelStadiumCuratedGroupSpec[] = [
  {
    id: "pac-man-soft-serve",
    label: "Pac-Man soft serve import vs seed",
    canonicalName: "Pac-Man Soft Serve",
    notes: "Import Pineapple Soft-Serve vs wave-2 Pac-Man Soft Serve Dole Whip helmet.",
    treatAsDuplicate: true,
    matchName: (n) => /^pac[- ]man soft serve$|^pineapple soft[- ]serve$/i.test(n.trim())
  },
  {
    id: "nashville-hot-sandwich",
    label: "Nashville hot chicken sandwich duplicate rows",
    canonicalName: "Nashville Hot & Buttermilk Fried Chicken Sandwich",
    notes: "General Concessions bullet import vs Strike Zone Chicken stand item.",
    treatAsDuplicate: true,
    matchName: (n) =>
      /nashville hot.*buttermilk.*(fried )?chicken sandwich/i.test(n.trim())
  },
  {
    id: "nashville-hot-tenders",
    label: "Nashville hot tenders duplicate rows",
    canonicalName: "Nashville Hot Tenders & Fries",
    notes: "General Concessions tenders vs Strike Zone Chicken combo row.",
    treatAsDuplicate: true,
    matchName: (n) =>
      /^nashville hot chicken tenders$|^nashville hot tenders/i.test(n.trim())
  }
];

/** Untyped General Concessions category rows (not Angels-named specialties). */
export const ANGEL_STADIUM_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

/** Vague club / rotating menu placeholders. */
export const ANGEL_STADIUM_VAGUE_PLACEHOLDER_SLUGS = new Set([
  "angels-ldc-visiting-team-menu"
]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|visiting team menu)$/i;

export function isAngelStadiumVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (ANGEL_STADIUM_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name === vendor;
}

export function isAngelStadiumGenericConcessionRow(slug: string): boolean {
  return ANGEL_STADIUM_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isAngelStadiumGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isAngelStadiumVaguePlaceholderRow(
  slug: string,
  name: string
): boolean {
  if (ANGEL_STADIUM_VAGUE_PLACEHOLDER_SLUGS.has(slug)) {
    return true;
  }
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type AngelStadiumRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyAngelStadiumRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): AngelStadiumRowClassification {
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

  if (ANGEL_STADIUM_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — wave-2 named menu items cover this vendor"
    };
  }

  if (isAngelStadiumVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists or stand is not reviewable alone"
    };
  }

  if (isAngelStadiumGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic ballpark concession category — not a named specialty dish"
    };
  }

  if (isAngelStadiumGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isAngelStadiumVaguePlaceholderRow(item.slug, item.name)) {
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

export function buildAngelStadiumCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: AngelStadiumCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of ANGEL_STADIUM_CURATED_CLEANUP_GROUPS) {
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
>(member: T, keep: T, spec: AngelStadiumCuratedGroupSpec): AngelStadiumCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
