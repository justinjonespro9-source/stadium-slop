/**
 * Mercedes-Benz Stadium menu cleanup heuristics.
 *
 * Official all-vendors import + NFL league import overlap on concept-level
 * vendor rows (name = vendor). Hide stand placeholders; keep headline named
 * dishes and specific menu items from the curated import.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction,
  type MenuQualityItem
} from "./venue-menu-quality-audit";

export const MERCEDES_BENZ_STADIUM_VENUE_SLUG = "mercedes-benz-stadium";

export type MercedesBenzStadiumCleanupAction = MenuQualityAction;

/**
 * Headline / named specialty rows where item title matches vendor — keep active.
 * These are reviewable stadium dishes, not stand labels.
 */
export const MERCEDES_BENZ_STADIUM_CANONICAL_STAND_DISH_SLUGS = new Set([
  "the-404-burger-the-404-burger",
  "peach-cobbler-waffle-cone-peach-cobbler-waffle-cone",
  "the-lemon-pepper-wet-bucket-the-lemon-pepper-wet-bucket"
]);

/** Stand labels with no named dish counterpart in the menu. */
export const MERCEDES_BENZ_STADIUM_REDUNDANT_STAND_LABEL_SLUGS = new Set(["dippin-dots"]);

export type MercedesBenzStadiumCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  preferredKeepSlug?: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const MERCEDES_BENZ_STADIUM_CURATED_CLEANUP_GROUPS: MercedesBenzStadiumCuratedGroupSpec[] =
  [
    {
      id: "molly-bs",
      label: "Molly B's punctuation duplicate rows",
      canonicalName: "Molly B's",
      preferredKeepSlug: "molly-bs",
      notes:
        "Official import slug vs NFL league import duplicate at same vendor.",
      treatAsDuplicate: true,
      matchName: (n) => /^molly b[''’]?s$/i.test(n.trim())
    }
  ];

export const MERCEDES_BENZ_STADIUM_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|value beer|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|rotating carved sandwich)$/i;

const VENDOR_STAND_EXEMPT_SLUGS = new Set([
  ...MERCEDES_BENZ_STADIUM_CANONICAL_STAND_DISH_SLUGS,
  "molly-bs"
]);

export function isMercedesBenzStadiumVendorStandPlaceholder(item: {
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

export function isMercedesBenzStadiumGenericConcessionRow(slug: string): boolean {
  return MERCEDES_BENZ_STADIUM_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isMercedesBenzStadiumGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isMercedesBenzStadiumVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type MercedesBenzStadiumRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyMercedesBenzStadiumRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): MercedesBenzStadiumRowClassification {
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

  if (MERCEDES_BENZ_STADIUM_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — not a named reviewable dish"
    };
  }

  if (isMercedesBenzStadiumVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason:
        "Stand/vendor placeholder — concept-level import row, not a specific dish"
    };
  }

  if (isMercedesBenzStadiumGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic value concession — not a named specialty dish"
    };
  }

  if (isMercedesBenzStadiumGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isMercedesBenzStadiumVaguePlaceholderRow(item.name)) {
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

export function buildMercedesBenzStadiumCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: MercedesBenzStadiumCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of MERCEDES_BENZ_STADIUM_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function pickMercedesBenzStadiumCuratedKeep<T extends MenuQualityItem>(
  members: T[],
  spec: MercedesBenzStadiumCuratedGroupSpec
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
  spec: MercedesBenzStadiumCuratedGroupSpec
): MercedesBenzStadiumCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
