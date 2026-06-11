/**
 * Paycom Center (Oklahoma City Thunder — NBA) menu parser.
 *
 * Curated from the official Thunder game-night guide and Loud City Hospitality
 * concessions coverage. HTeaO tea program and beverage-only rows preserved as
 * matches only; new rows are food-focused.
 *
 * Source:
 *   https://www.nba.com/thunder/gamenight
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

const VENUE_SLUG = "paycom-center";
const VENUE_NAME = "Paycom Center";
const SOURCE_URL = "https://www.nba.com/thunder/gamenight";

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
    name: "The \"Big Nasty\" Loaded Potato",
    description: "Salt-crusted baked potato loaded with pit-smoked brisket and toppings",
    fare: "Meals",
    vendor: "Big O's BBQ",
    vendorHint: sectionHint("110"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Big O's Brisket Sandwich",
    fare: "Meals",
    vendor: "Big O's BBQ",
    vendorHint: sectionHint("110"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Smoked Green Chile Pork Mac & Cheese",
    description: "Three-cheese mac with 14-hour smoked pork belly and green chile relish",
    fare: "Meals",
    vendor: "Marquee Classics",
    vendorHint: "Main concourse",
    tags: ["nba", "signature"]
  },
  {
    name: "The Mio Dog",
    description: "Premium hot dog with Made in Oklahoma condiments and relishes",
    fare: "Meals",
    vendor: "Made in Oklahoma",
    vendorHint: sectionHint("112"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Philly Cheese Egg Rolls",
    description: "Crispy wrappers with ribeye, caramelized onions, and provolone",
    fare: "Meals",
    vendor: "GastroPub",
    vendorHint: sectionHint("209"),
    tags: ["nba", "signature"]
  },
  {
    name: "Empire Slice House",
    description: "Plaza District New York-style pizza on the main concourse",
    fare: "Meals",
    vendor: "Empire Slice House",
    vendorHint: sectionHint("115"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Empire Slice Cheese Slice",
    fare: "Meals",
    vendor: "Empire Slice House",
    vendorHint: sectionHint("115"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Empire Slice Rumble Slice",
    description: "Pepperoni, bacon, and Canadian bacon specialty slice",
    fare: "Meals",
    vendor: "Empire Slice House",
    vendorHint: sectionHint("115"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Cupbop",
    description: "Korean BBQ-in-a-cup with glass noodles and marinated proteins",
    fare: "Meals",
    vendor: "Cupbop",
    vendorHint: sectionHint("102"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Cupbop Beef Cupbop",
    fare: "Meals",
    vendor: "Cupbop",
    vendorHint: sectionHint("102"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Freddy\u2019s Frozen Custard & Steakburgers",
    description: "Thin-crisp steakburgers and frozen custard",
    fare: "Meals",
    vendor: "Freddy\u2019s Frozen Custard & Steakburgers",
    vendorHint: sectionHint("107"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Freddy's Original Double Steakburger",
    fare: "Meals",
    vendor: "Freddy\u2019s Frozen Custard & Steakburgers",
    vendorHint: sectionHint("107"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "HTeaO",
    description: "Iced tea outpost — preserved as existing venue row",
    fare: "Meals",
    vendor: "HTeaO",
    vendorHint: sectionHint("102"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "FastBreak Markets",
    description: "Frictionless grab-and-go market",
    fare: "Meals",
    vendor: "FastBreak Markets",
    vendorHint: sectionHint("104"),
    tags: ["nba"]
  },
  {
    name: "Eddie's Buffalo Wings",
    fare: "Meals",
    vendor: "Eddie's",
    vendorHint: sectionHint("105"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Loud City Chicken Sandwich",
    description: "Spicy fried chicken with jalapeño bacon, pepper jack, and Mike's Hot Honey",
    fare: "Meals",
    vendor: "Michelob ULTRA Club",
    vendorHint: sectionHint("116"),
    tags: ["nba", "signature"]
  },
  {
    name: "Brisket Grilled Cheese",
    description: "House-smoked brisket with American cheese and bacon jam on Texas toast",
    fare: "Meals",
    vendor: "Michelob ULTRA Club",
    vendorHint: sectionHint("116"),
    tags: ["nba", "signature"]
  },
  {
    name: "Hand-Twisted Salt Pretzel",
    description: "Fresh pretzel with cheese dipping sauce",
    fare: "Meals",
    vendor: "Loud City Hospitality",
    vendorHint: "Multiple concourse locations",
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Peach Crisp",
    description: "Baked peach with oat crumble and vanilla ice cream",
    fare: "Desserts",
    vendor: "Blue Pit BBQ",
    vendorHint: sectionHint("225"),
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Okie Dilla Chicken Tinga Crunchwrap",
    fare: "Meals",
    vendor: "OKIE DILLA",
    vendorHint: sectionHint("215"),
    tags: ["nba", "local-vendor"]
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

export async function parsePaycomCenterMenu(
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
