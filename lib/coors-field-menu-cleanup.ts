/**
 * Coors Field menu cleanup heuristics.
 *
 * Dining-guide import created stand-level rows (name = vendor) alongside
 * wave-2 seed specialties. Hide stand labels and import dupes; keep Colorado
 * / Rockies named dishes (Helton Burger, Pizza Donuts, RMO, Glizzilla, etc.).
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction
} from "./venue-menu-quality-audit";

export const COORS_FIELD_VENUE_SLUG = "coors-field";

export type CoorsFieldCleanupAction = MenuQualityAction;

/** Named dishes where item title matches vendor/stand name — keep active. */
export const COORS_FIELD_CANONICAL_STAND_DISH_SLUGS = new Set([
  "rockies-helton-burger-item",
  "rockies-pizza-donuts-item",
  "rockies-rmo-plate"
]);

/** Import stand rows superseded by wave-2 named items at the same concept. */
export const COORS_FIELD_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "carving-station",
  "cookie-and-creamery",
  "john-dough-pizza-co"
]);

export type CoorsFieldCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const COORS_FIELD_CURATED_CLEANUP_GROUPS: CoorsFieldCuratedGroupSpec[] = [
  {
    id: "birdcall-sandwich",
    label: "Birdcall chicken sandwich import vs seed",
    canonicalName: "Chicken Sandwich",
    notes: "Dining-guide Birdcall Deck row vs Rooftop seed at Birdcall vendor.",
    treatAsDuplicate: true,
    matchName: (n) => /^birdcall chicken sandwich$|^chicken sandwich$/i.test(n.trim())
  },
  {
    id: "birdcall-nuggets",
    label: "Birdcall nuggets import vs seed",
    canonicalName: "Chicken Nuggets",
    notes: "Dining-guide Birdcall Deck row vs Rooftop seed at Birdcall vendor.",
    treatAsDuplicate: true,
    matchName: (n) => /^birdcall chicken nuggets$|^chicken nuggets$/i.test(n.trim())
  },
  {
    id: "birdcall-tots",
    label: "Birdcall loaded tots import vs seed",
    canonicalName: "Loaded Tater Tots",
    notes: "Dining-guide Birdcall Deck row vs Rooftop seed at Birdcall vendor.",
    treatAsDuplicate: true,
    matchName: (n) => /^birdcall loaded tater tots$|^loaded tater tots$/i.test(n.trim())
  },
  {
    id: "pizza-donut",
    label: "Pizza donut import vs Pizza Donuts stand",
    canonicalName: "Pizza Donuts",
    notes: "General Concessions Pizza Donut vs Section 109 Pizza Donuts specialty.",
    treatAsDuplicate: true,
    matchName: (n) => /^pizza donuts?$/i.test(n.trim())
  },
  {
    id: "polidori-hatch",
    label: "Polidori hatch green chile sausage naming",
    canonicalName: "Hatch Green Chile Sausage",
    notes: "Import chili spelling vs wave-2 seed at Polidori Sausage.",
    treatAsDuplicate: true,
    matchName: (n) => /polidori hatch green chil(i|e) sausage|^hatch green chil(i|e) sausage$/i.test(n)
  },
  {
    id: "polidori-jalapeno",
    label: "Polidori jalapeño cheddar sausage naming",
    canonicalName: "Jalapeño Cheddar Sausage",
    notes: "Import long name vs wave-2 seed at Polidori Sausage.",
    treatAsDuplicate: true,
    matchName: (n) =>
      /polidori.*jalape/i.test(n) || /^jalape.o cheddar sausage$/i.test(n.trim())
  },
  {
    id: "gf-hot-dog",
    label: "Gluten-free hot dog duplicate rows",
    canonicalName: "Gluten-Free Hot Dog",
    notes: "General Concessions GF row vs Section 143 Gluten Friendly Stand seed.",
    treatAsDuplicate: true,
    matchName: (n) => /^gluten[- ]friendly hot dog$|^gluten[- ]free hot dog$/i.test(n.trim())
  },
  {
    id: "gf-burger",
    label: "Gluten-free burger duplicate rows",
    canonicalName: "Gluten-Free Burger",
    notes: "General Concessions GF row vs Section 143 Gluten Friendly Stand seed.",
    treatAsDuplicate: true,
    matchName: (n) => /^gluten[- ]friendly hamburger$|^gluten[- ]free burger$/i.test(n.trim())
  },
  {
    id: "gf-chicken-sandwich",
    label: "Gluten-free chicken sandwich duplicate rows",
    canonicalName: "Gluten-Free Chicken Sandwich",
    notes: "General Concessions GF row vs Section 143 Gluten Friendly Stand seed.",
    treatAsDuplicate: true,
    matchName: (n) => /^gluten[- ]friendly chicken sandwich$|^gluten[- ]free chicken sandwich$/i.test(n.trim())
  },
  {
    id: "infield-greens-salad",
    label: "Infield Greens salad import vs seed",
    canonicalName: "Build-Your-Own Salad",
    notes: "Import salad at General Concessions vs Infield Greens stand build-your-own bowl.",
    treatAsDuplicate: true,
    matchName: (n) => /^infield greens salad$|^build[- ]your[- ]own salad$/i.test(n.trim())
  },
  {
    id: "double-classic-smash",
    label: "Smashburger double classic duplicate rows",
    canonicalName: "Double Classic Smash",
    notes: "Dining-guide import vs wave-2 seed at Smashburger.",
    treatAsDuplicate: true,
    matchName: (n) => /^double classic smash$/i.test(n.trim())
  }
];

/** Untyped General Concessions category rows (not Colorado-named specialties). */
export const COORS_FIELD_GENERIC_CONCESSION_SLUGS = new Set<string>([]);

const GENERIC_BEVERAGE_RE =
  /^(value soda|value water|grab[- ]and[- ]go drinks?|bar drinks?|craft beer|hard seltzer|domestic beer|beer)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(assorted snacks?|grab[- ]and[- ]go snacks?|beverage package|all[- ]you[- ]can[- ]eat package)$/i;

export function isCoorsFieldVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (COORS_FIELD_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name === vendor;
}

export function isCoorsFieldGenericConcessionRow(slug: string): boolean {
  return COORS_FIELD_GENERIC_CONCESSION_SLUGS.has(slug);
}

export function isCoorsFieldGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isCoorsFieldVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type CoorsFieldRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyCoorsFieldRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): CoorsFieldRowClassification {
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

  if (COORS_FIELD_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — named wave-2 menu items cover this vendor"
    };
  }

  if (isCoorsFieldVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists or stand is not reviewable alone"
    };
  }

  if (isCoorsFieldGenericConcessionRow(item.slug)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic ballpark concession category — not a named specialty dish"
    };
  }

  if (isCoorsFieldGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic value/grab-and-go beverage — not a named specialty pour"
    };
  }

  if (isCoorsFieldVaguePlaceholderRow(item.name)) {
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

export function buildCoorsFieldCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: CoorsFieldCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of COORS_FIELD_CURATED_CLEANUP_GROUPS) {
    const members = items.filter((item) => spec.matchName(item.name, item.vendor.name));
    if (members.length >= 2) {
      groups.push({ spec, members });
    }
  }

  return groups;
}

export function recommendCuratedMemberAction<
  T extends {
    name: string;
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(member: T, keep: T, spec: CoorsFieldCuratedGroupSpec): CoorsFieldCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
