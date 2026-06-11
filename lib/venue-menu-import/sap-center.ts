/**
 * SAP Center (San Jose Sharks — NHL) menu parser.
 *
 * Curated from SAP Center food & beverage listings and Sharks 2025-26 concept
 * coverage. Generic popcorn, cocktail rows, and teal kettle chips excluded.
 *
 * Sources:
 *   https://www.sapcenter.com/plan-your-visit/food-beverage
 *   https://www.sapcenter.com/plan-your-visit/venue-map
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

const VENUE_SLUG = "sap-center";
const VENUE_NAME = "SAP Center";
const SOURCE_URL = "https://www.sapcenter.com/plan-your-visit/food-beverage";

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
    name: "The Potato Tornado",
    description: "Spiral-twirled crispy fried potato on a stick from Jumbo's",
    fare: "Meals",
    vendor: "Jumbo's",
    vendorHint: "Club section 113",
    tags: ["nhl", "signature"]
  },
  {
    name: "The PB&A Arepa",
    description: "Gluten-free Venezuelan arepa with plantain, black beans, and avocado",
    fare: "Meals",
    vendor: "PANA",
    vendorHint: sectionHint("111"),
    dietary: ["Gluten Free", "Vegetarian"],
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "PANA Shredded Chicken Arepa",
    fare: "Meals",
    vendor: "PANA",
    vendorHint: sectionHint("111"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Cheesesteak of the Month",
    description: "Rotating limited-edition cheesesteak profiles",
    fare: "Meals",
    vendor: "Fin Philly",
    vendorHint: sectionHint("126"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Fin Philly Classic Cheesesteak",
    fare: "Meals",
    vendor: "Fin Philly",
    vendorHint: sectionHint("126"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Nirvana Soul Coffee",
    description: "Black-owned San Jose coffee institution on the mezzanine",
    fare: "Meals",
    vendor: "Nirvana Soul Coffee",
    vendorHint: sectionHint("210"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Ivan\u2019s Baked Potatoes",
    description: "Salt-crusted potatoes with chorizo, carne asada, and poblano toppings",
    fare: "Meals",
    vendor: "Nirvana Soul Coffee",
    vendorHint: sectionHint("210"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Bun Me Up",
    description: "Asian fusion steamed bao with braised pork belly",
    fare: "Meals",
    vendor: "Nirvana Soul Coffee",
    vendorHint: sectionHint("210"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Bun Me Up Pork Belly Bao",
    fare: "Meals",
    vendor: "Bun Me Up",
    vendorHint: sectionHint("210"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Habana Cuba",
    description: "Pressed Cubano sandwiches with Swiss and mustard",
    fare: "Meals",
    vendor: "Nirvana Soul Coffee",
    vendorHint: sectionHint("210"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Habana Cuba Cubano Sandwich",
    fare: "Meals",
    vendor: "Habana Cuba",
    vendorHint: sectionHint("210"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Shark-Cone Taiyaki",
    description: "Shark-shaped waffle cone with cookies-and-cream soft serve",
    fare: "Desserts",
    vendor: "Treat Street",
    vendorHint: `${sectionHint("226")}; Puck Parlor`,
    dietary: ["Vegetarian"],
    tags: ["nhl", "signature"]
  },
  {
    name: "Dubai Chocolate Strawberry Cups",
    description: "Strawberries with pistachio cream, filo crunch, and dark chocolate",
    fare: "Desserts",
    vendor: "Cake Cart",
    vendorHint: sectionHint("C01"),
    dietary: ["Vegetarian"],
    tags: ["nhl", "signature"]
  },
  {
    name: "Smoking Pig BBQ Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Smoking Pig BBQ",
    vendorHint: sectionHint("118"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "Tenders Love and Chicken",
    vendorHint: `${sectionHint("107")}; ${sectionHint("123")}`,
    tags: ["nhl"]
  },
  {
    name: "Loaded Nachos",
    fare: "Meals",
    vendor: "SAP Center Concessions",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Personal Pepperoni Pizza",
    fare: "Meals",
    vendor: "Bibo's NY Pizza",
    vendorHint: sectionHint("121"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Grilled Chicken Sandwich",
    fare: "Meals",
    vendor: "SAP Center Concessions",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Chocolate Chip Cookie",
    fare: "Desserts",
    vendor: "SAP Center Concessions",
    vendorHint: "Main concourse",
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

export async function parseSapCenterMenu(
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
