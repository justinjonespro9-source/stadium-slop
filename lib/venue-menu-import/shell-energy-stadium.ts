/**
 * Shell Energy Stadium (Houston Dynamo / Houston Dash — MLS / NWSL) menu parser.
 *
 * Curated from the official Shell Energy Stadium food and beverage page.
 * The source is category-driven (food type headings with vendor/location
 * sub-entries), not item-driven. Vendor/restaurant names are stored as
 * vendorName metadata only — never as FoodItem names.
 *
 * Items served at multiple stands have their locations consolidated into
 * a single combined locationHint. The $5 Value Menu items are tagged
 * separately from their regular-priced counterparts.
 *
 * Source: https://www.houstondynamofc.com/shell-energy-stadium/food-and-beverage
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "shell-energy-stadium";
const VENUE_NAME = "Shell Energy Stadium";
const SOURCE_URL =
  "https://www.houstondynamofc.com/shell-energy-stadium/food-and-beverage";

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
  // ── Hot Dogs ────────────────────────────────────────────────────

  {
    name: "Hot Dog",
    fare: "Meals",
    vendorHint:
      "La Cocina (Sec. 105), Bayou City Bites (Sec. 115/116), Diggity Dawgs (Sec. 137), H-Town Grill (Sec. 138)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Value Hot Dog",
    description: "$5 Value Menu",
    fare: "Meals",
    vendorHint:
      "La Cocina (Sec. 105), Bayou City Bites (Sec. 115/116), Diggity Dawgs (Sec. 137), H-Town Grill (Sec. 138)",
    tags: ["mls", "nwsl", "value-menu"]
  },

  // ── Nachos ──────────────────────────────────────────────────────

  {
    name: "Nachos",
    fare: "Snacks",
    vendorHint:
      "La Cocina (Sec. 105), Bayou City Bites (Sec. 115/116), Diesel's Smokehouse (Sec. 121), Taqueria Arandas (Sec. 134)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Cheese Nachos",
    fare: "Snacks",
    vendorHint:
      "La Cocina (Sec. 105), Bayou City Bites (Sec. 115/116), Diggity Dawgs (Sec. 137), H-Town Grill (Sec. 138)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Value Cheese Nachos",
    description: "$5 Value Menu; vegetarian friendly",
    fare: "Snacks",
    vendorHint:
      "La Cocina (Sec. 105), Bayou City Bites (Sec. 115/116), Diggity Dawgs (Sec. 137), H-Town Grill (Sec. 138)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "value-menu"]
  },

  // ── Tacos ───────────────────────────────────────────────────────

  {
    name: "Tacos",
    fare: "Meals",
    vendorHint:
      "Hugo's (Sec. 111), Urbe (Sec. 121), Diesel's Smokehouse (Sec. 121), Taqueria Arandas (Sec. 134)",
    tags: ["mls", "nwsl"]
  },

  // ── Pizza ───────────────────────────────────────────────────────

  {
    name: "Cheese Pizza",
    fare: "Meals",
    vendor: "Pitchside Pizza",
    vendorHint: "Pitchside Pizza (Sec. 107), H-Town Grill (Sec. 138)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Empanadas ───────────────────────────────────────────────────

  {
    name: "Empanadas",
    fare: "Snacks",
    vendor: "Little Patagonia",
    vendorHint: "Section 119",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Spinach Empanadas",
    fare: "Snacks",
    vendor: "Little Patagonia",
    vendorHint: "Section 119",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Elote / Latin Sides ─────────────────────────────────────────

  {
    name: "Elote",
    fare: "Snacks",
    vendorHint: "Hugo's (Sec. 111), Elotes Bravos (Sec. 118)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Papas Bravos",
    fare: "Snacks",
    vendor: "Hugo's",
    vendorHint: "Section 111",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Fries ───────────────────────────────────────────────────────

  {
    name: "Fries",
    fare: "Snacks",
    vendorHint: "713 Grill (Sec. 131), H-Town Grill (Sec. 138)",
    tags: ["mls", "nwsl"]
  },

  // ── Sausages ────────────────────────────────────────────────────

  {
    name: "Grilled Sausages",
    fare: "Meals",
    vendorHint:
      "Bayou City Bites (Sec. 115/116), Diesel's Smokehouse (Sec. 121), Diggity Dawgs (Sec. 137)",
    tags: ["mls", "nwsl"]
  },

  // ── Pretzels ────────────────────────────────────────────────────

  {
    name: "Pretzels",
    fare: "Snacks",
    vendorHint:
      "La Cocina (Sec. 105), Pitchside Pizza (Sec. 107), Bayou City Bites (Sec. 115/116), Diggity Dawgs (Sec. 137), H-Town Grill (Sec. 138)",
    tags: ["mls", "nwsl"]
  },

  // ── Desserts ────────────────────────────────────────────────────

  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendorHint: "Section 104, Section 122",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Shaved Ice",
    fare: "Desserts",
    vendorHint: "Section 102",
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

export async function parseShellEnergyStadiumMenu(
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
