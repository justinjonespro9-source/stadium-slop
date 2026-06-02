/**
 * Globe Life Field menu cleanup heuristics.
 *
 * PDF/menu import created stand-level rows (name = vendor) and many
 * General Concessions category rows. Wave-4 seed adds named Texas/Rangers
 * specialties; hide stand labels, generic pours, and duplicate boilerplate.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction
} from "./venue-menu-quality-audit";

export const GLOBE_LIFE_FIELD_VENUE_SLUG = "globe-life-field";

export type GlobeLifeCleanupAction = MenuQualityAction;

/** Named dishes where item title matches vendor/stand name — keep active. */
export const GLOBE_LIFE_CANONICAL_STAND_DISH_SLUGS = new Set([
  "glf-9th-inning-rally-sombrero-item",
  "glf-chicken-tender-helmet-item",
  "glf-high-steaks-nachos-item",
  "glf-texas-ribeye-sandwich-item",
  "glf-dirty-soda",
  "glf-whataburger-burger"
]);

/** Import stand rows superseded by wave-4 named items. */
export const GLOBE_LIFE_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "arlington-eats",
  "bahama-bucks-shaved-ice-and-sno-blasts",
  "farmers-fridge",
  "golden-chick",
  "hurtado-barbeque",
  "pluckers"
]);

export type GlobeLifeCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const GLOBE_LIFE_CURATED_CLEANUP_GROUPS: GlobeLifeCuratedGroupSpec[] = [
  {
    id: "hurtado-big-papa",
    label: "Hurtado Big Papa potato duplicate naming",
    canonicalName: "Big Papa Brisket Potato",
    notes: "PDF/import long name vs wave-4 Big Papa Brisket Potato at Hurtado Barbecue.",
    treatAsDuplicate: true,
    matchName: (n) => /big papa.*(potato|tater|brisket)/i.test(n)
  },
  {
    id: "chicken-tender-helmet",
    label: "Chicken tender helmet duplicate rows",
    canonicalName: "Chicken Tender Helmet",
    notes: "General Concessions meal row vs souvenir helmet item at stand vendor.",
    treatAsDuplicate: true,
    matchName: (n) => /chicken tender helmet/i.test(n)
  },
  {
    id: "boomstick-hot-dog",
    label: "Boomstick hot dog duplicate rows",
    canonicalName: "24-Inch Boomstick",
    notes: "Untyped boomstick row vs 24-Inch Boomstick at Boomstick Stands.",
    treatAsDuplicate: true,
    matchName: (n, v) =>
      /^boomstick$/i.test(n.trim()) ||
      (/^24[- ]inch boomstick$/i.test(n.trim()) && /boomstick/i.test(v))
  },
  {
    id: "boomstick-burrito",
    label: "Boomstick burrito duplicate rows",
    canonicalName: "Boomstick Burrito",
    notes: "General Concessions burrito vs Boomstick Stands seed item.",
    treatAsDuplicate: true,
    matchName: (n) => /boomstick burrito/i.test(n)
  },
  {
    id: "hawwt-dawwg",
    label: "Hawwt Dawwg biscuits & gravy naming",
    canonicalName: "Hawwt Dawwg Biscuits & Gravy",
    notes: "Hot Dawwg typo/import row vs Hawwt Dawwg stand specialty.",
    treatAsDuplicate: true,
    matchName: (n) => /(hawwt|hot) dawwg biscuits/i.test(n)
  },
  {
    id: "vegan-soft-serve",
    label: "Vegan soft serve duplicate rows",
    canonicalName: "Vegan Soft Serve",
    notes: "General Concessions row vs Sky Porch vegan soft serve.",
    treatAsDuplicate: true,
    matchName: (n) => /vegan soft serve/i.test(n)
  }
];

/** Untyped General Concessions / value category rows (not Texas-named specialties). */
export const GLOBE_LIFE_GENERIC_CONCESSION_SLUGS = new Set([
  "ballpark-nachos",
  "bacon-wrapped-dog",
  "bavarian-pretzel",
  "bratwurst",
  "burgers",
  "cajun-nachos",
  "captains-kids-meal",
  "cheese-fries",
  "chicago-dog",
  "chicken-tender-basket",
  "chili-cheese-dog",
  "cookie-dough-sundaes",
  "corn-dog",
  "foot-long-hot-dog",
  "fruit-cup",
  "fry-cup-basket",
  "funnel-cake",
  "garlic-fries",
  "gluten-free-hot-dog",
  "grande-nachos",
  "grilled-chicken-sandwich",
  "ice-cream-float",
  "ice-cream-waffle-bowl",
  "impossible-chicken-nuggets",
  "jumbo-hot-dog",
  "loaded-fries",
  "loaded-pretzels",
  "milkshakes",
  "oh-snap-pickles",
  "pizza",
  "pork-wings",
  "sabra-hummus",
  "sabritas-nuts",
  "smoked-sausage",
  "spring-rolls",
  "steak-nachos",
  "vegan-bratwurst",
  "vegan-burger",
  "vegan-hot-dog",
  "vegan-nachos"
]);

const GENERIC_BEVERAGE_RE =
  /^(bar drinks?|value beer|craft cocktails?|domestic beer|miller lite beer|seasonal seltzer|hard seltzer|gluten[- ]free beer|rotating craft cocktail|local craft beer)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(all[- ]you[- ]can[- ]eat package|beverage package|assorted snacks?|grab[- ]and[- ]go snacks?)$/i;

const GENERAL_CONCESSIONS_GENERIC_RE =
  /^(ballpark nachos|bavarian pretzel|bratwurst|burgers?|cajun nachos|cheese fries|chicago dog|chicken tender basket|chili cheese dog|corn dog|foot long hot dog|fruit cup|fry cup|garlic fries|gluten free hot dog|grande nachos|grilled chicken sandwich|jumbo hot dog|loaded fries|loaded pretzels|milkshakes?|pizza|smoked sausage)$/i;

/** Simple names that are still reviewable Texas/Rangers menu items at general stands. */
const GENERAL_CONCESSIONS_KEEP_RE =
  /(brisket|dawwg|boomstick triple|elote|lobster|tenderloin|bbq|barbeque|churro helmet|souvenir helmet|buffalo pulled|drunken noodle|tamale torta|pork wing)/i;

export function isGlobeLifeVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (GLOBE_LIFE_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name === vendor;
}

export function isGlobeLifeGeneralConcessionsBoilerplate(
  slug: string,
  name: string,
  vendorName: string
): boolean {
  if (!/general concessions/i.test(vendorName)) {
    return false;
  }
  if (GENERAL_CONCESSIONS_KEEP_RE.test(name)) {
    return false;
  }
  if (GLOBE_LIFE_GENERIC_CONCESSION_SLUGS.has(slug)) {
    return true;
  }
  return GENERAL_CONCESSIONS_GENERIC_RE.test(name.trim());
}

export function isGlobeLifeGenericConcessionRow(
  slug: string,
  name: string,
  vendorName: string
): boolean {
  if (GLOBE_LIFE_GENERIC_CONCESSION_SLUGS.has(slug)) {
    return true;
  }
  return isGlobeLifeGeneralConcessionsBoilerplate(slug, name, vendorName);
}

export function isGlobeLifeGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isGlobeLifeVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type GlobeLifeRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyGlobeLifeFieldRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): GlobeLifeRowClassification {
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

  if (GLOBE_LIFE_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — named wave-4 menu items cover this vendor"
    };
  }

  if (isGlobeLifeVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists or stand is not reviewable alone"
    };
  }

  if (isGlobeLifeGenericConcessionRow(item.slug, item.name, item.vendor.name)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic ballpark concession category — not a named specialty dish"
    };
  }

  if (isGlobeLifeGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic bar beer/cocktail category — not a named specialty pour"
    };
  }

  if (isGlobeLifeVaguePlaceholderRow(item.name)) {
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

export function buildGlobeLifeCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: GlobeLifeCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of GLOBE_LIFE_CURATED_CLEANUP_GROUPS) {
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
>(member: T, keep: T, spec: GlobeLifeCuratedGroupSpec): GlobeLifeCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
