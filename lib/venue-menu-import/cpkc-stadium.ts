/**
 * CPKC Stadium (Kansas City Current — NWSL) menu parser.
 *
 * Curated from the official CPKC Stadium matchday menu and KC Current partner
 * announcements. Generic popcorn/kettle corn, Amazon markets, and beer-only rows excluded.
 *
 * Sources:
 *   https://cpkcstadium.com/food-and-drink-menu
 *   https://www.kansascitycurrent.com/news/kansas-city-current-announces-babas-pantry-as-new-culinary-p
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

const VENUE_SLUG = "cpkc-stadium";
const VENUE_NAME = "CPKC Stadium";
const SOURCE_URL = "https://cpkcstadium.com/food-and-drink-menu";

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
    name: "Joe's KC Z-Man Brisket Sandwich",
    description: "Brisket, provolone, and onion rings on a Kaiser roll",
    fare: "Meals",
    vendor: "Joe's Kansas City BBQ",
    vendorHint: sectionHint("122"),
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Joe's KC Z-Man Chicken Sandwich",
    fare: "Meals",
    vendor: "Joe's Kansas City BBQ",
    vendorHint: sectionHint("122"),
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Baba's World-Famous Hummus and Pita Chips",
    fare: "Meals",
    vendor: "Baba's Pantry",
    vendorHint: sectionHint("123"),
    dietary: ["Vegetarian"],
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Bambi's Mini Nachos",
    description: "Chicken shawarma, torshi, and yogurt sauce on fresh tortilla chips",
    fare: "Meals",
    vendor: "Baba's Pantry",
    vendorHint: sectionHint("123"),
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Bambi's Vegetarian Mini Nachos",
    fare: "Meals",
    vendor: "Baba's Pantry",
    vendorHint: sectionHint("123"),
    dietary: ["Vegetarian"],
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Billie's Grocery KC Current Bowl",
    fare: "Meals",
    vendor: "Billie's Grocery",
    vendorHint: sectionHint("128"),
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Billie's Grocery Sesame Chicken Salad Bowl",
    fare: "Meals",
    vendor: "Billie's Grocery",
    vendorHint: sectionHint("128"),
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Billie's Grocery Reuben Wrap",
    fare: "Meals",
    vendor: "Billie's Grocery",
    vendorHint: sectionHint("128"),
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Room 39 Pork and Pozole",
    fare: "Meals",
    vendor: "Room 39",
    vendorHint: sectionHint("123"),
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Room 39 Arancini al Telefono",
    fare: "Meals",
    vendor: "Room 39",
    vendorHint: sectionHint("123"),
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Martin City Pizza Slice",
    fare: "Meals",
    vendor: "Martin City Brewing Company & Pizza",
    vendorHint: sectionHint("127"),
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Yoli Tortilleria Loaded Nachos",
    fare: "Meals",
    vendor: "Yoli Tortilleria",
    vendorHint: `${sectionHint("133")}; ${sectionHint("100")}`,
    tags: ["nwsl", "local-vendor", "signature"]
  },
  {
    name: "Yoli Tortilleria Flautas Veganas",
    fare: "Meals",
    vendor: "Yoli Tortilleria",
    vendorHint: sectionHint("133"),
    dietary: ["Vegan"],
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Yoli Tortilleria Burrito",
    fare: "Meals",
    vendor: "Yoli Tortilleria",
    vendorHint: sectionHint("133"),
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Ruby Jean's Acai Bowl",
    fare: "Meals",
    vendor: "Ruby Jean's Juicery",
    vendorHint: sectionHint("132"),
    dietary: ["Vegan"],
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Ruby Jean's Sweet Potato Brownie",
    fare: "Desserts",
    vendor: "Ruby Jean's Juicery",
    vendorHint: sectionHint("132"),
    dietary: ["Vegetarian"],
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Lulu's Thai Noodle Shop Yum Nua",
    fare: "Meals",
    vendor: "Lulu's Thai Noodle Shop",
    vendorHint: sectionHint("132"),
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Lulu's Thai Noodle Shop Laab Salad",
    fare: "Meals",
    vendor: "Lulu's Thai Noodle Shop",
    vendorHint: sectionHint("132"),
    tags: ["nwsl", "local-vendor"]
  },
  {
    name: "Got Game Grill Black Bean Burger",
    fare: "Meals",
    vendor: "Got Game Grill",
    vendorHint: `${sectionHint("108")}; ${sectionHint("133")}`,
    dietary: ["Vegetarian"],
    tags: ["nwsl"]
  },
  {
    name: "Got Game Grill Chicken Tenders",
    fare: "Meals",
    vendor: "Got Game Grill",
    vendorHint: `${sectionHint("108")}; ${sectionHint("133")}`,
    tags: ["nwsl"]
  },
  {
    name: "Corner Kick Market Vegan Quesadilla Crunch Wrap",
    fare: "Meals",
    vendor: "Corner Kick Market",
    vendorHint: sectionHint("100"),
    dietary: ["Vegan"],
    tags: ["nwsl"]
  },
  {
    name: "High Hopes Ice Cream Cup",
    fare: "Desserts",
    vendor: "High Hopes Ice Cream",
    vendorHint: `${sectionHint("111")}; ${sectionHint("124")}`,
    dietary: ["Vegetarian"],
    tags: ["nwsl", "local-vendor"]
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

export async function parseCpkcStadiumMenu(
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
