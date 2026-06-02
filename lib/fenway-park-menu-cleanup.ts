/**
 * Fenway Park menu cleanup heuristics.
 *
 * Concessions import created stand-level rows (name = vendor) alongside
 * expansion-seed Boston/Red Sox specialties. Hide stand labels and import
 * dupes; keep Fenway Frank, lobster items, Green Monster fries, etc.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction
} from "./venue-menu-quality-audit";

export const FENWAY_PARK_VENUE_SLUG = "fenway-park";

export type FenwayParkCleanupAction = MenuQualityAction;

/** Named dishes where item title matches vendor/stand name — keep active. */
export const FENWAY_PARK_CANONICAL_STAND_DISH_SLUGS = new Set([
  "fenway-green-monster-fries-item",
  "fenway-lobstah-poutine-item",
  "fenway-spicy-cabot-grilled-cheese-item"
]);

/** Import stand rows superseded by named menu items elsewhere. */
export const FENWAY_PARK_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "farmers-fridge",
  "sals-pizza"
]);

export type FenwayParkCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const FENWAY_PARK_CURATED_CLEANUP_GROUPS: FenwayParkCuratedGroupSpec[] = [
  {
    id: "fenway-frank",
    label: "Fenway Frank import vs expansion seed",
    canonicalName: "Fenway Frank",
    notes: "Import Kayem Fenway Frank vs expansion seed Fenway Frank at Kayem.",
    treatAsDuplicate: true,
    matchName: (n) => /^fenway frank$|^kayem fenway frank$/i.test(n.trim())
  },
  {
    id: "lukes-lobster-roll",
    label: "Luke's lobster roll import vs seed",
    canonicalName: "Luke's Lobster Roll",
    notes: "Import Luke's Lobster Roll vs expansion Lobster roll at Luke's Lobster.",
    treatAsDuplicate: true,
    matchName: (n) => /^luke'?s lobster roll$|^lobster roll$/i.test(n.trim())
  }
];

export const FENWAY_PARK_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet)$/i;

export function isFenwayParkVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (FENWAY_PARK_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name === vendor;
}

export function isFenwayParkGenericConcessionRow(slug: string): boolean {
  return FENWAY_PARK_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isFenwayParkGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isFenwayParkVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type FenwayParkRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyFenwayParkRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): FenwayParkRowClassification {
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

  if (FENWAY_PARK_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — Regina Pizzeria or other named items cover this concept"
    };
  }

  if (isFenwayParkVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists or stand is not reviewable alone"
    };
  }

  if (isFenwayParkGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic ballpark concession category — not a named specialty dish"
    };
  }

  if (isFenwayParkGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isFenwayParkVaguePlaceholderRow(item.name)) {
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

export function buildFenwayParkCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: FenwayParkCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of FENWAY_PARK_CURATED_CLEANUP_GROUPS) {
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
>(member: T, keep: T, spec: FenwayParkCuratedGroupSpec): FenwayParkCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
