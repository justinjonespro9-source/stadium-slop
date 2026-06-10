/**
 * Frost Bank Center (San Antonio Spurs — NBA) menu parser.
 *
 * Curated from the official Frost Bank Center food & beverage page.
 * Concession stands are grouped by arena level (Charter, Plaza, Balcony).
 * Item names come from each stand's "Key Features" where specific foods
 * are listed; alcohol-only bars, generic snacks, and value-menu staples
 * are excluded.
 *
 * Source: https://www.frostbankcenter.com/plan-your-visit/food-beverage
 * Re-verify each season to pick up menu changes.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "frost-bank-center";
const VENUE_NAME = "Frost Bank Center";
const SOURCE_URL = "https://www.frostbankcenter.com/plan-your-visit/food-beverage";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function levelHint(level: string, section: string): string {
  return `${level} · Section ${section}`;
}

const MENU_DATA: RawItem[] = [
  // ── Charter Level ───────────────────────────────────────────────

  {
    name: "Brisket Tacos",
    fare: "Meals",
    vendor: "Davila's BBQ/Grab & Go",
    vendorHint: levelHint("Charter Level", "4/6"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Davila's Frito Pie",
    fare: "Meals",
    vendor: "Davila's BBQ/Grab & Go",
    vendorHint: levelHint("Charter Level", "4/6"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Loaded Brisket Papas",
    fare: "Meals",
    vendor: "Davila's BBQ/Grab & Go",
    vendorHint: levelHint("Charter Level", "4/6"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Cowboy Mac & Cheese",
    fare: "Meals",
    vendor: "Davila's BBQ/Grab & Go",
    vendorHint: levelHint("Charter Level", "4/6"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Elote in a Cup",
    fare: "Snacks",
    vendor: "Davila's BBQ/Grab & Go",
    vendorHint: levelHint("Charter Level", "4/6"),
    tags: ["nba", "local-vendor"]
  },

  {
    name: "Pizza by the Slice",
    fare: "Meals",
    vendor: "North Crust",
    vendorHint: levelHint("Charter Level", "26"),
    tags: ["nba"]
  },
  {
    name: "Chicken Parmesan Sandwich",
    fare: "Meals",
    vendor: "North Crust",
    vendorHint: levelHint("Charter Level", "26"),
    tags: ["nba"]
  },
  {
    name: "Meatball Sub Sandwich",
    fare: "Meals",
    vendor: "North Crust",
    vendorHint: levelHint("Charter Level", "26"),
    tags: ["nba"]
  },
  {
    name: "Caesar Salad",
    fare: "Meals",
    vendor: "North Crust",
    vendorHint: levelHint("Charter Level", "26"),
    tags: ["nba"]
  },
  {
    name: "Gelato",
    fare: "Desserts",
    vendor: "North Crust",
    vendorHint: levelHint("Charter Level", "26"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },

  {
    name: "Pizza by the Slice",
    fare: "Meals",
    vendor: "South Crust",
    vendorHint: levelHint("Charter Level", "2"),
    tags: ["nba"]
  },
  {
    name: "Chicken Parmesan Sandwich",
    fare: "Meals",
    vendor: "South Crust",
    vendorHint: levelHint("Charter Level", "2"),
    tags: ["nba"]
  },
  {
    name: "Meatball Sub Sandwich",
    fare: "Meals",
    vendor: "South Crust",
    vendorHint: levelHint("Charter Level", "2"),
    tags: ["nba"]
  },
  {
    name: "Caesar Salad",
    fare: "Meals",
    vendor: "South Crust",
    vendorHint: levelHint("Charter Level", "2"),
    tags: ["nba"]
  },
  {
    name: "Gelato",
    fare: "Desserts",
    vendor: "South Crust",
    vendorHint: levelHint("Charter Level", "2"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },

  {
    name: "Smashburger",
    fare: "Meals",
    vendor: "Roadhouse",
    vendorHint: levelHint("Charter Level", "24"),
    tags: ["nba"]
  },
  {
    name: "Premium Chicken Tenders",
    fare: "Meals",
    vendor: "Roadhouse",
    vendorHint: levelHint("Charter Level", "24"),
    tags: ["nba"]
  },
  {
    name: "Roadhouse Nachos",
    fare: "Snacks",
    vendor: "Roadhouse",
    vendorHint: levelHint("Charter Level", "24"),
    tags: ["nba"]
  },
  {
    name: "Ranch Chicken Sandwich",
    description: "Limited-time offer; availability varies by event",
    fare: "Meals",
    vendor: "Roadhouse",
    vendorHint: levelHint("Charter Level", "24"),
    tags: ["nba", "seasonal-lto"]
  },
  {
    name: "Grilled Sirloin Hoagie",
    description: "Limited-time offer; availability varies by event",
    fare: "Meals",
    vendor: "Roadhouse",
    vendorHint: levelHint("Charter Level", "24"),
    tags: ["nba", "seasonal-lto"]
  },

  {
    name: "Smashburger",
    fare: "Meals",
    vendor: "SA Grille",
    vendorHint: levelHint("Charter Level", "6"),
    tags: ["nba"]
  },
  {
    name: "Premium Chicken Tenders",
    fare: "Meals",
    vendor: "SA Grille",
    vendorHint: levelHint("Charter Level", "6"),
    tags: ["nba"]
  },
  {
    name: "SA Grille Nachos",
    fare: "Snacks",
    vendor: "SA Grille",
    vendorHint: levelHint("Charter Level", "6"),
    tags: ["nba"]
  },
  {
    name: "Ranch Chicken Sandwich",
    description: "Limited-time offer; availability varies by event",
    fare: "Meals",
    vendor: "SA Grille",
    vendorHint: levelHint("Charter Level", "6"),
    tags: ["nba", "seasonal-lto"]
  },
  {
    name: "Grilled Sirloin Hoagie",
    description: "Limited-time offer; availability varies by event",
    fare: "Meals",
    vendor: "SA Grille",
    vendorHint: levelHint("Charter Level", "6"),
    tags: ["nba", "seasonal-lto"]
  },

  {
    name: "Specialty Torta",
    fare: "Meals",
    vendor: "Spurs Street Eats",
    vendorHint: levelHint("Charter Level", "10"),
    tags: ["nba"]
  },
  {
    name: "Quesadilla",
    fare: "Meals",
    vendor: "Spurs Street Eats",
    vendorHint: levelHint("Charter Level", "10"),
    tags: ["nba"]
  },
  {
    name: "Mini Fish Tacos",
    fare: "Meals",
    vendor: "Spurs Street Eats",
    vendorHint: levelHint("Charter Level", "10"),
    tags: ["nba"]
  },
  {
    name: "Al Pastor Tacos",
    fare: "Meals",
    vendor: "Spurs Street Eats",
    vendorHint: levelHint("Charter Level", "10"),
    tags: ["nba"]
  },
  {
    name: "Bistec Street Taco",
    fare: "Meals",
    vendor: "Spurs Street Eats",
    vendorHint: levelHint("Charter Level", "10"),
    tags: ["nba"]
  },
  {
    name: "Beef Fajita Bowl",
    fare: "Meals",
    vendor: "Spurs Street Eats",
    vendorHint: levelHint("Charter Level", "10"),
    tags: ["nba"]
  },
  {
    name: "Chicken Fajita Bowl",
    fare: "Meals",
    vendor: "Spurs Street Eats",
    vendorHint: levelHint("Charter Level", "10"),
    tags: ["nba"]
  },
  {
    name: "Chicken Gordita",
    fare: "Meals",
    vendor: "Spurs Street Eats",
    vendorHint: levelHint("Charter Level", "10"),
    tags: ["nba"]
  },
  {
    name: "Beef Gordita",
    fare: "Meals",
    vendor: "Spurs Street Eats",
    vendorHint: levelHint("Charter Level", "10"),
    tags: ["nba"]
  },
  {
    name: "Spurs Ultimate Nacho Bowl",
    fare: "Meals",
    vendor: "Spurs Street Eats",
    vendorHint: levelHint("Charter Level", "10"),
    tags: ["nba"]
  },

  {
    name: "Milkshake",
    fare: "Desserts",
    vendor: "Sweet Spirits",
    vendorHint: levelHint("Charter Level", "4"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Sweet Spirits Dessert",
    description: "Desserts and cakes from Sweet Spirits",
    fare: "Desserts",
    vendor: "Sweet Spirits",
    vendorHint: levelHint("Charter Level", "4"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },

  // ── Plaza Level ─────────────────────────────────────────────────

  {
    name: "Specialty Sausage",
    description: "Alamo City Grill specialty sausages",
    fare: "Meals",
    vendor: "Alamo City Grill",
    vendorHint: levelHint("Plaza Level", "112"),
    tags: ["nba"]
  },
  {
    name: "Specialty Beignets",
    fare: "Desserts",
    vendor: "Beignet Stand",
    vendorHint: levelHint("Plaza Level", "121"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Specialty Cheeseburger",
    fare: "Meals",
    vendor: "Burger Kitchen",
    vendorHint: levelHint("Plaza Level", "105"),
    tags: ["nba"]
  },
  {
    name: "Premium Chicken Tenders",
    fare: "Meals",
    vendor: "Burger Kitchen",
    vendorHint: levelHint("Plaza Level", "105"),
    tags: ["nba"]
  },
  {
    name: "Cookie",
    fare: "Desserts",
    vendor: "Cookies & Creamery",
    vendorHint: levelHint("Plaza Level", "111"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Sundae",
    fare: "Desserts",
    vendor: "Cookies & Creamery",
    vendorHint: levelHint("Plaza Level", "111"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Cookie Sandwich",
    fare: "Desserts",
    vendor: "Cookies & Creamery",
    vendorHint: levelHint("Plaza Level", "111"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Fruit Cup",
    fare: "Snacks",
    vendor: "Fruit Cup/Cocktail Bar",
    vendorHint: levelHint("Plaza Level", "126"),
    dietary: ["Vegetarian", "Vegan"],
    tags: ["nba"]
  },
  {
    name: "Mangonada",
    fare: "Desserts",
    vendor: "Fruit Cup/Cocktail Bar",
    vendorHint: levelHint("Plaza Level", "126"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Pizza Hut Pizza",
    fare: "Meals",
    vendor: "Pizza Hut",
    vendorHint: levelHint("Plaza Level", "110"),
    tags: ["nba"]
  },
  {
    name: "Pizza Hut Chicken Wings",
    fare: "Meals",
    vendor: "Pizza Hut",
    vendorHint: levelHint("Plaza Level", "110"),
    tags: ["nba"]
  },
  {
    name: "Pizza Hut Breadsticks",
    fare: "Snacks",
    vendor: "Pizza Hut",
    vendorHint: levelHint("Plaza Level", "110"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Bunz Burger",
    description: "Bunz Burgers by Chef Thierry at SA Central",
    fare: "Meals",
    vendor: "SA Central",
    vendorHint: levelHint("Plaza Level", "107"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Fruteria",
    description: "Fruteria by Chef Johnny Hernandez at SA Central",
    fare: "Snacks",
    vendor: "SA Central",
    vendorHint: levelHint("Plaza Level", "107"),
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Shuck Shack Oysters",
    description: "Shuck Shack at SA Central; availability varies",
    fare: "Meals",
    vendor: "SA Central",
    vendorHint: levelHint("Plaza Level", "107"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Two Brothers BBQ",
    description: "Two Brothers BBQ by Chef Jason Dady at SA Central",
    fare: "Meals",
    vendor: "SA Central",
    vendorHint: levelHint("Plaza Level", "107"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Beef Bulgogi Bowl",
    fare: "Meals",
    vendor: "Seoul Stop",
    vendorHint: levelHint("Plaza Level", "121"),
    tags: ["nba"]
  },
  {
    name: "Chicken Bulgogi Bowl",
    fare: "Meals",
    vendor: "Seoul Stop",
    vendorHint: levelHint("Plaza Level", "121"),
    tags: ["nba"]
  },
  {
    name: "Tofu Bulgogi Bowl",
    fare: "Meals",
    vendor: "Seoul Stop",
    vendorHint: levelHint("Plaza Level", "121"),
    dietary: ["Vegetarian", "Vegan"],
    tags: ["nba"]
  },
  {
    name: "Burrito Bowl",
    fare: "Meals",
    vendor: "Super Bien",
    vendorHint: levelHint("Plaza Level", "117"),
    tags: ["nba"]
  },
  {
    name: "Premium Chicken Tenders",
    fare: "Meals",
    vendor: "Tenders, Love, & Chicken",
    vendorHint: levelHint("Plaza Level", "121"),
    tags: ["nba"]
  },
  {
    name: "Ultra Club Burger",
    fare: "Meals",
    vendor: "Ultra Club",
    vendorHint: levelHint("Plaza Level", "116"),
    tags: ["nba"]
  },
  {
    name: "Ultra Club Sandwich",
    fare: "Meals",
    vendor: "Ultra Club",
    vendorHint: levelHint("Plaza Level", "116"),
    tags: ["nba"]
  },
  {
    name: "Cheese Curds",
    fare: "Snacks",
    vendor: "Ultra Club",
    vendorHint: levelHint("Plaza Level", "116"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Brisket Nachos",
    fare: "Meals",
    vendor: "Ultra Club",
    vendorHint: levelHint("Plaza Level", "116"),
    tags: ["nba"]
  },
  {
    name: "Fry Basket",
    fare: "Snacks",
    vendor: "Ultra Club",
    vendorHint: levelHint("Plaza Level", "116"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Whataburger",
    fare: "Meals",
    vendor: "Whataburger",
    vendorHint: levelHint("Plaza Level", "121/122"),
    tags: ["nba"]
  },
  {
    name: "Whataburger Chicken Sandwich",
    fare: "Meals",
    vendor: "Whataburger",
    vendorHint: levelHint("Plaza Level", "121/122"),
    tags: ["nba"]
  },
  {
    name: "Whataburger Salad",
    fare: "Meals",
    vendor: "Whataburger",
    vendorHint: levelHint("Plaza Level", "121/122"),
    tags: ["nba"]
  },
  {
    name: "Whataburger Chicken Tenders",
    fare: "Meals",
    vendor: "Whataburger",
    vendorHint: levelHint("Plaza Level", "121/122"),
    tags: ["nba"]
  },

  // ── Balcony Level ───────────────────────────────────────────────

  {
    name: "Specialty Sausage",
    description: "Alamo City Grill specialty sausages",
    fare: "Meals",
    vendor: "Alamo City Grill",
    vendorHint: levelHint("Balcony Level", "208"),
    tags: ["nba"]
  },
  {
    name: "Burgerteca Specialty Burger",
    fare: "Meals",
    vendor: "Burgerteca",
    vendorHint: levelHint("Balcony Level", "201A"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Mexican Street Dog",
    fare: "Meals",
    vendor: "Burgerteca",
    vendorHint: levelHint("Balcony Level", "201A"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Burgerteca Specialty Fries",
    fare: "Snacks",
    vendor: "Burgerteca",
    vendorHint: levelHint("Balcony Level", "201A"),
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Burgerteca Nachos",
    fare: "Snacks",
    vendor: "Burgerteca",
    vendorHint: levelHint("Balcony Level", "201A"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Mangonada Soft-Serve",
    fare: "Desserts",
    vendor: "Burgerteca",
    vendorHint: levelHint("Balcony Level", "201A"),
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor"]
  },
  {
    name: "La Gloria Tacos",
    fare: "Meals",
    vendor: "La Gloria",
    vendorHint: levelHint("Balcony Level", "231"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "La Gloria Nachos",
    fare: "Snacks",
    vendor: "La Gloria",
    vendorHint: levelHint("Balcony Level", "231"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "La Gloria Quesadilla",
    fare: "Meals",
    vendor: "La Gloria",
    vendorHint: levelHint("Balcony Level", "231"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Carne Asada Fries",
    fare: "Meals",
    vendor: "La Gloria",
    vendorHint: levelHint("Balcony Level", "231"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "La Gloria Chopped Salad",
    fare: "Meals",
    vendor: "La Gloria",
    vendorHint: levelHint("Balcony Level", "231"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Elote",
    fare: "Snacks",
    vendor: "La Gloria",
    vendorHint: levelHint("Balcony Level", "231"),
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Pizza Hut Pizza",
    fare: "Meals",
    vendor: "Pizza Hut",
    vendorHint: levelHint("Balcony Level", "206"),
    tags: ["nba"]
  },
  {
    name: "Pizza Hut Chicken Wings",
    fare: "Meals",
    vendor: "Pizza Hut",
    vendorHint: levelHint("Balcony Level", "206"),
    tags: ["nba"]
  },
  {
    name: "Pizza Hut Breadsticks",
    fare: "Snacks",
    vendor: "Pizza Hut",
    vendorHint: levelHint("Balcony Level", "206"),
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Premium Chicken Tenders",
    fare: "Meals",
    vendor: "Tenders, Love, & Chicken",
    vendorHint: levelHint("Balcony Level", "215"),
    tags: ["nba"]
  },

  // ── Spurs Culinary Residency (named vendors only) ───────────────

  {
    name: "DonutNV Donuts",
    description: "Rotating Spurs Culinary Residency vendor; menu varies by event",
    fare: "Desserts",
    vendor: "Spurs Culinary Residency",
    vendorHint: levelHint("Balcony Level", "217"),
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor", "culinary-residency"]
  },
  {
    name: "Crepelandia210 Crepes",
    description: "Rotating Spurs Culinary Residency vendor; menu varies by event",
    fare: "Meals",
    vendor: "Spurs Culinary Residency",
    vendorHint: levelHint("Balcony Level", "217"),
    tags: ["nba", "local-vendor", "culinary-residency"]
  },
  {
    name: "Tacos Al Carbon Cabron Street Tacos",
    description: "Rotating Spurs Culinary Residency vendor; menu varies by event",
    fare: "Meals",
    vendor: "Spurs Culinary Residency",
    vendorHint: levelHint("Balcony Level", "217"),
    tags: ["nba", "local-vendor", "culinary-residency"]
  },
  {
    name: "The Purple Pig BBQ Plate",
    description: "Rotating Spurs Culinary Residency vendor; menu varies by event",
    fare: "Meals",
    vendor: "Spurs Culinary Residency",
    vendorHint: levelHint("Balcony Level", "217"),
    tags: ["nba", "local-vendor", "culinary-residency"]
  }
];

function mergeVendorHints(a?: string, b?: string): string | undefined {
  if (!a) {
    return b;
  }
  if (!b || a.includes(b)) {
    return a;
  }
  if (b.includes(a)) {
    return b;
  }
  return `${a}; ${b}`;
}

/** Collapse duplicate item names; merge stand locations and prefer first vendor label. */
function dedupeMenuItems(rawItems: RawItem[]): RawItem[] {
  const byName = new Map<string, RawItem>();

  for (const item of rawItems) {
    const key = normalizeMenuItemName(item.name);
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, { ...item });
      continue;
    }

    byName.set(key, {
      ...existing,
      vendorHint: mergeVendorHints(existing.vendorHint, item.vendorHint),
      vendor: existing.vendor ?? item.vendor,
      description: existing.description ?? item.description,
      tags: [...new Set([...(existing.tags ?? []), ...(item.tags ?? [])])]
    });
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

export async function parseFrostBankCenterMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;
  const deduped = dedupeMenuItems(MENU_DATA);
  const items: VenueMenuSourceItem[] = deduped.map(toSourceItem);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}

export const FROST_BANK_CENTER_MENU_ITEM_COUNT = MENU_DATA.length;
export const FROST_BANK_CENTER_DEDUPED_ITEM_COUNT = dedupeMenuItems(MENU_DATA).length;
