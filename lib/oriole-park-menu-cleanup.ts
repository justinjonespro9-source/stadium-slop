/**
 * Oriole Park at Camden Yards menu cleanup heuristics.
 *
 * Concessions import overlaps wave-3 seed items. Hide punctuation duplicate
 * imports, stand labels, and reclassify Baltimore/Orioles specialties to keep.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction,
  type MenuQualityItem
} from "./venue-menu-quality-audit";

export const ORIOLE_PARK_VENUE_SLUG = "oriole-park-at-camden-yards";

export type OrioleParkCleanupAction = MenuQualityAction;

/** Named dishes where item title matches vendor/stand name — keep active. */
export const ORIOLE_PARK_CANONICAL_STAND_DISH_SLUGS = new Set<string>([]);

/** Import stand rows superseded by wave-3 named items. */
export const ORIOLE_PARK_REDUNDANT_STAND_LABEL_SLUGS = new Set(["dippin-dots"]);

export type OrioleParkCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  /** When set, this slug is kept over score-based canonical pick (wave-3 seed). */
  preferredKeepSlug?: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const ORIOLE_PARK_CURATED_CLEANUP_GROUPS: OrioleParkCuratedGroupSpec[] = [
  {
    id: "bmore-yak",
    label: "B'More Yak punctuation duplicate rows",
    canonicalName: "B'MORE Yak",
    preferredKeepSlug: "orioles-bmore-yak",
    notes:
      "Import at Pat LaFrieda Meats vs wave-3 Eutaw Street Butchery seed (Baltimore specialty).",
    treatAsDuplicate: true,
    matchName: (n) => /^b[''’]?more yak$/i.test(n.trim())
  },
  {
    id: "kats-japanese-cheesesteak",
    label: "Kat's Japanese Cheesesteak punctuation duplicate rows",
    canonicalName: "Kat's Japanese Cheesesteak",
    preferredKeepSlug: "orioles-kats-japanese-cheesesteak",
    notes:
      "Import at Kat's King of Steaks vs wave-3 All-Star Kitchen seed item.",
    treatAsDuplicate: true,
    matchName: (n) => /^kat[''’]?s japanese cheesesteak$/i.test(n.trim())
  },
  {
    id: "kosher-hot-pastrami",
    label: "Birdland Kosher hot pastrami duplicate rows",
    canonicalName: "Hot Pastrami on Rye",
    preferredKeepSlug: "orioles-kosher-hot-pastrami",
    notes: "Import long name vs wave-3 kosher stand seed at Birdland Kosher.",
    treatAsDuplicate: true,
    matchName: (n) => /^hot pastrami (sandwich )?on rye$/i.test(n.trim())
  }
];

export const ORIOLE_PARK_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|rotating carved sandwich)$/i;

export function isOrioleParkVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (ORIOLE_PARK_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name === vendor;
}

export function isOrioleParkGenericConcessionRow(slug: string): boolean {
  return ORIOLE_PARK_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isOrioleParkGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isOrioleParkVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type OrioleParkRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyOrioleParkRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): OrioleParkRowClassification {
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

  if (ORIOLE_PARK_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — not a named reviewable dish"
    };
  }

  if (isOrioleParkVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists or stand is not reviewable alone"
    };
  }

  if (isOrioleParkGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic ballpark concession category — not a named specialty dish"
    };
  }

  if (isOrioleParkGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isOrioleParkVaguePlaceholderRow(item.name)) {
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

export function buildOrioleParkCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: OrioleParkCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of ORIOLE_PARK_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function pickOrioleParkCuratedKeep<T extends MenuQualityItem>(
  members: T[],
  spec: OrioleParkCuratedGroupSpec
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
>(member: T, keep: T, spec: OrioleParkCuratedGroupSpec): OrioleParkCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
