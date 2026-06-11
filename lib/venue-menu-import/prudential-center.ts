/**
 * Prudential Center (New Jersey Devils — NHL) menu parser.
 *
 * Curated from the official concessions guide and Eastback Kitchen stand pages.
 * Alcohol bars, popcorn-for-the-people generic rows, and beverage-only excluded.
 *
 * Sources:
 *   https://www.prucenter.com/concessions
 *   https://www.prucenter.com/concessions/mighty-quinns-2
 *   https://www.prucenter.com/concessions/bayonne-diner
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

const VENUE_SLUG = "prudential-center";
const VENUE_NAME = "Prudential Center";
const SOURCE_URL = "https://www.prucenter.com/concessions";

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
    name: "Bacon Jam Grilled Cheese",
    fare: "Meals",
    vendor: "Eastback Kitchen",
    vendorHint: "Main concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "The Jersey Shore Dog",
    fare: "Meals",
    vendor: "Brick City Dogs",
    vendorHint: sectionHint("4"),
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "Melba's Signature Chicken & Waffle Bowl",
    fare: "Meals",
    vendor: "Melba's",
    vendorHint: "Main concourse",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Mighty Quinn's BBQ Brisket Sandwich",
    description: "Chopped brisket with Fresno chiles and cucumber on challah",
    fare: "Meals",
    vendor: "Mighty Quinn's Barbeque",
    vendorHint: `${sectionHint("4")}; ${sectionHint("111")}`,
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Mighty Quinn's Pulled Chipotle BBQ Chicken Sandwich",
    fare: "Meals",
    vendor: "Mighty Quinn's Barbeque",
    vendorHint: `${sectionHint("4")}; ${sectionHint("111")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Mighty Quinn's Brisket Nachos",
    fare: "Meals",
    vendor: "Mighty Quinn's Barbeque",
    vendorHint: `${sectionHint("4")}; ${sectionHint("111")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Smash by Pat LaFrieda Burger",
    fare: "Meals",
    vendor: "Smash by Pat LaFrieda",
    vendorHint: "Main concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "The Boardwalk Cheesesteak",
    fare: "Meals",
    vendor: "The Boardwalk",
    vendorHint: "Main concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Garlic Knots in a Goalie Helmet",
    description: "Souvenir helmet vessel with garlic knots",
    fare: "Meals",
    vendor: "Eastback Kitchen",
    vendorHint: "Select Devils home games",
    dietary: ["Vegetarian"],
    tags: ["nhl", "signature"]
  },
  {
    name: "The Rock's Smash Burger",
    description: "Double Pat LaFrieda patty with Rock's sauce on challah",
    fare: "Meals",
    vendor: "Main Street Diner",
    vendorHint: sectionHint("1"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Taylor Ham, Egg, and Cheese Sandwich",
    fare: "Meals",
    vendor: "Main Street Diner",
    vendorHint: sectionHint("1"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Main Street Diner Disco Fries",
    description: "Fries with gravy and mozzarella",
    fare: "Meals",
    vendor: "Main Street Diner",
    vendorHint: sectionHint("1"),
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Goya Cantina Empanadas",
    fare: "Meals",
    vendor: "Goya Cantina",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Heritage Kitchen Rotating Feature",
    description: "Cultural heritage rotating menu from Heritage Kitchen",
    fare: "Meals",
    vendor: "Heritage Kitchen",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Goal Tenders Chicken Tender Combo",
    fare: "Meals",
    vendor: "Goal Tenders",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "The Jersey Tomato Caprese Sandwich",
    fare: "Meals",
    vendor: "The Jersey Tomato",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Main Street Diner Funnel Cake Fries",
    fare: "Desserts",
    vendor: "Main Street Diner",
    vendorHint: sectionHint("1"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Brick City All Beef Hot Dog",
    fare: "Meals",
    vendor: "Brick City Dogs",
    vendorHint: sectionHint("110"),
    tags: ["nhl"]
  },
  {
    name: "Mulberry Market Fresh Panini",
    fare: "Meals",
    vendor: "Mulberry Market",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Kosher Deli Sandwich",
    fare: "Meals",
    vendor: "Kosher",
    vendorHint: `${sectionHint("10")}; ${sectionHint("17")}; ${sectionHint("124")}`,
    tags: ["nhl"]
  },
  {
    name: "Goya Cantina Loaded Nachos",
    fare: "Meals",
    vendor: "Goya Cantina",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Smash by Pat LaFrieda Chicken Sandwich",
    fare: "Meals",
    vendor: "Smash by Pat LaFrieda",
    vendorHint: "Main concourse",
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

export async function parsePrudentialCenterMenu(
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
