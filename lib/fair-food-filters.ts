import type { FoodItem } from "@/lib/sample-data";
import {
  isDessertFunDrinkItem,
  itemMatches21PlusFilter
} from "@/lib/venue-item-filters";

export const FAIR_FOOD_FILTER_KEYS = [
  "new-foods",
  "sweet",
  "savory",
  "deep-fried",
  "on-a-stick",
  "shareable",
  "spicy",
  "dessert",
  "21-plus"
] as const;

export type FairFoodFilterKey = (typeof FAIR_FOOD_FILTER_KEYS)[number];

export type FairFoodFilterDefinition = {
  key: FairFoodFilterKey;
  label: string;
};

/** Base labels; "new-foods" is rewritten to "New for {year}" via getFairFoodFilterDefinitions. */
export const FAIR_FOOD_FILTER_DEFINITIONS: FairFoodFilterDefinition[] = [
  { key: "new-foods", label: "New Foods" },
  { key: "sweet", label: "Sweet" },
  { key: "savory", label: "Savory" },
  { key: "deep-fried", label: "Deep Fried" },
  { key: "on-a-stick", label: "On-a-Stick" },
  { key: "shareable", label: "Shareable" },
  { key: "spicy", label: "Spicy" },
  { key: "dessert", label: "Dessert" },
  { key: "21-plus", label: "21+" }
];

const NEW_SEASON_TAG_RE = /^new-(\d{4})$/i;

const SWEET_RE =
  /\b(sweet|dessert|desserts|candy|chocolate|cheesecake|churro|cookie|milkshake|malt\b|float\b|funnel cake|ice cream|sorbet|salpicon|delight|brownie|donut|doughnut|cinnamon roll|banana split|slushie|slushy|smoothie|shake\b|frozen custard|hot chocolate)\b/i;

const SAVORY_RE =
  /\b(taco|ramen|burger|hot dog|corn dog|sandwich|slider|arancini|carbonara|pickle|birria|brisket|bbq|nachos|crunchwrap|deviled|wagyu|crab|fish|pork|chicken|eggroll|pretzel|elote|popcorn|wings|rib|sausage|mac and cheese|loaded)\b/i;

const DEEP_FRIED_RE =
  /\b(deep[- ]?fried|fried pickle|fried |funnel cake|arancini|fritter|corn dog|churro|donut|doughnut|bombs?|crunchwrap|eggroll|taco[s]?)\b/i;

const ON_A_STICK_RE =
  /\b(on a stick|on-a-stick|skewer|corn dog|rocket on a stick|pickle on a stick)\b/i;

const SHAREABLE_RE =
  /\b(nachos|fries|sampler|platter|sliders?|bombs?|bites?|share|flight|trio|three ways|half & half)\b/i;

const SPICY_RE =
  /\b(jalape[nñ]o|chili|chile|habanero|cayenne|spicy|hot honey|flamin|pepper|baja|chipotle|sriracha|buffalo)\b/i;

const DESSERT_RE =
  /\b(dessert|cheesecake|cookie|churro|chocolate|milkshake|malt\b|float\b|funnel cake|delight|ice cream|sorbet|banana split|cinnamon roll|brownie|donut|doughnut|slushie|slushy|smoothie|shake\b)\b/i;

function itemHaystack(item: FoodItem): string {
  return [
    item.name,
    item.description,
    item.category,
    item.itemType,
    ...(item.tags ?? []),
    item.seasonIntroduced ?? ""
  ]
    .join(" ")
    .toLowerCase();
}

/** Latest `new-YYYY` tag year in the catalog; falls back to the current calendar year. */
export function resolveFairNewFoodsSeasonYear(
  items: FoodItem[],
  fallbackYear: number = new Date().getFullYear()
): number {
  let maxYear = 0;
  for (const item of items) {
    for (const tag of item.tags ?? []) {
      const match = NEW_SEASON_TAG_RE.exec(tag.trim());
      if (match) {
        maxYear = Math.max(maxYear, Number(match[1]));
      }
    }
  }
  return maxYear > 0 ? maxYear : fallbackYear;
}

export function getFairNewFoodsFilterLabel(seasonYear: number): string {
  return `New for ${seasonYear}`;
}

export function getFairFoodFilterDefinitions(
  seasonYear: number
): FairFoodFilterDefinition[] {
  return FAIR_FOOD_FILTER_DEFINITIONS.map((def) =>
    def.key === "new-foods"
      ? { ...def, label: getFairNewFoodsFilterLabel(seasonYear) }
      : def
  );
}

/** Only items explicitly tagged `new-{seasonYear}` — not prior-year preview catalogs. */
export function itemHasNewSeasonTag(item: FoodItem, seasonYear: number): boolean {
  const target = `new-${seasonYear}`;
  return (item.tags ?? []).some((tag) => tag.trim().toLowerCase() === target);
}

function matchesSweet(item: FoodItem, haystack: string): boolean {
  if (isDessertFunDrinkItem(item)) {
    return true;
  }
  if (DESSERT_RE.test(haystack) || SWEET_RE.test(haystack)) {
    return true;
  }
  const category = item.category.toLowerCase();
  return category.includes("dessert");
}

function matchesSavory(item: FoodItem, haystack: string): boolean {
  if (matchesSweet(item, haystack) || matchesDessert(haystack)) {
    return false;
  }
  if (item.itemType === "Alcoholic Drink") {
    return false;
  }
  if (SAVORY_RE.test(haystack)) {
    return true;
  }
  const category = item.category.toLowerCase();
  return category === "meals" || category === "snacks" || category === "food";
}

function matchesDessert(haystack: string): boolean {
  return DESSERT_RE.test(haystack);
}

export function itemMatchesFairFoodFilter(
  item: FoodItem,
  filter: FairFoodFilterKey,
  seasonYear: number = resolveFairNewFoodsSeasonYear([item])
): boolean {
  const haystack = itemHaystack(item);

  switch (filter) {
    case "new-foods":
      return itemHasNewSeasonTag(item, seasonYear);
    case "sweet":
      return matchesSweet(item, haystack);
    case "savory":
      return matchesSavory(item, haystack);
    case "deep-fried":
      return DEEP_FRIED_RE.test(haystack);
    case "on-a-stick":
      return ON_A_STICK_RE.test(haystack);
    case "shareable":
      return SHAREABLE_RE.test(haystack);
    case "spicy":
      return SPICY_RE.test(haystack);
    case "dessert":
      return matchesDessert(haystack) || item.category.toLowerCase().includes("dessert");
    case "21-plus":
      return itemMatches21PlusFilter(item);
    default:
      return false;
  }
}

export function countFairFoodFilterMatches(
  items: FoodItem[],
  filter: FairFoodFilterKey,
  seasonYear?: number
): number {
  const year = seasonYear ?? resolveFairNewFoodsSeasonYear(items);
  return items.filter((item) => itemMatchesFairFoodFilter(item, filter, year)).length;
}

export function buildFairFoodFilterCounts(
  items: FoodItem[],
  seasonYear?: number
): Record<FairFoodFilterKey, number> {
  const year = seasonYear ?? resolveFairNewFoodsSeasonYear(items);
  const counts = {} as Record<FairFoodFilterKey, number>;
  for (const key of FAIR_FOOD_FILTER_KEYS) {
    counts[key] = countFairFoodFilterMatches(items, key, year);
  }
  return counts;
}
