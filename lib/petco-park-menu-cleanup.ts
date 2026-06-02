/**
 * Petco Park menu cleanup heuristics.
 *
 * Food-guide import created stand-level rows (name = vendor) and duplicate
 * menu rows overlapping expansion-seed named dishes. Hide stand labels and
 * generic hub rows; keep San Diego / Padres specialties.
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import {
  pickCanonicalMember,
  recommendMenuQualityAction,
  type MenuQualityAction
} from "./venue-menu-quality-audit";

export const PETCO_PARK_VENUE_SLUG = "petco-park";

export type PetcoCleanupAction = MenuQualityAction;

/** Named dishes where item title matches vendor — none at Petco (all stand labels). */
export const PETCO_CANONICAL_STAND_DISH_SLUGS = new Set<string>([]);

/** Import stand rows superseded by expansion-seed named items. */
export const PETCO_REDUNDANT_STAND_LABEL_SLUGS = new Set([
  "ans-field-services-gelato",
  "carnitas-snack-shack",
  "gaglione-brothers",
  "grand-ole-bbq",
  "hodads",
  "jack-in-the-box",
  "mini-donut-company",
  "negihama-sushi",
  "pizza-port",
  "puesto",
  "randy-jones-grill",
  "san-diegos-finest-hot-chicken",
  "spiros-mediterranean"
]);

export type PetcoCuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

export const PETCO_CURATED_CLEANUP_GROUPS: PetcoCuratedGroupSpec[] = [
  {
    id: "curry-rice",
    label: "Coco Ichibanya curry rice import vs seed",
    canonicalName: "Curry rice",
    notes: "Menu import row vs expansion-seed curry rice.",
    treatAsDuplicate: true,
    matchName: (n) => /^curry rice$/i.test(n.trim())
  },
  {
    id: "curry-bun",
    label: "Coco Ichibanya curry bun naming",
    canonicalName: "Curry bun",
    notes: "Curry Buns import vs seed Curry bun.",
    treatAsDuplicate: true,
    matchName: (n) => /^curry bun(s)?$/i.test(n.trim())
  },
  {
    id: "garlic-naan",
    label: "Coco Ichibanya garlic naan naming",
    canonicalName: "Garlic naan",
    notes: "Garlic Nan Bread import vs seed Garlic naan.",
    treatAsDuplicate: true,
    matchName: (n) => /^garlic na(n|an)( bread)?$/i.test(n.trim())
  },
  {
    id: "buffalo-pretzel",
    label: "Padre Pretzels buffalo pretzel duplicate",
    canonicalName: "Buffalo pretzel",
    notes: "Import braided pretzel name vs seed buffalo pretzel.",
    treatAsDuplicate: true,
    matchName: (n) => /buffalo.*pretzel/i.test(n)
  },
  {
    id: "honey-pretzel",
    label: "Padre Pretzels honey mustard pretzel duplicate",
    canonicalName: "Honey mustard pretzel",
    notes: "Import braided pretzel name vs seed honey mustard pretzel.",
    treatAsDuplicate: true,
    matchName: (n) => /honey mustard.*pretzel/i.test(n)
  },
  {
    id: "chicken-pot-pie",
    label: "Pop Pie Co. chicken pot pie duplicate",
    canonicalName: "Classic chicken pot pie",
    notes: "Classic Chicken Pie import vs seed classic chicken pot pie.",
    treatAsDuplicate: true,
    matchName: (n) => /classic chicken (pot )?pie/i.test(n)
  },
  {
    id: "shortstop-sandwich",
    label: "The Shortstop sandwich duplicate rows",
    canonicalName: "Shortstop sandwich",
    notes: "General Concessions stand row vs The Shortstop seed sandwich.",
    treatAsDuplicate: true,
    matchName: (n) => /^the shortstop$/i.test(n.trim()) || /^shortstop sandwich$/i.test(n.trim())
  },
  {
    id: "short-rib-chili-dog",
    label: "Short rib chili cheese dog duplicate rows",
    canonicalName: "Short rib chili cheese dog",
    notes: "General Concessions chili cheese dog vs Shortstop seed dog.",
    treatAsDuplicate: true,
    matchName: (n) => /(short rib )?chili (cheese )?dog/i.test(n)
  },
  {
    id: "deckmans-fish-taco",
    label: "Deckman's fish taco duplicate rows",
    canonicalName: "Market fish taco",
    notes: "Baja Fish Taco import vs Deckman's market fish taco seed item.",
    treatAsDuplicate: true,
    matchName: (n, v) =>
      /^baja fish taco$/i.test(n.trim()) ||
      (/^market fish taco$/i.test(n.trim()) && /deckman/i.test(v))
  }
];

/** Import rows superseded by expansion-seed slug at same concept. */
export const PETCO_IMPORT_DUPLICATE_SLUGS = new Set(["smores-braided-pretzel"]);

/** Untyped ballpark / hub rows. */
export const PETCO_GENERIC_CONCESSION_SLUGS = new Set([
  "nachos",
  "frozen-friar",
  "soft-serve-ice-cream"
]);

const GENERIC_BEVERAGE_RE =
  /^(craft beer|bar drinks?|value beer|value soda|value water|hard seltzer|domestic beer|local craft beer|gluten[- ]free beer|rotating craft cocktail)$/i;

const VAGUE_PLACEHOLDER_RE =
  /^(all[- ]you[- ]can[- ]eat package|beverage package|assorted snacks?|grab[- ]and[- ]go snacks?)$/i;

export function isPetcoVendorStandPlaceholder(item: {
  slug: string;
  name: string;
  vendor: { name: string };
}): boolean {
  if (PETCO_CANONICAL_STAND_DISH_SLUGS.has(item.slug)) {
    return false;
  }
  const name = normalizeMenuItemName(item.name);
  const vendor = normalizeMenuItemName(item.vendor.name);
  return name === vendor;
}

export function isPetcoGenericConcessionRow(slug: string, name: string): boolean {
  if (PETCO_GENERIC_CONCESSION_SLUGS.has(slug)) {
    return true;
  }
  return /^(nachos|frozen friar|soft serve ice cream)$/i.test(name.trim());
}

export function isPetcoGenericBeverageRow(name: string): boolean {
  return GENERIC_BEVERAGE_RE.test(name.trim());
}

export function isPetcoVaguePlaceholderRow(name: string): boolean {
  return VAGUE_PLACEHOLDER_RE.test(name.trim());
}

export type PetcoRowClassification =
  | { kind: "keep"; action: "keep-canonical"; reason: string }
  | { kind: "vendor-only"; action: "hide-duplicate"; reason: string }
  | { kind: "generic-concession"; action: "hide-generic"; reason: string }
  | { kind: "generic-beverage"; action: "hide-generic"; reason: string }
  | { kind: "vague"; action: "hide-generic"; reason: string }
  | { kind: "manual"; action: "manual-review"; reason: string };

export function classifyPetcoParkRow(
  item: {
    slug: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
  },
  opts?: { skipEngagementGuard?: boolean }
): PetcoRowClassification {
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

  if (PETCO_IMPORT_DUPLICATE_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Import duplicate — expansion-seed item is canonical"
    };
  }

  if (PETCO_REDUNDANT_STAND_LABEL_SLUGS.has(item.slug)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Redundant stand label — named expansion menu items cover this vendor"
    };
  }

  if (isPetcoVendorStandPlaceholder(item)) {
    return {
      kind: "vendor-only",
      action: "hide-duplicate",
      reason: "Stand/vendor label row — named menu item exists or stand is not reviewable alone"
    };
  }

  if (isPetcoGenericConcessionRow(item.slug, item.name)) {
    return {
      kind: "generic-concession",
      action: "hide-generic",
      reason: "Generic ballpark concession category — not a named specialty dish"
    };
  }

  if (isPetcoGenericBeverageRow(item.name)) {
    return {
      kind: "generic-beverage",
      action: "hide-generic",
      reason: "Generic bar beer/cocktail category — not a named specialty pour"
    };
  }

  if (isPetcoVaguePlaceholderRow(item.name)) {
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

export function buildPetcoCuratedGroups<
  T extends {
    id: string;
    name: string;
    vendor: { name: string };
    reviewCount: number;
    photoCount: number;
    isNewThisSeason: boolean;
  }
>(items: T[]) {
  const groups: { spec: PetcoCuratedGroupSpec; members: T[] }[] = [];

  for (const spec of PETCO_CURATED_CLEANUP_GROUPS) {
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
>(member: T, keep: T, spec: PetcoCuratedGroupSpec): PetcoCleanupAction {
  return recommendMenuQualityAction(member, keep, {
    treatAsDuplicate: spec.treatAsDuplicate,
    preferredCanonical: spec.canonicalName
  });
}

export { pickCanonicalMember };
