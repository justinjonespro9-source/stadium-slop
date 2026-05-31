import { normalizeMenuItemName } from "@/lib/venue-menu-import/normalize";
import type { FairRawMenuItem } from "./types";

export type MinnesotaKickoffQualityResult = {
  items: FairRawMenuItem[];
  skippedItems: { name: string; reason: string }[];
  ambiguousItems: { name: string; reason: string }[];
  stats: {
    reviewWorthyKept: number;
    iconicSimpleKept: number;
    genericFillerSkipped: number;
    ambiguousFlagged: number;
    iconicExamples: string[];
    genericExamples: string[];
    ambiguousExamples: string[];
  };
};

const ICONIC_VENDOR_RE =
  /sweet martha|pronto pup|fresh french fries|mouth trap|peterson'?s pork|nelson'?s foot long|hansen'?s foot long|richie'?s cheese curd|tiny tim donut|the perfect pickle|cheese on-a-stick|minneapple pie|minnesnowii|big fat bacon/i;

const ICONIC_ITEM_RE =
  /pronto pup|papa pup|jumbo pickle|foot long (corn dog|hot dog)|\bcorn dog\b|cheese curd|cheese on-a-stick|mini donut|pork chop|pickle on-a-stick|deep[- ]?fried pickle|funnel cake|\bmalts?\b|minneapple|minnecookie|bacon on-a-stick|giant egg roll|\bsambusa|gator tot hotdish|deep[- ]?fried ranch|boxchecker|pickle cheese curd|pizza cheese curd|buffalo chicken cheese curd|fresh squeezed lemonade|wojapi|hornado|sec o de|fried bee-nana|garlic cream cheese wonton|irish butter ice cream|nacho bomb|loaded lobster|lobster roll|bang bang chicken|beauty and the buffalo|falafelicious|hummus bi lahme|uncrustaburger|totchos|poutine|elote|esquites|empanada|walking taco/i;

const ALWAYS_SKIP_RE = [
  /^[;,]$/,
  /^\*gluten/i,
  /^note:/i,
  /^vegetarian and gluten/i,
  /^gf\s*(\*|$)/i,
  /^gf without/i,
  /^can be served on a bed of/i,
  /^without ranch/i,
  /^served with (choice|ranch)/i,
  /^served hot or iced/i,
  /grill happy seasoning/i,
  /^dipping sauces$/i,
  /^coleslaw$/i,
  /^kettle chips$/i,
  /^rc'?s chips$/i,
  /^cotton candy$/i,
  /^sno cones$/i,
  /^meal cqombos$/i,
  /^sanduches$/i,
  /^plain, buffalo$/i,
  /^without ranch/i,
  /^hot honey, jalape/i,
  /^can be served/i
];

const GENERIC_PLAIN_RE = [
  /^french fries$/i,
  /^fresh[- ]?cut french fries$/i,
  /^fries$/i,
  /^nachos$/i,
  /^popcorn$/i,
  /^kettle corn$/i,
  /^ice cream$/i,
  /^soft serve/i,
  /^pretzels?$/i,
  /^bavarian pretzels?$/i,
  /^tater tots?$/i,
  /^chicken tenders$/i,
  /^chicken fingers$/i,
  /^chicken tenders with fries$/i,
  /^hot dogs?$/i,
  /^hamburger$/i,
  /^cheeseburger$/i,
  /^hamburger with chips$/i,
  /^cheeseburger with chips$/i,
  /^wings$/i,
  /^sub sandwiches$/i,
  /^chicken sandwich$/i,
  /^crab cakes$/i,
  /^buffalo wings$/i,
  /^glazed donut$/i,
  /^specialty donut$/i,
  /^mystery flavor$/i,
  /^whip cream$/i,
  /^maple syrup & bacon$/i,
  /^berry blast lemonade$/i,
  /^ginger lemonade$/i,
  /^somali spiced tea$/i,
  /^vietnamese iced coffee$/i,
  /^bootleg$/i,
  /^margarita$/i,
  /^perfect press/i,
  /^luna paloma$/i,
  /^lake storm lemonade$/i,
  /^minnesota mocktails$/i,
  /^rainbow$/i,
  /^hawaiian sunrise$/i,
  /^snow cream topping$/i,
  /^minnesnowii shave ice with variety/i,
  /^pull(ed)? pork sandwich$/i,
  /^smoked chicken sandwich$/i,
  /^pork memphis-style sandwich$/i,
  /^grilled chicken sandwiches$/i,
  /^black bean burgers$/i,
  /^build-your-own veggie sub$/i,
  /^chicken caesar wrap$/i,
  /^grilled chicken sandwich/i,
  /^hamburger, cheeseburger/i,
  /^cheese$/i,
  /^pepperoni$/i,
  /^sausage$/i,
  /^brat, polish sausage$/i
];

const GENERIC_VENDOR_MEAL_RE =
  /^(ball park cafe|andy'?s grille|cafe caribe)$/i;

const FLAVOR_LIST_START_RE =
  /^(vanilla|chocolate|strawberry|raspberry|caramel|hot fudge|blue raspberry|cherry|cotton candy|ham, turkey|corn, sour cream|corn chips|carne asada steak|grilled chicken sandwich|hamburger, cheeseburger)/i;

const MAX_ICONIC_EXAMPLES = 10;
const MAX_GENERIC_EXAMPLES = 12;
const MAX_AMBIGUOUS_EXAMPLES = 8;

function cleanItemName(raw: string): string {
  return raw.replace(/^[;,]\s+/, "").replace(/,+\s*$/, "").trim();
}

function isAlwaysSkipLine(name: string): string | null {
  const n = name.trim();
  if (n.length < 3) return "Too short to be a menu item";
  if (ALWAYS_SKIP_RE.some((re) => re.test(n))) return "Not a food item name (footnote, side note, or option line)";
  if (/^[;,]$/.test(n)) return "Parser fragment (leading punctuation)";
  return null;
}

function isFlavorOrOptionList(name: string): boolean {
  if (!name.includes(",")) return false;
  const parts = name
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 2) return false;
  if (parts.some((p) => p.length < 2)) return true;
  if (FLAVOR_LIST_START_RE.test(name)) return true;
  if (parts.length >= 3) {
    const avg = parts.reduce((s, p) => s + p.length, 0) / parts.length;
    if (avg < 22) return true;
  }
  if (parts.length >= 2 && /^(regular|jumbo|large cup|pail|vanilla|chocolate)/i.test(parts[0])) {
    return true;
  }
  return false;
}

function isIconicSimple(name: string, vendor: string): boolean {
  if (ICONIC_ITEM_RE.test(name)) return true;
  if (!ICONIC_VENDOR_RE.test(vendor)) return false;
  if (/cheese curd|curds|pronto|pup|pickle|pork chop|mini donut|funnel|lemonade|bucket|pail/i.test(name)) {
    return true;
  }
  if (/sweet martha/i.test(vendor) && /cup|pail|cookie/i.test(name)) return true;
  if (/cheese on-a-stick/i.test(vendor) && /lemonade|cheese on-a-stick/i.test(name)) return true;
  return false;
}

function isGenericPlain(name: string, vendor: string): boolean {
  if (isIconicSimple(name, vendor)) return false;
  const n = name.trim();
  if (GENERIC_PLAIN_RE.some((re) => re.test(n))) return true;
  if (GENERIC_VENDOR_MEAL_RE.test(vendor) && /^(hamburger|cheeseburger|chicken)/i.test(n)) return true;
  if (/^gyros sandwich/i.test(n)) return false;
  if (/^traditional beef$/i.test(n)) return false;
  return false;
}

function ambiguousReason(name: string, vendor: string): string | null {
  if (/^(large cup, pail|regular, bucket|regular, jumbo)$/i.test(name)) {
    return "Size-only line — confirm item title with fair source";
  }
  if (/sweet martha/i.test(vendor) && /cup|pail/i.test(name)) {
    return "Sweet Martha's size line without cookie item name";
  }
  if (/^\d+\s*oz\.\s*bucket/i.test(name) && /,/.test(name)) {
    return "Multiple fry sizes on one line — split or merge manually";
  }
  if (/^minnesnowii shave ice$/i.test(name)) {
    return null;
  }
  if (/shave ice with variety/i.test(name)) {
    return "Flavor umbrella line — use single shave ice entry or Fair Finder later";
  }
  return null;
}

function splitFreshFriesBuckets(item: FairRawMenuItem): FairRawMenuItem[] | null {
  if (!/fresh french fries/i.test(item.vendor)) return null;
  if (!/bucket|pail/i.test(item.name)) return null;
  const parts = item.name.split(",").map((p) => cleanItemName(p)).filter(Boolean);
  if (parts.length < 2) return null;
  return parts.map((name) => ({ ...item, name }));
}

export function filterMinnesotaKickoffQuality(
  rawItems: FairRawMenuItem[]
): MinnesotaKickoffQualityResult {
  const items: FairRawMenuItem[] = [];
  const skippedItems: { name: string; reason: string }[] = [];
  const ambiguousItems: { name: string; reason: string }[] = [];
  const seenVendorItem = new Set<string>();

  const stats = {
    reviewWorthyKept: 0,
    iconicSimpleKept: 0,
    genericFillerSkipped: 0,
    ambiguousFlagged: 0,
    iconicExamples: [] as string[],
    genericExamples: [] as string[],
    ambiguousExamples: [] as string[]
  };

  const pushSkipped = (name: string, reason: string, bucket: "generic" | "other") => {
    skippedItems.push({ name, reason });
    if (bucket === "generic") {
      stats.genericFillerSkipped++;
      if (stats.genericExamples.length < MAX_GENERIC_EXAMPLES) {
        stats.genericExamples.push(`${name} — ${reason}`);
      }
    }
  };

  const candidates: FairRawMenuItem[] = [];

  for (const raw of rawItems) {
    const name = cleanItemName(raw.name);
    const vendor = raw.vendor.trim();
    if (!name || !vendor) continue;

    const item = { ...raw, name, vendor };

    const fryBuckets = splitFreshFriesBuckets(item);
    if (fryBuckets) {
      candidates.push(...fryBuckets);
      continue;
    }
    candidates.push(item);
  }

  for (const item of candidates) {
    const { name, vendor } = item;
    const vendorItemKey = `${normalizeMenuItemName(vendor)}::${normalizeMenuItemName(name)}`;

    const forceSkip = isAlwaysSkipLine(name);
    if (forceSkip) {
      pushSkipped(name, forceSkip, "generic");
      continue;
    }

    const amb = ambiguousReason(name, vendor);
    if (amb) {
      ambiguousItems.push({ name, reason: amb });
      stats.ambiguousFlagged++;
      if (stats.ambiguousExamples.length < MAX_AMBIGUOUS_EXAMPLES) {
        stats.ambiguousExamples.push(`${vendor}: ${name}`);
      }
      continue;
    }

    if (isFlavorOrOptionList(name)) {
      pushSkipped(name, "Flavor, size, or combo option list — not a single menu item", "generic");
      continue;
    }

    if (seenVendorItem.has(vendorItemKey)) {
      pushSkipped(name, "Duplicate item for same vendor", "other");
      continue;
    }

    if (isGenericPlain(name, vendor)) {
      pushSkipped(name, "Generic fair filler (non-iconic)", "generic");
      continue;
    }

    seenVendorItem.add(vendorItemKey);

    if (isIconicSimple(name, vendor)) {
      stats.iconicSimpleKept++;
      if (stats.iconicExamples.length < MAX_ICONIC_EXAMPLES) {
        stats.iconicExamples.push(`${vendor} — ${name}`);
      }
    } else {
      stats.reviewWorthyKept++;
    }

    items.push(item);
  }

  return { items, skippedItems, ambiguousItems, stats };
}

export function formatMinnesotaQualityWarnings(
  stats: MinnesotaKickoffQualityResult["stats"]
): string[] {
  return [
    `Quality pass: ${stats.reviewWorthyKept} review-worthy items kept.`,
    `Quality pass: ${stats.iconicSimpleKept} iconic/simple fair classics kept intentionally.`,
    `Quality pass: ${stats.genericFillerSkipped} generic filler lines skipped.`,
    `Quality pass: ${stats.ambiguousFlagged} ambiguous lines flagged for human review (not imported).`,
    stats.iconicExamples.length
      ? `Iconic kept (sample): ${stats.iconicExamples.join("; ")}`
      : "Iconic kept (sample): none",
    stats.genericExamples.length
      ? `Generic skipped (sample): ${stats.genericExamples.slice(0, 6).join("; ")}`
      : "Generic skipped (sample): none",
    stats.ambiguousExamples.length
      ? `Ambiguous (sample): ${stats.ambiguousExamples.join("; ")}`
      : "Ambiguous (sample): none"
  ];
}
