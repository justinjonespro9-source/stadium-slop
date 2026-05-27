/**
 * BMO Field (Toronto FC / Toronto Argonauts — MLS / CFL) menu parser.
 *
 * Cross-referenced from two official sources:
 *   1. Primary concessions page — item names, vendor stands, locations, descriptions
 *   2. Specialty food guide — dietary tags (gluten-friendly, vegetarian, vegan, halal)
 *      and additional items not listed on the primary page
 *
 * Vendor/stand names (Food Junction, Panini, Frites, Pizza Pizza, etc.) are
 * stored as vendorName metadata only — never as FoodItem names.
 *
 * The specialty guide also revealed items not on the primary page:
 *   - Charbroiled Cheeseburger, Pickle Fried Chicken Sandwich, Vegan Stadium Dog,
 *     Vegan Chorizo Burrito, Nacho Supreme, Vegan Poutine, BBQ Brisket Poutine,
 *     Chicken Shawarma Poutine, Cheese Pizza
 *
 * "Smoked Turkey BLT" (specialty page) is consolidated with "Smoked Turkey Club"
 * (primary page) — likely the same sandwich with inconsistent naming.
 *
 * Sources:
 *   https://www.bmofield.com/plan-your-visit/food-beverage/food-concessions
 *   https://bmofield.netlify.app/specialtyfood
 *
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "bmo-field";
const VENUE_NAME = "BMO Field";
const SOURCE_URL =
  "https://www.bmofield.com/plan-your-visit/food-beverage/food-concessions";

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
  // ── Food Junction ───────────────────────────────────────────────

  {
    name: "All-Dressed Crispy Fried Chicken Sandwich",
    description: "On a butter toasted brioche bun",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint: "Sections 105, 107, 108, 115, 116, 127, 204, 208",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Grilled Beef Burger",
    description: "Topped with bacon & caramelized onion relish",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint: "Sections 105, 107, 108, 115, 116, 127, 204, 208",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Charbroiled Cheeseburger",
    description: "Gluten-free bun available on request",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint: "Sections 105, 115, 127, 204",
    dietary: ["Gluten Free"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host", "halal"]
  },
  {
    name: "Foot-Long Taquito",
    description:
      "Stuffed with in-house braised pork birria & cheese, fried until crispy",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint: "Sections 105, 107, 108, 115, 116, 127, 204, 208",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint: "Sections 105, 108, 115, 127, 204",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host", "halal"]
  },
  {
    name: "Hot Dog",
    description: "Nathan's famous all beef; gluten-free bun available",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint:
      "Food Junction (Sec. 105, 107, 108, 115, 116, 127, 204, 208), Hogtown (Sec. 125)",
    dietary: ["Gluten Free"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Nachos",
    fare: "Snacks",
    vendor: "Food Junction",
    vendorHint: "Sections 105, 107, 108, 115, 116, 127, 204, 208",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Nacho Supreme",
    description: "Gluten-friendly without cheese sauce",
    fare: "Snacks",
    vendor: "Food Junction",
    vendorHint:
      "Food Junction (Sec. 105, 108, 115, 127, 204), Panini (Sec. 106)",
    dietary: ["Vegetarian", "Gluten Free"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host", "halal"]
  },
  {
    name: "Vegan Stadium Dog",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint: "Sections 105, 108, 115, 127, 204",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Pickle Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Food Junction",
    vendorHint: "Sections 105, 108, 127",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host", "halal"]
  },

  // ── Panini ──────────────────────────────────────────────────────

  {
    name: "Porchetta Sandwich",
    description: "12-hour cooked roast porchetta, carved to order; GF bun available",
    fare: "Meals",
    vendor: "Panini",
    vendorHint: "Sections 106, 107, 108, 124, 206, 207",
    dietary: ["Gluten Free"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Braised Beef Grilled Cheese",
    fare: "Meals",
    vendor: "Panini",
    vendorHint: "Sections 106, 107, 108, 124, 206, 207",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host", "halal"]
  },
  {
    name: "Smoked Meat Sandwich",
    description: "On bakery fresh onion bun",
    fare: "Meals",
    vendor: "Panini",
    vendorHint: "Sections 106, 107, 108, 124, 206, 207",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Smoked Turkey Club",
    description:
      "Hand cut; GF bun available (listed as Smoked Turkey BLT on specialty guide)",
    fare: "Meals",
    vendor: "Panini",
    vendorHint: "Sections 106, 107, 108, 124, 206, 207",
    dietary: ["Gluten Free"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Vegan Mushroom Focaccia",
    description: "Served with a side of fresh kettle chips",
    fare: "Meals",
    vendor: "Panini",
    vendorHint: "Sections 106, 107, 108, 124, 206, 207",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Vegan Chorizo Burrito",
    fare: "Meals",
    vendor: "Panini",
    vendorHint: "Sections 106, 108, 124, 207",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },

  // ── Frites ──────────────────────────────────────────────────────

  {
    name: "Jerk Chicken Poutine",
    fare: "Meals",
    vendor: "Frites",
    vendorHint: "Section 110",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host", "halal"]
  },
  {
    name: "Steak & Ale Pie Chips",
    fare: "Meals",
    vendor: "Frites",
    vendorHint: "Section 110",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Vegan Curry Chips",
    fare: "Meals",
    vendor: "Frites",
    vendorHint: "Section 110",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Pork Birria Fries",
    fare: "Meals",
    vendor: "Frites",
    vendorHint: "Section 110",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Classic Poutine",
    fare: "Meals",
    vendor: "Frites",
    vendorHint: "Section 110",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "Vegan Poutine",
    fare: "Meals",
    vendor: "Frites",
    vendorHint: "Section 110",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
  },
  {
    name: "BBQ Brisket Poutine",
    fare: "Meals",
    vendor: "Frites",
    vendorHint: "Section 110",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host", "halal"]
  },
  {
    name: "Chicken Shawarma Poutine",
    fare: "Meals",
    vendor: "Frites",
    vendorHint: "Section 110",
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host", "halal"]
  },
  {
    name: "French Fries",
    description: "Triple-cooked, house-cut",
    fare: "Snacks",
    vendor: "Frites",
    vendorHint: "Section 110",
    dietary: ["Vegetarian", "Vegan", "Gluten Free"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host", "halal"]
  },

  // ── Pizza Pizza ─────────────────────────────────────────────────

  {
    name: "Cheese Pizza",
    fare: "Meals",
    vendor: "Pizza Pizza",
    vendorHint: "Sections 105, 108, 109, 115, 121, 127, 209",
    dietary: ["Vegetarian"],
    tags: ["mls", "cfl", "canada-soccer", "world-cup-host"]
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

export async function parseBmoFieldMenu(
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
