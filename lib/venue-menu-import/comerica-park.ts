/**
 * Comerica Park (Detroit Tigers) menu parser.
 *
 * Source: https://www.mlb.com/tigers/ballpark/food-finder
 * Curated static dataset from the official Tigers Food Finder.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "comerica-park";
const VENUE_NAME = "Comerica Park";
const SOURCE_URL = "https://www.mlb.com/tigers/ballpark/food-finder";

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
  // ── Value Items ────────────────────────────────────────────────

  {
    name: "Hot Dog Value Meal",
    description:
      "Hot dog, bag of chips, 16 oz fountain drink — $9.42 (also Kids Value Meal)",
    fare: "Meals",
    vendorHint:
      "100 Level: 108, 130 · 200 Level: 213 · 300 Level: 325, 327, 331, 339, 343"
  },
  {
    name: "Pizza Value Meal",
    description:
      "Little Caesars Super Slice, 16 oz fountain drink — $12.50",
    fare: "Meals",
    vendor: "Little Caesars",
    vendorHint:
      "100 Level: 115, 137 · 200 Level: 217 · 300 Level: 334"
  },

  // ── Classic Ballpark Fare ──────────────────────────────────────

  {
    name: "All Beef Hot Dogs",
    fare: "Meals",
    vendorHint: "100 Level: 104, 113, 125, 131, 134"
  },
  {
    name: "Ball Park Franks",
    fare: "Meals",
    vendorHint:
      "100 Level: 108, 116, 130, 139, 147, 151 · 200 Level: 213, 214 · 300 Level: 325, 327, 328, 331, 339, 343"
  },
  {
    name: "Brats",
    fare: "Meals",
    vendorHint: "100 Level: 104, 113, 134"
  },
  {
    name: "Nachos",
    fare: "Snacks",
    vendorHint:
      "100 Level: 108, 116, 119, 130 · 200 Level: 213 · 300 Level: 325, 331, 339"
  },

  // ── Dietary & Allergy Friendly ─────────────────────────────────

  {
    name: "Impossible Burger",
    fare: "Meals",
    vendorHint: "100 Level: 119 · 300 Level: 327",
    dietary: ["Vegetarian"]
  },
  {
    name: "Veggie Dogs",
    fare: "Meals",
    vendorHint:
      "100 Level: 108, 130 · 200 Level: 213 · 300 Level: 325",
    dietary: ["Vegan"]
  },

  // ── Local Concepts ─────────────────────────────────────────────

  {
    name: "Dubai Chocolate Strawberries",
    description: "Also available as plain strawberries",
    fare: "Desserts",
    vendorHint: "100 Level: 132 · 300 Level: 340"
  },
  {
    name: "Fairway",
    fare: "Meals",
    vendorHint: "100 Level: 151"
  },
  {
    name: "Green Dot Sliders",
    fare: "Meals",
    vendorHint: "100 Level: 143"
  },
  {
    name: "Pierogi Nacho",
    fare: "Meals",
    vendorHint: "100 Level: 122"
  },
  {
    name: "Slows BBQ",
    description: "Detroit-famous slow-smoked BBQ",
    fare: "Meals",
    vendor: "Slows Bar BQ",
    vendorHint: "100 Level: 149"
  },
  {
    name: "Slows Mac & Cheese",
    fare: "Meals",
    vendor: "Slows Bar BQ",
    vendorHint: "100 Level: 149"
  },
  {
    name: "Smashburger",
    fare: "Meals",
    vendorHint: "100 Level: 119, 151"
  },
  {
    name: "Smoked Short Rib Sandwich",
    fare: "Meals",
    vendorHint: "300 Level: 328"
  },
  {
    name: "Steak Frites",
    fare: "Meals",
    vendorHint: "100 Level: 151"
  },
  {
    name: "Steak Sandwich",
    fare: "Meals",
    vendorHint: "100 Level: 151"
  },
  {
    name: "Taqueria El Rey Steak Tacos",
    fare: "Meals",
    vendor: "Taqueria El Rey",
    vendorHint: "100 Level: 119"
  },
  {
    name: "Taqueria El Rey Chorizo Tacos",
    fare: "Meals",
    vendor: "Taqueria El Rey",
    vendorHint: "100 Level: 119"
  },
  {
    name: "Taqueria El Rey Street Corn Nacho",
    fare: "Meals",
    vendor: "Taqueria El Rey",
    vendorHint: "100 Level: 119"
  },
  {
    name: "Tiger Tail",
    fare: "Desserts",
    vendorHint: "300 Level: 336"
  },

  // ── Mains ──────────────────────────────────────────────────────

  {
    name: "BBQ",
    fare: "Meals",
    vendorHint: "100 Level: 133, 149"
  },
  {
    name: "Brisket Sandwiches",
    fare: "Meals",
    vendorHint: "100 Level: 133, 149"
  },
  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendorHint:
      "100 Level: 101, 119 · 300 Level: 327, 336"
  },
  {
    name: "Chili Cheese Fries",
    fare: "Snacks",
    vendorHint: "100 Level: 119 · 300 Level: 327, 336"
  },
  {
    name: "Coney Style Hot Dogs",
    description: "Detroit-style coney dog",
    fare: "Meals",
    vendorHint: "100 Level: 105, 119"
  },
  {
    name: "Fresh Italian Sausage",
    fare: "Meals",
    vendorHint:
      "100 Level: 104, 113, 125, 134, 139, 147 · 200 Level: 212"
  },
  {
    name: "Pizza",
    description: "Little Caesars",
    fare: "Meals",
    vendor: "Little Caesars",
    vendorHint:
      "100 Level: 115, 119, 137 · 200 Level: 217 · 300 Level: 323, 334"
  },
  {
    name: "Polish Sausage",
    fare: "Meals",
    vendorHint: "100 Level: 113, 131, 134"
  },
  {
    name: "Snap Dog with Onions",
    fare: "Meals",
    vendorHint: "100 Level: 105, 119"
  },
  {
    name: "Soft Tacos",
    fare: "Meals",
    vendorHint: "100 Level: 119, 129"
  },
  {
    name: "Street Nachos",
    fare: "Snacks",
    vendorHint: "100 Level: 119, 129"
  },

  // ── Sweet Treats (selective) ───────────────────────────────────

  {
    name: "Elephant Ears",
    fare: "Desserts",
    vendorHint: "100 Level: 119"
  },
  {
    name: "Dippin Dots",
    fare: "Desserts",
    vendorHint:
      "100 Level: 111, 128, 151 · 200 Level: 213 · 300 Level: 333, 334"
  }
];

export async function parseComericaParkMenu(
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
      vendorName: raw.vendor,
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
