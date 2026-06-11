/**
 * Capital One Arena (Washington Wizards / Capitals — NBA/NHL) menu parser.
 *
 * Curated from Monumental Sports' 2025-26 culinary announcement and Arena
 * Bar & Eats menu highlights. Alcohol bars, unlimited soda program rows,
 * and generic snacks are excluded.
 *
 * Source:
 *   https://monumentalsports.com/2025/10/monumental-sports-entertainment-unveils-new-chef-spike-mendelsohn-concept-and-2025-26-culinary-offerings-at-capital-one-arena/
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

const VENUE_SLUG = "capital-one-arena";
const VENUE_NAME = "Capital One Arena";
const SOURCE_URL =
  "https://monumentalsports.com/2025/10/monumental-sports-entertainment-unveils-new-chef-spike-mendelsohn-concept-and-2025-26-culinary-offerings-at-capital-one-arena/";

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
    name: "Light Up the Lamp Nachos",
    description:
      "Loaded chips with black beans, Mexican cheese, crema, queso, guacamole, pico, and jalapeños",
    fare: "Meals",
    vendor: "Arena Bar & Eats",
    vendorHint: "Former Signature Club space",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Owner's Burger",
    description:
      "Pat La Frieda beef with Vidalia onion marmalade, blue cheese, bacon, and horseradish mayo",
    fare: "Meals",
    vendor: "Arena Bar & Eats",
    vendorHint: "Former Signature Club space",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Waffle Pressed Cuban Sandwich",
    description: "Mojo pork, ham, and Swiss pressed between mustard waffles",
    fare: "Meals",
    vendor: "Arena Bar & Eats",
    vendorHint: "Former Signature Club space",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Mumbo Jumbo Crab Roll",
    description: "Maryland jumbo crab on a potato roll with Mumbo sauce",
    fare: "Meals",
    vendor: "Arena Bar & Eats",
    vendorHint: "Former Signature Club space",
    tags: ["nba", "nhl", "signature", "local-vendor"]
  },
  {
    name: "Soko Cheesesteak",
    description: "Classic cheesesteak from Takoma Park butchery",
    fare: "Meals",
    vendor: "Soko Cheesesteaks",
    vendorHint: sectionHint("105"),
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Soko Loaded Cheese Fries",
    fare: "Meals",
    vendor: "Soko Cheesesteaks",
    vendorHint: sectionHint("105"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Federalist Pig Brisket Sandwich",
    fare: "Meals",
    vendor: "Federalist Pig",
    vendorHint: `${sectionHint("107")}; ${sectionHint("402")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Federalist Pig BBQ Ribs",
    fare: "Meals",
    vendor: "Federalist Pig",
    vendorHint: `${sectionHint("107")}; ${sectionHint("402")}`,
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Federalist Pig Mac & Cheese",
    fare: "Meals",
    vendor: "Federalist Pig",
    vendorHint: `${sectionHint("107")}; ${sectionHint("402")}`,
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Balos Chicken Gyro",
    fare: "Meals",
    vendor: "Balos",
    vendorHint: sectionHint("120"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Balos Beef Skewer Plate",
    fare: "Meals",
    vendor: "Balos",
    vendorHint: sectionHint("120"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Balos Oregano Fries",
    fare: "Meals",
    vendor: "Balos",
    vendorHint: sectionHint("120"),
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "fuku Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "fuku by Chef David Chang",
    vendorHint: `${sectionHint("117")}; ${sectionHint("413")}`,
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "fuku Tender & Fry Combo",
    fare: "Meals",
    vendor: "fuku by Chef David Chang",
    vendorHint: `${sectionHint("117")}; ${sectionHint("413")}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "6th Street Taco Chicken Taco",
    fare: "Meals",
    vendor: "6th Street Taco",
    vendorHint: sectionHint("106"),
    tags: ["nba", "nhl"]
  },
  {
    name: "6th Street Taco Beef Taco",
    fare: "Meals",
    vendor: "6th Street Taco",
    vendorHint: sectionHint("106"),
    tags: ["nba", "nhl"]
  },
  {
    name: "District Dog Loaded Half-Smoke",
    description: "DC half-smoke hot dog with assorted toppings",
    fare: "Meals",
    vendor: "District Dog",
    vendorHint: sectionHint("119"),
    tags: ["nba", "nhl", "signature", "local-vendor"]
  },
  {
    name: "Capital Classics Brisket Nachos",
    fare: "Meals",
    vendor: "Capital Classics",
    vendorHint: `${sectionHint("103")}; ${sectionHint("422")}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "Tenders Love and Chicken Tender Combo",
    fare: "Meals",
    vendor: "Tenders Love and Chicken",
    vendorHint: `${sectionHint("112")}; ${sectionHint("229")}; ${sectionHint("402")}; ${sectionHint("417")}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "Pat & Stuggs Double Smash Burger",
    fare: "Meals",
    vendor: "Pat & Stuggs",
    vendorHint: sectionHint("413"),
    tags: ["nba", "nhl"]
  },
  {
    name: "District Grill Smash Burger",
    fare: "Meals",
    vendor: "District Grills",
    vendorHint: `${sectionHint("102")}; ${sectionHint("116")}; ${sectionHint("201")}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "Insomnia Cookies Chocolate Chunk Cookie",
    fare: "Desserts",
    vendor: "Insomnia Cookies",
    vendorHint: `${sectionHint("107")}; ${sectionHint("408")}`,
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl"]
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

export async function parseCapitalOneArenaMenu(
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
