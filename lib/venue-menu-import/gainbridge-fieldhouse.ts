/**
 * Gainbridge Fieldhouse (Indiana Pacers / Fever — NBA/WNBA) menu parser.
 *
 * Curated from the official Pacers arena dining guide and team food announcements.
 * Alcohol bars, grab-and-go markets, generic snacks, and beverages excluded.
 *
 * Sources:
 *   https://www.nba.com/pacers/gainbridge-fieldhouse-food
 *   https://www.gainbridgefieldhouse.com/plan-your-visit/dining
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

const VENUE_SLUG = "gainbridge-fieldhouse";
const VENUE_NAME = "Gainbridge Fieldhouse";
const SOURCE_URL = "https://www.nba.com/pacers/gainbridge-fieldhouse-food";

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
    name: "The Fever Milkshake",
    description: "Red-and-yellow layered shake celebrating Fever Basketball",
    fare: "Desserts",
    vendor: "Shake Bar by Steak 'n Shake",
    vendorHint: sectionHint("11"),
    dietary: ["Vegetarian"],
    tags: ["nba", "signature"]
  },
  {
    name: "The Full Court Porkster",
    description: "Crispy pork tenderloin with local slaw and house sauce",
    fare: "Meals",
    vendor: "The Kitchen",
    vendorHint: sectionHint("17"),
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "Double Smash Burgers",
    description: "Lacy-edged patties smashed to order at Boom Baby Burgers",
    fare: "Meals",
    vendor: "Boom Baby Burgers",
    vendorHint: sectionHint("117"),
    tags: ["nba", "signature"]
  },
  {
    name: "Boom Baby Bacon Pimento Cheeseburger",
    fare: "Meals",
    vendor: "Boom Baby Burgers",
    vendorHint: sectionHint("117"),
    tags: ["nba", "signature"]
  },
  {
    name: "Boom Baby Dill Pickle Burger",
    fare: "Meals",
    vendor: "Boom Baby Burgers",
    vendorHint: sectionHint("117"),
    tags: ["nba"]
  },
  {
    name: "Oven-Baked Italian Hero",
    description: "Capicola, salami, pepperoni, and provolone toasted in pizza ovens",
    fare: "Meals",
    vendor: "Delaware St. Pizzeria",
    vendorHint: sectionHint("105"),
    tags: ["nba", "signature"]
  },
  {
    name: "Churro-Style Donut Holes",
    description: "Cinnamon-sugar donut holes with dulce de leche",
    fare: "Desserts",
    vendor: "Three Point Taqueria",
    vendorHint: sectionHint("6") + "; " + sectionHint("115"),
    dietary: ["Vegetarian"],
    tags: ["nba", "signature"]
  },
  {
    name: "Ben's Pretzels",
    description: "Hand-rolled Amish-country soft pretzels baked on the concourse",
    fare: "Meals",
    vendor: "Ben's Pretzels",
    vendorHint: sectionHint("2"),
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "HotBox Pizza",
    description: "Indy local pizza with thick pepperoni cups",
    fare: "Meals",
    vendor: "HotBox Pizza",
    vendorHint: "Multiple Sections",
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "HotBox Pepperoni Slice",
    fare: "Meals",
    vendor: "HotBox Pizza",
    vendorHint: "Main Concourse",
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Warehouse District BBQ",
    description: "Pulled pork and brisket with kettle chips and pimento cheese dip",
    fare: "Meals",
    vendor: "Warehouse District BBQ",
    vendorHint: sectionHint("15") + "; " + sectionHint("216"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Warehouse District Smoked Brisket Sandwich",
    fare: "Meals",
    vendor: "Warehouse District BBQ",
    vendorHint: sectionHint("15"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Chick-fil-A",
    description: "Classic chicken sandwiches and waffle fries on the balcony level",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: sectionHint("208") + "; " + sectionHint("215"),
    tags: ["nba"]
  },
  {
    name: "Chick-fil-A Chicken Sandwich",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: sectionHint("208"),
    tags: ["nba"]
  },
  {
    name: "Three Point Taqueria Street Tacos",
    description: "Al pastor and carne asada street tacos",
    fare: "Meals",
    vendor: "Three Point Taqueria",
    vendorHint: sectionHint("6"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Delaware St. Pepperoni Pizza Slice",
    fare: "Meals",
    vendor: "Delaware St. Pizzeria",
    vendorHint: sectionHint("105"),
    tags: ["nba"]
  },
  {
    name: "Steak 'n Shake Patty Melt",
    fare: "Meals",
    vendor: "Shake Bar by Steak 'n Shake",
    vendorHint: sectionHint("11"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Indiana Pork Tenderloin Sandwich",
    description: "Breaded tenderloin on a bun — classic Indiana staple",
    fare: "Meals",
    vendor: "The Kitchen",
    vendorHint: sectionHint("17"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "HotBox Breadstix",
    fare: "Meals",
    vendor: "HotBox Pizza",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Chicken Quesadilla",
    fare: "Meals",
    vendor: "Three Point Taqueria",
    vendorHint: sectionHint("115"),
    tags: ["nba"]
  },
  {
    name: "Loaded Nachos",
    fare: "Meals",
    vendor: "Gainbridge Fieldhouse Concessions",
    vendorHint: "Upper Concourse",
    tags: ["nba"]
  },
  {
    name: "Chocolate Chip Cookie",
    fare: "Desserts",
    vendor: "Chick-fil-A",
    vendorHint: sectionHint("215"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
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

export async function parseGainbridgeFieldhouseMenu(
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
