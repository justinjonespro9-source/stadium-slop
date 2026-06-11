/**
 * Delta Center (Utah Jazz / Utah Mammoth — NBA/NHL) menu parser.
 *
 * Curated from official Delta Center announcements and local partner listings.
 * Generic $2/$3 mountain menu popcorn/nachos/hot dogs and beverages excluded.
 *
 * Sources:
 *   https://www.deltacenter.com/news/new-experiences-expanded-local-fb-options-a-fully-overhauled-broadcast-studio-and-other-building-upgrades-await-fans-at-delta-center/
 *   https://www.deltacenter.com/news/6630/
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

const VENUE_SLUG = "delta-center";
const VENUE_NAME = "Delta Center";
const SOURCE_URL =
  "https://www.deltacenter.com/news/new-experiences-expanded-local-fb-options-a-fully-overhauled-broadcast-studio-and-other-building-upgrades-await-fans-at-delta-center/";

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
    name: "The Slapshot Burger",
    fare: "Meals",
    vendor: "Delta Center Concessions",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "The Hat Trick Burger",
    fare: "Meals",
    vendor: "Delta Center Concessions",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "Smoked Pork Nachos in a Helmet",
    fare: "Meals",
    vendor: "Delta Center Concessions",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Thick Shakes & Fries",
    fare: "Meals",
    vendor: "Delta Center Concessions",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl"]
  },
  {
    name: "Tusks Up Churros",
    fare: "Desserts",
    vendor: "San Diablo Churros",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Salt City Smokehouse Chimichurri Tri Tip Sandwich",
    description: "Texas toast tri-tip sandwich from Section F barbecue stand",
    fare: "Meals",
    vendor: "Salt City Smokehouse",
    vendorHint: "Section F · Level 3",
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Salt City Smokehouse Hickory Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Salt City Smokehouse",
    vendorHint: "Section F · Level 3",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Salt City Smokehouse S'mores Ice Cream Sandwich",
    fare: "Desserts",
    vendor: "Salt City Smokehouse",
    vendorHint: "Section F · Level 3",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "MOZZ Pizza Handcrafted Personal Pizza",
    description: "Fresh-ingredient pizza with crispy wings from southeast concourse",
    fare: "Meals",
    vendor: "MOZZ Pizza",
    vendorHint: "Southeast corner · Level 3",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Proper Burger Signature Patty",
    fare: "Meals",
    vendor: "Proper Burger",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Cupbop Korean BBQ Bowl",
    fare: "Meals",
    vendor: "Cupbop",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Costa Vida Burrito Bowl",
    fare: "Meals",
    vendor: "Costa Vida Mexican Grill",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Chile Verde Mexican Burrito",
    fare: "Meals",
    vendor: "Chile Verde",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Cubby's Club Sandwich",
    fare: "Meals",
    vendor: "Cubby's",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Maxwell's Pizza Slice",
    fare: "Meals",
    vendor: "Maxwell's Pizza",
    vendorHint: "Main concourse",
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Spilled Milk Ice Cream Sundae",
    fare: "Desserts",
    vendor: "Spilled Milk Ice Cream",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Bon Bon Gelato Cup",
    fare: "Desserts",
    vendor: "Bon Bon Desserts & Gelato",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Casamigos Corner Loaded Nachos",
    fare: "Meals",
    vendor: "Casamigos Corner",
    vendorHint: "Portal DD",
    tags: ["nba", "nhl"]
  },
  {
    name: "Casamigos Corner Bone-In Chicken Wings",
    fare: "Meals",
    vendor: "Casamigos Corner",
    vendorHint: "Portal DD",
    tags: ["nba", "nhl"]
  },
  {
    name: "Sprinkles Cupcake",
    fare: "Desserts",
    vendor: "Sprinkles Cupcakes",
    vendorHint: "South main concourse · Upper concourse ATM",
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl"]
  },
  {
    name: "Summit Snacks Chicken Tenders Plate",
    fare: "Meals",
    vendor: "Summit Snacks and Tenders",
    vendorHint: "Level 3 · Level 5",
    tags: ["nba", "nhl"]
  },
  {
    name: "Honest Acai Bowl",
    fare: "Meals",
    vendor: "Honest Acai",
    vendorHint: "Main concourse",
    dietary: ["Vegan"],
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

export async function parseDeltaCenterMenu(
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
