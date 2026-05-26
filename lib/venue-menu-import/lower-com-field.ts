/**
 * Lower.com Field (Columbus Crew — MLS) menu parser.
 *
 * Curated from the official Columbus Crew concessions page. Each vendor
 * section has a Menu: line whose comma-separated items are split into
 * individual food item candidates. Generic staples (hot dog, popcorn,
 * candy, nachos, fries, chips, pretzels) are excluded unless tied to a
 * named local vendor or branded as a signature item.
 *
 * Source: https://www.columbuscrew.com/stadium/concessions
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "lower-com-field";
const VENUE_NAME = "Lower.com Field";
const SOURCE_URL = "https://www.columbuscrew.com/stadium/concessions";

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
  // ── Condado - Southwest Corner ──────────────────────────────────

  {
    name: "Condado Tacos",
    description: "Build-your-own tacos from Columbus taco chain Condado",
    fare: "Meals",
    vendor: "Condado",
    vendorHint: "Southwest Corner",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Condado Bowls",
    fare: "Meals",
    vendor: "Condado",
    vendorHint: "Southwest Corner",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Condado Burritos",
    fare: "Meals",
    vendor: "Condado",
    vendorHint: "Southwest Corner",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Condado Nachos",
    fare: "Snacks",
    vendor: "Condado",
    vendorHint: "Southwest Corner",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Condado Chips & Dips",
    fare: "Snacks",
    vendor: "Condado",
    vendorHint: "Southwest Corner",
    tags: ["mls", "local-vendor"]
  },

  // ── Philly - Section 103 ────────────────────────────────────────

  {
    name: "Philly Cheesesteak Sandwich",
    fare: "Meals",
    vendor: "Philly",
    vendorHint: "Section 103",
    tags: ["mls"]
  },
  {
    name: "Philly Cheesesteak Nacho",
    fare: "Meals",
    vendor: "Philly",
    vendorHint: "Section 103",
    tags: ["mls"]
  },

  // ── Crew Grill - Section 105 ────────────────────────────────────

  {
    name: "Impossible Burger",
    description: "Plant-based burger; gluten-free buns available on request",
    fare: "Meals",
    vendor: "Crew Grill",
    vendorHint: "Section 105",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── Sideline Nacho - Section 105 ────────────────────────────────

  {
    name: "Achiote Chicken Nachos",
    description: "Black & Gold salsa, lime crema, queso, cheese",
    fare: "Meals",
    vendor: "Sideline Nacho",
    vendorHint: "Section 105",
    tags: ["mls"]
  },
  {
    name: "Battle Nacho",
    fare: "Meals",
    vendor: "Sideline Nacho",
    vendorHint: "Section 105",
    tags: ["mls"]
  },
  {
    name: "Nacho Grande",
    fare: "Snacks",
    vendor: "Sideline Nacho",
    vendorHint: "Section 105",
    tags: ["mls"]
  },

  // ── Sandwich Shoppe - Section 107 ───────────────────────────────

  {
    name: "Italian Village Meatball Sub",
    description: "Featuring Carfagna meatballs",
    fare: "Meals",
    vendor: "Sandwich Shoppe",
    vendorHint: "Section 107",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "The German Brew District Loaded Bratwurst",
    description: "Featuring Schmidt's bratwurst",
    fare: "Meals",
    vendor: "Sandwich Shoppe",
    vendorHint: "Section 107",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "The Big Bella",
    fare: "Meals",
    vendor: "Sandwich Shoppe",
    vendorHint: "Section 107",
    tags: ["mls"]
  },
  {
    name: "The 614 Ranch Wrap",
    fare: "Meals",
    vendor: "Sandwich Shoppe",
    vendorHint: "Section 107",
    tags: ["mls"]
  },

  // ── Ben's Pretzels - Section 108 & 125 ──────────────────────────

  {
    name: "Pretzel Bites",
    description: "Freshly baked pretzel bites from Ben's Pretzels",
    fare: "Snacks",
    vendor: "Ben's Pretzels",
    vendorHint: "Section 108 & 125",
    tags: ["mls"]
  },
  {
    name: "Cinnamon Sugar Pretzel Bites",
    fare: "Snacks",
    vendor: "Ben's Pretzels",
    vendorHint: "Section 108 & 125",
    tags: ["mls"]
  },

  // ── Walking Taco - Section 109 ──────────────────────────────────

  {
    name: "Walking Taco",
    description: "Served in Doritos or Fritos bag",
    fare: "Snacks",
    vendor: "Walking Taco",
    vendorHint: "Section 109",
    tags: ["mls"]
  },

  // ── Columbus Craves - Section 122 ───────────────────────────────

  {
    name: "The Kingston",
    description: "Jerk chicken, pineapple salsa, spicy slaw",
    fare: "Meals",
    vendor: "Columbus Craves",
    vendorHint: "Section 122",
    tags: ["mls"]
  },

  // ── Swensons - Section 124 ──────────────────────────────────────

  {
    name: "Galley Boy",
    description:
      "Swensons' signature double cheeseburger with two special sauces",
    fare: "Meals",
    vendor: "Swensons",
    vendorHint: "Section 124",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Double Cheeseburger Combo",
    description: "Served with fries, onion rings, or potato teezers",
    fare: "Meals",
    vendor: "Swensons",
    vendorHint: "Section 124",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Potato Teezers",
    description: "Swensons' signature seasoned potato bites",
    fare: "Snacks",
    vendor: "Swensons",
    vendorHint: "Section 124",
    tags: ["mls", "local-vendor"]
  },

  // ── Endeavor Brewing - Section 127 ──────────────────────────────

  {
    name: "Sweet Thai Chicken Bowl",
    description: "White rice, Asian slaw, sriracha aioli",
    fare: "Meals",
    vendor: "Endeavor Brewing",
    vendorHint: "Section 127",
    tags: ["mls"]
  },
  {
    name: "General Tso Beef Meatball Bowl",
    description: "White rice, Asian slaw, sriracha aioli",
    fare: "Meals",
    vendor: "Endeavor Brewing",
    vendorHint: "Section 127",
    tags: ["mls"]
  },
  {
    name: "Veggie Potsticker Bowl",
    description: "White rice, Asian slaw, sriracha aioli",
    fare: "Meals",
    vendor: "Endeavor Brewing",
    vendorHint: "Section 127",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── Schmidt's - Section 128 ─────────────────────────────────────

  {
    name: "Bahama Mama Platter",
    fare: "Meals",
    vendor: "Schmidt's",
    vendorHint: "Section 128",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Bahama Mama",
    description: "Schmidt's signature smoked sausage",
    fare: "Meals",
    vendor: "Schmidt's",
    vendorHint: "Section 128",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Bratwurst Platter",
    fare: "Meals",
    vendor: "Schmidt's",
    vendorHint: "Section 128",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Schmidt's Bratwurst",
    fare: "Meals",
    vendor: "Schmidt's",
    vendorHint: "Section 128",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Frankfurter",
    fare: "Meals",
    vendor: "Schmidt's",
    vendorHint: "Section 128",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Garlic Knockwurst Platter",
    fare: "Meals",
    vendor: "Schmidt's",
    vendorHint: "Section 128",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Garlic Knockwurst",
    fare: "Meals",
    vendor: "Schmidt's",
    vendorHint: "Section 128",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Black & Gold Puff",
    description: "Schmidt's cream puff in Crew colors",
    fare: "Desserts",
    vendor: "Schmidt's",
    vendorHint: "Section 128",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Cream Puff",
    description: "Schmidt's famous cream puff",
    fare: "Desserts",
    vendor: "Schmidt's",
    vendorHint: "Section 128",
    tags: ["mls", "local-vendor"]
  },

  // ── Sideline Cantina - Section 129 ──────────────────────────────

  {
    name: "Achiote Chicken Tacos",
    fare: "Meals",
    vendor: "Sideline Cantina",
    vendorHint: "Section 129",
    tags: ["mls"]
  },
  {
    name: "Chile-Braised Barbacoa Tacos",
    fare: "Meals",
    vendor: "Sideline Cantina",
    vendorHint: "Section 129",
    tags: ["mls"]
  },
  {
    name: "Tajin Sweet Potato Tacos",
    fare: "Meals",
    vendor: "Sideline Cantina",
    vendorHint: "Section 129",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── BBQ - Section 130 ───────────────────────────────────────────

  {
    name: "BBQ Brisket Sandwich",
    fare: "Meals",
    vendor: "BBQ",
    vendorHint: "Section 130",
    tags: ["mls"]
  },
  {
    name: "BBQ Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "BBQ",
    vendorHint: "Section 130",
    tags: ["mls"]
  },
  {
    name: "BBQ Brisket Smokestack",
    fare: "Meals",
    vendor: "BBQ",
    vendorHint: "Section 130",
    tags: ["mls"]
  },
  {
    name: "BBQ Pulled Pork Smokestack",
    fare: "Meals",
    vendor: "BBQ",
    vendorHint: "Section 130",
    tags: ["mls"]
  },
  {
    name: "Mac & Cheese Side",
    fare: "Snacks",
    vendor: "BBQ",
    vendorHint: "Section 130",
    tags: ["mls"]
  },

  // ── Donatos - Section 107 & 132 ─────────────────────────────────

  {
    name: "Donatos Pepperoni Pizza",
    fare: "Meals",
    vendor: "Donatos",
    vendorHint: "Section 107 & 132",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Donatos Cheese Pizza",
    fare: "Meals",
    vendor: "Donatos",
    vendorHint: "Section 107 & 132",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-vendor"]
  },

  // ── Dirty Franks - Section 143, The Chase Plaza ─────────────────

  {
    name: "Chicago Dog",
    fare: "Meals",
    vendor: "Dirty Franks",
    vendorHint: "Section 143, The Chase Plaza",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Cowgirl Carmen",
    description: "Dirty Franks signature hot dog",
    fare: "Meals",
    vendor: "Dirty Franks",
    vendorHint: "Section 143, The Chase Plaza",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Chili Dog",
    fare: "Meals",
    vendor: "Dirty Franks",
    vendorHint: "Section 143, The Chase Plaza",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Birthday Suit",
    description: "Dirty Franks signature hot dog",
    fare: "Meals",
    vendor: "Dirty Franks",
    vendorHint: "Section 143, The Chase Plaza",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Sauerkraut Dog",
    fare: "Meals",
    vendor: "Dirty Franks",
    vendorHint: "Section 143, The Chase Plaza",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Dirty Franks Bratwurst",
    fare: "Meals",
    vendor: "Dirty Franks",
    vendorHint: "Section 143, The Chase Plaza",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Cheesy Tots",
    fare: "Snacks",
    vendor: "Dirty Franks",
    vendorHint: "Section 143, The Chase Plaza",
    tags: ["mls", "local-vendor"]
  },
  {
    name: "Blondie Brownie",
    fare: "Desserts",
    vendor: "Dirty Franks",
    vendorHint: "Section 143, The Chase Plaza",
    tags: ["mls", "local-vendor"]
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

export async function parseLowerComFieldMenu(
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
