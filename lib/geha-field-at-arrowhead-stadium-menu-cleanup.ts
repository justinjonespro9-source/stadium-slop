/**
 * GEHA Field at Arrowhead Stadium menu cleanup heuristics.
 *
 * Curated amenities import + NFL league import overlap on concept-level
 * vendor rows (name = vendor). Hide stand placeholders; keep headline named
 * dishes; dedupe Crab Fries / Crabfries punctuation variant.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction,
  type MenuQualityItem
} from "./venue-menu-quality-audit";

export const GEHA_FIELD_AT_ARROWHEAD_STADIUM_VENUE_SLUG =
  "geha-field-at-arrowhead-stadium";

export type GehaFieldAtArrowheadStadiumCleanupAction = MenuQualityAction;

/** Headline / named specialty rows where item title matches vendor — keep active. */
export const GEHA_FIELD_AT_ARROWHEAD_STADIUM_CANONICAL_STAND_DISH_SLUGS = new Set([
  "the-loudest-mac-cheese-the-loudest-mac-cheese",
  "the-catfish-po-boy-the-catfish-po-boy",
  "fluffy-tacos-fluffy-tacos",
  "elote-corn-elote-corn",
  "funnel-cake-apple-pie-funnel-cake-apple-pie"
]);

export const GEHA_FIELD_AT_ARROWHEAD_STADIUM_REDUNDANT_STAND_LABEL_SLUGS =
  new Set<string>([]);

export type GehaFieldAtArrowheadStadiumCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  preferredKeepSlug?: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const GEHA_FIELD_AT_ARROWHEAD_STADIUM_CURATED_CLEANUP_GROUPS: GehaFieldAtArrowheadStadiumCuratedGroupSpec[] =
  [
    {
      id: "crab-fries-with-cheese",
      label: "Crab Fries with Cheese / Crabfries punctuation duplicate",
      canonicalName: "Crab Fries with Cheese",
      preferredKeepSlug: "crabfries-with-cheese",
      notes:
        "Chickie and Pete's is the recognizable crabfries brand; hide Connected Concepts operator/import spelling variant.",
      treatAsDuplicate: true,
      matchName: (n) => /^crab\s*fries with cheese$/i.test(n.trim())
    }
  ];

export const GEHA_FIELD_AT_ARROWHEAD_STADIUM_GENERIC_CONCESSION_SLUGS =
  new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|value beer|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|rotating carved sandwich)$/i;

const VENDOR_STAND_EXEMPT_SLUGS = new Set([
  ...GEHA_FIELD_AT_ARROWHEAD_STADIUM_CANONICAL_STAND_DISH_SLUGS
]);

export function isGehaFieldAtArrowheadStadiumVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (VENDOR_STAND_EXEMPT_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name.length > 0 && name === vendor;
}

export function isGehaFieldAtArrowheadStadiumGenericConcessionRow(
  slug: string
): boolean {
  return GEHA_FIELD_AT_ARROWHEAD_STADIUM_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isGehaFieldAtArrowheadStadiumGenericBeverageRow(
  name: string
): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isGehaFieldAtArrowheadStadiumVaguePlaceholderRow(
  name: string
): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export function getGehaFieldAtArrowheadStadiumKeepBothMemberIds<
  T extends { id: string; name: string; vendor: { name: string } }
>(items: T[]): Set<string> {
  const ids = new Set<string>();
  for (const spec of GEHA_FIELD_AT_ARROWHEAD_STADIUM_CURATED_CLEANUP_GROUPS) {
    if (spec.treatAsDuplicate) continue;
    const members = items.filter((item) =>
      spec.matchName(item.name, item.vendor.name)
    );
    if (members.length < 2) continue;
    for (const member of members) {
      ids.add(member.id);
    }
  }
  return ids;
}

export type GehaFieldAtArrowheadStadiumRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyGehaFieldAtArrowheadStadiumRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): GehaFieldAtArrowheadStadiumRowClassification {
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

  if (GEHA_FIELD_AT_ARROWHEAD_STADIUM_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — not a named reviewable dish"
    };
  }

  if (isGehaFieldAtArrowheadStadiumVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason:
        "Stand/vendor placeholder — league import row, named menu items exist at this stand"
    };
  }

  if (isGehaFieldAtArrowheadStadiumGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic value concession — not a named specialty dish"
    };
  }

  if (isGehaFieldAtArrowheadStadiumGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isGehaFieldAtArrowheadStadiumVaguePlaceholderRow(item.name)) {
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

export function buildGehaFieldAtArrowheadStadiumCuratedGroups<
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
    spec: GehaFieldAtArrowheadStadiumCuratedGroupSpec;
    members: T[];
  }[] = [];

  for (const spec of GEHA_FIELD_AT_ARROWHEAD_STADIUM_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) =>
      spec.matchName(item.name, item.vendor.name)
    );
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function pickGehaFieldAtArrowheadStadiumCuratedKeep<T extends MenuQualityItem>(
  members: T[],
  spec: GehaFieldAtArrowheadStadiumCuratedGroupSpec
): T {
  if (spec.preferredKeepSlug) {
    const preferred = members.find((m) => m.slug === spec.preferredKeepSlug);
    if (preferred) return preferred;
  }
  return pickCanonicalMember(members, spec.canonicalName);
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
  spec: GehaFieldAtArrowheadStadiumCuratedGroupSpec
): GehaFieldAtArrowheadStadiumCleanupAction {
  if (!spec.treatAsDuplicate) {
    return "keep-both";
  }
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
