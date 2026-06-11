/**
 * Caesars Superdome (New Orleans Saints — NFL) menu parser.
 *
 * Curated from official Saints concessions coverage and league import data.
 * Alcohol bars, daiquiri bars, and beverage-only rows excluded.
 *
 * Source: https://www.neworleanssaints.com/stadium/food-and-beverage
 *
 * Re-verify each season to pick up menu changes.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "caesars-superdome";
const VENUE_NAME = "Caesars Superdome";
const SOURCE_URL = "https://www.neworleanssaints.com/stadium/food-and-beverage";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function sectionHint(section: string): string {
  return `Section ${section}`;
}

const MENU_DATA: RawItem[] = [
  {
    name: "The \"Debris\" Mac & Cheese",
    description: "Five-cheese mac with roast beef debris and gravy",
    fare: "Meals",
    vendor: "Caesars Superdome Concessions",
    vendorHint: sectionHint("117") + "; " + sectionHint("145"),
    tags: ["nfl", "signature"]
  },
  {
    name: "Tabasco Chipotle BBQ Burger",
    description: "Double patty with Tabasco chipotle BBQ sauce",
    fare: "Meals",
    vendor: "Bienville Burger Bar",
    vendorHint: sectionHint("227") + "; " + sectionHint("269"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Seafood Nachos",
    description: "Chips with crawfish and shrimp queso",
    fare: "Meals",
    vendor: "504 Eats",
    vendorHint: sectionHint("117") + "; " + sectionHint("145"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "The \"Action Station\" Pasta",
    description: "Rotating pasta such as Cajun shrimp alfredo",
    fare: "Meals",
    vendor: "Caesars Superdome Concessions",
    vendorHint: sectionHint("217") + "; " + sectionHint("259"),
    tags: ["nfl", "signature"]
  },
  {
    name: "Beignet \"Flights\"",
    description: "Fresh fried beignets with dipping sauces",
    fare: "Desserts",
    vendor: "Loge Level",
    vendorHint: sectionHint("217"),
    dietary: ["Vegetarian"],
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Tony Chachere's",
    description: "Jambalaya, crawfish pie, and alligator sausage po'boys",
    fare: "Meals",
    vendor: "Tony Chachere's",
    vendorHint: sectionHint("104") + "; " + sectionHint("124"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Tony Chachere's Jambalaya",
    fare: "Meals",
    vendor: "Tony Chachere's",
    vendorHint: sectionHint("104"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Crawfish Pie",
    fare: "Meals",
    vendor: "Tony Chachere's",
    vendorHint: sectionHint("124"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Alligator Sausage Po'Boy",
    fare: "Meals",
    vendor: "Tony Chachere's",
    vendorHint: sectionHint("513"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Conecuh Smoked Sausage",
    description: "Southern smoked sausage on a local bun",
    fare: "Meals",
    vendor: "Conecuh Sausage",
    vendorHint: sectionHint("227") + "; " + sectionHint("543"),
    tags: ["nfl", "local-vendor"]
  },
  {
    name: "Little Caesars \"Super Slice\"",
    fare: "Meals",
    vendor: "Little Caesars",
    vendorHint: "Multiple Sections",
    tags: ["nfl"]
  },
  {
    name: "Cochon de Lait Sandwich",
    description: "Cajun pulled pork with cabbage slaw on French roll",
    fare: "Meals",
    vendor: "Dressed Or Not",
    vendorHint: "Multiple Sections",
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Ochsner Eat Fit",
    description: "Eat Fit approved wraps and fresh fruit cups",
    fare: "Meals",
    vendor: "Ochsner Eat Fit",
    vendorHint: sectionHint("111") + "; " + sectionHint("145"),
    tags: ["nfl"]
  },
  {
    name: "Chicken Caesar Wrap",
    fare: "Meals",
    vendor: "Ochsner Eat Fit",
    vendorHint: sectionHint("111"),
    tags: ["nfl"]
  },
  {
    name: "Gumbo Cup",
    fare: "Meals",
    vendor: "504 Eats",
    vendorHint: sectionHint("117"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Shrimp Po'Boy",
    fare: "Meals",
    vendor: "Dressed Or Not",
    vendorHint: "Main Concourse",
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Red Beans and Rice Bowl",
    fare: "Meals",
    vendor: "504 Eats",
    vendorHint: sectionHint("145"),
    tags: ["nfl", "local-vendor"]
  },
  {
    name: "Muffuletta Sandwich",
    fare: "Meals",
    vendor: "Caesars Superdome Concessions",
    vendorHint: "Main Concourse",
    tags: ["nfl", "local-vendor", "signature"]
  }
];

function dedupeMenuItems(rawItems: RawItem[]): RawItem[] {
  const byName = new Map<string, RawItem>();
  for (const item of rawItems) {
    const key = normalizeMenuItemName(item.name);
    if (!byName.has(key)) byName.set(key, { ...item });
  }
  return [...byName.values()];
}

function toSourceItem(raw: RawItem): VenueMenuSourceItem {
  return {
    name: raw.name,
    description: raw.description,
    fare: raw.fare,
    category: "Food",
    vendorName: raw.vendor,
    vendorLocationHint: raw.vendorHint,
    dietaryTags: raw.dietary ?? [],
    sourceUrl: SOURCE_URL,
    importTags: raw.tags
  };
}

export async function parseCaesarsSuperdomeMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;
  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items: dedupeMenuItems(MENU_DATA).map(toSourceItem),
    skippedDrinks: 0
  };
}
