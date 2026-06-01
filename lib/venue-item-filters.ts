import type { FoodItem } from "@/lib/sample-data";

export const VENUE_ITEM_CATEGORY_FILTERS = [
  "all",
  "food",
  "sweets",
  "21-plus",
  "vegan",
  "gf",
  "reviewed"
] as const;

export type VenueItemCategoryFilter = (typeof VENUE_ITEM_CATEGORY_FILTERS)[number];

export const VENUE_ITEM_CATEGORY_OPTIONS: {
  label: string;
  value: VenueItemCategoryFilter;
}[] = [
  { label: "All", value: "all" },
  { label: "Food", value: "food" },
  { label: "Sweets", value: "sweets" },
  { label: "21+", value: "21-plus" },
  { label: "Vegan", value: "vegan" },
  { label: "GF", value: "gf" },
  { label: "Reviewed", value: "reviewed" }
];

const SWEET_FOOD_RE =
  /\b(sweet|dessert|treat|sundae|cannoli|donut|doughnut|gelato|ice cream|frost|funnel cake|candy|churro|brownie|cookie|cheesecake|cinnamon roll|banana split|salpicon|delight|sorbet)\b/i;

/** Milkshakes, malts, floats, slushies, and other dessert/fun drinks (NA or review-worthy). */
export const DESSERT_FUN_DRINK_RE =
  /\b(milkshake|malt\b|float\b|root beer float|orange whip|slushie|slushy|slush\b|icee|smoothie|frapp[eé]|frozen drink|dessert shake|shake\b|frozen\s+(?:lemonade|coffee|hot chocolate|chocolate)|hot chocolate|affogato|boba|bubble tea|frozen\s+custard|custard cup|walking pretzel|pretzel caramel)\b/i;

/** Generic pours we do not surface in the 21+ specialty bucket. */
export const GENERIC_BEVERAGE_RE =
  /\b(bottled water|fountain soda|pepsi|coke|coca-?cola|sprite|gatorade|powerade|domestic beer|draft beer|beer pour|tap beer|can of beer|bottled beer|hard seltzer|white claw|truly\b|corona\b|bud light|miller lite|coors light|michelob|modelo\b|lemonade|iced tea|sweet tea|hot coffee|refresher|grab-and-go drinks|bar drinks|premium bar drinks|silver bullet bar|outdoor bar drinks)\b|\b(?:soda|water|coffee)\b/i;

/** Named cocktails and specialty adult pours (21+ bucket). */
export const SPECIALTY_ADULT_DRINK_RE =
  /\b(bloody mary|margarita|old fashioned|manhattan|mojito|daiquiri|martini|negroni|moscow mule|whiskey sour|michelada|paloma|spritz|signature cocktail|craft cocktail|spiked|boozy|tequila|bourbon|whiskey|whisky|rum punch|frozen margarita|distillery|moonshine|cantina|highball|ritas?\b|mule\b|cocktail|mocktail|21\+|age restricted)\b/i;

export function itemFilterHaystack(
  item: Pick<FoodItem, "name" | "description" | "category" | "itemType" | "tags">
): string {
  return [
    item.name,
    item.description,
    item.category,
    item.itemType,
    ...(item.tags ?? [])
  ]
    .join(" ")
    .toLowerCase();
}

export function isGenericBeverageItem(
  item: Pick<FoodItem, "name" | "description" | "category" | "itemType" | "tags">
): boolean {
  const haystack = itemFilterHaystack(item);
  if (item.itemType === "Food") {
    return false;
  }
  if (DESSERT_FUN_DRINK_RE.test(haystack) && item.itemType === "Non-Alcoholic Drink") {
    return false;
  }
  if (SPECIALTY_ADULT_DRINK_RE.test(haystack) && item.itemType === "Alcoholic Drink") {
    return false;
  }
  return GENERIC_BEVERAGE_RE.test(haystack);
}

export function isDessertFunDrinkItem(
  item: Pick<FoodItem, "name" | "description" | "category" | "itemType" | "tags" | "ageRestricted">
): boolean {
  const haystack = itemFilterHaystack(item);

  if (item.ageRestricted || item.itemType === "Alcoholic Drink") {
    if (/\b(spiked|boozy|margarita|cocktail)\b/i.test(haystack)) {
      return false;
    }
  }

  if (DESSERT_FUN_DRINK_RE.test(haystack)) {
    return true;
  }

  return (
    item.itemType === "Non-Alcoholic Drink" &&
    !isGenericBeverageItem(item) &&
    /\b(frozen|shake|float|slush|malt|smoothie|custard|sundae)\b/i.test(haystack)
  );
}

export function isSpecialtyAdultDrinkItem(
  item: Pick<
    FoodItem,
    "name" | "description" | "category" | "itemType" | "tags" | "ageRestricted"
  >
): boolean {
  if (isDessertFunDrinkItem(item)) {
    return false;
  }

  const haystack = itemFilterHaystack(item);

  if (item.ageRestricted) {
    return !isGenericBeverageItem(item);
  }

  if (item.itemType !== "Alcoholic Drink") {
    return false;
  }

  if (isGenericBeverageItem(item)) {
    return false;
  }

  return SPECIALTY_ADULT_DRINK_RE.test(haystack);
}

export function itemMatchesSweetsFilter(item: FoodItem): boolean {
  const haystack = itemFilterHaystack(item);

  if (isDessertFunDrinkItem(item)) {
    return true;
  }

  if (item.itemType === "Alcoholic Drink") {
    return false;
  }

  return SWEET_FOOD_RE.test(haystack);
}

export function itemMatches21PlusFilter(item: FoodItem): boolean {
  return isSpecialtyAdultDrinkItem(item);
}

function itemMatchesVeganFilter(item: FoodItem): boolean {
  const lower = `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
  const upper = `${item.category} ${item.tags.join(" ")}`.toUpperCase();
  return upper.includes("VEGAN") || lower.includes("vegan") || lower.includes("plant-based");
}

function itemMatchesGlutenFreeFilter(item: FoodItem): boolean {
  const lower = `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
  const upper = `${item.category} ${item.tags.join(" ")}`.toUpperCase();
  return (
    upper.includes("GLUTEN") ||
    upper.includes("GLUTEN_FREE") ||
    lower.includes("gluten-free") ||
    lower.includes("gluten free")
  );
}

export function parseVenueItemCategoryFilter(value?: string): VenueItemCategoryFilter {
  if (value && VENUE_ITEM_CATEGORY_FILTERS.includes(value as VenueItemCategoryFilter)) {
    return value as VenueItemCategoryFilter;
  }
  if (value === "sweet" || value === "sweets") {
    return "sweets";
  }
  if (value === "drinks" || value === "alcoholic" || value === "non-alcoholic") {
    return "21-plus";
  }
  if (value === "vegan-gf") {
    return "vegan";
  }
  return "all";
}

export function itemPassesVenueCategoryFilter(
  item: FoodItem,
  category: VenueItemCategoryFilter
): boolean {
  if (category === "all" || category === "reviewed") {
    return true;
  }

  if (category === "food") {
    return item.itemType === "Food";
  }

  if (category === "sweets") {
    return itemMatchesSweetsFilter(item);
  }

  if (category === "21-plus") {
    return itemMatches21PlusFilter(item);
  }

  if (category === "vegan") {
    return itemMatchesVeganFilter(item);
  }

  if (category === "gf") {
    return itemMatchesGlutenFreeFilter(item);
  }

  return true;
}

export function buildVenueCategoryHrefParams(category: VenueItemCategoryFilter): string | null {
  return category === "all" ? null : category;
}
