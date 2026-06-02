/**
 * Daikin Park menu cleanup heuristics.
 *
 * Food-guide import overlaps wave-4 seed items. Reclassify name=vendor false
 * positives on Houston/Astros specialties; hide value pours and import dupes.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction
} from "./venue-menu-quality-audit";

export const DAIKIN_PARK_VENUE_SLUG = "daikin-park";

export type DaikinCleanupAction = MenuQualityAction;

/** Named dishes where item title matches vendor/stand name — keep active. */
export const DAIKIN_CANONICAL_STAND_DISH_SLUGS = new Set([
  "daikin-brisket-donuts-item",
  "daikin-crawlache-item",
  "daikin-maple-brisket-wafflewich-item",
  "daikin-whataburger-burger"
]);

export const DAIKIN_REDUNDANT_STAND_LABEL_SLUGS = new Set<string>([]);

export type DaikinCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const DAIKIN_CURATED_CLEANUP_GROUPS: DaikinCuratedGroupSpec[] = [
  {
    id: "frozen-margarita",
    label: "El Tiempo frozen margarita at two bar locations",
    canonicalName: "Frozen Margarita",
    notes: "Same drink name at Cantina vs Margarita Bar — meaningfully different stands.",
    treatAsDuplicate: false,
    matchName: (n) => /^frozen margarita$/i.test(n.trim())
  },
  {
    id: "brisket-donut",
    label: "Brisket donut import vs seed naming",
    canonicalName: "Brisket Donuts",
    notes: "Menu import Brisket Donut vs wave-4 Brisket Donuts stand item.",
    treatAsDuplicate: true,
    matchName: (n) => /^brisket donuts?$/i.test(n.trim())
  },
  {
    id: "banh-mi-dog",
    label: "Bahn Mi Dog typo import vs seed",
    canonicalName: "Banh Mi Dog",
    notes: "Import Bahn Mi Dog vs seed Banh Mi Dog at stands.",
    treatAsDuplicate: true,
    matchName: (n) => /^ba(nh|hn) mi dog$/i.test(n.trim())
  },
  {
    id: "h-town-boomin-onion",
    label: "H-Town hot onion blossom naming",
    canonicalName: "H-Town Hot Boomin Onion",
    notes: "Import onion blossom vs Onion Station seed Boomin Onion.",
    treatAsDuplicate: true,
    matchName: (n) => /h[- ]town hot (boomin )?onion/i.test(n)
  },
  {
    id: "bbq-pork-boomin-onion",
    label: "BBQ pork burnt end onion naming",
    canonicalName: "BBQ Pork Burnt End Boomin Onion",
    notes: "Import onion blossom vs Onion Station seed Boomin Onion.",
    treatAsDuplicate: true,
    matchName: (n) => /bbq pork burnt end (boomin )?onion/i.test(n)
  },
  {
    id: "chick-fil-a-sandwich",
    label: "Chick-fil-A sandwich duplicate rows",
    canonicalName: "Chick-fil-A Chicken Sandwich",
    notes: "Import named sandwich vs seed generic Chicken Sandwich.",
    treatAsDuplicate: true,
    matchName: (n, v) =>
      /chick[- ]fil[- ]a chicken sandwich/i.test(n) ||
      (/^chicken sandwich$/i.test(n.trim()) && /chick[- ]fil[- ]a/i.test(v))
  },
  {
    id: "pluckers-wings",
    label: "Pluckers wings duplicate rows",
    canonicalName: "Pluckers Wings",
    notes: "Import Pluckers Wings vs seed generic Wings at Pluckers Wing Bar.",
    treatAsDuplicate: true,
    matchName: (n, v) =>
      /^pluckers wings$/i.test(n.trim()) ||
      (/^wings$/i.test(n.trim()) && /pluckers/i.test(v))
  }
];

export const DAIKIN_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package)$/i;

export function isDaikinVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (DAIKIN_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name === vendor;
}

export function isDaikinGenericConcessionRow(slug: string, name: string): boolean {
  if (DAIKIN_GENERIC_CONCESSION_SLUGS.has(slug)) {
    return true;
  }
  return false;
}

export function isDaikinGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isDaikinVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type DaikinRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyDaikinParkRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): DaikinRowClassification {
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

  if (DAIKIN_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — named wave-4 menu items cover this vendor"
    };
  }

  if (isDaikinVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists or stand is not reviewable alone"
    };
  }

  if (isDaikinGenericConcessionRow(item.slug, item.name)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic ballpark concession category — not a named specialty dish"
    };
  }

  if (isDaikinGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isDaikinVaguePlaceholderRow(item.name)) {
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

export function buildDaikinCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: DaikinCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of DAIKIN_CURATED_CLEANUP_GROUPS) {
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
>(member: T, keep: T, spec: DaikinCuratedGroupSpec): DaikinCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
