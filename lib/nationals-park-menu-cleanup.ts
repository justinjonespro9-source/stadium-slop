/**
 * Nationals Park menu cleanup heuristics.
 *
 * Primary issue: MLB menu import + concessions guide created stand-level rows
 * where FoodItem.name equals vendor.name. Wave-2 seed added named dishes;
 * vendor-label rows should be hidden, not generic concession inventory.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction
} from "./venue-menu-quality-audit";

export const NATIONALS_PARK_VENUE_SLUG = "nationals-park";

export type NationalsCleanupAction = MenuQualityAction;

/** Named dishes that share a stand title as display name — keep, do not treat as vendor-only. */
export const NATIONALS_CANONICAL_STAND_DISH_SLUGS = new Set([
  "nats-capitol-slugger-dog"
]);

/** Import stand-label rows superseded by named seed items at the same vendor. */
export const NATIONALS_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "melissas-field-of-greens"
]);

export type NationalsCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const NATIONALS_CURATED_CLEANUP_GROUPS: NationalsCuratedGroupSpec[] = [
  {
    id: "melissa-stand-label",
    label: "Melissa's Field of Greens stand label vs menu items",
    canonicalName: "Plant-Based Protein Bowl",
    notes: "Import stand row; keep Fresh Salad and Plant-Based Protein Bowl from seed.",
    treatAsDuplicate: true,
    matchName: (n) => /^melissa.?s field of greens$/i.test(n.trim())
  }
];

const GENERIC_BEVERAGE_RE =
  /^(cocktails?|local craft beer|frozen cocktails?|frozen gin & tonic|hard cider|beer)$/i;

const VAGUE_NON_REVIEWABLE_RE = /^(upscale snacks)$/i;

export function isNationalsVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (NATIONALS_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name === vendor;
}

export function isNationalsGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isNationalsVaguePlaceholderRow(name: string): boolean {
  return VAGUE_NON_REVIEWABLE_RE.test(name.trim());
}

export type NationalsRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyNationalsParkRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): NationalsRowClassification {
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

  if (NATIONALS_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — Fresh Salad and Plant-Based Protein Bowl cover this vendor"
    };
  }

  if (isNationalsVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists elsewhere or stand is not reviewable alone"
    };
  }

  if (isNationalsGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic bar beer/cocktail category — not a named specialty pour"
    };
  }

  if (isNationalsVaguePlaceholderRow(item.name)) {
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

export function buildNationalsCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: {
    spec: NationalsCuratedGroupSpec;
    members: T[];
  }[] = [];

  for (const spec of NATIONALS_CURATED_CLEANUP_GROUPS) {
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
>(member: T, keep: T, spec: NationalsCuratedGroupSpec): NationalsCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
