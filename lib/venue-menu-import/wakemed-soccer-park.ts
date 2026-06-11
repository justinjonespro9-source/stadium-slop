/**
 * WakeMed Soccer Park (North Carolina Courage — NWSL) menu parser.
 *
 * Curated from the official NC Courage matchday guide and Unique Food &
 * Beverage concessions coverage. Alcohol bars, generic snacks, soda, and
 * marketplace-only rows excluded.
 *
 * Sources:
 *   https://www.nccourage.com/matchday
 *   https://www.northcarolinafc.com/stadium/
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

const VENUE_SLUG = "wakemed-soccer-park";
const VENUE_NAME = "WakeMed Soccer Park";
const SOURCE_URL = "https://www.nccourage.com/matchday";

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
    name: "Kicker's Kitchen Burger",
    fare: "Meals",
    vendor: "Kicker's Kitchen",
    vendorHint: "Northwest Concessions",
    tags: ["nwsl"]
  },
  {
    name: "Kicker's Kitchen Hot Dog",
    fare: "Meals",
    vendor: "Kicker's Kitchen",
    vendorHint: "Northwest Concessions",
    tags: ["nwsl"]
  },
  {
    name: "Sideline Snack Shack Nachos",
    fare: "Meals",
    vendor: "Sideline Snack Shack",
    vendorHint: "Northeast Concessions",
    tags: ["nwsl"]
  },
  {
    name: "Sideline Snack Shack Loaded Fries",
    fare: "Meals",
    vendor: "Sideline Snack Shack",
    vendorHint: "Northeast Concessions",
    tags: ["nwsl"]
  },
  {
    name: "Hustle House Chicken Tenders",
    fare: "Meals",
    vendor: "Hustle House",
    vendorHint: "Southeast Concessions",
    tags: ["nwsl"]
  },
  {
    name: "Hustle House Chicken Sandwich",
    fare: "Meals",
    vendor: "Hustle House",
    vendorHint: "Southeast Concessions",
    tags: ["nwsl"]
  },
  {
    name: "The Goal Post Pizza Slice",
    fare: "Meals",
    vendor: "The Goal Post",
    vendorHint: "Upper Mezzanine & Upper Level",
    tags: ["nwsl"]
  },
  {
    name: "The Goal Post Personal Pizza",
    fare: "Meals",
    vendor: "The Goal Post",
    vendorHint: "Upper Mezzanine",
    tags: ["nwsl"]
  },
  {
    name: "Alpaca Peruvian Chicken Meal",
    description: "Local Peruvian chicken with sides — rotating Fan Fest vendor",
    fare: "Meals",
    vendor: "Alpaca",
    vendorHint: "Fan Fest / Concourse",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Alpaca Peruvian Chicken Salad",
    fare: "Meals",
    vendor: "Alpaca",
    vendorHint: "Fan Fest",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Two Roosters Ice Cream Cup",
    fare: "Desserts",
    vendor: "Two Roosters Ice Cream",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Fan Fest Food Truck Nachos",
    description: "Rotating food truck option in Fan Fest",
    fare: "Meals",
    vendor: "Fan Fest Food Trucks",
    vendorHint: "Fan Fest — North parking lot",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Fan Fest Food Truck Tacos",
    description: "Rotating food truck option in Fan Fest",
    fare: "Meals",
    vendor: "Fan Fest Food Trucks",
    vendorHint: "Fan Fest — North parking lot",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Grilled Chicken Wrap",
    fare: "Meals",
    vendor: "WakeMed Soccer Park Concessions",
    vendorHint: "West Concourse",
    tags: ["nwsl"]
  },
  {
    name: "Soft Pretzel with Cheese Cup",
    fare: "Meals",
    vendor: "WakeMed Soccer Park Concessions",
    vendorHint: "South Gate",
    dietary: ["Vegetarian"],
    tags: ["nwsl"]
  },
  {
    name: "Brisket Sandwich",
    fare: "Meals",
    vendor: "WakeMed Soccer Park Concessions",
    vendorHint: "Southwest Corner Stand",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "BBQ Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "WakeMed Soccer Park Concessions",
    vendorHint: "Northeast Corner Stand",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Caesar Salad",
    fare: "Meals",
    vendor: "WakeMed Soccer Park Concessions",
    vendorHint: "West Concourse",
    tags: ["nwsl"]
  },
  {
    name: "Veggie Burger",
    fare: "Meals",
    vendor: "WakeMed Soccer Park Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nwsl"]
  },
  {
    name: "Chocolate Chip Cookie",
    fare: "Desserts",
    vendor: "WakeMed Soccer Park Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nwsl"]
  },
  {
    name: "Chicken Quesadilla",
    fare: "Meals",
    vendor: "Hustle House",
    vendorHint: "Southeast Concessions",
    tags: ["nwsl"]
  },
  {
    name: "Stadium Mac & Cheese Cup",
    fare: "Meals",
    vendor: "Kicker's Kitchen",
    vendorHint: "Northwest Concessions",
    dietary: ["Vegetarian"],
    tags: ["nwsl"]
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

export async function parseWakemedSoccerParkMenu(
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
