/**
 * Ball Arena (Denver Nuggets / Colorado Avalanche — NBA/NHL) menu parser.
 *
 * Curated from the official Avalanche/Legends vendor announcement and
 * documented local stand menus. Generic $5 popcorn/pretzel rows and
 * alcohol are excluded.
 *
 * Source:
 *   https://www.nhl.com/avalanche/news/legends-and-ball-arena-partner-with-colorado-avalanche-to-introduce-fan-friendly-pricing-and-new-vendors
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

const VENUE_SLUG = "ball-arena";
const VENUE_NAME = "Ball Arena";
const SOURCE_URL =
  "https://www.nhl.com/avalanche/news/legends-and-ball-arena-partner-with-colorado-avalanche-to-introduce-fan-friendly-pricing-and-new-vendors";

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
    name: "Big Belly Brothers Brisket Sandwich",
    description: "20-hour smoked brisket sandwich",
    fare: "Meals",
    vendor: "Big Belly Brothers BBQ",
    vendorHint: `${sectionHint("148")}; ${sectionHint("379")}`,
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Big Belly Brothers Brisket Loaded Fries",
    fare: "Meals",
    vendor: "Big Belly Brothers BBQ",
    vendorHint: `${sectionHint("148")}; ${sectionHint("379")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Big Belly Brothers Poblano Nachos",
    fare: "Meals",
    vendor: "Big Belly Brothers BBQ",
    vendorHint: `${sectionHint("148")}; ${sectionHint("379")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Big Belly Brothers Raspberry Chipotle Baby Back Ribs",
    fare: "Meals",
    vendor: "Big Belly Brothers BBQ",
    vendorHint: `${sectionHint("148")}; ${sectionHint("379")}`,
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Redeemer Pizza Cup & Char Pepperoni Slice",
    description: "NY-style artisan pizza with Ezzo pepperoni",
    fare: "Meals",
    vendor: "Redeemer Pizza",
    vendorHint: `${sectionHint("126")}; ${sectionHint("342")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Nola Jane Debris Po'boy",
    description: "8-hour braised beef with lettuce, tomato, onion, mayo, and jus gravy",
    fare: "Meals",
    vendor: "Nola Jane",
    vendorHint: sectionHint("303"),
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Nola Jane Gumbo",
    fare: "Meals",
    vendor: "Nola Jane",
    vendorHint: sectionHint("303"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Nola Jane Jambalaya",
    fare: "Meals",
    vendor: "Nola Jane",
    vendorHint: sectionHint("303"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Nola Jane Nola Poutine",
    description: "Fries smothered in gumbo with cheese",
    fare: "Meals",
    vendor: "Nola Jane",
    vendorHint: sectionHint("303"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Mexico City Famous Fried Tacos",
    description: "White corn tortilla with melted cheese, lettuce, and tomato",
    fare: "Meals",
    vendor: "Mexico City",
    vendorHint: `${sectionHint("118")}; ${sectionHint("330")}`,
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Illegal Burger Jalapeño Cream Cheese Burger",
    description: "Fresh all-natural beef with fried onion strings",
    fare: "Meals",
    vendor: "Illegal Burger",
    vendorHint: sectionHint("102"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Illegal Burger Truffle Fries",
    fare: "Meals",
    vendor: "Illegal Burger",
    vendorHint: sectionHint("102"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Illegal Spicy Chicken Sandwich",
    fare: "Meals",
    vendor: "Illegal Burger",
    vendorHint: sectionHint("102"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Jake's Baby D's Mini Donuts",
    fare: "Desserts",
    vendor: "Jake's Baby D's",
    vendorHint: sectionHint("134"),
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Cluck Shack Chicken Sandwich",
    fare: "Meals",
    vendor: "Cluck Shack Chicken",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "Ford Champions Club Bacon BBQ Chicken Melt",
    description: "Fried chicken and grilled cheese mash-up; open to all Avs ticket holders",
    fare: "Meals",
    vendor: "Ford Champions Club",
    vendorHint: "Event level",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Gluten Friendly Baked Penne with Sausage",
    fare: "Meals",
    vendor: "Ball Arena Gluten Friendly Stand",
    vendorHint: sectionHint("303"),
    tags: ["nba", "nhl"]
  },
  {
    name: "Big Belly Brothers Loaded Brisket Chili",
    fare: "Meals",
    vendor: "Big Belly Brothers BBQ",
    vendorHint: `${sectionHint("148")}; ${sectionHint("379")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Nola Jane Andouille Dog",
    fare: "Meals",
    vendor: "Nola Jane",
    vendorHint: sectionHint("303"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Redeemer Pizza Cheese Slice",
    fare: "Meals",
    vendor: "Redeemer Pizza",
    vendorHint: `${sectionHint("126")}; ${sectionHint("342")}`,
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Big Belly Brothers Beef Burnt Ends",
    fare: "Meals",
    vendor: "Big Belly Brothers BBQ",
    vendorHint: `${sectionHint("148")}; ${sectionHint("379")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Mexico City Lounge Ground Beef Fried Taco",
    fare: "Meals",
    vendor: "Mexico City",
    vendorHint: `${sectionHint("118")}; ${sectionHint("330")}`,
    tags: ["nba", "nhl", "local-vendor"]
  }
];

function dedupeMenuItems(rawItems: RawItem[]): RawItem[] {
  const byName = new Map<string, RawItem>();
  for (const item of rawItems) {
    const key = normalizeMenuItemName(item.name);
    if (!byName.has(key)) {
      byName.set(key, { ...item });
    }
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

export async function parseBallArenaMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;
  const items = dedupeMenuItems(MENU_DATA).map(toSourceItem);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
