/**
 * UBS Arena (New York Islanders — NHL) menu parser.
 *
 * Curated from the official UBS Arena dining page and Delaware North
 * season announcements. Generic popcorn, pretzels, and beverage-only rows excluded.
 *
 * Sources:
 *   https://ubsarena.com/plan-your-trip/dining/
 *   https://media.delawarenorth.com/ubs-arena-and-delaware-north-unveil-exciting-new-menu-items-for-2025-2026-new-york-islanders-season/
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

const VENUE_SLUG = "ubs-arena";
const VENUE_NAME = "UBS Arena";
const SOURCE_URL = "https://ubsarena.com/plan-your-trip/dining/";

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
    name: "CinnaBEC",
    description: "Cinnamon bun with bacon, egg, and cheese",
    fare: "Meals",
    vendor: "UBS Arena Markets",
    vendorHint: "Main Concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "The Knishwich",
    description: "Pastrami, Swiss, slaw, and mustard on a knish bun",
    fare: "Meals",
    vendor: "UBS Arena Markets",
    vendorHint: "Market 102",
    tags: ["nhl", "signature"]
  },
  {
    name: "The Meatball Arancini Hero",
    fare: "Meals",
    vendor: "UBS Arena Markets",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "Chicken Bacon Ranch Cheesesteak",
    fare: "Meals",
    vendor: "Empire Cheesesteaks",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "Shareable Poutine Pucks",
    description: "Classic shareable poutine served in a hockey puck vessel",
    fare: "Meals",
    vendor: "UBS Arena Markets",
    vendorHint: "Market 111",
    tags: ["nhl", "signature"]
  },
  {
    name: "The Cookie Doughminator",
    fare: "Desserts",
    vendor: "UBS Arena Markets",
    vendorHint: "Portable stands",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Zeppole Kebab",
    description: "Fried dough balls with Nutella and raspberry filling",
    fare: "Desserts",
    vendor: "UBS Arena Markets",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Fuku OG Chicken Sandwich",
    fare: "Meals",
    vendor: "Fuku by David Chang",
    vendorHint: "Main Concourse markets",
    tags: ["nhl", "signature"]
  },
  {
    name: "Fuku Sweet and Spicy Tenders",
    fare: "Meals",
    vendor: "Fuku by David Chang",
    vendorHint: "Main Concourse markets",
    tags: ["nhl"]
  },
  {
    name: "Burgerology Classic Cheeseburger",
    description: "Smashed beef patty with house sauce on a torta bun",
    fare: "Meals",
    vendor: "Burgerology",
    vendorHint: "Section 119 · Markets 203, 229, 214",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Benihana Hibachi Chicken Bowl",
    fare: "Meals",
    vendor: "Benihana",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "Shah's Halal Chicken & Rice Platter",
    fare: "Meals",
    vendor: "Shah's Halal",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Birria Grilled Cheese",
    description: "Birria beef with Monterey cheese and consommé dip",
    fare: "Meals",
    vendor: "UBS Arena Markets",
    vendorHint: "Market 220",
    tags: ["nhl"]
  },
  {
    name: "Buffalo Chicken Pizza Slice",
    fare: "Meals",
    vendor: "New York Pizza",
    vendorHint: "Market 108 · Market 203",
    tags: ["nhl"]
  },
  {
    name: "Mighty Quinn's Chipotle Chicken Mac & Cheese",
    fare: "Meals",
    vendor: "Mighty Quinn's Barbeque",
    vendorHint: "Portable 107 · Market 203",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Slapshot Shareable Nachos",
    description: "Chicken tinga nachos in a souvenir hockey puck",
    fare: "Meals",
    vendor: "Nacho Station",
    vendorHint: "Market 102",
    tags: ["nhl", "signature"]
  },
  {
    name: "French Dip Sandwich",
    fare: "Meals",
    vendor: "A Cut Above",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "Cuban Sandwich",
    fare: "Meals",
    vendor: "UBS Arena Markets",
    vendorHint: "Portable stands",
    tags: ["nhl"]
  },
  {
    name: "Chicken Cutlet and Prosciutto Parmesan Hero",
    fare: "Meals",
    vendor: "Deli",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "Fear the Schmear Sandwich",
    description: "Pork belly and habanero cream cheese on an English muffin",
    fare: "Meals",
    vendor: "A Cut Above",
    vendorHint: "Main Concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "Northwell Syosset Signature Salad",
    fare: "Meals",
    vendor: "Northwell Health Healthy Choice",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Mister Softee Cup",
    description: "Soft-serve with blue and orange sprinkles",
    fare: "Desserts",
    vendor: "Mister Softee",
    vendorHint: "Main Concourse",
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

export async function parseUbsArenaMenu(
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
