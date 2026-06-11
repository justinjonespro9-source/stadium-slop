/**
 * Allen Fieldhouse (Kansas Jayhawks — NCAA Basketball) menu parser.
 *
 * Curated from OVG Hospitality / KU athletics concessions announcements.
 * Generic snacks and beverages excluded.
 *
 * Sources:
 *   https://www.foodservicedirector.com/colleges-universities/new-menu-set-to-slam-dunk-at-ku-s-allen-fieldhouse-as-college-basketball-tips-off
 *   https://kuathletics.com/sports/mens-basketball
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

const VENUE_SLUG = "allen-fieldhouse";
const VENUE_NAME = "Allen Fieldhouse";
const SOURCE_URL =
  "https://www.foodservicedirector.com/colleges-universities/new-menu-set-to-slam-dunk-at-ku-s-allen-fieldhouse-as-college-basketball-tips-off";

const NCAA_BB = ["ncaa", "college-basketball"] as const;

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
    name: "BBQ Brisket Sandwich",
    description: "Smoked brisket sandwich at Allen Fieldhouse",
    fare: "Meals",
    vendor: "Kuna Meats",
    vendorHint: "Naismith Room kitchen",
    tags: [...NCAA_BB, "local-vendor", "signature"]
  },
  {
    name: "Jayhawk Loaded Nachos",
    fare: "Meals",
    vendor: "Nothing but Nachos",
    vendorHint: "Second-level concourse",
    tags: [...NCAA_BB, "signature"]
  },
  {
    name: "Nothing but Nachos",
    description: "OVG Hospitality nacho concept",
    fare: "Meals",
    vendor: "Nothing but Nachos",
    vendorHint: "Second-level concourse",
    tags: [...NCAA_BB, "signature"]
  },
  {
    name: "Chicken Sandwich",
    fare: "Meals",
    vendor: "Allen Fieldhouse Concessions",
    vendorHint: "Main concourse",
    tags: [...NCAA_BB]
  },
  {
    name: "Hot Dog",
    fare: "Meals",
    vendor: "Allen Fieldhouse Concessions",
    vendorHint: "Main concourse",
    tags: [...NCAA_BB]
  },
  {
    name: "Larryville Links Sausage",
    description: "Local Lawrence sausage from OVG partner",
    fare: "Meals",
    vendor: "Larryville Links",
    vendorHint: "Grab-and-go station",
    tags: [...NCAA_BB, "local-vendor", "signature"]
  },
  {
    name: "Farm-to-Market Sandwich",
    fare: "Meals",
    vendor: "Farm-to-Market",
    vendorHint: "Second-level concourse",
    tags: [...NCAA_BB, "local-vendor"]
  },
  {
    name: "Fabulous Fish Sandwich",
    fare: "Meals",
    vendor: "Fabulous Fish",
    vendorHint: "Naismith Room kitchen",
    tags: [...NCAA_BB, "local-vendor"]
  },
  {
    name: "Rock Chalk Chicken Wrap",
    fare: "Meals",
    vendor: "Allen Fieldhouse Concessions",
    vendorHint: "Third-level concourse",
    tags: [...NCAA_BB, "signature"]
  },
  {
    name: "Personal Pizza",
    fare: "Meals",
    vendor: "Allen Fieldhouse Concessions",
    vendorHint: "Portable stands",
    tags: [...NCAA_BB]
  },
  {
    name: "Grilled Cheese",
    fare: "Meals",
    vendor: "Allen Fieldhouse Concessions",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB]
  },
  {
    name: "McLain's Bakery Cookie",
    fare: "Desserts",
    vendor: "McLain's Bakery",
    vendorHint: "Grab-and-go marketplace",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB, "local-vendor", "signature"]
  },
  {
    name: "Soft Pretzel",
    fare: "Meals",
    vendor: "Allen Fieldhouse Concessions",
    vendorHint: "Portable stands",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB]
  },
  {
    name: "Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "Allen Fieldhouse Concessions",
    vendorHint: "Main concourse",
    tags: [...NCAA_BB]
  },
  {
    name: "Veggie Wrap",
    fare: "Meals",
    vendor: "Allen Fieldhouse Concessions",
    vendorHint: "Third-level concourse",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB]
  },
  {
    name: "Smoked Turkey Sandwich",
    fare: "Meals",
    vendor: "Kuna Meats",
    vendorHint: "Naismith Room kitchen",
    tags: [...NCAA_BB, "local-vendor"]
  },
  {
    name: "Brownie",
    fare: "Desserts",
    vendor: "McLain's Bakery",
    vendorHint: "Grab-and-go marketplace",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB, "local-vendor"]
  },
  {
    name: "Phog Allen Burger",
    description: "Named for legendary Jayhawks coach Phog Allen",
    fare: "Meals",
    vendor: "Allen Fieldhouse Concessions",
    vendorHint: "Main concourse",
    tags: [...NCAA_BB, "signature"]
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

export async function parseAllenFieldhouseMenu(
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
