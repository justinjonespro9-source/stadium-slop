/**
 * Kauffman Stadium (Kansas City Royals) menu parser.
 *
 * Source: https://www.mlb.com/royals/ballpark/food
 * Curated static dataset from the official Royals Dining Guide.
 *
 * NOTE: This source is a mix of vendor/concept-level and item-level.
 * Several entries represent named food concepts; future passes can expand
 * with specific menu items as detail becomes available.
 *
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "kauffman-stadium";
const VENUE_NAME = "Kauffman Stadium";
const SOURCE_URL = "https://www.mlb.com/royals/ballpark/food";

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
  // ── New in 2026 ────────────────────────────────────────────────

  {
    name: "Hawaiian Bros Island Grill",
    description: "Hawaiian cuisine — sweet and savory island flavors",
    fare: "Meals",
    vendorHint: "Behind Home Plate near Royals Team Store; Diamond Club",
    tags: ["New in 2026"]
  },

  // ── KC Favorites ───────────────────────────────────────────────

  {
    name: "Z-Man Sandwich",
    description:
      "World-famous smoked brisket sandwich with crispy onion rings",
    fare: "Meals",
    vendor: "Joe's KC Bar-B-Que",
    vendorHint: "Right Field"
  },
  {
    name: "Italian Beef Pasqwich",
    fare: "Meals",
    vendor: "Pasquantino's",
    vendorHint: "Section 208"
  },
  {
    name: "Italian Sausage",
    description: "Locally sourced",
    fare: "Meals",
    vendor: "Italian Sausage Co.",
    vendorHint: "Section 234"
  },
  {
    name: "Andy's Frozen Custard",
    description: "Creamy frozen custard by the half pint",
    fare: "Desserts",
    vendorHint:
      "Sections 221, 239; Price Chopper Marketplace; Diamond Club"
  },
  {
    name: "Belfonte Ice Cream Sundae",
    fare: "Desserts",
    vendor: "Belfonte Ice Cream",
    vendorHint: "Center Field — Outfield Experience"
  },
  {
    name: "Belfonte Milkshake",
    fare: "Desserts",
    vendor: "Belfonte Ice Cream",
    vendorHint: "Center Field — Outfield Experience"
  },
  {
    name: "Brisketacho",
    description: "Loaded brisket nachos served in a baseball helmet",
    fare: "Meals",
    vendorHint: "Sections 221, 234, 417, 422"
  },
  {
    name: "Bullpen Burgers and Shakes",
    description: "Classic burgers, fries, and shakes",
    fare: "Meals",
    vendorHint: "Sections 250, 308, 413"
  },
  {
    name: "Tender Love & Chicken",
    description:
      "Gourmet chicken tenders, ranch-dusted fries, dipping sauces",
    fare: "Meals",
    vendorHint: "Sections 206, 308, 427"
  },

  // ── Restaurants — explicit food items ──────────────────────────

  {
    name: "Hand-Battered Chicken Tenders",
    fare: "Meals",
    vendor: "Craft & Draft",
    vendorHint: "Craft & Draft restaurant"
  },
  {
    name: "Quick-Fire Pizza",
    fare: "Meals",
    vendor: "Craft & Draft",
    vendorHint: "Craft & Draft restaurant"
  },
  {
    name: "Street Tacos",
    fare: "Meals",
    vendor: "Rivals",
    vendorHint: "Rivals restaurant"
  },

  // ── Value Menu ─────────────────────────────────────────────────

  {
    name: "Value Hot Dog",
    description: "$5 or less",
    fare: "Meals",
    vendorHint:
      "Sections 120, 135, 201, 213, 242, 405, 417, 422"
  },
  {
    name: "Value Pretzel",
    description: "$5 or less",
    fare: "Snacks",
    vendorHint:
      "Sections 120, 135, 201, 213, 242, 405, 417, 422"
  },

  // ── Gluten-Free & Vegetarian (Section 203 Marketplace) ────────

  {
    name: "GF Hot Dog",
    description: "Gluten-free bun",
    fare: "Meals",
    vendorHint: "Section 203 Marketplace",
    dietary: ["Gluten Free"]
  },
  {
    name: "Made to Order Salads",
    fare: "Meals",
    vendorHint: "Section 203 Marketplace",
    dietary: ["Gluten Free", "Vegetarian"]
  },
  {
    name: "Veggie Burger",
    fare: "Meals",
    vendorHint: "Section 203 Marketplace",
    dietary: ["Vegetarian"]
  },
  {
    name: "Beyond Brat",
    fare: "Meals",
    vendorHint: "Section 203 Marketplace",
    dietary: ["Vegetarian"]
  },
  {
    name: "Made to Order Wraps",
    fare: "Meals",
    vendorHint: "Section 203 Marketplace",
    dietary: ["Vegetarian"]
  }
];

export async function parseKauffmanStadiumMenu(
  _sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const items: VenueMenuSourceItem[] = [];

  for (const raw of MENU_DATA) {
    const dietaryTags = raw.dietary ?? [];
    const extraTags = raw.tags ?? [];

    items.push({
      name: raw.name,
      description: raw.description,
      fare: raw.fare,
      category: "Food",
      vendorName: raw.vendor ?? raw.name,
      vendorLocationHint: raw.vendorHint,
      dietaryTags,
      sourceUrl: SOURCE_URL
    });

    if (extraTags.length > 0) {
      const last = items[items.length - 1];
      last.dietaryTags = [
        ...dietaryTags,
        ...extraTags.filter((t): t is VenueMenuDietaryTag =>
          ["Gluten Free", "Lactose Free", "Vegan", "Vegetarian"].includes(t)
        )
      ];
    }
  }

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
