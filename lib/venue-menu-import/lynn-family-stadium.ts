/**
 * Lynn Family Stadium (Louisville City FC / Racing Louisville — MLS/NWSL) menu parser.
 *
 * Curated from official Louisville City 2026 stadium announcements and Levy
 * concessions updates. Alcohol bars, craft soda/mocktail bars, grab-and-go
 * markets, generic popcorn, and beverages excluded.
 *
 * Sources:
 *   https://www.loucity.com/news/2026/03/12/heres-whats-new-at-lynn-family-stadium-in-2026/
 *   https://lynnfamilystadium.com/atoz/
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

const VENUE_SLUG = "lynn-family-stadium";
const VENUE_NAME = "Lynn Family Stadium";
const SOURCE_URL =
  "https://www.loucity.com/news/2026/03/12/heres-whats-new-at-lynn-family-stadium-in-2026/";

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
    name: "PARLOUR Cheese Pizza",
    fare: "Meals",
    vendor: "PARLOUR Pizza",
    vendorHint: "West Concourse",
    tags: ["mls", "nwsl", "local-vendor", "signature"]
  },
  {
    name: "PARLOUR Pepperoni Pizza",
    fare: "Meals",
    vendor: "PARLOUR Pizza",
    vendorHint: "West Concourse",
    tags: ["mls", "nwsl", "local-vendor"]
  },
  {
    name: "PARLOUR Sausage Pizza",
    fare: "Meals",
    vendor: "PARLOUR Pizza",
    vendorHint: "West Concourse",
    tags: ["mls", "nwsl", "local-vendor"]
  },
  {
    name: "PARLOUR Smoked Chicken Tenders",
    fare: "Meals",
    vendor: "PARLOUR Pizza",
    vendorHint: "West Concourse",
    tags: ["mls", "nwsl", "local-vendor", "signature"]
  },
  {
    name: "Gustavo's Mexican Grill Burrito Bowl",
    fare: "Meals",
    vendor: "Gustavo's Mexican Grill",
    vendorHint: "West Concourse",
    tags: ["mls", "nwsl", "local-vendor", "signature"]
  },
  {
    name: "Gustavo's Street Tacos",
    fare: "Meals",
    vendor: "Gustavo's Mexican Grill",
    vendorHint: "West Concourse",
    tags: ["mls", "nwsl", "local-vendor"]
  },
  {
    name: "Queso Fundido Nachos",
    fare: "Meals",
    vendor: "Lynn Family Stadium Concessions",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl", "signature"]
  },
  {
    name: "BBQ Philly Cheesesteak",
    fare: "Meals",
    vendor: "Lynn Family Stadium Concessions",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl", "signature", "local-vendor"]
  },
  {
    name: "Chicken Bacon Ranch Cheesesteak",
    fare: "Meals",
    vendor: "Lynn Family Stadium Concessions",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Black Bean Burger",
    fare: "Meals",
    vendor: "Lynn Family Stadium Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "The Funky Lou",
    description: "Harissa sloppy joe with pimento cheese",
    fare: "Meals",
    vendor: "Levy Concessions",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl", "local-vendor", "signature"]
  },
  {
    name: "Derby City Dog",
    description: "Jumbo hot dog with cream cheese, grilled onions, and chow chow",
    fare: "Meals",
    vendor: "Levy Concessions",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl", "local-vendor", "signature"]
  },
  {
    name: "Patty Melt",
    description: "Double patty with Swiss and caramelized onions on rye",
    fare: "Meals",
    vendor: "Levy Concessions",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl"]
  },
  {
    name: "S'mores Nachos",
    description: "Dessert nachos with marshmallow and chocolate",
    fare: "Desserts",
    vendor: "Levy Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "signature"]
  },
  {
    name: "Martin's Bar-B-Que Sandwich",
    fare: "Meals",
    vendor: "Martin's Bar-B-Que Joint",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl", "local-vendor", "signature"]
  },
  {
    name: "I Love Tacos Street Tacos",
    fare: "Meals",
    vendor: "I Love Tacos",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl", "local-vendor", "signature"]
  },
  {
    name: "Signature Smash Burger",
    description: "Rotating signature smash burger on the concourse",
    fare: "Meals",
    vendor: "Lynn Family Stadium Concessions",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl", "signature"]
  },
  {
    name: "Signature Chicken Sandwich",
    description: "Rotating signature chicken sandwich",
    fare: "Meals",
    vendor: "Lynn Family Stadium Concessions",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Value Menu Cheeseburger",
    fare: "Meals",
    vendor: "Levy Concessions",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Value Menu Chicken Sandwich",
    fare: "Meals",
    vendor: "Levy Concessions",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Value Menu Hot Dog",
    fare: "Meals",
    vendor: "Levy Concessions",
    vendorHint: "Main Concourse",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Philly's Best Frozen Dessert",
    fare: "Desserts",
    vendor: "Philly's Best Frozen Desserts",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "local-vendor"]
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

export async function parseLynnFamilyStadiumMenu(
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
