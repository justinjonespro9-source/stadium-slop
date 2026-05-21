/**
 * Classify generic concession items that should not rank as Stadium Slop headliners.
 * Does not delete — callers set FoodItem.status to HIDDEN.
 */

export type GenericFoodItemInput = {
  name: string;
  description?: string | null;
  tags?: string[] | null;
  vendorName?: string | null;
};

export type GenericFoodItemClassification = {
  shouldHide: boolean;
  reason: string | null;
};

const SPECIALTY_QUALIFIERS =
  /\b(loaded|specialty|craft|local|signature|gourmet|artisan|house[- ]?made|truffle|caramel|brisket|smoked|famous|iconic|dirty|helmet|flight|flights|challenge|fusion|vegan|plant[- ]?based|award|omakase|arepa|pupusas|bbq|wagyu|short\s*rib|mac\s*&?\s*cheese|dubai|buffalo|cheetos|toffee|tallow|slushy|cocktail|margarita|mule|spritz|cantina|brew\s*pub|brew\s*house|party\s*zone|happy\s*hour|nachos|fish\s*&\s*chips|pretzel\s*dog|pretzel\s*braid|pretzel\s*bites|cotton\s*candy|sponge\s*candy|watermelon|blood\s*in\s*the\s*water|cutwater|angry\s*orchard|bold\s*city|nola|ben['\u2019]?s|bibigo|gourmet|bucket|souvenir|grilled\s*cheese|walleye|ferry|kettle|chomps|arizona\s*craft|hands\s*beer|beer\s*bat|mini\s*bat)\b/i;

const CRAFT_OR_LOCAL_BEER =
  /\b(craft\s*beer|local\s*(?:beer|ipa|lager|ale|brew)|microbrew|taproom|brewery|4\s*hands|805\s*beer|sierra\s*nevada|lagunitas|bell['\u2019]?s|founders|boulevard|boulevard|stone\s*brewing|dogfish)\b/i;

const GENERIC_VENDOR_RE =
  /^(?:section|stand|concourse|cart|kiosk|grill\s*\d+|level\s*\d+|club\s*level|upper|lower|main|plaza|gate|suite|value\s*menu|general\s*concession)/i;

/** Normalized names that are always generic (whole-item match). */
const GENERIC_EXACT_NAMES = new Set(
  [
    "water",
    "bottled water",
    "soda",
    "fountain drink",
    "fountain soda",
    "chips",
    "bag of chips",
    "potato chips",
    "popcorn",
    "candy",
    "pretzel",
    "soft pretzel",
    "generic pretzel",
    "domestic beer",
    "domestic draft",
    "draft beer",
    "regular beer",
    "beer",
    "bud light",
    "miller lite",
    "coors light",
    "michelob ultra",
    "busch light",
    "natural light"
  ].map(normalizeFoodItemName)
);

const DOMESTIC_BEER_BRANDS =
  /\b(bud\s*light|budweiser|miller\s*lite|miller\s*high\s*life|coors\s*light|michelob\s*ultra|busch\s*light|natural\s*light|keystone\s*light|pbr|pabst)\b/i;

const VALUE_MENU_GENERIC =
  /\b(?:\d+\s+)?value\s+(?:water|popcorn|pretzel|chips|draft\s*beer|beer|soda)\b/i;

const PLAIN_GENERIC_PHRASES: Array<{ reason: string; re: RegExp }> = [
  { reason: "bottled-water", re: /\b(bottled\s+water|dasani\s+water)\b/i },
  { reason: "free-water", re: /\bfree\s+filtered\s+water\b/i },
  { reason: "fountain-drink", re: /\bfountain\s+(?:drink|soda)\b/i },
  { reason: "bag-of-chips", re: /\bbag\s+of\s+chips\b/i },
  { reason: "plain-chips", re: /^(?:\d+\s+)?(?:value\s+)?chips$/i },
  { reason: "plain-popcorn", re: /^(?:\d+\s+)?(?:value\s+)?popcorn$/i },
  { reason: "plain-pretzel", re: /^(?:\d+\s+)?(?:value\s+)?(?:soft\s+)?pretzel$/i },
  { reason: "plain-candy", re: /^(?:\d+\s+)?candy$/i },
  { reason: "domestic-beer-brand", re: DOMESTIC_BEER_BRANDS },
  {
    reason: "domestic-beer-stand",
    re: /^(?:miller\s*lite|bud\s*light|coors\s*light)\s*(?:beer)?\s*$/i
  },
  { reason: "generic-pretzel-label", re: /\bgeneric\s+pretzel\b/i },
  { reason: "value-menu-item", re: VALUE_MENU_GENERIC }
];

export function normalizeFoodItemName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['\u2019]/g, "'")
    .replace(/[^a-z0-9\s&$-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(name: string): number {
  return name.split(/\s+/).filter(Boolean).length;
}

function hasSpecialtyQualifier(text: string): boolean {
  return SPECIALTY_QUALIFIERS.test(text);
}

function isCraftOrLocalBeer(text: string): boolean {
  return CRAFT_OR_LOCAL_BEER.test(text);
}

function isDistinctiveVendor(vendorName: string | null | undefined): boolean {
  const vendor = (vendorName ?? "").trim();
  if (!vendor || vendor.length < 4) return false;
  if (GENERIC_VENDOR_RE.test(vendor)) return false;
  if (hasSpecialtyQualifier(vendor)) return true;
  return wordCount(normalizeFoodItemName(vendor)) >= 2;
}

function isUniqueStadiumItem(item: GenericFoodItemInput, normalizedName: string): boolean {
  const tags = item.tags ?? [];
  if (tags.some((t) => /import|headline|local\s*favorite|premium/i.test(t))) {
    if (!GENERIC_EXACT_NAMES.has(normalizedName) && wordCount(normalizedName) >= 3) {
      return true;
    }
  }
  const description = (item.description ?? "").trim();
  if (description.length >= 120 && wordCount(normalizedName) >= 3) {
    return true;
  }
  if (wordCount(normalizedName) >= 5 && !GENERIC_EXACT_NAMES.has(normalizedName)) {
    return true;
  }
  return false;
}

/**
 * Returns whether an active item should be hidden as a generic concession.
 */
export function classifyGenericFoodItem(
  item: GenericFoodItemInput
): GenericFoodItemClassification {
  const name = item.name?.trim() ?? "";
  if (!name) {
    return { shouldHide: false, reason: null };
  }

  const normalized = normalizeFoodItemName(name);
  const combined = `${normalized} ${(item.description ?? "").toLowerCase()}`;

  if (hasSpecialtyQualifier(name) || hasSpecialtyQualifier(combined)) {
    return { shouldHide: false, reason: null };
  }

  if (isCraftOrLocalBeer(name) || isCraftOrLocalBeer(combined)) {
    return { shouldHide: false, reason: null };
  }

  if (/\bcocktail\b/i.test(name) && !DOMESTIC_BEER_BRANDS.test(name)) {
    return { shouldHide: false, reason: null };
  }

  if (isDistinctiveVendor(item.vendorName) && !GENERIC_EXACT_NAMES.has(normalized)) {
    if (wordCount(normalized) >= 2 || /pretzel|taco|burger|bbq|brisket/i.test(name)) {
      return { shouldHide: false, reason: null };
    }
  }

  if (isUniqueStadiumItem(item, normalized)) {
    return { shouldHide: false, reason: null };
  }

  if (GENERIC_EXACT_NAMES.has(normalized)) {
    return { shouldHide: true, reason: `exact:${normalized}` };
  }

  for (const { reason, re } of PLAIN_GENERIC_PHRASES) {
    if (re.test(name) || re.test(normalized)) {
      return { shouldHide: true, reason };
    }
  }

  if (/^305\s+value\s+/i.test(name)) {
    return { shouldHide: true, reason: "value-menu-brand" };
  }

  if (/\$\d+\s+bud\s*lights?$/i.test(normalized) || /^\$5\s+bud\s*lights?$/i.test(name)) {
    return { shouldHide: true, reason: "domestic-beer-brand" };
  }

  if (
    /^(the\s+)?(bud\s*light|miller\s*lite|coors\s*light)\s+(party\s*zone|deck|cantina|grab|midway|landing|brew)/i.test(
      name
    )
  ) {
    return { shouldHide: true, reason: "domestic-beer-zone" };
  }

  if (/^beer,?\s*wine\s+and\s+soda$/i.test(normalized)) {
    return { shouldHide: true, reason: "generic-beverage-combo" };
  }

  return { shouldHide: false, reason: null };
}
