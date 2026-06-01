/**
 * Target Field menu dedupe / cleanup heuristics (audit + optional apply).
 */

import { normalizeMenuItemName } from "./venue-menu-import/normalize";

export const TARGET_FIELD_VENUE_SLUG = "target-field";

/** Official curated names from lib/venue-menu-import/target-field.ts (canonical display). */
export const TARGET_FIELD_IMPORT_CANONICAL_NAMES = new Set(
  [
    "Red Cow 60/40 Bacon Burger Sliders",
    "Tony O's Cuban Sandwich",
    "Pizza Lucé Slice",
    "Pizza Lucé Whole Pie",
    "Pizza Lucé Gluten Free Pie",
    "Murray's Steak Sandwich",
    "Buffalo Chicken Mac & Cheese",
    "Smoked Brisket Mac & Cheese",
    "Kramarczuk's Sausages",
    "Kramarczuk's Sampler",
    "La Madre Mexican Street Elote",
    "Union Hmong Kitchen Sweet and Sour Fried Pork",
    "Izakaya Kazama Chocolate Fish on a Stick",
    "Taco Libre Machete or Bowl",
    "No Gluten Way Stacked Burger"
  ].map((n) => normalizeMenuItemName(n))
);

export type CleanupAction =
  | "keep-canonical"
  | "hide-duplicate"
  | "rename-canonical"
  | "keep-both"
  | "hide-generic"
  | "manual-review";

export type CuratedGroupSpec = {
  id: string;
  label: string;
  canonicalName: string;
  notes: string;
  /** When true, members are duplicates; when false, report only for human review. */
  treatAsDuplicate: boolean;
  matchName: (name: string, vendorName: string) => boolean;
};

/** User-requested inspection groups + high-confidence stadium pairs. */
export const CURATED_CLEANUP_GROUPS: CuratedGroupSpec[] = [
  {
    id: "red-cow-6040",
    label: "60/40 Burger vs Red Cow 60/40 Burger",
    canonicalName: "Red Cow 60/40 Bacon Burger Sliders",
    notes: "Seed 60/40 bacon-beef slider vs official Red Cow slider name.",
    treatAsDuplicate: true,
    matchName: (n) =>
      /60\s*\/\s*40/i.test(n) ||
      /bacon-beef slider/i.test(n) ||
      /red cow 60\/40 bacon burger sliders/i.test(n)
  },
  {
    id: "tony-os-cuban",
    label: "Tony O's Cuban Sandwich (case/vendor duplicate)",
    canonicalName: "Tony O's Cuban Sandwich",
    notes: "MLB seed vs menu import; curly vs straight apostrophe on vendor.",
    treatAsDuplicate: true,
    matchName: (n) => /tony o.?s cuban sandwich/i.test(n)
  },
  {
    id: "pizza-luce-slice",
    label: "Pizza Lucé by the Slice vs Pizza Lucé Slice",
    canonicalName: "Pizza Lucé Slice",
    notes: "bpItem pizza-luce-slice vs importer Pizza Lucé Slice.",
    treatAsDuplicate: true,
    matchName: (n) =>
      /pizza luc[eé] slice/i.test(n) || /^pizza by the slice$/i.test(n.trim())
  },
  {
    id: "pizza-luce-pie",
    label: "Pizza Lucé Whole Pie vs GF Whole Pie",
    canonicalName: "Pizza Lucé Whole Pie",
    notes: "Different SKUs — whole pie vs 10-inch GF pie.",
    treatAsDuplicate: false,
    matchName: (n) => /pizza luc[eé].*(whole|gluten free|gf)/i.test(n)
  },
  {
    id: "murrays-steak",
    label: "Murray's Steak Sandwich vs Silver Butter Knife",
    canonicalName: "Murray's Steak Sandwich",
    notes: "Importer uses Murray's Steak Sandwich; seed uses Silver Butter Knife name.",
    treatAsDuplicate: true,
    matchName: (n) =>
      /murray.?s (steak sandwich|silver butter knife)/i.test(n) ||
      /silver butter knife steak sandwich/i.test(n)
  },
  {
    id: "buffalo-mac",
    label: "Buffalo Chicken Mac Bowl vs Mac & Cheese",
    canonicalName: "Buffalo Chicken Mac & Cheese",
    notes: "Same stand (Mac and Yes Please); bowl slug from seed, & Cheese from 2026 menu.",
    treatAsDuplicate: true,
    matchName: (n) => /buffalo chicken mac/i.test(n)
  },
  {
    id: "kramarczuks-sausage",
    label: "Kramarczuk's sausage rows (all stands)",
    canonicalName: "Kramarczuk's Sausages",
    notes: "Sampler is a distinct combo; see brats-vs-sausages group for likely duplicate.",
    treatAsDuplicate: false,
    matchName: (n, v) => /kramarczuk/i.test(n) || /kramarczuk/i.test(v)
  },
  {
    id: "kramarczuks-brats-vs-sausages",
    label: "Kramarczuk's Brat/Polish/Hungarian vs Sausages",
    canonicalName: "Kramarczuk's Sausages",
    notes: "MLB seed brat line vs menu-import Kramarczuk's Sausages — same stand menu category.",
    treatAsDuplicate: true,
    matchName: (n) =>
      /kramarczuk.?s sausages/i.test(n) ||
      /brat\s*\/\s*polish\s*\/\s*hungarian/i.test(n)
  },
  {
    id: "smoked-brisket-mac",
    label: "Smoked brisket mac bowl vs Mac & Cheese",
    canonicalName: "Smoked Brisket Mac & Cheese",
    notes: "Same pattern as buffalo mac seed vs importer naming.",
    treatAsDuplicate: true,
    matchName: (n) => /smoked brisket mac/i.test(n)
  },
  {
    id: "chocolate-fish",
    label: "Izakaya chocolate fish (duplicate naming)",
    canonicalName: "Izakaya Kazama Chocolate Fish on a Stick",
    notes: "Seed taiyaki title vs importer item name.",
    treatAsDuplicate: true,
    matchName: (n) => /chocolate fish/i.test(n)
  },
  {
    id: "union-hmong-pork",
    label: "Union Hmong sweet and sour pork",
    canonicalName: "Union Hmong Kitchen Sweet and Sour Fried Pork",
    notes: "Seed short name vs importer long name.",
    treatAsDuplicate: true,
    matchName: (n) => /sweet and sour fried pork/i.test(n) || /sweet and sour pork/i.test(n)
  },
  {
    id: "la-madre-elote",
    label: "La Madre elote",
    canonicalName: "La Madre Mexican Street Elote",
    notes: "Street elote seed vs importer elote name.",
    treatAsDuplicate: true,
    matchName: (n) => /street elote|mexican street elote/i.test(n)
  },
  {
    id: "no-gluten-burger",
    label: "No Gluten Way stacked burger",
    canonicalName: "No Gluten Way Stacked Burger",
    notes: "Stacked GF burger seed vs importer name.",
    treatAsDuplicate: true,
    matchName: (n) => /stacked gf burger|no gluten way stacked burger/i.test(n)
  },
  {
    id: "taco-libre-machete",
    label: "Taco Libre machete",
    canonicalName: "Taco Libre Machete or Bowl",
    notes: "Seed machete taco/bowl vs importer wording.",
    treatAsDuplicate: true,
    matchName: (n) => /machete/i.test(n) && (/taco libre/i.test(n) || /bowl/i.test(n))
  }
];

const GENERIC_NON_REVIEWABLE_RE =
  /^(cotton candy|cracker jacks?|grab[- ]and[- ]go(?: counter pick)?|popcorn|peanuts)$/i;

const VAGUE_VENDOR_AS_ITEM_RE =
  /^(justin'?s candied popcorn bar|herbivorous butcher|section \d+)$/i;

export function punctuationFoldKey(name: string): string {
  return normalizeMenuItemName(name).replace(/[^a-z0-9]+/g, "");
}

export function vendorStripKey(itemName: string, vendorName: string): string {
  let name = itemName.trim();
  const vendor = vendorName.trim();
  if (!vendor) return normalizeMenuItemName(name);

  const patterns = [
    new RegExp(`^${escapeRegExp(vendor)}\\s*[-–—:|]\\s*`, "i"),
    new RegExp(`^${escapeRegExp(vendor)}\\s+`, "i")
  ];
  for (const re of patterns) {
    name = name.replace(re, "");
  }
  return normalizeMenuItemName(name);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isGenericNonReviewableItem(name: string, vendorName: string): boolean {
  const trimmed = name.trim();
  if (GENERIC_NON_REVIEWABLE_RE.test(trimmed)) return true;
  if (VAGUE_VENDOR_AS_ITEM_RE.test(trimmed)) return true;
  if (normalizeMenuItemName(trimmed) === normalizeMenuItemName(vendorName)) {
    return true;
  }
  return false;
}

export function scoreCanonicalCandidate(item: {
  name: string;
  reviewCount: number;
  photoCount: number;
  isNewThisSeason: boolean;
  preferredCanonical?: string;
}): number {
  let score = 0;
  score += item.reviewCount * 10_000;
  score += item.photoCount * 5_000;
  if (item.isNewThisSeason) score += 40;
  if (TARGET_FIELD_IMPORT_CANONICAL_NAMES.has(normalizeMenuItemName(item.name))) {
    score += 120;
  }
  if (
    item.preferredCanonical &&
    normalizeMenuItemName(item.name) === normalizeMenuItemName(item.preferredCanonical)
  ) {
    score += 200;
  }
  const len = item.name.trim().length;
  if (len >= 12 && len <= 56) score += 10;
  if (/^[A-Z]/.test(item.name)) score += 4;
  if (/\(|\)/.test(item.name)) score -= 8;
  return score;
}

export function pickCanonicalMember<
  T extends { name: string; reviewCount: number; photoCount: number; isNewThisSeason: boolean }
>(members: T[], preferredCanonical?: string): T {
  return [...members].sort(
    (a, b) =>
      scoreCanonicalCandidate({ ...b, preferredCanonical }) -
      scoreCanonicalCandidate({ ...a, preferredCanonical })
  )[0];
}

export function recommendActionForMember(
  member: { name: string; reviewCount: number; photoCount: number },
  keep: { name: string },
  opts: {
    treatAsDuplicate: boolean;
    preferredCanonical?: string;
    isGeneric?: boolean;
  }
): CleanupAction {
  if (!opts.treatAsDuplicate) {
    return "keep-both";
  }
  if (member.name === keep.name) {
    if (
      opts.preferredCanonical &&
      normalizeMenuItemName(member.name) !== normalizeMenuItemName(opts.preferredCanonical)
    ) {
      return member.reviewCount > 0 || member.photoCount > 0
        ? "manual-review"
        : "rename-canonical";
    }
    return "keep-canonical";
  }
  if (member.reviewCount > 0 || member.photoCount > 0) {
    return "manual-review";
  }
  if (opts.isGeneric && member.reviewCount === 0 && member.photoCount === 0) {
    return "hide-generic";
  }
  return "hide-duplicate";
}
