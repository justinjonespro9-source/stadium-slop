/**
 * AT&T Stadium menu cleanup heuristics.
 *
 * Curated flipbook/NFL import overlaps league stand rows (name = vendor).
 * Hide stand placeholders; keep headline named dishes; keep GF hand pie SKU.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction,
  type MenuQualityItem
} from "./venue-menu-quality-audit";

export const ATT_STADIUM_VENUE_SLUG = "att-stadium";

export type AttStadiumCleanupAction = MenuQualityAction;

/**
 * Headline / named specialty rows where item title matches vendor — keep active.
 */
export const ATT_STADIUM_CANONICAL_STAND_DISH_SLUGS = new Set([
  "the-rowdy-dog-the-rowdy-dog",
  "the-texas-burrito-the-texas-burrito",
  "the-elote-burger-the-elote-burger",
  "frito-pie-burger-frito-pie-burger",
  "smoked-salmon-blt-smoked-salmon-blt",
  "dessert-nachos-dessert-nachos",
  "jumbo-cowboys-cheesesteak-jumbo-cowboys-cheesesteak"
]);

/** Non-reviewable import rows (stand labels, suite copy, combo bundles). */
export const ATT_STADIUM_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "blue-bell-ice-cream-the-suite-refresh",
  "gluten-free-hand-pies-cowboys-kid-meals"
]);

export type AttStadiumCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  preferredKeepSlug?: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const ATT_STADIUM_CURATED_CLEANUP_GROUPS: AttStadiumCuratedGroupSpec[] = [
  {
    id: "cowboys-cheesesteak-hand-pie",
    label: "Cowboys Cheesesteak Hand Pie vs gluten-free variant",
    canonicalName: "Cowboys Cheesesteak Hand Pie",
    notes:
      "Distinct SKUs — standard pastry vs gluten-free pastry. Keep both reviewable.",
    treatAsDuplicate: false,
    matchName: (n) => /cowboys cheesesteak hand pie/i.test(n.trim())
  }
];

export const ATT_STADIUM_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|value beer|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|rotating carved sandwich)$/i;

const VENDOR_STAND_EXEMPT_SLUGS = new Set([...ATT_STADIUM_CANONICAL_STAND_DISH_SLUGS]);

export function isAttStadiumVendorStandPlaceholder(item: {
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

export function isAttStadiumGenericConcessionRow(slug: string): boolean {
  return ATT_STADIUM_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isAttStadiumGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isAttStadiumVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

/** Member IDs in curated keep-both groups — skip auto duplicate hide. */
export function getAttStadiumKeepBothMemberIds<
  T extends { id: string; name: string; vendor: { name: string } }
>(items: T[]): Set<string> {
  const ids = new Set<string>();
  for (const spec of ATT_STADIUM_CURATED_CLEANUP_GROUPS) {
    if (spec.treatAsDuplicate) continue;
    const members = items.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length < 2) continue;
    for (const member of members) {
      ids.add(member.id);
    }
  }
  return ids;
}

export type AttStadiumRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyAttStadiumRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): AttStadiumRowClassification {
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

  if (ATT_STADIUM_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Non-reviewable import row — suite copy or combo bundle, not a named dish"
    };
  }

  if (isAttStadiumVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason:
        "Stand/vendor placeholder — league import row, named menu items exist at this stand"
    };
  }

  if (isAttStadiumGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic value concession — not a named specialty dish"
    };
  }

  if (isAttStadiumGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isAttStadiumVaguePlaceholderRow(item.name)) {
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

export function buildAttStadiumCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: AttStadiumCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of ATT_STADIUM_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function pickAttStadiumCuratedKeep<T extends MenuQualityItem>(
  members: T[],
  spec: AttStadiumCuratedGroupSpec
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
>(member: T, keep: T, spec: AttStadiumCuratedGroupSpec): AttStadiumCleanupAction {
  if (!spec.treatAsDuplicate) {
    return "keep-both";
  }
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
