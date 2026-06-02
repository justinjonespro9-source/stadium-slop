/**
 * SoFi Stadium menu cleanup heuristics.
 *
 * Firestore dining import + NFL league import overlap on concept-level vendor
 * rows (name = vendor). Hide stand placeholders and NFL non-menu rows; keep
 * headline named dishes; dedupe mac bowls and Twinkie Burger variants.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction,
  type MenuQualityItem
} from "./venue-menu-quality-audit";

export const SOFI_STADIUM_VENUE_SLUG = "sofi-stadium";

export type SofiStadiumCleanupAction = MenuQualityAction;

/** Headline / named specialty rows where item title matches vendor — keep active. */
export const SOFI_STADIUM_CANONICAL_STAND_DISH_SLUGS = new Set([
  "haupia-tart-haupia-tart",
  "the-dirty-hollywood-soda-the-dirty-hollywood-soda",
  "the-world-cup-char-siu-bowl-the-world-cup-char-siu-bowl",
  "tuxedo-cake-tuxedo-cake"
]);

/** NFL import rows that are not reviewable menu items. */
export const SOFI_STADIUM_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "johnnie-walker-bar-uber-eats-order-ahead",
  "frictionless-zippin-markets-vegan-gf-awareness"
]);

export type SofiStadiumCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  preferredKeepSlug?: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const SOFI_STADIUM_CURATED_CLEANUP_GROUPS: SofiStadiumCuratedGroupSpec[] =
  [
    {
      id: "mac-and-cheese-bowl",
      label: "Loaded Mac & Cheese Bowl / Mac & Cheese Bowl",
      canonicalName: "Loaded Mac & Cheese Bowl",
      preferredKeepSlug: "loaded-mac-and-cheese-bowl",
      notes:
        "Same BBQ stand SKU — keep loaded variant; hide shorter generic name.",
      treatAsDuplicate: true,
      matchName: (n) => {
        const key = normalizeMenuItemName(n);
        return (
          key === "loaded mac and cheese bowl" || key === "mac and cheese bowl"
        );
      }
    },
    {
      id: "twinkie-burger",
      label: "The Twinkie Burger headline vs BBQ import",
      canonicalName: "Twinkie Burger",
      preferredKeepSlug: "twinkie-burger",
      notes:
        "Keep Firestore BBQ row; hide NFL headline row where name equals vendor.",
      treatAsDuplicate: true,
      matchName: (n) =>
        normalizeMenuItemName(n).replace(/^the\s+/, "") === "twinkie burger"
    }
  ];

export const SOFI_STADIUM_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|value beer|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer|cocktails?|free filtered water|bottled water|fountain soda)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package|premium buffet|rotating carved sandwich|member inclusive menu)$/i;

const NFL_NON_FOOD_RE =
  /\b(uber\s+eats\s+order|zippin|vegan\s*&?\s*gf\s+awareness|frictionless)\b/i;

const VENDOR_STAND_EXEMPT_SLUGS = new Set([...SOFI_STADIUM_CANONICAL_STAND_DISH_SLUGS]);

export function isSofiStadiumVendorStandPlaceholder(item: {
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

export function isSofiStadiumGenericConcessionRow(slug: string): boolean {
  return SOFI_STADIUM_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isSofiStadiumGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isSofiStadiumVaguePlaceholderRow(name: string): boolean {
  return (
    VAGUE_PLACEHOLDER_RE.test(name.trim()) || NFL_NON_FOOD_RE.test(name.trim())
  );
}

export function getSofiStadiumKeepBothMemberIds<
  T extends { id: string; name: string; vendor: { name: string } }
>(items: T[]): Set<string> {
  const ids = new Set<string>();
  for (const spec of SOFI_STADIUM_CURATED_CLEANUP_GROUPS) {
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

export type SofiStadiumRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifySofiStadiumRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): SofiStadiumRowClassification {
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

  if (SOFI_STADIUM_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "NFL import non-food or non-menu row — not a reviewable dish"
    };
  }

  if (isSofiStadiumVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason:
        "Stand/vendor placeholder — league import row, named menu items exist at this stand"
    };
  }

  if (isSofiStadiumGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic value concession — not a named specialty dish"
    };
  }

  if (isSofiStadiumGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isSofiStadiumVaguePlaceholderRow(item.name)) {
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

export function buildSofiStadiumCuratedGroups<
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
    spec: SofiStadiumCuratedGroupSpec;
    members: T[];
  }[] = [];

  for (const spec of SOFI_STADIUM_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) =>
      spec.matchName(item.name, item.vendor.name)
    );
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function pickSofiStadiumCuratedKeep<T extends MenuQualityItem>(
  members: T[],
  spec: SofiStadiumCuratedGroupSpec
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
  spec: SofiStadiumCuratedGroupSpec
): SofiStadiumCleanupAction {
  if (!spec.treatAsDuplicate) {
    return "keep-both";
  }
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
