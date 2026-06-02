/**
 * Tropicana Field menu cleanup heuristics.
 *
 * Food-guide import created stand labels and near-duplicate rows overlapping
 * wave-3 seed items. Hide vendor labels, generic hub rows, and token-similar
 * duplicates; keep Tampa/Rays named specialties.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction
} from "./venue-menu-quality-audit";

export const TROPICANA_FIELD_VENUE_SLUG = "tropicana-field";

export type TropicanaCleanupAction = MenuQualityAction;

export const TROPICANA_CANONICAL_STAND_DISH_SLUGS = new Set<string>([]);

/** Import stand rows superseded by wave-3 named items. */
export const TROPICANA_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "crumbl-cookies",
  "epic-milkshakes"
]);

export type TropicanaCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const TROPICANA_CURATED_CLEANUP_GROUPS: TropicanaCuratedGroupSpec[] = [
  {
    id: "pulled-pork-nachos",
    label: "Fan Favorites pulled pork nachos sizing",
    canonicalName: "Pulled Pork Nachos",
    notes: "Regular vs Super pulled pork nachos — keep base listing at Fan Favorites.",
    treatAsDuplicate: true,
    matchName: (n) => /^(super )?pulled pork nachos$/i.test(n.trim())
  },
  {
    id: "bird-batter-tenders",
    label: "Bird & Batter chicken tenders combo duplicate",
    canonicalName: "Buffalo Chicken Tenders and Fries",
    notes: "Plain tenders & fries import vs named buffalo combo at Bird & Batter.",
    treatAsDuplicate: true,
    matchName: (n) =>
      /^buffalo chicken tenders and fries$/i.test(n.trim()) ||
      /^chicken tenders & fries$/i.test(n.trim())
  }
];

export const TROPICANA_GENERIC_CONCESSION_SLUGS = new Set(["cotton-candy"]);

const GENERIC_BEVERAGE_RE =
  /^(grab[- ]and[- ]go drinks?|value soda|value water|bar drinks?|craft beer|hard seltzer|domestic beer)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package)$/i;

export function isTropicanaVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (TROPICANA_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name === vendor;
}

export function isTropicanaGenericConcessionRow(slug: string, name: string): boolean {
  if (TROPICANA_GENERIC_CONCESSION_SLUGS.has(slug)) {
    return true;
  }
  return /^cotton candy$/i.test(name.trim());
}

export function isTropicanaGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isTropicanaVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type TropicanaRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyTropicanaFieldRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): TropicanaRowClassification {
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

  if (TROPICANA_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — named wave-3 menu items cover this vendor"
    };
  }

  if (isTropicanaVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists or stand is not reviewable alone"
    };
  }

  if (isTropicanaGenericConcessionRow(item.slug, item.name)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic ballpark snack category — not a named specialty dish"
    };
  }

  if (isTropicanaGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isTropicanaVaguePlaceholderRow(item.name)) {
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

export function buildTropicanaCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: TropicanaCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of TROPICANA_CURATED_CLEANUP_GROUPS) {
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
>(member: T, keep: T, spec: TropicanaCuratedGroupSpec): TropicanaCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
