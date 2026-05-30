import type { FairRawMenuItem } from "./types";

const GENERIC_DRINK_RE =
  /^(?:water|soda|pop|cola|lemonade|iced tea|sweet tea|coffee|latte|espresso|beer|seltzer|wine|cocktail|margarita|rita|mule|cooler|float|slush|shake|lemonade|refresher)\b/i;

const MERCH_RE =
  /(?:merchandise|souvenir|t-?shirt|apparel|craft booth|vendor booth only)/i;

export function shouldSkipFairRawItem(item: FairRawMenuItem): string | null {
  if (MERCH_RE.test(item.name) || MERCH_RE.test(item.vendor)) {
    return "Non-food vendor";
  }

  if (item.allowBeverage) {
    return null;
  }

  if (item.beverageCategory) {
    return "Generic or non-specialty beverage";
  }

  if (GENERIC_DRINK_RE.test(item.name)) {
    return "Generic beverage";
  }

  if (/\b(?:lemonade|iced tea|beer|wine|cocktail|margarita|cooler|slush|float|refresher|soda)\b/i.test(item.name)) {
    return "Beverage-only item";
  }

  return null;
}
