import type { FoodItem } from "@/lib/sample-data";

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

const NEW_FOOD_TAGS = ["state-fair", "2025-preview", "prior-year-listing"] as const;

const SWEET_RE =
  /\b(sweet|dessert|desserts|candy|chocolate|cheesecake|churro|cookie|milkshake|funnel cake|ice cream|sorbet|salpicon|delight|brownie|donut|doughnut|cinnamon roll|banana split)\b/i;

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
  /\b(dessert|cheesecake|cookie|churro|chocolate|milkshake|funnel cake|delight|ice cream|sorbet|banana split|cinnamon roll|brownie|donut|doughnut)\b/i;

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

function hasNewFoodSignals(item: FoodItem): boolean {
  const tags = (item.tags ?? []).map((t) => t.toLowerCase());
  if (NEW_FOOD_TAGS.some((tag) => tags.includes(tag))) {
    return true;
  }
  if (item.isNewThisSeason) {
    return true;
  }
  const season = item.seasonIntroduced?.trim();
  return season === "2025" || season === "2026";
}

function matchesSweet(item: FoodItem, haystack: string): boolean {
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
  filter: FairFoodFilterKey
): boolean {
  const haystack = itemHaystack(item);

  switch (filter) {
    case "new-foods":
      return hasNewFoodSignals(item);
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
      return Boolean(item.ageRestricted) || item.itemType === "Alcoholic Drink";
    default:
      return false;
  }
}

export function countFairFoodFilterMatches(
  items: FoodItem[],
  filter: FairFoodFilterKey
): number {
  return items.filter((item) => itemMatchesFairFoodFilter(item, filter)).length;
}

export function buildFairFoodFilterCounts(
  items: FoodItem[]
): Record<FairFoodFilterKey, number> {
  const counts = {} as Record<FairFoodFilterKey, number>;
  for (const key of FAIR_FOOD_FILTER_KEYS) {
    counts[key] = countFairFoodFilterMatches(items, key);
  }
  return counts;
}
