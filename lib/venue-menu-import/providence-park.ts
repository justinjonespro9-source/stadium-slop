/**
 * Providence Park (Portland Timbers — MLS, Portland Thorns FC — NWSL) menu parser.
 *
 * Menu data curated from the PTFCmap interactive stadium guide (Wayfyndr API),
 * which exposes per-location HTML menus when loaded in-browser. The public
 * concessions map at ptfcmap.com does not render item lists in static HTML.
 *
 * Cross-referenced with official 2026 Timbers announcements for new items
 * (Decade Dogs, Classic Beef Nachos, Plant-Based Nachos, etc.).
 *
 * Vendor/stand names are stored as vendorName metadata only.
 * Generic candy/chips, popcorn, condiment add-ons, and beverages excluded.
 *
 * Sources:
 *   https://www.ptfcmap.com/map?c=1
 *   https://www.timbers.com/news/what-s-new-at-providence-park-in-2026
 *
 * Re-verify each season — menus are loaded dynamically from Wayfyndr.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "providence-park";
const VENUE_NAME = "Providence Park";
const SOURCE_URL = "https://www.ptfcmap.com/map?c=1";

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
  // ── 2026 New Items (official announcement + map) ────────────────
  // Decade Dogs omitted — already ACTIVE in DB (prior import, name "\"Decade Dogs\"").

  {
    name: "Shoyu Chicken Bowl",
    fare: "Meals",
    vendor: "North End Eats",
    vendorHint: "Near Section 107",
    tags: ["mls", "nwsl", "new-in-2026", "local-specialty"]
  },
  {
    name: "Big Kahuna Bowl",
    fare: "Meals",
    vendor: "North End Eats",
    vendorHint: "Near Section 107",
    tags: ["mls", "nwsl", "new-in-2026", "local-specialty"]
  },
  {
    name: "Carnitas Fries",
    fare: "Snacks",
    vendor: "Modelo Mercado - Brews & Bites",
    vendorHint: "Near Section 99",
    tags: ["mls", "nwsl", "new-in-2026", "local-specialty"]
  },
  {
    name: "Esquite Fries",
    description: "Elote off-the-cob fries; new for 2026",
    fare: "Snacks",
    vendor: "Modelo Mercado - Brews & Bites",
    vendorHint: "Near Section 99",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "new-in-2026", "local-specialty"]
  },

  // ── Hawaiian / Poke (Box to Box, North End Eats) ────────────────

  {
    name: "Kalua Pork Bowl",
    fare: "Meals",
    vendorHint: "Box to Box Hawaiian Bowls (Sec. 118), North End Eats (Sec. 107)",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Beet Poke Bowl",
    fare: "Meals",
    vendorHint: "Box to Box Hawaiian Bowls (Sec. 118), North End Eats (Sec. 107)",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Ahi Tuna Poke Bowl",
    fare: "Meals",
    vendorHint: "Box to Box Hawaiian Bowls (Sec. 118), North End Eats (Sec. 107)",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Spam Musubi",
    fare: "Snacks",
    vendorHint: "Box to Box Hawaiian Bowls (Sec. 118), North End Eats (Sec. 107)",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Hawaiian Shave Ice",
    fare: "Desserts",
    vendor: "Fusion Shave Ice",
    vendorHint: "Near Section 96",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Killer Burger ───────────────────────────────────────────────

  {
    name: "Classic Burger",
    fare: "Meals",
    vendor: "Killer Burger",
    vendorHint: "Near Section 93",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Peanut Butter Pickle Bacon Burger",
    fare: "Meals",
    vendor: "Killer Burger",
    vendorHint: "Near Section 93",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Striker Burger",
    fare: "Meals",
    vendor: "Killer Burger",
    vendorHint: "Near Section 93",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Pizzicato ───────────────────────────────────────────────────

  {
    name: "Cheese Pizza Slice",
    fare: "Meals",
    vendor: "Pizzicato",
    vendorHint: "Near Section 119, East Vista",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Pepperoni Pizza Slice",
    fare: "Meals",
    vendor: "Pizzicato",
    vendorHint: "Near Section 119, East Vista",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Cha Cha Cha ─────────────────────────────────────────────────

  {
    name: "Bean and Cheese Burrito",
    fare: "Meals",
    vendor: "Cha Cha Cha",
    vendorHint: "Near Section 117",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Chips and Guacamole",
    fare: "Snacks",
    vendor: "Cha Cha Cha",
    vendorHint: "Sections 96, 117",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Roasted Salsa and Chips",
    fare: "Snacks",
    vendor: "Cha Cha Cha",
    vendorHint: "Near Section 117",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "nwsl"]
  },

  // ── Nachos ──────────────────────────────────────────────────────

  {
    name: "Loaded BBQ Nachos",
    fare: "Snacks",
    vendorHint: "Loaded Nachos (Sec. 108), Nacho Box (Sec. 98)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Beef Nachos",
    description: "Classic beef nachos; new for 2026 per club announcement",
    fare: "Snacks",
    vendor: "Loaded Nachos",
    vendorHint: "Near Section 108",
    tags: ["mls", "nwsl", "new-in-2026"]
  },
  {
    name: "Plant-Based Nachos",
    description: "Vegan nachos; listed as Vegan Nacho on PTFCmap",
    fare: "Snacks",
    vendor: "Loaded Nachos",
    vendorHint: "Near Section 108",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["mls", "nwsl", "new-in-2026"]
  },
  {
    name: "Blanco Queso Nachos",
    fare: "Snacks",
    vendor: "Loaded Nachos",
    vendorHint: "Near Section 108",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Hawaiian Nachos",
    fare: "Snacks",
    vendorHint: "Nacho Box (Sec. 98), North End Eats (Sec. 107)",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Modelo Mercado ──────────────────────────────────────────────

  {
    name: "Chicken Tenders with Waffle Fries",
    fare: "Meals",
    vendor: "Modelo Mercado - Brews & Bites",
    vendorHint: "Near Section 99",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Churro Grande",
    fare: "Desserts",
    vendor: "Modelo Mercado - Brews & Bites",
    vendorHint: "Near Section 99",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Zenner's / Hot Dogs ─────────────────────────────────────────

  {
    name: "Zenner's Hot Dog",
    description: "Portland staple — available at stands throughout the stadium",
    fare: "Meals",
    vendorHint:
      "Zenner's stands (Sec. 96, 97, 116, South Side), Soccer City Classics (Sec. 121), Tillamook Melt (Sec. 103), and more",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Field Roast Vegan Dog",
    fare: "Meals",
    vendorHint:
      "Zenner's stands, Soccer City Classics (Sec. 121), Tillamook Melt (Sec. 103), North End Eats (Sec. 107)",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Bier Brat",
    fare: "Meals",
    vendor: "Zenner's Sausage Stand",
    vendorHint: "Near Section 96",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Footlong Zenner's Dog",
    description: "Half-pound footlong with optional rotating topping",
    fare: "Meals",
    vendorHint: "Zenner's Sausage Stand (Sec. 96), Soccer City Classics (Sec. 121)",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Pigs in Blanket",
    fare: "Snacks",
    vendorHint: "Zenner's Sausage Stand (Sec. 96), Soccer City Classics (Sec. 121)",
    tags: ["mls", "nwsl"]
  },

  // ── Grab n' Go / Pub ──────────────────────────────────────────────

  {
    name: "Jalapeno Cheese Stuffed Pretzel",
    fare: "Snacks",
    vendor: "Grab n' Go",
    vendorHint: "The Pub Beer Patio",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Chicken Caesar Wrap",
    fare: "Meals",
    vendor: "Grab n' Go",
    vendorHint: "The Pub Beer Patio",
    tags: ["mls", "nwsl"]
  },
  {
    name: "PTFC Wrap",
    fare: "Meals",
    vendor: "Grab n' Go",
    vendorHint: "The Pub Beer Patio",
    tags: ["mls", "nwsl"]
  },

  // ── Other Stands ──────────────────────────────────────────────────

  {
    name: "BBQ Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "House of 75",
    vendorHint: "Toyota Terrace, North Side",
    tags: ["mls", "nwsl", "local-specialty", "value-menu"]
  },
  {
    name: "Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Vista Nachos",
    vendorHint: "North Side (East Vista)",
    tags: ["mls", "nwsl", "value-menu"]
  },
  {
    name: "Stadium Nachos",
    fare: "Snacks",
    vendorHint: "Tillamook Melt (Sec. 103), Vista Nachos (North Side), House of 75",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Pretzel",
    fare: "Snacks",
    vendorHint:
      "Cha Cha Cha (Sec. 117), North End Eats (Sec. 107), Soccer City Classics (Sec. 121), Zenner's Sausage Stand (Sec. 96)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  }
];

function toSourceItem(raw: RawItem): VenueMenuSourceItem {
  return {
    name: raw.name,
    description: raw.description,
    fare: raw.fare,
    category: "Food",
    vendorName: raw.vendor,
    vendorLocationHint: raw.vendorHint,
    dietaryTags: raw.dietary ?? [],
    sourceUrl: SOURCE_URL
  };
}

export async function parseProvidenceParkMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;
  const items: VenueMenuSourceItem[] = MENU_DATA.map(toSourceItem);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
