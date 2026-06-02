/**
 * Gillette Stadium menu cleanup heuristics.
 *
 * Official concessions import + NFL league import overlap on concept-level
 * vendor rows (name = vendor). Hide stand placeholders and NFL non-menu rows;
 * keep headline named dishes and New England / Patriots specialties.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction,
  type MenuQualityItem
} from "./venue-menu-quality-audit";

export const GILLETTE_STADIUM_VENUE_SLUG = "gillette-stadium";

export type GilletteStadiumCleanupAction = MenuQualityAction;

/** Headline / named specialty rows where item title matches vendor — keep active. */
export const GILLETTE_STADIUM_CANONICAL_STAND_DISH_SLUGS = new Set([
  "clam-chowder-poutine-clam-chowder-poutine"
]);

/** NFL import rows that are not reviewable menu items. */
export const GILLETTE_STADIUM_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "pepsi-grab-go-5-value-staples",
  "pepsi-grab-go-gluten-free-awareness",
  "the-landing-bar-draftkings-sports-zone"
]);

export type GilletteStadiumCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  preferredKeepSlug?: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const GILLETTE_STADIUM_CURATED_CLEANUP_GROUPS: GilletteStadiumCuratedGroupSpec[] =
  [];

export const GILLETTE_STADIUM_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|value beer|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?|free filtered water|bottled water|fountain soda)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|rotating carved sandwich|member inclusive menu|\$5 value staples|gluten[- ]free awareness|draftkings sports zone)$/i;

const NFL_NON_FOOD_RE =
  /\b(draftkings sports zone|zippin|value staples|gluten[- ]free awareness)\b/i;

const VENDOR_STAND_EXEMPT_SLUGS = new Set([
  ...GILLETTE_STADIUM_CANONICAL_STAND_DISH_SLUGS
]);

export function isGilletteStadiumVendorStandPlaceholder(item: {
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

export function isGilletteStadiumGenericConcessionRow(slug: string): boolean {
  return GILLETTE_STADIUM_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isGilletteStadiumGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isGilletteStadiumVaguePlaceholderRow(name: string): boolean {
  return (
    VAGUE_PLACEHOLDER_RE.test(name.trim()) || NFL_NON_FOOD_RE.test(name.trim())
  );
}

export function getGilletteStadiumKeepBothMemberIds<
  T extends { id: string; name: string; vendor: { name: string } }
>(items: T[]): Set<string> {
  const ids = new Set<string>();
  for (const spec of GILLETTE_STADIUM_CURATED_CLEANUP_GROUPS) {
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

export type GilletteStadiumRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyGilletteStadiumRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): GilletteStadiumRowClassification {
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

  if (GILLETTE_STADIUM_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "NFL import non-food or non-menu row — not a reviewable dish"
    };
  }

  if (isGilletteStadiumVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason:
        "Stand/vendor placeholder — league import row, named menu items exist at this stand"
    };
  }

  if (isGilletteStadiumGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic value concession — not a named specialty dish"
    };
  }

  if (isGilletteStadiumGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isGilletteStadiumVaguePlaceholderRow(item.name)) {
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

export function buildGilletteStadiumCuratedGroups<
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
    spec: GilletteStadiumCuratedGroupSpec;
    members: T[];
  }[] = [];

  for (const spec of GILLETTE_STADIUM_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) =>
      spec.matchName(item.name, item.vendor.name)
    );
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function pickGilletteStadiumCuratedKeep<T extends MenuQualityItem>(
  members: T[],
  spec: GilletteStadiumCuratedGroupSpec
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
  spec: GilletteStadiumCuratedGroupSpec
): GilletteStadiumCleanupAction {
  if (!spec.treatAsDuplicate) {
    return "keep-both";
  }
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
