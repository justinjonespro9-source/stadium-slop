/**
 * Lincoln Financial Field menu cleanup heuristics.
 *
 * Official concessions import + NFL league import overlap on concept-level
 * vendor rows (name = vendor). Hide stand placeholders and NFL non-venue rows;
 * keep headline named dishes and Philadelphia / Eagles specialties.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction,
  type MenuQualityItem
} from "./venue-menu-quality-audit";

export const LINCOLN_FINANCIAL_FIELD_VENUE_SLUG = "lincoln-financial-field";

export type LincolnFinancialFieldCleanupAction = MenuQualityAction;

/** Headline / named specialty rows where item title matches vendor — keep active. */
export const LINCOLN_FINANCIAL_FIELD_CANONICAL_STAND_DISH_SLUGS = new Set([
  "the-south-philly-caipirinha-the-south-philly-caipirinha"
]);

/** NFL import rows that are not reviewable menu items. */
export const LINCOLN_FINANCIAL_FIELD_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "the-south-philly-caipirinha-xfinity-live"
]);

export type LincolnFinancialFieldCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  preferredKeepSlug?: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const LINCOLN_FINANCIAL_FIELD_CURATED_CLEANUP_GROUPS: LincolnFinancialFieldCuratedGroupSpec[] =
  [
    {
      id: "kelly-green-jumbo-cookie",
      label: "Kelly Green Jumbo Cookie headline vs official import",
      canonicalName: "Kelly Green Jumbo Cookie",
      preferredKeepSlug: "kelly-green-jumbo-cookie",
      notes:
        "Keep Sideline Markets import row; hide NFL headline row where name equals vendor.",
      treatAsDuplicate: true,
      matchName: (n) =>
        normalizeMenuItemName(n).replace(/^the\s+/, "") ===
        "kelly green jumbo cookie"
    }
  ];

export const LINCOLN_FINANCIAL_FIELD_GENERIC_CONCESSION_SLUGS =
  new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|value beer|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?|free filtered water|bottled water|fountain soda)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|rotating carved sandwich|member inclusive menu)$/i;

const NFL_NON_FOOD_RE = /\bxfinity live\b/i;

const VENDOR_STAND_EXEMPT_SLUGS = new Set([
  ...LINCOLN_FINANCIAL_FIELD_CANONICAL_STAND_DISH_SLUGS
]);

export function isLincolnFinancialFieldVendorStandPlaceholder(item: {
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

export function isLincolnFinancialFieldGenericConcessionRow(
  slug: string
): boolean {
  return LINCOLN_FINANCIAL_FIELD_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isLincolnFinancialFieldGenericBeverageRow(
  name: string
): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isLincolnFinancialFieldVaguePlaceholderRow(
  name: string
): boolean {
  return (
    VAGUE_PLACEHOLDER_RE.test(name.trim()) || NFL_NON_FOOD_RE.test(name.trim())
  );
}

export function getLincolnFinancialFieldKeepBothMemberIds<
  T extends { id: string; name: string; vendor: { name: string } }
>(items: T[]): Set<string> {
  const ids = new Set<string>();
  for (const spec of LINCOLN_FINANCIAL_FIELD_CURATED_CLEANUP_GROUPS) {
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

export type LincolnFinancialFieldRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyLincolnFinancialFieldRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): LincolnFinancialFieldRowClassification {
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

  if (LINCOLN_FINANCIAL_FIELD_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "NFL import non-food or non-menu row — not a reviewable dish"
    };
  }

  if (isLincolnFinancialFieldVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason:
        "Stand/vendor placeholder — league import row, named menu items exist at this stand"
    };
  }

  if (isLincolnFinancialFieldGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic value concession — not a named specialty dish"
    };
  }

  if (isLincolnFinancialFieldGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isLincolnFinancialFieldVaguePlaceholderRow(item.name)) {
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

export function buildLincolnFinancialFieldCuratedGroups<
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
    spec: LincolnFinancialFieldCuratedGroupSpec;
    members: T[];
  }[] = [];

  for (const spec of LINCOLN_FINANCIAL_FIELD_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) =>
      spec.matchName(item.name, item.vendor.name)
    );
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function pickLincolnFinancialFieldCuratedKeep<T extends MenuQualityItem>(
  members: T[],
  spec: LincolnFinancialFieldCuratedGroupSpec
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
  spec: LincolnFinancialFieldCuratedGroupSpec
): LincolnFinancialFieldCleanupAction {
  if (!spec.treatAsDuplicate) {
    return "keep-both";
  }
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
