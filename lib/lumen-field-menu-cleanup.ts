/**
 * Lumen Field menu cleanup heuristics.
 *
 * Official concessions import + NFL/MLS league import overlap on concept-level
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

export const LUMEN_FIELD_VENUE_SLUG = "lumen-field";

export type LumenFieldCleanupAction = MenuQualityAction;

/**
 * Headline / named specialty rows where item title matches vendor — keep active.
 * Official import or NFL headline items that are reviewable dishes, not stand labels.
 */
export const LUMEN_FIELD_CANONICAL_STAND_DISH_SLUGS = new Set([
  "bam-bam-smash-burger",
  "catfish-nuggets-catfish-nuggets"
]);

export const LUMEN_FIELD_REDUNDANT_STAND_LABEL_SLUGS = new Set<string>([]);

export type LumenFieldCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  preferredKeepSlug?: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const LUMEN_FIELD_CURATED_CLEANUP_GROUPS: LumenFieldCuratedGroupSpec[] = [];

export const LUMEN_FIELD_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|value beer|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|rotating carved sandwich)$/i;

const VENDOR_STAND_EXEMPT_SLUGS = new Set([...LUMEN_FIELD_CANONICAL_STAND_DISH_SLUGS]);

export function isLumenFieldVendorStandPlaceholder(item: {
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

export function isLumenFieldGenericConcessionRow(slug: string): boolean {
  return LUMEN_FIELD_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isLumenFieldGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isLumenFieldVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type LumenFieldRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyLumenFieldRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): LumenFieldRowClassification {
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

  if (LUMEN_FIELD_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — not a named reviewable dish"
    };
  }

  if (isLumenFieldVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason:
        "Stand/vendor placeholder — league import row, named menu items exist at this stand"
    };
  }

  if (isLumenFieldGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic value concession — not a named specialty dish"
    };
  }

  if (isLumenFieldGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isLumenFieldVaguePlaceholderRow(item.name)) {
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

export function buildLumenFieldCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: LumenFieldCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of LUMEN_FIELD_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function pickLumenFieldCuratedKeep<T extends MenuQualityItem>(
  members: T[],
  spec: LumenFieldCuratedGroupSpec
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
>(member: T, keep: T, spec: LumenFieldCuratedGroupSpec): LumenFieldCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
