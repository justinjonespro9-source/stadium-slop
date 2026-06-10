/**
 * Lenovo Center (Carolina Hurricanes — NHL) menu parser.
 *
 * Curated from the official Lenovo Center concessions page with item-level
 * entries for named stands. Alcohol-only bars, marketplace convenience rows,
 * and generic snacks/beverages are excluded unless distinctly notable.
 *
 * Sources:
 *   https://www.lenovocenter.com/concessions
 *   https://www.lenovocenter.com/plan-your-visit/food-beverage
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

const VENUE_SLUG = "lenovo-center";
const VENUE_NAME = "Lenovo Center";
const SOURCE_URL = "https://www.lenovocenter.com/concessions";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function sectionHint(section: string, note?: string): string {
  return note ? `Section ${section} · ${note}` : `Section ${section}`;
}

const PRIORITY_LOUNGE =
  "Priority Lounge & Club Level ticketholders";

const MENU_DATA: RawItem[] = [
  // ── Willy's Hot Chicken ─────────────────────────────────────────

  {
    name: "Willy's Hot Chicken Tenders",
    description:
      "Fresh-breaded jumbo tenders with multiple spice levels and signature house sauce; collaboration with Justin Williams",
    fare: "Meals",
    vendor: "Willy's Hot Chicken",
    vendorHint: sectionHint("130"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Willy's Hot Chicken Sliders",
    fare: "Meals",
    vendor: "Willy's Hot Chicken",
    vendorHint: sectionHint("130"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Willy's Beef Tallow Fries",
    fare: "Snacks",
    vendor: "Willy's Hot Chicken",
    vendorHint: sectionHint("130"),
    tags: ["nhl"]
  },

  // ── Sup Dogs ────────────────────────────────────────────────────

  {
    name: "Sup Dogs Gourmet Hot Dog",
    description: PRIORITY_LOUNGE,
    fare: "Meals",
    vendor: "Sup Dogs",
    vendorHint: `${sectionHint("103")}; ${sectionHint("118")}`,
    tags: ["nhl", "local-vendor"]
  },

  // ── Alpaca Peruvian Chicken ───────────────────────────────────

  {
    name: "Alpaca Peruvian Chicken Bowl",
    description: "Pulled charcoal chicken bowl with Peruvian flavors",
    fare: "Meals",
    vendor: "Alpaca Peruvian Chicken",
    vendorHint: `${sectionHint("322")}; ${sectionHint("110", "cart")}`,
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Alpaca Peruvian Chicken Salad",
    fare: "Meals",
    vendor: "Alpaca Peruvian Chicken",
    vendorHint: `${sectionHint("322")}; ${sectionHint("110", "cart")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Alpaca Yuca Fries",
    fare: "Snacks",
    vendor: "Alpaca Peruvian Chicken",
    vendorHint: `${sectionHint("322")}; ${sectionHint("110", "cart")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },

  // ── The BBQ Lab ─────────────────────────────────────────────────

  {
    name: "BBQ Lab Brisket",
    description: `Low-and-slow smoked brisket with scratch-made sides. ${PRIORITY_LOUNGE}`,
    fare: "Meals",
    vendor: "The BBQ Lab",
    vendorHint: `${sectionHint("105", "Priority Lounge")}; ${sectionHint("120", "Priority Lounge")}`,
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "BBQ Lab Smoked Turkey",
    description: PRIORITY_LOUNGE,
    fare: "Meals",
    vendor: "The BBQ Lab",
    vendorHint: `${sectionHint("105", "Priority Lounge")}; ${sectionHint("120", "Priority Lounge")}`,
    tags: ["nhl", "local-vendor"]
  },

  // ── Buffalo Brothers ────────────────────────────────────────────

  {
    name: "Buffalo Brothers Personal Pizza",
    description: "Fresh-baked personal pizza; also available in Club Level lounges",
    fare: "Meals",
    vendor: "Buffalo Brothers",
    vendorHint: `${sectionHint("114")}; ${sectionHint("310")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Buffalo Brothers Chicken Wings",
    description: "Jumbo wings tossed in signature local sauces",
    fare: "Meals",
    vendor: "Buffalo Brothers",
    vendorHint: `${sectionHint("114")}; ${sectionHint("310")}`,
    tags: ["nhl", "local-vendor"]
  },

  // ── Chick-fil-A ─────────────────────────────────────────────────

  {
    name: "Chick-fil-A Chicken Sandwich",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: `${sectionHint("109", "stand")}; ${sectionHint("120", "cart")}; ${sectionHint("325", "cart")}`,
    tags: ["nhl"]
  },

  // ── Fiesta Tacos ────────────────────────────────────────────────

  {
    name: "Fiesta Tacos",
    fare: "Meals",
    vendor: "Fiesta Tacos",
    vendorHint: sectionHint("112", "stand"),
    tags: ["nhl"]
  },
  {
    name: "Fiesta Nachos",
    fare: "Meals",
    vendor: "Fiesta Tacos",
    vendorHint: `${sectionHint("112", "stand")}; ${sectionHint("130", "cart · nachos only")}`,
    tags: ["nhl"]
  },

  // ── The Mac Bar ─────────────────────────────────────────────────

  {
    name: "Mac Bar Signature Mac & Cheese Bowl",
    description: "Signature mac & cheese bowl from The Mac Bar",
    fare: "Meals",
    vendor: "The Mac Bar",
    vendorHint: sectionHint("329"),
    dietary: ["Vegetarian"],
    tags: ["nhl", "signature"]
  },
  {
    name: "Build-Your-Own Mac & Cheese Bowl",
    description: "Custom mac bowl with proteins, toppings, and sauces",
    fare: "Meals",
    vendor: "The Mac Bar",
    vendorHint: sectionHint("329"),
    tags: ["nhl"]
  },

  // ── Shake Shack ─────────────────────────────────────────────────

  {
    name: "Shake Shack Burger",
    description: "100% all-natural Angus beef ShackBurger",
    fare: "Meals",
    vendor: "Shake Shack",
    vendorHint: sectionHint("123"),
    tags: ["nhl"]
  },
  {
    name: "Shake Shack Portobello Burger",
    fare: "Meals",
    vendor: "Shake Shack",
    vendorHint: sectionHint("123"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Shake Shack Vienna Beef Dog",
    fare: "Meals",
    vendor: "Shake Shack",
    vendorHint: sectionHint("123"),
    tags: ["nhl"]
  },
  {
    name: "Shake Shack Fries",
    fare: "Snacks",
    vendor: "Shake Shack",
    vendorHint: sectionHint("123"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Shake Shack Frozen Custard Shake",
    description: "Spun-fresh frozen custard shake; shake-only cart near Section 332",
    fare: "Desserts",
    vendor: "Shake Shack",
    vendorHint: `${sectionHint("123")}; ${sectionHint("332", "shake cart")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },

  // ── Tombachi ────────────────────────────────────────────────────

  {
    name: "Tombachi Chicken Hibachi",
    description: "Hibachi plate with chicken, rice, and house-made sauces",
    fare: "Meals",
    vendor: "Tombachi",
    vendorHint: `${sectionHint("107", "cart")}; ${sectionHint("204", "West Club Stand")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Tombachi Steak Hibachi",
    fare: "Meals",
    vendor: "Tombachi",
    vendorHint: `${sectionHint("107", "cart")}; ${sectionHint("204", "West Club Stand")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Tombachi Shrimp Hibachi",
    fare: "Meals",
    vendor: "Tombachi",
    vendorHint: `${sectionHint("107", "cart")}; ${sectionHint("204", "West Club Stand")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Tombachi Potstickers",
    fare: "Meals",
    vendor: "Tombachi",
    vendorHint: `${sectionHint("107", "cart")}; ${sectionHint("204", "West Club Stand")}`,
    tags: ["nhl", "local-vendor"]
  },

  // ── Two Roosters ────────────────────────────────────────────────

  {
    name: "Two Roosters Hand-Dipped Ice Cream",
    description: "Local Raleigh ice cream with staple and guest-feature flavors",
    fare: "Desserts",
    vendor: "Two Roosters",
    vendorHint: `${sectionHint("116", "stand")}; ${sectionHint("325", "cart")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },

  // ── The Carvery ─────────────────────────────────────────────────

  {
    name: "Carvery Fresh Carved Sandwich",
    fare: "Meals",
    vendor: "The Carvery",
    vendorHint: sectionHint("120", "cart"),
    tags: ["nhl"]
  },

  // ── North Carolina BBQ Company ──────────────────────────────────

  {
    name: "North Carolina Pulled BBQ Sandwich",
    description: "In-house pulled BBQ with coleslaw; BBQ Lab sauces available",
    fare: "Meals",
    vendor: "North Carolina BBQ Company",
    vendorHint: `${sectionHint("107")}; ${sectionHint("123")}; ${sectionHint("305")}; ${sectionHint("326")}`,
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "North Carolina BBQ Nachos",
    fare: "Meals",
    vendor: "North Carolina BBQ Company",
    vendorHint: `${sectionHint("107")}; ${sectionHint("123")}; ${sectionHint("305")}; ${sectionHint("326")}`,
    tags: ["nhl", "local-vendor"]
  },

  // ── Sausage Stop ────────────────────────────────────────────────

  {
    name: "Sausage Stop Italian Sausage",
    description: "Grilled Italian sausage with sautéed sweet peppers and onions",
    fare: "Meals",
    vendor: "Sausage Stop",
    vendorHint: `${sectionHint("105")}; ${sectionHint("120")}; ${sectionHint("306")}`,
    tags: ["nhl"]
  },
  {
    name: "Sausage Stop Bratwurst",
    description: "Grilled bratwurst with sautéed sweet peppers and onions",
    fare: "Meals",
    vendor: "Sausage Stop",
    vendorHint: `${sectionHint("105")}; ${sectionHint("120")}; ${sectionHint("306")}`,
    tags: ["nhl"]
  },

  // ── Sinnfully Sinnamon ──────────────────────────────────────────

  {
    name: "Sinnfully Sinnamon Cinnamon Bun",
    fare: "Desserts",
    vendor: "Sinnfully Sinnamon",
    vendorHint: sectionHint("110"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Sinnfully Sinnamon Cookies",
    fare: "Desserts",
    vendor: "Sinnfully Sinnamon",
    vendorHint: sectionHint("110"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Sinnfully Sinnamon Chocolate Bundt Cake",
    fare: "Desserts",
    vendor: "Sinnfully Sinnamon",
    vendorHint: sectionHint("110"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },

  // ── Raising the Steak ───────────────────────────────────────────

  {
    name: "Raising the Steak Sandwich",
    description: "Steak with onions and provolone on a sub roll",
    fare: "Meals",
    vendor: "Raising the Steak",
    vendorHint: sectionHint("123"),
    tags: ["nhl"]
  },

  // ── General Stand at 301 ────────────────────────────────────────

  {
    name: "General Stand Chicken Wrap",
    description: "Menu varies for concerts and special events",
    fare: "Meals",
    vendor: "General Stand at 301",
    vendorHint: sectionHint("301"),
    tags: ["nhl"]
  },
  {
    name: "General Stand Chicken Tenders",
    vendor: "General Stand at 301",
    vendorHint: sectionHint("301"),
    fare: "Meals",
    tags: ["nhl"]
  },
  {
    name: "General Stand Hot Dog",
    vendor: "General Stand at 301",
    vendorHint: sectionHint("301"),
    fare: "Meals",
    tags: ["nhl"]
  },

  // ── Club Concourse ──────────────────────────────────────────────

  {
    name: "Club Concourse Carved Sandwich",
    description: "Upgraded carved sandwich from Club Lounges",
    fare: "Meals",
    vendor: "Club Concourse",
    vendorHint: `${sectionHint("204", "Club Lounge")}; ${sectionHint("220", "Club Lounge")}`,
    tags: ["nhl"]
  },
  {
    name: "Club Concourse Fresh Dessert",
    description: "Rotating fresh desserts in Club Lounges",
    fare: "Desserts",
    vendor: "Club Concourse",
    vendorHint: `${sectionHint("204", "Club Lounge")}; ${sectionHint("220", "Club Lounge")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },

  // ── Popcorn & Pretzels ──────────────────────────────────────────

  {
    name: "Gourmet Stuffed Pretzel",
    description: "Notable stuffed pretzel from Popcorn & Pretzels stands",
    fare: "Snacks",
    vendor: "Popcorn & Pretzels",
    vendorHint: `${sectionHint("103")}; ${sectionHint("118")}; ${sectionHint("306")}; ${sectionHint("325")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },

  // ── Dippin' Dots ────────────────────────────────────────────────

  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendor: "Dippin' Dots Ice Cream",
    vendorHint: `${sectionHint("106")}; ${sectionHint("120")}; ${sectionHint("306")}; ${sectionHint("326")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl"]
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

export async function parseLenovoCenterMenu(
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

export const LENOVO_CENTER_RAW_ITEM_COUNT = MENU_DATA.length;
