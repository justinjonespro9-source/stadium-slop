/**
 * Kauffman Stadium menu cleanup heuristics.
 *
 * MLB dining-guide import created stand-level rows (name = vendor) and generic
 * marketplace/value placeholders. Wave-6 seed added named dishes; hide import
 * stand labels and vague rows, keep reviewable specialties.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction
} from "./venue-menu-quality-audit";

export const KAUFFMAN_STADIUM_VENUE_SLUG = "kauffman-stadium";

export type KauffmanCleanupAction = MenuQualityAction;

/** Named dishes where item title matches vendor/stand name — keep active. */
export const KAUFFMAN_CANONICAL_STAND_DISH_SLUGS = new Set([
  "kauff-hot-dog-wellington-item",
  "kauff-smores-quesadilla-item",
  "kauff-tiramisu-helmet-item",
  "brisketacho",
  "kauff-dirty-soda"
]);

/** Import stand rows superseded by wave-6 named items at the same concept. */
export const KAUFFMAN_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "andys-frozen-custard",
  "hawaiian-bros-island-grill"
]);

export type KauffmanCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const KAUFFMAN_CURATED_CLEANUP_GROUPS: KauffmanCuratedGroupSpec[] = [];

/** Untyped import / marketplace rows. */
export const KAUFFMAN_GENERIC_CONCESSION_SLUGS = new Set([
  "gf-hot-dog",
  "veggie-burger",
  "beyond-brat",
  "made-to-order-salads",
  "made-to-order-wraps",
  "value-pretzel",
  "italian-sausage"
]);

const GENERIC_BEVERAGE_RE =
  /^(craft cocktails?|domestic beer|miller lite beer|seasonal seltzer|value beer|bar drinks?|hard seltzer|gluten[- ]free beer|rotating craft cocktail)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(all[- ]you[- ]can[- ]eat package|beverage package|assorted snacks?|grab[- ]and[- ]go|made to order salads?|made to order wraps?)$/i;

export function isKauffmanVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (KAUFFMAN_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name === vendor;
}

export function isKauffmanGenericConcessionRow(slug: string, name: string): boolean {
  if (KAUFFMAN_GENERIC_CONCESSION_SLUGS.has(slug)) {
    return true;
  }
  return /^(gf hot dog|veggie burger|beyond brat|value pretzel|made to order salads?|made to order wraps?)$/i.test(
    name.trim()
  );
}

export function isKauffmanGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isKauffmanVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type KauffmanRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyKauffmanStadiumRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): KauffmanRowClassification {
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

  if (KAUFFMAN_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — named wave-6 menu items cover this vendor"
    };
  }

  if (isKauffmanVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists or stand is not reviewable alone"
    };
  }

  if (isKauffmanGenericConcessionRow(item.slug, item.name)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic ballpark concession or marketplace category — not a named specialty dish"
    };
  }

  if (isKauffmanGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic bar beer/cocktail category — not a named specialty pour"
    };
  }

  if (isKauffmanVaguePlaceholderRow(item.name)) {
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

export function buildKauffmanCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: KauffmanCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of KAUFFMAN_CURATED_CLEANUP_GROUPS) {
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
>(member: T, keep: T, spec: KauffmanCuratedGroupSpec): KauffmanCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
