/**
 * State Farm Arena (Atlanta Hawks — NBA) menu parser.
 *
 * Curated from official Hawks concessions announcements and Chef Garvin menu
 * coverage. Alcohol bars, milkshakes, and beverage-only rows excluded.
 *
 * Sources:
 *   https://www.statefarmarena.com/plan-your-visit/dining
 *   https://www.nba.com/hawks/
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

const VENUE_SLUG = "state-farm-arena";
const VENUE_NAME = "State Farm Arena";
const SOURCE_URL = "https://www.statefarmarena.com/plan-your-visit/dining";

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
    name: "The Lemon Pepper Loaded Footlong",
    description: "Deep-fried footlong with zesty lemon pepper seasoning",
    fare: "Meals",
    vendor: "Topped Cart",
    vendorHint: "Gate 6",
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "Jerk Chicken Sandwich",
    description: "24-hour jerk-marinated thigh with mango slaw and plantains",
    fare: "Meals",
    vendor: "State Farm Arena Concessions",
    vendorHint: sectionHint("118") + "; " + sectionHint("211"),
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "The BBQ Smashburger",
    description: "Smash patty with onion rings, pepper jack, and Southern BBQ sauce",
    fare: "Meals",
    vendor: "Chef Garvin",
    vendorHint: sectionHint("107"),
    tags: ["nba", "signature"]
  },
  {
    name: "J.R. Crickets",
    description: "Atlanta wing institution — buffalo and lemon pepper baskets",
    fare: "Meals",
    vendor: "J.R. Crickets",
    vendorHint: "Gate 5",
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "J.R. Crickets Lemon Pepper Wings",
    fare: "Meals",
    vendor: "J.R. Crickets",
    vendorHint: "Gate 5",
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Dolo's Pizza",
    description: "Non-traditional New York-style slices",
    fare: "Meals",
    vendor: "Dolo's Pizza",
    vendorHint: "Gate 5",
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Dolo's Pepperoni Slice",
    fare: "Meals",
    vendor: "Dolo's Pizza",
    vendorHint: "Gate 5",
    tags: ["nba", "local-vendor"]
  },
  {
    name: "The Black Bean Burger",
    description: "House-made spicy black bean patty with cilantro aioli",
    fare: "Meals",
    vendor: "State Farm Arena Concessions",
    vendorHint: sectionHint("118") + "; " + sectionHint("221"),
    dietary: ["Vegetarian", "Vegan"],
    tags: ["nba"]
  },
  {
    name: "Mediterranean Vegan Falafel",
    description: "Falafel on pita with cucumber, tomato, and vegan tzatziki",
    fare: "Meals",
    vendor: "State Farm Arena Concessions",
    vendorHint: sectionHint("107") + "; " + sectionHint("114"),
    dietary: ["Vegetarian", "Vegan"],
    tags: ["nba"]
  },
  {
    name: "Peach Hand Pie",
    description: "Georgia peach filling in flaky pastry with cinnamon sugar",
    fare: "Desserts",
    vendor: "State Farm Arena Concessions",
    vendorHint: "Sweet stands",
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Guest Chef Rotating Feature",
    description: "Rotating local minority- and women-owned restaurant pop-up",
    fare: "Meals",
    vendor: "Guest Chef Program",
    vendorHint: "Main concourse",
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Breakfast at Barney's Chicken & Waffle Slider",
    fare: "Meals",
    vendor: "Guest Chef Program",
    vendorHint: "Premium club rotation",
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Cubano Sandwich",
    fare: "Meals",
    vendor: "Guest Chef Program",
    vendorHint: "Main concourse rotation",
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "State Farm Arena Concessions",
    vendorHint: "Main concourse",
    tags: ["nba"]
  },
  {
    name: "Loaded Nachos",
    fare: "Meals",
    vendor: "State Farm Arena Concessions",
    vendorHint: sectionHint("214"),
    tags: ["nba"]
  },
  {
    name: "Grilled Chicken Sandwich",
    fare: "Meals",
    vendor: "State Farm Arena Concessions",
    vendorHint: sectionHint("227"),
    tags: ["nba"]
  },
  {
    name: "Personal Pepperoni Pizza",
    fare: "Meals",
    vendor: "State Farm Arena Concessions",
    vendorHint: "Upper concourse",
    tags: ["nba"]
  },
  {
    name: "Chocolate Chip Cookie",
    fare: "Desserts",
    vendor: "State Farm Arena Concessions",
    vendorHint: "Main concourse",
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

export async function parseStateFarmArenaMenu(
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
