/**
 * Northwestern Medicine Field at Martin Stadium (Chicago Stars FC — NWSL) menu parser.
 *
 * Curated from Northwestern Athletics food truck announcements and Chicago Stars
 * matchday fan zone coverage. Alcohol bars and brewery rows excluded.
 *
 * Sources:
 *   https://nusports.com/news/2024/8/30/general-northwestern-athletics-announces-expanded-food-and-beverage-options-at-northwestern-medicine-field-at-martin-stadium
 *   https://chicagostars.com/matchday-guide/
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

const VENUE_SLUG = "northwestern-medicine-field-at-martin-stadium";
const VENUE_NAME = "Northwestern Medicine Field at Martin Stadium";
const SOURCE_URL =
  "https://nusports.com/news/2024/8/30/general-northwestern-athletics-announces-expanded-food-and-beverage-options-at-northwestern-medicine-field-at-martin-stadium";

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
    name: "Soul & Smoke",
    description: "Chicago BBQ food truck at north and west stadium ends",
    fare: "Meals",
    vendor: "Soul & Smoke",
    vendorHint: "North Fan Zone",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Soul & Smoke Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Soul & Smoke",
    vendorHint: "North Fan Zone",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Soul & Smoke Brisket Plate",
    fare: "Meals",
    vendor: "Soul & Smoke",
    vendorHint: "North Fan Zone",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "La Cocinita",
    description: "Venezuelan-inspired Latin American street food",
    fare: "Meals",
    vendor: "La Cocinita",
    vendorHint: "West end food trucks",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "La Cocinita Arepas",
    fare: "Meals",
    vendor: "La Cocinita",
    vendorHint: "West end food trucks",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Cheesie's Pub & Grub",
    description: "Grilled cheese specialist food truck",
    fare: "Meals",
    vendor: "Cheesie's Pub & Grub",
    vendorHint: "North Fan Zone",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Cheesie's Signature Grilled Cheese",
    fare: "Meals",
    vendor: "Cheesie's Pub & Grub",
    vendorHint: "North Fan Zone",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Vienna Beef Hot Dogs",
    fare: "Meals",
    vendor: "Vienna Beef",
    vendorHint: "South Fan Zone",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Chicago-Style Vienna Beef Dog",
    description: "Mustard, relish, onions, tomato, pickle, sport peppers",
    fare: "Meals",
    vendor: "Vienna Beef",
    vendorHint: "South Fan Zone",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Serna's Italian Beef Sandwich",
    fare: "Meals",
    vendor: "Serna's Grill",
    vendorHint: "West end food trucks",
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Flash Taco Street Tacos",
    fare: "Meals",
    vendor: "Flash Taco",
    vendorHint: "West end food trucks",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Tacomotora Street Tacos",
    fare: "Meals",
    vendor: "Tacomotora",
    vendorHint: "North Fan Zone",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Billy Bricks Wood-Fired Pizza Slice",
    fare: "Meals",
    vendor: "Billy Bricks",
    vendorHint: "North Fan Zone",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Clucker's Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Clucker's",
    vendorHint: "North Fan Zone",
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Elephant and Vine Avocado Toast",
    fare: "Meals",
    vendor: "Elephant and Vine",
    vendorHint: "South Fan Zone",
    dietary: ["Vegetarian"],
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Rainbow Cone Ice Cream",
    description: "Classic Chicago rainbow ice cream",
    fare: "Desserts",
    vendor: "Rainbow Cone",
    vendorHint: "West end food trucks",
    dietary: ["Vegetarian"],
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Stadium Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "Martin Stadium Concessions",
    vendorHint: "South Fan Zone",
    tags: ["nwsl"]
  },
  {
    name: "Loaded Nachos",
    fare: "Meals",
    vendor: "Martin Stadium Concessions",
    vendorHint: "South Fan Zone",
    tags: ["nwsl"]
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

export async function parseNorthwesternMedicineFieldAtMartinStadiumMenu(
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
