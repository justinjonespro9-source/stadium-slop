/**
 * Hard Rock Stadium menu cleanup heuristics.
 *
 * Curated concessions import + NFL league import overlap on concept-level
 * vendor rows (name = vendor). Hide stand placeholders; keep headline named
 * dishes; dedupe Key Lime Pie Souvenir Jar plural import.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction,
  type MenuQualityItem
} from "./venue-menu-quality-audit";

export const HARD_ROCK_STADIUM_VENUE_SLUG = "hard-rock-stadium";

export type HardRockStadiumCleanupAction = MenuQualityAction;

/** Headline / named specialty rows where item title matches vendor — keep active. */
export const HARD_ROCK_STADIUM_CANONICAL_STAND_DISH_SLUGS = new Set([
  "the-beef-hammer",
  "salmon-mosaic-salmon-mosaic",
  "south-florida-mofongo-south-florida-mofongo",
  "caramelized-foie-gras-slider-caramelized-foie-gras-slider",
  "shula-burger"
]);

export const HARD_ROCK_STADIUM_REDUNDANT_STAND_LABEL_SLUGS = new Set<string>([]);

export type HardRockStadiumCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  preferredKeepSlug?: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const HARD_ROCK_STADIUM_CURATED_CLEANUP_GROUPS: HardRockStadiumCuratedGroupSpec[] =
  [
    {
      id: "key-lime-pie-souvenir-jar",
      label: "Key Lime Pie Souvenir Jar singular vs plural import",
      canonicalName: "Key Lime Pie Souvenir Jar",
      preferredKeepSlug: "key-lime-pie-souvenir-jar",
      notes:
        "Official import singular name vs NFL league import plural — same souvenir dessert SKU.",
      treatAsDuplicate: true,
      matchName: (n) => /^key lime pie souvenir jars?$/i.test(n.trim())
    }
  ];

export const HARD_ROCK_STADIUM_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|value beer|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|rotating carved sandwich)$/i;

const VENDOR_STAND_EXEMPT_SLUGS = new Set([
  ...HARD_ROCK_STADIUM_CANONICAL_STAND_DISH_SLUGS
]);

export function isHardRockStadiumVendorStandPlaceholder(item: {
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

export function isHardRockStadiumGenericConcessionRow(slug: string): boolean {
  return HARD_ROCK_STADIUM_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isHardRockStadiumGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isHardRockStadiumVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export function getHardRockStadiumKeepBothMemberIds<
  T extends { id: string; name: string; vendor: { name: string } }
>(items: T[]): Set<string> {
  const ids = new Set<string>();
  for (const spec of HARD_ROCK_STADIUM_CURATED_CLEANUP_GROUPS) {
    if (spec.treatAsDuplicate) continue;
    const members = items.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length < 2) continue;
    for (const member of members) {
      ids.add(member.id);
    }
  }
  return ids;
}

export type HardRockStadiumRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyHardRockStadiumRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): HardRockStadiumRowClassification {
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

  if (HARD_ROCK_STADIUM_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — not a named reviewable dish"
    };
  }

  if (isHardRockStadiumVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason:
        "Stand/vendor placeholder — league import row, named menu items exist at this stand"
    };
  }

  if (isHardRockStadiumGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic value concession — not a named specialty dish"
    };
  }

  if (isHardRockStadiumGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isHardRockStadiumVaguePlaceholderRow(item.name)) {
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

export function buildHardRockStadiumCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: HardRockStadiumCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of HARD_ROCK_STADIUM_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function pickHardRockStadiumCuratedKeep<T extends MenuQualityItem>(
  members: T[],
  spec: HardRockStadiumCuratedGroupSpec
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
  spec: HardRockStadiumCuratedGroupSpec
): HardRockStadiumCleanupAction {
  if (!spec.treatAsDuplicate) {
    return "keep-both";
  }
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
