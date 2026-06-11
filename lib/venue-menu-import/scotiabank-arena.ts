/**
 * Scotiabank Arena (Toronto Maple Leafs / Raptors — NHL/NBA) menu parser.
 *
 * Curated from the official Scotiabank Arena food concessions page with
 * item-level entries for named vendors. Alcohol bars, lounges, generic snacks,
 * and beverages are excluded.
 *
 * Source: https://www.scotiabankarena.com/plan-your-visit/food-beverage/food-concessions
 * Re-verify each season to pick up menu changes.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "scotiabank-arena";
const VENUE_NAME = "Scotiabank Arena";
const SOURCE_URL =
  "https://www.scotiabankarena.com/plan-your-visit/food-beverage/food-concessions";

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
    name: "Aloette Go Chicken Sandwich",
    description: "Portable Aloette chicken sandwich concept",
    fare: "Meals",
    vendor: "Aloette Go",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Cherry St. BBQ Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Cherry St. BBQ",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "ChungChun Rice Dog",
    description: "Korean-style rice-coated hot dog",
    fare: "Meals",
    vendor: "ChungChun Rice Dog",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "The Prime Rib Sandwich",
    description: "Top-selling carved prime rib with kettle chips",
    fare: "Meals",
    vendor: "Hot Stove Carve",
    vendorHint:
      "Platinum Level; Gallery Levels; Sections 104, 110, 117, 314, 318",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Loaded Rotisserie Chicken Poutine",
    fare: "Meals",
    vendor: "The Poutinerie",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Wicked Jerk Chicken Sandwich & Roti",
    fare: "Meals",
    vendor: "Wicked Carib",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Food Junction Chicken Tenders & Fries",
    description: "In-house MLSE culinary team signature entrée",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "Food Junction Buffalo Chicken Wrap",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "Food Junction Stadium Hot Dog",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "Hogtown Gourmet Hot Dog",
    fare: "Meals",
    vendor: "Hogtown Gourmet Hot Dogs",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Pizza Pizza Slice",
    fare: "Meals",
    vendor: "Pizza Pizza",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "The Poutinerie Classic Poutine",
    description: "Premium cheese curds and hand-cut fries",
    fare: "Meals",
    vendor: "The Poutinerie",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "The Poutinerie Steak and Onion Poutine",
    fare: "Meals",
    vendor: "The Poutinerie",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "St. Patties Burger",
    fare: "Meals",
    vendor: "St. Patties",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "Kibo Spicy Tuna Roll",
    fare: "Meals",
    vendor: "Kibo",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "Kibo Salmon Poke Bowl",
    fare: "Meals",
    vendor: "Kibo",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "Wicked Carib Jerk Chicken Bowl",
    fare: "Meals",
    vendor: "Wicked Carib",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "Tim Horton's Chili Bowl",
    fare: "Meals",
    vendor: "Tim Horton's",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Food Junction Italian Sausage",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "Hot Stove Carve Turkey Sandwich",
    fare: "Meals",
    vendor: "Hot Stove Carve",
    vendorHint: "Gallery Levels",
    tags: ["nba", "nhl"]
  },
  {
    name: "Cherry St. BBQ Brisket Sandwich",
    fare: "Meals",
    vendor: "Cherry St. BBQ",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Aloette Go Grain Bowl",
    fare: "Meals",
    vendor: "Aloette Go",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
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

export async function parseScotiabankArenaMenu(
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
