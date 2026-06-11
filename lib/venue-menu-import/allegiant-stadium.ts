/**
 * Allegiant Stadium (Las Vegas Raiders — NFL) menu parser.
 *
 * Curated from official Raiders concessions coverage and league import data.
 * Alcohol bars, frictionless markets, and beverage-only rows excluded.
 *
 * Source: https://www.raiders.com/stadium/food-beverage
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

const VENUE_SLUG = "allegiant-stadium";
const VENUE_NAME = "Allegiant Stadium";
const SOURCE_URL = "https://www.raiders.com/stadium/food-beverage";

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
    name: "Tailgater Trash Can Nachos",
    description: "Brisket nachos served under a lifted trash can reveal",
    fare: "Meals",
    vendor: "Guy Fieri's",
    vendorHint: sectionHint("136"),
    tags: ["nfl", "signature"]
  },
  {
    name: "The \"Black Hole\" Burger",
    description: "Wagyu patty with squid-ink black cheese on charcoal bun",
    fare: "Meals",
    vendor: "Fukuburger",
    vendorHint: sectionHint("121"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Fukuburger",
    description: "All-American burger with Japanese soul",
    fare: "Meals",
    vendor: "Fukuburger",
    vendorHint: sectionHint("121"),
    tags: ["nfl", "local-vendor"]
  },
  {
    name: "Tamago Burger",
    description: "Fried egg and furikake-topped Fukuburger cult favorite",
    fare: "Meals",
    vendor: "Fukuburger",
    vendorHint: sectionHint("121"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Lobster Roll Fries",
    description: "Fries topped with Maine lobster and tarragon aioli",
    fare: "Meals",
    vendor: "Allegiant Stadium Concessions",
    vendorHint: sectionHint("114"),
    tags: ["nfl", "signature"]
  },
  {
    name: "Wagyu Steak Sandwich",
    description: "Shaved wagyu with truffle onions and Gruyère",
    fare: "Meals",
    vendor: "Shift4 Club",
    vendorHint: "Club Level",
    tags: ["nfl", "signature"]
  },
  {
    name: "Pizza Rock by Tony Gemignani",
    description: "Award-winning New Yorker and Margherita slices",
    fare: "Meals",
    vendor: "Pizza Rock",
    vendorHint: sectionHint("118") + "; " + sectionHint("140"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Pizza Rock Margherita Slice",
    fare: "Meals",
    vendor: "Pizza Rock",
    vendorHint: sectionHint("118"),
    tags: ["nfl", "local-vendor"]
  },
  {
    name: "Rollin' Smoke BBQ",
    description: "Local Las Vegas BBQ institution",
    fare: "Meals",
    vendor: "Rollin' Smoke BBQ",
    vendorHint: sectionHint("124") + "; " + sectionHint("312"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Chopped Brisket Sandwich",
    fare: "Meals",
    vendor: "Rollin' Smoke BBQ",
    vendorHint: sectionHint("124"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Outlaw Fries",
    description: "Fries loaded with smoked meats and toppings",
    fare: "Meals",
    vendor: "Rollin' Smoke BBQ",
    vendorHint: sectionHint("312"),
    tags: ["nfl", "local-vendor"]
  },
  {
    name: "Ferraro's Italian Street Eats",
    description: "Meatball subs and Italian sausage with peppers",
    fare: "Meals",
    vendor: "Ferraro's Italian Street Eats",
    vendorHint: sectionHint("328"),
    tags: ["nfl", "local-vendor"]
  },
  {
    name: "Ferraro's Meatball Sub",
    fare: "Meals",
    vendor: "Ferraro's Italian Street Eats",
    vendorHint: sectionHint("328"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Piña",
    description: "Upscale Mexican street food stand",
    fare: "Meals",
    vendor: "Piña",
    vendorHint: sectionHint("104"),
    tags: ["nfl", "local-vendor"]
  },
  {
    name: "Piña Al Pastor Tacos",
    fare: "Meals",
    vendor: "Piña",
    vendorHint: sectionHint("104"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Smashed Avocado Nachos",
    fare: "Meals",
    vendor: "Piña",
    vendorHint: sectionHint("104"),
    dietary: ["Vegetarian"],
    tags: ["nfl", "local-vendor"]
  },
  {
    name: "Vegan \"Trash Can\" Nachos",
    description: "Plant-based version with smoked jackfruit",
    fare: "Meals",
    vendor: "Guy Fieri's",
    vendorHint: "100 Level",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["nfl", "signature"]
  },
  {
    name: "Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "Allegiant Stadium Concessions",
    vendorHint: sectionHint("206"),
    tags: ["nfl"]
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

export async function parseAllegiantStadiumMenu(
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
