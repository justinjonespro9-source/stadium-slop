/**
 * Little Caesars Arena (Detroit Pistons / Red Wings — NBA/NHL) menu parser.
 *
 * Curated from Delaware North 2025-26 Pistons and Red Wings centennial menu
 * announcements and 313 Presents venue dining listings. Beverage-only bars excluded.
 *
 * Sources:
 *   https://media.delawarenorth.com/new-food-and-beverage-offerings-announced-for-2025-26-detroit-pistons-season-at-little-caesars-arena/
 *   https://www.313presents.com/venue/little-caesars-arena/where-to-eat
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

const VENUE_SLUG = "little-caesars-arena";
const VENUE_NAME = "Little Caesars Arena";
const SOURCE_URL =
  "https://media.delawarenorth.com/new-food-and-beverage-offerings-announced-for-2025-26-detroit-pistons-season-at-little-caesars-arena/";

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
    name: "The Playoff Run-ning Taco",
    description: "Flamin' Hot Cheetos walking taco with seasoned protein and cheese",
    fare: "Meals",
    vendor: "The Playoff Run-ning Taco",
    vendorHint: portalHint("26"),
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Apple BBQ Chicken",
    description: "Red Wings centenary smoked chicken with apple BBQ glaze",
    fare: "Meals",
    vendor: "Slows Bar BQ",
    vendorHint: "Portable 46 concessions",
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "All The Time Fry",
    description: "Seasoned fries with All The Time sauce, scallions, and house sauce",
    fare: "Meals",
    vendor: "The Coop",
    vendorHint: `${portalHint("18")}; ${portalHint("19")}`,
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Coop Chicken Tender Basket",
    fare: "Meals",
    vendor: "The Coop",
    vendorHint: portalHint("18"),
    tags: ["nba", "nhl"]
  },
  {
    name: "EggRollDiva",
    description: "Detroit food-truck legend serving stuffed specialty egg rolls",
    fare: "Meals",
    vendor: "EggRollDiva",
    vendorHint: "1701 Pub",
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Belle\u2019s Tap House Ramen",
    description: "Craft ramen with choice of chicken, pork belly, or tofu",
    fare: "Meals",
    vendor: "Bell's Taphouse",
    vendorHint: "1701 Pub",
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Haloumi Mushroom Hash Sandwich",
    fare: "Meals",
    vendor: "Bell's Taphouse",
    vendorHint: "1701 Pub",
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "The 2645 Pastrami",
    description: "House pastrami on marble rye with Swiss and spicy mustard",
    fare: "Meals",
    vendor: "The 2645 Pastrami",
    vendorHint: "1701 Pub",
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "MotorCity Ham & Cheese",
    description: "Dearborn ham with caramelized onion bacon jam and Zingerman's pimento cheese",
    fare: "Meals",
    vendor: "The 2645 Pastrami",
    vendorHint: "1701 Pub",
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Little Caesars Pizza",
    description: "Hot-and-ready arena pizza slices",
    fare: "Meals",
    vendor: "Little Caesars Pizza",
    vendorHint: "Multiple portals on 100 and 300 levels",
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Little Caesars Pepperoni Slice",
    fare: "Meals",
    vendor: "Little Caesars Pizza",
    vendorHint: portalHint("4"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "The Mixing Board",
    description: "Michigan-themed scratch kitchen at Mike's Pizza Bar",
    fare: "Meals",
    vendor: "Mike's Pizza Bar",
    vendorHint: "In-venue restaurant",
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "The Mixing Board Lobster Roll",
    description: "Fresh New England-style lobster roll",
    fare: "Meals",
    vendor: "The Mixing Board",
    vendorHint: "Mike's Pizza Bar",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Slows Pulled Pork Meal",
    description: "Signature pulled pork with mac and cheese, coleslaw, cornbread, and pickles",
    fare: "Meals",
    vendor: "Slows Bar BQ",
    vendorHint: "Portable 46",
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Slows Smoked Brisket Meal",
    fare: "Meals",
    vendor: "Slows Bar BQ",
    vendorHint: "Portable 46",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "313 Grill Smash Burger",
    fare: "Meals",
    vendor: "313 Grill Co.",
    vendorHint: `${portalHint("2")}; ${portalHint("51")}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "Taqueria Street Tacos",
    fare: "Meals",
    vendor: "Taqueria",
    vendorHint: portalHint("25"),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Mike's Pizza Gnocchi",
    fare: "Meals",
    vendor: "Mike's Pizza Bar",
    vendorHint: "In-venue restaurant",
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Beirut Bakery Spinach Pie",
    fare: "Meals",
    vendor: "Beirut Bakery",
    vendorHint: "Detroit House",
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "local-vendor"]
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

export async function parseLittleCaesarsArenaMenu(
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
