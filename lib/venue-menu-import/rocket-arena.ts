/**
 * Rocket Arena (Cleveland Cavaliers — NBA) menu parser.
 *
 * Formerly Rocket Mortgage FieldHouse. Curated from the official Cavaliers arena
 * dining guide and team culinary announcements. Alcohol bars, grab-and-go markets,
 * generic snacks, and beverages excluded.
 *
 * Sources:
 *   https://www.nba.com/cavaliers/rocket-arena/dining
 *   https://www.rocketarena.com/plan-your-visit/dining
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

const VENUE_SLUG = "rocket-arena";
const VENUE_NAME = "Rocket Arena";
const SOURCE_URL = "https://www.nba.com/cavaliers/rocket-arena/dining";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function portalHint(portal: string): string {
  return `Portal ${portal}`;
}

const MENU_DATA: RawItem[] = [
  {
    name: "The Big Cleve Burger",
    description: "Smash patty with kielbasa, ballpark fries, and nacho cheese",
    fare: "Meals",
    vendor: "Symon's Burger Joint",
    vendorHint: portalHint("9") + "; " + portalHint("43"),
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "The Tremonster Cheesesteak",
    description: "Shaved ribeye with provolone, mushrooms, and onions",
    fare: "Meals",
    vendor: "Rocco's",
    vendorHint: "Northwest Atrium",
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "Sriracha Maple Crispy Chicken Sando",
    description: "Golden-fried chicken with sriracha maple glaze and pickles",
    fare: "Meals",
    vendor: "Pearl's Kitchen",
    vendorHint: portalHint("18"),
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "The Cleveland Hot Chicken Sandwich",
    description: "Crispy chicken with secret Cleveland spice blend",
    fare: "Meals",
    vendor: "Loudville Grill",
    vendorHint: "Main Concourse",
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "The Funghi Wood-Fired Pizza",
    description: "Wild mushrooms, goat cheese, shallots, and white truffle oil",
    fare: "Meals",
    vendor: "Flour Pizza Co.",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "South Neighborhood",
    description: "James Beard-winner Jonathon Sawyer's arena concept",
    fare: "Meals",
    vendor: "Green House Kitchen",
    vendorHint: "Main Concourse",
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Green House Signature Frites",
    fare: "Meals",
    vendor: "Green House Kitchen",
    vendorHint: "Main Concourse",
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Handmade Bavarian Pretzel",
    description: "Giant pretzel with local stadium mustard",
    fare: "Meals",
    vendor: "Green House Kitchen",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Elmore's Smokehouse",
    description: "Pulled pork and ribs with Elmore Smith's bottled BBQ sauce",
    fare: "Meals",
    vendor: "Green House Kitchen",
    vendorHint: "Main Concourse",
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "Elmore's Pulled Pork Platter",
    fare: "Meals",
    vendor: "Elmore's Smokehouse",
    vendorHint: "Main Concourse",
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Mitchell's Ice Cream",
    description: "Cleveland small-batch ice cream in souvenir mini-helmets",
    fare: "Desserts",
    vendor: "Mitchell's Ice Cream",
    vendorHint: "Multiple Portals",
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Chicken Sack",
    description: "Honey-butter tossed tenders from Rocco's",
    fare: "Meals",
    vendor: "Rocco's",
    vendorHint: "Northwest Atrium",
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Flour Margherita Wood-Fired Pizza",
    fare: "Meals",
    vendor: "Flour Pizza Co.",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor"]
  },
  {
    name: "BBQ Chik'n Wrap",
    fare: "Meals",
    vendor: "CLE/MKT",
    vendorHint: portalHint("21"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Caesar Salad",
    fare: "Meals",
    vendor: "CLE/MKT",
    vendorHint: portalHint("21"),
    tags: ["nba"]
  },
  {
    name: "Polish Boy",
    description: "Cleveland classic kielbasa sandwich with fries and coleslaw",
    fare: "Meals",
    vendor: "Symon's Burger Joint",
    vendorHint: portalHint("9"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Loudville Loaded Fries",
    fare: "Meals",
    vendor: "Loudville Grill",
    vendorHint: "Main Concourse",
    tags: ["nba"]
  },
  {
    name: "Symon's Lola Burger",
    description: "Michael Symon signature burger with spicy ketchup and pickles",
    fare: "Meals",
    vendor: "Symon's Burger Joint",
    vendorHint: portalHint("43"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Pearl's Mac & Cheese",
    fare: "Meals",
    vendor: "Pearl's Kitchen",
    vendorHint: portalHint("18"),
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Cleveland Pierogi Plate",
    description: "Pan-fried pierogies with sour cream and onions",
    fare: "Meals",
    vendor: "Rocket Arena Concessions",
    vendorHint: "Upper Concourse",
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Brisket Nachos",
    fare: "Meals",
    vendor: "Elmore's Smokehouse",
    vendorHint: "Main Concourse",
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Chocolate Brownie Sundae",
    fare: "Desserts",
    vendor: "Rocket Arena Concessions",
    vendorHint: "Main Concourse",
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

export async function parseRocketArenaMenu(
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
