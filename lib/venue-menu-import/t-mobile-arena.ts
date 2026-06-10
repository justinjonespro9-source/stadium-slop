/**
 * T-Mobile Arena (Vegas Golden Knights — NHL) menu parser.
 *
 * Curated from the official T-Mobile Arena Food & Beverage page with
 * item-level entries for named stands and dishes. Alcohol-only bars,
 * grab-and-go markets, generic snacks, and beverage stands are excluded.
 *
 * Source: https://www.t-mobilearena.com/plan-your-visit/food-beverage
 * Re-verify each season to pick up menu changes.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "t-mobile-arena";
const VENUE_NAME = "T-Mobile Arena";
const SOURCE_URL = "https://www.t-mobilearena.com/plan-your-visit/food-beverage";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function levelHint(level: string, section: string, note?: string): string {
  const base = `${level} · Section ${section}`;
  return note ? `${base} · ${note}` : base;
}

const MAIN = "Main Concourse";
const UPPER = "Upper Concourse";

const MENU_DATA: RawItem[] = [
  // ── Capriotti's Sandwich Shop ───────────────────────────────────

  {
    name: "The Bobbie",
    description:
      "Capriotti's signature sub with slow-roasted hand-pulled turkey, stuffing, cranberry sauce, and mayo — a Las Vegas favorite",
    fare: "Meals",
    vendor: "Capriotti's Sandwich Shop",
    vendorHint: levelHint(MAIN, "12"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Capriotti's Cheese Steak",
    description: "USDA Choice beef cheese steak sub from Capriotti's",
    fare: "Meals",
    vendor: "Capriotti's Sandwich Shop",
    vendorHint: levelHint(MAIN, "12"),
    tags: ["nhl", "local-vendor"]
  },

  // ── Freed's Bakery ──────────────────────────────────────────────

  {
    name: "Freed's Decadent Dessert Cake",
    description:
      "Layered dessert cake from Freed's — a Las Vegas staple for over 35 years",
    fare: "Desserts",
    vendor: "Freed's Bakery",
    vendorHint: `${levelHint(MAIN, "15")}; ${levelHint(MAIN, "16")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Freed's Gourmet Cookies",
    description: "Made-from-scratch cookies and pastries from Freed's Bakery",
    fare: "Desserts",
    vendor: "Freed's Bakery",
    vendorHint: `${levelHint(MAIN, "15")}; ${levelHint(MAIN, "16")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },

  // ── The Great Greek Mediterranean Grill ─────────────────────────

  {
    name: "Greek Chicken Souvlaki",
    description: "Charred chicken souvlaki with fresh vegetables and Greek sauces",
    fare: "Meals",
    vendor: "The Great Greek Mediterranean Grill",
    vendorHint: levelHint(MAIN, "20"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Greek Pork Souvlaki",
    fare: "Meals",
    vendor: "The Great Greek Mediterranean Grill",
    vendorHint: levelHint(MAIN, "20"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Greek Gyro Wrap",
    fare: "Meals",
    vendor: "The Great Greek Mediterranean Grill",
    vendorHint: levelHint(MAIN, "20"),
    tags: ["nhl", "local-vendor"]
  },

  // ── Cool Intentions ─────────────────────────────────────────────

  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendor: "Cool Intentions",
    vendorHint: levelHint(UPPER, "215"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Soft Serve Custard Ice Cream",
    fare: "Desserts",
    vendor: "Cool Intentions",
    vendorHint: levelHint(UPPER, "215"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },

  // ── Shake Shack ─────────────────────────────────────────────────

  {
    name: "Shack Burger",
    description: "Shake Shack all-natural Angus beef burger",
    fare: "Meals",
    vendor: "Shake Shack",
    vendorHint: levelHint(MAIN, "20"),
    tags: ["nhl"]
  },
  {
    name: "Shack Hand-Spun Shake",
    description: "Hand-spun frozen custard shake",
    fare: "Desserts",
    vendor: "Shake Shack",
    vendorHint: levelHint(MAIN, "20"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },

  // ── BBQ Mexicana / Pacha Mama ───────────────────────────────────

  {
    name: "BBQ Mexicana Burrito",
    fare: "Meals",
    vendor: "BBQ Mexicana",
    vendorHint: `${levelHint(MAIN, "19", "Pacha Mama")}; ${levelHint(UPPER, "215")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "BBQ Mexicana Skewers",
    fare: "Meals",
    vendor: "BBQ Mexicana",
    vendorHint: levelHint(MAIN, "19", "Pacha Mama"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "BBQ Mexicana Bowl",
    fare: "Meals",
    vendor: "BBQ Mexicana",
    vendorHint: levelHint(MAIN, "19", "Pacha Mama"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "BBQ Mexicana Ceviche",
    fare: "Meals",
    vendor: "BBQ Mexicana",
    vendorHint: levelHint(MAIN, "19", "Pacha Mama"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Senora Dog",
    description: "Specialty hot dog from BBQ Mexicana upper-concourse stand",
    fare: "Meals",
    vendor: "BBQ Mexicana",
    vendorHint: levelHint(UPPER, "215"),
    tags: ["nhl", "local-vendor"]
  },

  // ── Extravagant Eats ────────────────────────────────────────────

  {
    name: "Helmet Popcorn",
    description: "Distinctive Vegas concession popcorn served in a souvenir helmet",
    fare: "Snacks",
    vendor: "Extravagant Eats",
    vendorHint: levelHint(MAIN, "12"),
    dietary: ["Vegetarian"],
    tags: ["nhl", "signature"]
  },
  {
    name: "Parfait Pizza Sticks",
    fare: "Snacks",
    vendor: "Extravagant Eats",
    vendorHint: levelHint(MAIN, "12"),
    tags: ["nhl"]
  },

  // ── Four Peaks Carvery ──────────────────────────────────────────

  {
    name: "Four Peaks Hand Carved Sandwich",
    description: "Fresh hand-carved meat sandwich from Four Peaks Carvery",
    fare: "Meals",
    vendor: "Four Peaks Carvery",
    vendorHint: levelHint(MAIN, "9"),
    tags: ["nhl"]
  },

  // ── Fuku Chicken (Chef David Chang) ─────────────────────────────

  {
    name: "Fuku Spicy Chicken Sandwich",
    description: "Habanero-brined spicy fried chicken sandwich by Chef David Chang",
    fare: "Meals",
    vendor: "Fuku Chicken",
    vendorHint: `${levelHint(MAIN, "10")}; ${levelHint(UPPER, "215")}`,
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Fuku Chicken Tenders",
    description: "Jumbo habanero-brined chicken tenders",
    fare: "Meals",
    vendor: "Fuku Chicken",
    vendorHint: `${levelHint(MAIN, "10")}; ${levelHint(UPPER, "215")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Fuku Popcorn Chicken",
    description: "Bite-size habanero-brined fried chicken",
    fare: "Meals",
    vendor: "Fuku Chicken",
    vendorHint: `${levelHint(MAIN, "10")}; ${levelHint(UPPER, "215")}`,
    tags: ["nhl", "local-vendor"]
  },

  // ── Golden Road / Kona Big Wave pubs ────────────────────────────

  {
    name: "The Smoke House Burger",
    description:
      "Brisket burger with pepper jack, bacon, chipotle BBQ, and caramelized onions; available at Golden Road (Sec. 5) and Kona Big Wave (Sec. 17)",
    fare: "Meals",
    vendor: "Kona Big Wave & Golden Road Pubs",
    vendorHint: `${levelHint(MAIN, "5", "Golden Road Mango Cart")}; ${levelHint(MAIN, "17", "Kona Big Wave Liquid Aloha")}`,
    tags: ["nhl", "signature"]
  },
  {
    name: "Spice Bag Fries",
    description: "Seasoned fries served in a paper bag at Golden Road and Kona Big Wave stands",
    fare: "Snacks",
    vendor: "Kona Big Wave & Golden Road Pubs",
    vendorHint: `${levelHint(MAIN, "5", "Golden Road Mango Cart")}; ${levelHint(MAIN, "17", "Kona Big Wave Liquid Aloha")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl", "signature"]
  },

  // ── Home Rice Advantage ─────────────────────────────────────────

  {
    name: "Teriyaki Chicken Rice Bowl",
    fare: "Meals",
    vendor: "Home Rice Advantage",
    vendorHint: levelHint(MAIN, "9"),
    tags: ["nhl"]
  },

  // ── Neon Eats ───────────────────────────────────────────────────

  {
    name: "Neon Eats Hot Dog",
    fare: "Meals",
    vendor: "Neon Eats",
    vendorHint: `${levelHint(MAIN, "9")}; ${levelHint(MAIN, "12")}`,
    tags: ["nhl"]
  },
  {
    name: "Neon Eats Nachos",
    fare: "Meals",
    vendor: "Neon Eats",
    vendorHint: `${levelHint(MAIN, "9")}; ${levelHint(MAIN, "12")}`,
    tags: ["nhl"]
  },

  // ── Pizza Piena ─────────────────────────────────────────────────

  {
    name: "Pizza Piena Pizza",
    fare: "Meals",
    vendor: "Pizza Piena",
    vendorHint: levelHint(MAIN, "11"),
    tags: ["nhl"]
  },
  {
    name: "Pizza Piena Calzone",
    fare: "Meals",
    vendor: "Pizza Piena",
    vendorHint: levelHint(MAIN, "11"),
    tags: ["nhl"]
  },
  {
    name: "Pizza Piena Stromboli",
    fare: "Meals",
    vendor: "Pizza Piena",
    vendorHint: levelHint(MAIN, "11"),
    tags: ["nhl"]
  },
  {
    name: "Pizza Piena Salad",
    fare: "Meals",
    vendor: "Pizza Piena",
    vendorHint: levelHint(MAIN, "11"),
    tags: ["nhl"]
  },

  // ── Breakaway Burgers ───────────────────────────────────────────

  {
    name: "Breakaway Specialty Burger",
    fare: "Meals",
    vendor: "Breakaway Burgers",
    vendorHint: `${levelHint(UPPER, "208")}; ${levelHint(UPPER, "221")}`,
    tags: ["nhl"]
  },
  {
    name: "Breakaway Brisket Burger",
    fare: "Meals",
    vendor: "Breakaway Burgers",
    vendorHint: `${levelHint(UPPER, "208")}; ${levelHint(UPPER, "221")}`,
    tags: ["nhl"]
  },
  {
    name: "Breakaway Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "Breakaway Burgers",
    vendorHint: `${levelHint(UPPER, "208")}; ${levelHint(UPPER, "221")}`,
    tags: ["nhl"]
  },

  // ── Desert Smokehouse BBQ ───────────────────────────────────────

  {
    name: "Desert Smokehouse BBQ Philly",
    description: "BBQ-style Philly sandwich from Desert Smokehouse BBQ",
    fare: "Meals",
    vendor: "Desert Smokehouse BBQ",
    vendorHint: levelHint(UPPER, "208"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Desert Smokehouse BBQ Loaded Potato",
    description: "Loaded baked potato with BBQ toppings",
    fare: "Meals",
    vendor: "Desert Smokehouse BBQ",
    vendorHint: levelHint(UPPER, "208"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Desert Smokehouse Hot Link",
    fare: "Meals",
    vendor: "Desert Smokehouse BBQ",
    vendorHint: levelHint(UPPER, "208"),
    tags: ["nhl", "local-vendor"]
  },

  // ── Golden Churros ──────────────────────────────────────────────

  {
    name: "Golden Churros",
    description: "Fresh-made churros",
    fare: "Desserts",
    vendor: "Golden Churros",
    vendorHint: levelHint(UPPER, "213"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Churro Sundae",
    fare: "Desserts",
    vendor: "Golden Churros",
    vendorHint: levelHint(UPPER, "213"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },

  // ── Nacho Spot ──────────────────────────────────────────────────

  {
    name: "Carne Asada Loaded Nachos",
    fare: "Meals",
    vendor: "Nacho Spot",
    vendorHint: levelHint(UPPER, "221"),
    tags: ["nhl"]
  },
  {
    name: "Chicken Fajita Loaded Nachos",
    fare: "Meals",
    vendor: "Nacho Spot",
    vendorHint: levelHint(UPPER, "221"),
    tags: ["nhl"]
  },

  // ── Paradise Pizza ──────────────────────────────────────────────

  {
    name: "Paradise Pizza",
    fare: "Meals",
    vendor: "Paradise Pizza",
    vendorHint: `${levelHint(UPPER, "208")}; ${levelHint(UPPER, "221")}`,
    tags: ["nhl"]
  },
  {
    name: "Paradise Pizza Steak",
    description: "Philly-style pizza steak from Paradise Pizza",
    fare: "Meals",
    vendor: "Paradise Pizza",
    vendorHint: `${levelHint(UPPER, "208")}; ${levelHint(UPPER, "221")}`,
    tags: ["nhl"]
  },

  // ── Silver State ────────────────────────────────────────────────

  {
    name: "Silver State Philly Cheesesteak",
    fare: "Meals",
    vendor: "Silver State",
    vendorHint: levelHint(UPPER, "213"),
    tags: ["nhl"]
  },
  {
    name: "Silver State Bella Italian Sub",
    description: "Silver State \"Bella\" Italian sub",
    fare: "Meals",
    vendor: "Silver State",
    vendorHint: levelHint(UPPER, "213"),
    tags: ["nhl"]
  },

  // ── 702 Cantina ─────────────────────────────────────────────────

  {
    name: "702 Cantina Loaded Chipotle Bowl",
    description: "Loaded chipotle bowl with rice or chips base",
    fare: "Meals",
    vendor: "702 Cantina",
    vendorHint: levelHint(UPPER, "209"),
    tags: ["nhl", "local-vendor"]
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

export async function parseTMobileArenaMenu(
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

export const T_MOBILE_ARENA_MENU_ITEM_COUNT = MENU_DATA.length;
export const T_MOBILE_ARENA_DEDUPED_ITEM_COUNT = dedupeMenuItems(MENU_DATA).length;
