/**
 * KeyBank Center (Buffalo Sabres — NHL) menu parser.
 *
 * Curated from the official Sabres food catalog and Delaware North announcements.
 * Generic chips/candy, bottomless popcorn, and alcohol bars excluded.
 *
 * Sources:
 *   https://www.nhl.com/sabres/arena/food-catalog
 *   https://media.delawarenorth.com/delaware-north-unveils-fresh-culinary-lineup-for-buffalo-sabres-fansat-keybank-center/
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

const VENUE_SLUG = "keybank-center";
const VENUE_NAME = "KeyBank Center";
const SOURCE_URL = "https://www.nhl.com/sabres/arena/food-catalog";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

const MENU_DATA: RawItem[] = [
  {
    name: "Helicopter Fried Bologna Sandwich",
    description: "Thick-cut fried bologna with lettuce, tomato, bacon, and garlic aioli",
    fare: "Meals",
    vendor: "Grill Stand",
    vendorHint: "100 Level",
    tags: ["nhl", "signature"]
  },
  {
    name: "Rayzor Dog",
    description: "Sahlen's footlong with smoked pulled pork and cheddar",
    fare: "Meals",
    vendor: "Top Dog",
    vendorHint: "100 Level · 300 Level",
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "La Nova Stinger Pizza",
    fare: "Meals",
    vendor: "La Nova Pizza",
    vendorHint: "100 Level · 300 Level",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Let's Go Buffalo Wings & Pizza Logs",
    fare: "Meals",
    vendor: "Let's Go Buffalo",
    vendorHint: "100 Level",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "The French Connection",
    description: "Buffalo-style French dip sandwich",
    fare: "Meals",
    vendor: "KeyBank Center Concessions",
    vendorHint: "100 Level",
    tags: ["nhl", "signature"]
  },
  {
    name: "Sabres Steakhouse Stack",
    fare: "Meals",
    vendor: "KeyBank Center Concessions",
    vendorHint: "100 Level",
    tags: ["nhl", "signature"]
  },
  {
    name: "The Tage Hero",
    description: "Named for Sabres captain Tage Thompson",
    fare: "Meals",
    vendor: "KeyBank Center Concessions",
    vendorHint: "100 Level",
    tags: ["nhl", "signature"]
  },
  {
    name: "Return of the Dominator",
    description: "Quadruple bacon cheeseburger tribute to Dominik Hasek",
    fare: "Meals",
    vendor: "KeyBank Center Concessions",
    vendorHint: "100 Level",
    tags: ["nhl", "signature"]
  },
  {
    name: "Mega Weck Beef on Weck",
    fare: "Meals",
    vendor: "KeyBank Center Concessions",
    vendorHint: "100 Level · 200 Level · 300 Level",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Classic Poutine",
    fare: "Meals",
    vendor: "KeyBank Center Concessions",
    vendorHint: "100 Level",
    tags: ["nhl"]
  },
  {
    name: "Beef on Weck Poutine",
    fare: "Meals",
    vendor: "KeyBank Center Concessions",
    vendorHint: "100 Level",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "The Portabella Sandwich",
    description: "Portabella mushroom with horseradish fondue and arugula",
    fare: "Meals",
    vendor: "KeyBank Center Concessions",
    vendorHint: "100 Level",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Sponge Candy Crunch Fried Dough",
    fare: "Desserts",
    vendor: "Let's Dough!",
    vendorHint: "100 Level",
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Caramel Apple Fried Dough",
    fare: "Desserts",
    vendor: "Let's Dough!",
    vendorHint: "100 Level",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "La Nova Buffalo Chicken Finger Pizza",
    fare: "Meals",
    vendor: "La Nova Pizza",
    vendorHint: "100 Level",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "The Porker Burger",
    description: "Pulled pork, piggy sauce, chipotle BBQ, onion rings",
    fare: "Meals",
    vendor: "Americana Burger",
    vendorHint: "100 Level",
    tags: ["nhl"]
  },
  {
    name: "Southtowns BBQ Mac & Cheese",
    fare: "Meals",
    vendor: "Southtowns BBQ",
    vendorHint: "100 Level",
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Center Ice Cantina Burrito Bowl",
    fare: "Meals",
    vendor: "Center Ice Cantina",
    vendorHint: "100 Level · 300 Level",
    tags: ["nhl"]
  },
  {
    name: "Greek Out Mediterranean Bowl",
    fare: "Meals",
    vendor: "Greek Out",
    vendorHint: "100 Level",
    tags: ["nhl"]
  },
  {
    name: "Walking Taco",
    fare: "Meals",
    vendor: "Walking Taco Stand",
    vendorHint: "100 Level",
    tags: ["nhl"]
  },
  {
    name: "Mozzarella Caprese Melt",
    fare: "Meals",
    vendor: "Grill Stand",
    vendorHint: "100 Level",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Dubai Chocolate Pretzel Braid",
    fare: "Desserts",
    vendor: "KeyBank Center Concessions",
    vendorHint: "100 Level",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
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

export async function parseKeybankCenterMenu(
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
