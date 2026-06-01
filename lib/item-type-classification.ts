import { ItemCategory, ItemType } from "@prisma/client";

/** Obvious food tokens for import/audit heuristics (substring match on normalized name). */
export const FOOD_ITEM_NAME_TERMS = [
  "nachos",
  "nacho",
  "burger",
  "hot dog",
  " hotdog",
  " dog",
  "pizza",
  "fries",
  "fry",
  "sandwich",
  "taco",
  "tacos",
  "chicken",
  "wings",
  "tenders",
  "pretzel",
  "poutine",
  "brisket",
  "birria",
  "loaded",
  " bowl",
  "sausage",
  "cheesesteak",
  "curds",
  "popcorn",
  "grilled cheese",
  "brat",
  "perogy",
  "perogie",
  "pierogi",
  "nacho",
  "quesadilla",
  "burrito",
  "rib",
  "ribs",
  "steak",
  "patty",
  "slider",
  "sliders",
  "corn dog",
  "corndog",
  "onion ring",
  "tater tot",
  "totts",
  "tottine",
  "mac and cheese",
  "mac & cheese",
  "cookie",
  "brownie",
  "ice cream",
  "donut",
  "doughnut",
  "waffle",
  "funnel cake",
  "cotton candy",
  "gyro",
  "shawarma",
  "ramen",
  "pho",
  "sushi",
  "poke",
  "salad",
  "wrap",
  "sub ",
  " hoagie",
  "panini",
  "empanada",
  "dumpling",
  "bao",
  "elote",
  "falafel",
  "meatball",
  "meatballs",
  "poutine",
  "cheese curd",
  "curds",
  "pork",
  "bacon",
  "turkey leg",
  "helmet nacho"
] as const;

/** Drink-forward tokens — food heuristic must not override these. */
const DRINK_ITEM_NAME_TERMS = [
  "old fashioned",
  "manhattan",
  "margarita",
  "mojito",
  "daiquiri",
  "martini",
  "negroni",
  "spritz",
  "sangria",
  "moscow mule",
  "whiskey sour",
  "bloody mary",
  "michelada",
  "hard seltzer",
  "seltzer",
  " ipa",
  " lager",
  " stout",
  " pilsner",
  "craft beer",
  " draft beer",
  " bottled beer",
  " beer ",
  "wine",
  "cocktail",
  "mocktail",
  "lemonade",
  "iced tea",
  "sweet tea",
  "soda",
  "cola",
  "pepsi",
  "coke",
  "sprite",
  "gatorade",
  "powerade",
  "water bottle",
  " bottled water",
  "energy drink",
  "red bull",
  "monster energy",
  "celtzer",
  "hard cider",
  "cider pour",
  "pour only",
  "double ipa",
  "whiskey neat",
  "bourbon flight",
  "wine flight",
  "beer flight",
  "cold brew",
  " cooler",
  "milkshake",
  "smoothie",
  "shake"
] as const;

function normalizeItemName(name: string): string {
  return ` ${name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
}

export function isDrinksSocialSectionLabel(category?: string | null): boolean {
  const key = (category ?? "").trim().toLowerCase();
  return key === "drinks/social" || key.includes("drinks/social");
}

export function looksLikeDrinkItemName(name: string): boolean {
  const normalized = normalizeItemName(name);
  return DRINK_ITEM_NAME_TERMS.some((term) => normalized.includes(term));
}

export function looksLikeFoodItemName(name: string): boolean {
  const normalized = normalizeItemName(name);
  if (looksLikeDrinkItemName(name)) {
    return false;
  }
  return FOOD_ITEM_NAME_TERMS.some((term) => normalized.includes(term));
}

export function inferItemTypeFromImport(
  category?: string | null,
  itemName?: string | null
): ItemType {
  const name = itemName?.trim() ?? "";
  const cat = category?.trim() ?? "";
  const key = cat.toLowerCase();

  if (name && looksLikeDrinkItemName(name)) {
    if (key.includes("alcohol") || key.includes("beer") || key.includes("cocktail")) {
      return ItemType.ALCOHOLIC_DRINK;
    }
    return ItemType.ALCOHOLIC_DRINK;
  }

  if (name && looksLikeFoodItemName(name)) {
    return ItemType.FOOD;
  }

  if (isDrinksSocialSectionLabel(cat)) {
    return ItemType.FOOD;
  }

  if (key.includes("alcohol") || key.includes("beer") || key.includes("cocktail")) {
    return ItemType.ALCOHOLIC_DRINK;
  }
  if (key.includes("beverage") || key.includes("soda")) {
    return ItemType.NON_ALCOHOLIC_DRINK;
  }
  if (key.includes("drink") && !key.includes("social")) {
    return ItemType.NON_ALCOHOLIC_DRINK;
  }

  return ItemType.FOOD;
}

export function shouldReclassifyMisclassifiedDrinkAsFood(input: {
  name: string;
  itemType: ItemType;
  category: ItemCategory;
  customCategoryLabel: string | null;
}): boolean {
  if (
    input.itemType !== ItemType.ALCOHOLIC_DRINK &&
    input.itemType !== ItemType.NON_ALCOHOLIC_DRINK
  ) {
    return false;
  }

  if (!looksLikeFoodItemName(input.name)) {
    return false;
  }

  if (looksLikeDrinkItemName(input.name)) {
    return false;
  }

  return true;
}

export function foodCategoryAfterReclassify(
  customCategoryLabel: string | null,
  currentCategory: ItemCategory
): ItemCategory {
  if (isDrinksSocialSectionLabel(customCategoryLabel)) {
    return ItemCategory.OTHER;
  }
  if (
    currentCategory === ItemCategory.BEVERAGE ||
    currentCategory === ItemCategory.ALCOHOLIC_BEVERAGE
  ) {
    return ItemCategory.OTHER;
  }
  return currentCategory;
}
