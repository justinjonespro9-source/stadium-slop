/**
 * Centennial Stadium (Denver Summit FC — NWSL) menu parser.
 *
 * Curated from Denver Summit FC / Levy concessions announcements for the
 * temporary Potomac Park stadium. Alcohol bars and beverages excluded.
 *
 * Sources:
 *   https://www.sportsbusinessjournal.com/Articles/2026/01/26/denver-summit-fc-picks-levy-for-fb-retail-at-new-stadiums/
 *   https://www.centennialco.gov/Government/City-Projects-and-Initiatives/Denver-NWSL%E2%80%99s-New-Home-at-Potomac-Park
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

const VENUE_SLUG = "centennial-stadium";
const VENUE_NAME = "Centennial Stadium";
const SOURCE_URL =
  "https://www.sportsbusinessjournal.com/Articles/2026/01/26/denver-summit-fc-picks-levy-for-fb-retail-at-new-stadiums/";

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
    name: "Denver Metro Street Tacos",
    description: "Local metro-area street taco stand",
    fare: "Meals",
    vendor: "Denver Metro Street Tacos",
    vendorHint: "North Concourse",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Al Pastor Street Tacos",
    fare: "Meals",
    vendor: "Denver Metro Street Tacos",
    vendorHint: "North Concourse",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Carne Asada Street Tacos",
    fare: "Meals",
    vendor: "Denver Metro Street Tacos",
    vendorHint: "East Concourse",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Front Range Smoked Meats",
    description: "Colorado BBQ stand with smoked meats",
    fare: "Meals",
    vendor: "Front Range Smoked Meats",
    vendorHint: "South Concourse",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Front Range Brisket Sandwich",
    fare: "Meals",
    vendor: "Front Range Smoked Meats",
    vendorHint: "South Concourse",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Front Range Pulled Pork Bowl",
    fare: "Meals",
    vendor: "Front Range Smoked Meats",
    vendorHint: "South Concourse",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Hand-Breaded Hot Chicken & Tenders",
    description: "Crispy hot chicken concept on the concourse",
    fare: "Meals",
    vendor: "Centennial Stadium Concessions",
    vendorHint: "East Concourse",
    tags: ["nwsl", "signature"]
  },
  {
    name: "Nashville Hot Chicken Sandwich",
    fare: "Meals",
    vendor: "Centennial Stadium Concessions",
    vendorHint: "East Concourse",
    tags: ["nwsl"]
  },
  {
    name: "House-Made Pizza Stalls",
    description: "Personal pizza from stadium pizza stalls",
    fare: "Meals",
    vendor: "House-Made Pizza Stalls",
    vendorHint: "North Concourse",
    tags: ["nwsl"]
  },
  {
    name: "Pepperoni Pizza Slice",
    fare: "Meals",
    vendor: "House-Made Pizza Stalls",
    vendorHint: "North Concourse",
    tags: ["nwsl"]
  },
  {
    name: "Green Chile Cheeseburger",
    description: "Colorado green chile-topped burger",
    fare: "Meals",
    vendor: "Levy Concessions",
    vendorHint: "South Concourse",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Rocky Mountain Bison Burger",
    fare: "Meals",
    vendor: "Levy Concessions",
    vendorHint: "West Premium Club",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Loaded Nachos with Queso",
    fare: "Meals",
    vendor: "Levy Concessions",
    vendorHint: "Main Concourse",
    tags: ["nwsl"]
  },
  {
    name: "Smash Burger",
    fare: "Meals",
    vendor: "Levy Concessions",
    vendorHint: "East Concourse",
    tags: ["nwsl"]
  },
  {
    name: "Chicken Bacon Ranch Wrap",
    fare: "Meals",
    vendor: "Centennial Stadium Concessions",
    vendorHint: "South Concourse",
    tags: ["nwsl"]
  },
  {
    name: "Veggie Bowl",
    fare: "Meals",
    vendor: "Centennial Stadium Concessions",
    vendorHint: "North Concourse",
    dietary: ["Vegetarian"],
    tags: ["nwsl"]
  },
  {
    name: "Colorado Craft Mac & Cheese",
    fare: "Meals",
    vendor: "Levy Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Churro Bites",
    fare: "Desserts",
    vendor: "Centennial Stadium Concessions",
    vendorHint: "East Concourse",
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

export async function parseCentennialStadiumMenu(
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
