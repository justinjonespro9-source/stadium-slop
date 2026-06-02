/**
 * NRG Stadium menu cleanup heuristics.
 *
 * Curated menu import + NFL league import overlap on concept-level vendor rows
 * (name = vendor). Hide stand placeholders and NFL non-menu rows; keep headline
 * named dishes; dedupe Trill Town Loaded Fries variants.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction,
  type MenuQualityItem
} from "./venue-menu-quality-audit";

export const NRG_STADIUM_VENUE_SLUG = "nrg-stadium";

export type NrgStadiumCleanupAction = MenuQualityAction;

/** Headline / named specialty rows where item title matches vendor — keep active. */
export const NRG_STADIUM_CANONICAL_STAND_DISH_SLUGS = new Set([
  "the-dirty-h-town-soda-the-dirty-h-town-soda",
  "vegan-og-burger-vegan-og-burger"
]);

/** NFL import rows that are not reviewable menu items. */
export const NRG_STADIUM_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "club-level-bmw-lone-star-ballroom",
  "maui-wowi-champion-wine-garden-restaurant",
  "vegan-og-burger-gluten-free-halal-aware",
  "club-level-hugo-s"
]);

export type NrgStadiumCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  preferredKeepSlug?: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const NRG_STADIUM_CURATED_CLEANUP_GROUPS: NrgStadiumCuratedGroupSpec[] = [
  {
    id: "trill-town-loaded-fries",
    label:
      'The "Trill Town" Loaded Fries / Trill Town Loaded Fries',
    canonicalName: 'The "Trill Town" Loaded Fries',
    preferredKeepSlug: "trill-burgers-the-trill-town-loaded-fries",
    notes:
      "2026 headline naming vs curated import — same Trill Burgers loaded-fries SKU.",
    treatAsDuplicate: true,
    matchName: (n) =>
      normalizeMenuItemName(n).replace(/^the\s+/, "") ===
      "trill town loaded fries"
  }
];

export const NRG_STADIUM_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|value beer|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?|free filtered water|bottled water|fountain soda|frozen margaritas?)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|rotating carved sandwich|member inclusive menu|gluten[- ]free\s*&?\s*halal aware)$/i;

const NFL_NON_FOOD_RE =
  /\b(bmw lone star ballroom|champion wine garden|wine garden restaurant|xfinity live)\b/i;

const VENDOR_STAND_EXEMPT_SLUGS = new Set([...NRG_STADIUM_CANONICAL_STAND_DISH_SLUGS]);

export function isNrgStadiumVendorStandPlaceholder(item: {
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

export function isNrgStadiumGenericConcessionRow(slug: string): boolean {
  return NRG_STADIUM_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isNrgStadiumGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isNrgStadiumVaguePlaceholderRow(name: string): boolean {
  return (
    VAGUE_PLACEHOLDER_RE.test(name.trim()) || NFL_NON_FOOD_RE.test(name.trim())
  );
}

export function getNrgStadiumKeepBothMemberIds<
  T extends { id: string; name: string; vendor: { name: string } }
>(items: T[]): Set<string> {
  const ids = new Set<string>();
  for (const spec of NRG_STADIUM_CURATED_CLEANUP_GROUPS) {
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

export type NrgStadiumRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyNrgStadiumRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): NrgStadiumRowClassification {
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

  if (NRG_STADIUM_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "NFL import non-food or non-menu row — not a reviewable dish"
    };
  }

  if (isNrgStadiumVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason:
        "Stand/vendor placeholder — league import row, named menu items exist at this stand"
    };
  }

  if (isNrgStadiumGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic value concession — not a named specialty dish"
    };
  }

  if (isNrgStadiumGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isNrgStadiumVaguePlaceholderRow(item.name)) {
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

export function buildNrgStadiumCuratedGroups<
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
    spec: NrgStadiumCuratedGroupSpec;
    members: T[];
  }[] = [];

  for (const spec of NRG_STADIUM_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) =>
      spec.matchName(item.name, item.vendor.name)
    );
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function pickNrgStadiumCuratedKeep<T extends MenuQualityItem>(
  members: T[],
  spec: NrgStadiumCuratedGroupSpec
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
  spec: NrgStadiumCuratedGroupSpec
): NrgStadiumCleanupAction {
  if (!spec.treatAsDuplicate) {
    return "keep-both";
  }
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
