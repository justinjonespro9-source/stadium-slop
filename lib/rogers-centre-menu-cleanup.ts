/**
 * Rogers Centre menu cleanup heuristics.
 *
 * Food-finder import overlaps wave-6 seed items. Reclassify name=vendor false
 * positives on Toronto/Blue Jays specialties; keep Mary Brown's combo SKUs
 * as meaningfully different; hide import dupes and value placeholders.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction
} from "./venue-menu-quality-audit";

export const ROGERS_CENTRE_VENUE_SLUG = "rogers-centre";

export type RogersCentreCleanupAction = MenuQualityAction;

/** Named dishes where item title matches vendor/stand name — keep active. */
export const ROGERS_CENTRE_CANONICAL_STAND_DISH_SLUGS = new Set([
  "rc-ace-dog-item",
  "rc-crispy-calamari-item",
  "rc-meatball-panini-item"
]);

/** Import stand rows superseded by wave-6 named items. */
export const ROGERS_CENTRE_REDUNDANT_STAND_LABEL_SLUGS = new Set<string>([]);

export type RogersCentreCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const ROGERS_CENTRE_CURATED_CLEANUP_GROUPS: RogersCentreCuratedGroupSpec[] = [
  {
    id: "mary-brown-big-mary-combo",
    label: "Mary Brown's Big Mary sandwich vs combo with Taters",
    canonicalName: "Mary Brown's Original Big Mary",
    notes:
      "Distinct Mary Brown's SKUs — sandwich-only vs combo with taters. Keep both reviewable.",
    treatAsDuplicate: false,
    matchName: (n) => /mary brown'?s original big mary/i.test(n.trim())
  },
  {
    id: "shawarma-bowl",
    label: "Shawarma bowl import vs The Stop seed",
    canonicalName: "Beef Shawarma Bowl",
    notes: "General Concessions shawarma bowl vs The Stop beef shawarma rice bowl.",
    treatAsDuplicate: true,
    matchName: (n) => /^shawarma bowl$|^beef shawarma bowl$/i.test(n.trim())
  },
  {
    id: "jamaican-beef-patty",
    label: "Jamaican beef patty import vs Randy's seed",
    canonicalName: "Beef Jamaican Patty",
    notes: "General Concessions patty vs Randy's Patties seed item.",
    treatAsDuplicate: true,
    matchName: (n) => /^jamaican beef patty$|^beef jamaican patty$/i.test(n.trim())
  },
  {
    id: "stuffed-jamaican-patty",
    label: "Stuffed Jamaican patty import vs The Stop seed",
    canonicalName: "Stuffed Jamaican Patties",
    notes: "General Concessions specialty patty vs The Stop stuffed patties.",
    treatAsDuplicate: true,
    matchName: (n) =>
      /^specialty stuffed jamaican patty$|^stuffed jamaican patties$/i.test(n.trim())
  }
];

export const ROGERS_CENTRE_GENERIC_CONCESSION_SLUGS = new Set(["value-pretzel-bites"]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|visiting team menu)$/i;

export function isRogersCentreVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (ROGERS_CENTRE_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name === vendor;
}

export function isRogersCentreGenericConcessionRow(slug: string): boolean {
  return ROGERS_CENTRE_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isRogersCentreGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isRogersCentreVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

/** Member IDs in curated keep-both groups — skip auto duplicate hide. */
export function getRogersCentreKeepBothMemberIds<
  T extends { id: string; name: string; vendor: { name: string } }
>(items: T[]): Set<string> {
  const ids = new Set<string>();
  for (const spec of ROGERS_CENTRE_CURATED_CLEANUP_GROUPS) {
    if (spec.treatAsDuplicate) continue;
    const members = items.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length < 2) continue;
    for (const member of members) {
      ids.add(member.id);
    }
  }
  return ids;
}

export type RogersCentreRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyRogersCentreRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): RogersCentreRowClassification {
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

  if (ROGERS_CENTRE_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — wave-6 named menu items cover this vendor"
    };
  }

  if (isRogersCentreVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists or stand is not reviewable alone"
    };
  }

  if (isRogersCentreGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic value concession — not a named specialty dish"
    };
  }

  if (isRogersCentreGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isRogersCentreVaguePlaceholderRow(item.name)) {
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

export function buildRogersCentreCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: RogersCentreCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of ROGERS_CENTRE_CURATED_CLEANUP_GROUPS) {
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
>(
  member: T,
  keep: T,
  spec: RogersCentreCuratedGroupSpec
): RogersCentreCleanupAction {
  if (!spec.treatAsDuplicate) {
    return "keep-both";
  }
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
