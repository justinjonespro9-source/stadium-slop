/**
 * Oracle Park (San Francisco Giants) menu parser.
 *
 * Curated from the official Oracle Park Food Guide. The source is a
 * highlight-style guide rather than a full item table, but each vendor
 * section explicitly names its menu items. All imports below are
 * item-level (directly mentioned or clearly derived from descriptions).
 *
 * Source: https://www.mlb.com/giants/ballpark/food
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "oracle-park";
const VENUE_NAME = "Oracle Park";
const SOURCE_URL = "https://www.mlb.com/giants/ballpark/food";

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
  // ── Gilroy Garlic Fries ─────────────────────────────────────────

  {
    name: "Gilroy Garlic Fries",
    description: "The iconic Oracle Park dish — garlicky fries",
    fare: "Snacks",
    vendorHint: "Various locations"
  },

  // ── Organic Coup ────────────────────────────────────────────────

  {
    name: "Organic Coup Chicken Sandwiches",
    description: "Celebrated organic chicken sandwiches with ranch or spicy BBQ",
    fare: "Meals",
    vendor: "Organic Coup"
  },
  {
    name: "Organic Coup Chicken Tenders",
    description: "Organic chicken tenders with ranch or spicy BBQ sauce",
    fare: "Meals",
    vendor: "Organic Coup"
  },
  {
    name: "Organic Coup Wraps",
    description: "Organic chicken wraps with ranch or spicy BBQ sauce",
    fare: "Meals",
    vendor: "Organic Coup"
  },
  {
    name: "Organic Coup Corn Dogs",
    fare: "Meals",
    vendor: "Organic Coup"
  },
  {
    name: "Organic Coup Salads",
    fare: "Meals",
    vendor: "Organic Coup"
  },
  {
    name: "Organic Coup Tots",
    fare: "Snacks",
    vendor: "Organic Coup"
  },

  // ── Crazy Crab'z ────────────────────────────────────────────────

  {
    name: "Crazy Crab'z Sandwich",
    description:
      "Dungeness crab piled between two slices of buttery grilled sourdough",
    fare: "Meals"
  },

  // ── Super Duper Burger ──────────────────────────────────────────

  {
    name: "Super Duper Burger",
    description:
      "Organic, locally-sourced, humanely raised, never frozen burgers made fresh daily",
    fare: "Meals",
    vendor: "Super Duper Burgers"
  },

  // ── fuku ────────────────────────────────────────────────────────

  {
    name: "fuku O.G. Chicken Sando",
    description: "Spicy fried chicken sandwich by chef David Chang",
    fare: "Meals",
    vendor: "fuku"
  },
  {
    name: "fuku Jumbo Tenders",
    fare: "Meals",
    vendor: "fuku"
  },
  {
    name: "fuku Waffle Fries",
    fare: "Snacks",
    vendor: "fuku"
  },
  {
    name: "fuku Impossible Nuggies",
    description: "Plant-based nuggets",
    fare: "Meals",
    vendor: "fuku",
    dietary: ["Vegan", "Vegetarian"]
  },

  // ── Tony's Pizza ────────────────────────────────────────────────

  {
    name: "Tony's Cheese Pizza",
    description: "From world pizza master Tony Gemignani of North Beach",
    fare: "Meals",
    vendor: "Tony's Pizza"
  },
  {
    name: "Tony's Pepperoni Pizza",
    fare: "Meals",
    vendor: "Tony's Pizza"
  },
  {
    name: "Tony's Veggie Pizza",
    fare: "Meals",
    vendor: "Tony's Pizza",
    dietary: ["Vegetarian"]
  },

  // ── Hot Dogs / Brats ────────────────────────────────────────────

  {
    name: "Bacon Wrapped Hot Dog",
    description: "Mission-style bacon-wrapped hot dog",
    fare: "Meals"
  },
  {
    name: "Sheboygan Bratwurst",
    fare: "Meals"
  },

  // ── Da Poke-Mon ─────────────────────────────────────────────────

  {
    name: "Poke Bowl",
    description:
      "Da Poke-Mon's spicy ahi tuna poke with mayo-based spicy sauce over rice, greens, or tortilla chips",
    fare: "Meals",
    vendor: "Da Poke-Mon"
  },

  // ── Pacific Eats ────────────────────────────────────────────────

  {
    name: "Banh Mi",
    description: "Choice of tofu, chicken, or bulgogi",
    fare: "Meals",
    vendor: "Pacific Eats",
    vendorHint: "Section 127"
  },
  {
    name: "Rice Bowl",
    description: "Choice of tofu, chicken, or bulgogi",
    fare: "Meals",
    vendor: "Pacific Eats",
    vendorHint: "Section 127"
  },

  // ── Pita Gyros ──────────────────────────────────────────────────

  {
    name: "Pita Gyros",
    description: "Authentic lamb and beef gyros from San Bruno-based Pita Gyros",
    fare: "Meals",
    vendor: "Pita Gyros"
  },
  {
    name: "Chicken Gyros",
    fare: "Meals",
    vendor: "Pita Gyros"
  },
  {
    name: "Falafel Sandwich",
    fare: "Meals",
    vendor: "Pita Gyros",
    dietary: ["Vegan", "Vegetarian"]
  },
  {
    name: "Dolmas",
    fare: "Snacks",
    vendor: "Pita Gyros",
    dietary: ["Vegetarian"]
  },
  {
    name: "Baklava",
    fare: "Desserts",
    vendor: "Pita Gyros",
    dietary: ["Vegetarian"]
  },

  // ── Desserts / Ice Cream ────────────────────────────────────────

  {
    name: "Ghirardelli Hot Fudge Sundae",
    description:
      "Vanilla ice cream with handmade hot fudge, whipped cream, diced almonds, and a cherry",
    fare: "Desserts",
    vendor: "Ghirardelli"
  },
  {
    name: "Klimon Non-Dairy Ice Cream",
    description: "Creamy non-dairy ice cream for all dietary restrictions",
    fare: "Desserts",
    vendor: "Klimon",
    dietary: ["Vegan"]
  },

  // ── The Lumpia Company ──────────────────────────────────────────

  {
    name: "Shanghai Lumpia",
    description: "Shanghai-style lumpia from Bay Area favorite The Lumpia Company",
    fare: "Snacks",
    vendor: "The Lumpia Company"
  },
  {
    name: "Vegan Lumpia",
    fare: "Snacks",
    vendor: "The Lumpia Company",
    dietary: ["Vegan", "Vegetarian"]
  },
  {
    name: "Bacon Cheeseburger Lumpia",
    fare: "Snacks",
    vendor: "The Lumpia Company"
  },

  // ── The Garden ──────────────────────────────────────────────────

  {
    name: "The Garden Flatbread Pizza",
    description: "Made without gluten-containing ingredients",
    fare: "Meals",
    vendorHint: "The Garden, lower centerfield",
    dietary: ["Gluten Free"]
  },
  {
    name: "The Garden All-Beef Hot Dog",
    description: "Made without gluten-containing ingredients",
    fare: "Meals",
    vendorHint: "The Garden, lower centerfield",
    dietary: ["Gluten Free"]
  },
  {
    name: "The Garden Seasonal Salad",
    description: "Made without gluten-containing ingredients",
    fare: "Meals",
    vendorHint: "The Garden, lower centerfield",
    dietary: ["Gluten Free"]
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

export async function parseOracleParkMenu(
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
