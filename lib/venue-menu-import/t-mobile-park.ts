/**
 * T-Mobile Park (Seattle Mariners) menu parser.
 *
 * Source: https://mktg.mlbstatic.com/mariners/documents/y2026/all-levels-food-roster.pdf
 * The source PDF is image-based (no extractable text layer), so this parser
 * uses a curated static dataset transcribed from the official All Levels
 * Food Roster poster. Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "t-mobile-park";
const VENUE_NAME = "T-Mobile Park";
const SOURCE_URL =
  "https://mktg.mlbstatic.com/mariners/documents/y2026/all-levels-food-roster.pdf";

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
  // ── Named Vendor Concepts (Asian) ─────────────────────────────

  {
    name: "Marination",
    description: "Hawaiian-Korean fusion",
    fare: "Meals",
    vendor: "Marination",
    vendorHint: "The 'Pen, Section 119"
  },
  {
    name: "Nakagawa Sushi",
    fare: "Meals",
    vendor: "Nakagawa Sushi",
    vendorHint: "Section 132"
  },
  {
    name: "Tamari Bar",
    description: "Japanese rice bowls and sides",
    fare: "Meals",
    vendor: "Tamari Bar",
    vendorHint: "Sections 132, 243"
  },
  {
    name: "Sumo Dog",
    description: "Japanese-style hot dogs",
    fare: "Meals",
    vendor: "Sumo Dog",
    vendorHint: "Section 119"
  },

  // ── BBQ ────────────────────────────────────────────────────────

  {
    name: "Rolling Smoke BBQ",
    description: "Smoked meats and BBQ sandwiches",
    fare: "Meals",
    vendor: "Rolling Smoke BBQ",
    vendorHint: "Section 313"
  },

  // ── Burgers ────────────────────────────────────────────────────

  {
    name: "Big League Burger",
    fare: "Meals",
    vendor: "Big League Burger",
    vendorHint: "Section 340"
  },
  {
    name: "Kidd Valley Burger",
    description: "Seattle burger chain",
    fare: "Meals",
    vendor: "Kidd Valley",
    vendorHint: "Sections 145, 325"
  },
  {
    name: "Great State Burger",
    description: "Pacific Northwest burgers",
    fare: "Meals",
    vendor: "Great State Burger",
    vendorHint: "The 'Pen, Section 218"
  },
  {
    name: "Hit It Here Café Burger",
    fare: "Meals",
    vendor: "Hit It Here Café",
    vendorHint: "Right Field"
  },

  // ── Cheesesteaks ───────────────────────────────────────────────

  {
    name: "Uncle Charlie's Cheesesteak",
    fare: "Meals",
    vendor: "Uncle Charlie's Cheesesteaks",
    vendorHint: "Sections 115, 140, 333"
  },

  // ── Chicken ────────────────────────────────────────────────────

  {
    name: "Chick Chick Boom",
    description: "Fried chicken",
    fare: "Meals",
    vendor: "Chick Chick Boom",
    vendorHint: "Section 106"
  },
  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendorHint:
      "Big League Burger 340, Double Play 136, Ivar's 117/335, Kidd Valley 145/325, Great State Burger, Chick Chick Boom 106"
  },
  {
    name: "Double Play Chicken & Sausage",
    fare: "Meals",
    vendor: "Double Play Chicken & Sausage",
    vendorHint: "Section 136"
  },

  // ── Mexican ────────────────────────────────────────────────────

  {
    name: "Edgar's Cantina",
    description: "Mexican food",
    fare: "Meals",
    vendor: "Edgar's Cantina",
    vendorHint: "Section 212"
  },
  {
    name: "El Rinconsito",
    description: "Mexican food",
    fare: "Meals",
    vendor: "El Rinconsito",
    vendorHint: "The 'Pen"
  },
  {
    name: "The Walking Taco",
    fare: "Meals",
    vendor: "The Walking Taco",
    vendorHint: "Sections 313, 333"
  },

  // ── Italian / Pizza ────────────────────────────────────────────

  {
    name: "Trattoria Pasta",
    description: "Italian pasta dishes",
    fare: "Meals",
    vendor: "Trattoria",
    vendorHint: "Section 216",
    dietary: ["Vegetarian"]
  },
  {
    name: "Ballard Pizza Co",
    fare: "Meals",
    vendor: "Ballard Pizza Co",
    vendorHint: "The 'Pen, Sections 132, 241",
    dietary: ["Vegetarian"]
  },
  {
    name: "High Cheese Pizza",
    fare: "Meals",
    vendor: "High Cheese Pizza",
    vendorHint: "Sections 109, 329"
  },
  {
    name: "Moto Pizza",
    fare: "Meals",
    vendor: "Moto Pizza",
    vendorHint: "Section 321"
  },

  // ── Seafood ────────────────────────────────────────────────────

  {
    name: "Ivar's Fish & Chips",
    description: "Seattle seafood institution — fish, chips, chowder",
    fare: "Meals",
    vendor: "Ivar's",
    vendorHint: "Sections 117, 335"
  },
  {
    name: "Sound Seafood",
    description: "Seafood sandwiches and chowder",
    fare: "Meals",
    vendor: "Sound Seafood",
    vendorHint: "Section 249"
  },
  {
    name: "The Way Back Crab Shack",
    description: "Crab, seafood, nachos",
    fare: "Meals",
    vendor: "The Way Back Crab Shack",
    vendorHint: "Section 187"
  },

  // ── Healthy / Salads ───────────────────────────────────────────

  {
    name: "The Natural",
    description: "Salads and healthy options",
    fare: "Meals",
    vendor: "The Natural",
    vendorHint: "Section 146",
    dietary: ["Vegetarian", "Gluten Free"]
  },

  // ── Seattle Classics ───────────────────────────────────────────

  {
    name: "Seattle Dog",
    description: "Seattle-style hot dog with cream cheese",
    fare: "Meals",
    vendor: "Grill Carts / Hempler's Box",
    vendorHint: "Grill Carts 131, 142; Hempler's Box 329; Beer Garden 221"
  },
  {
    name: "Turkey Legs",
    fare: "Meals",
    vendor: "King's Court",
    vendorHint: "Section 144"
  },
  {
    name: "Piroshky Piroshky",
    description: "Russian-style hand pies from Pike Place Market",
    fare: "Meals",
    vendor: "Piroshky Piroshky",
    vendorHint: "Section 132",
    dietary: ["Vegetarian"]
  },

  // ── Hot Dogs / Sausages ────────────────────────────────────────

  {
    name: "Hot Dog",
    fare: "Meals",
    vendorHint:
      "Walk-Off Market 105/126/141, Fair Territory 327, Great State Burger, Kidd Valley 145/325, Sumo Dog 119, Rolling Roof Refreshments"
  },
  {
    name: "Corn Dogs",
    fare: "Meals",
    vendor: "Fair Territory",
    vendorHint: "Section 327"
  },
  {
    name: "Hempler's Sausage",
    description: "Pacific Northwest sausages",
    fare: "Meals",
    vendor: "Hempler's Box",
    vendorHint: "Hempler's Box 329; Grill Carts 131, 142"
  },

  // ── Sides / Snacks ────────────────────────────────────────────

  {
    name: "Garlic Fries",
    fare: "Snacks",
    vendorHint:
      "Big League Burger 340, Double Play 136, Kidd Valley 145, Chick Chick Boom 106, Ivar's 117/335"
  },
  {
    name: "Nachos",
    description: "Cantina Nachos",
    fare: "Snacks",
    vendor: "Cantina Nacho Carts",
    vendorHint: "Sections 143, 195, 319, 333"
  },
  {
    name: "Value Nachos",
    fare: "Snacks",
    vendorHint:
      "Walk-Off Market, Rolling Roof Refreshments — Sections 105, 109, 118, 126, 141, 222, 244, 309, 319, 329, 347"
  },
  {
    name: "Pretzels",
    fare: "Snacks",
    vendorHint:
      "Dippin' Dots Carts, Rolling Roof Refreshments, Walk-Off Market"
  },
  {
    name: "Wings",
    fare: "Meals",
    vendor: "Walk-Off Market",
    vendorHint: "Section 105"
  },
  {
    name: "French Fries",
    fare: "Snacks",
    vendorHint: "Multiple concourse locations"
  },
  {
    name: "Tater Tot Onion Rings",
    fare: "Snacks",
    vendorHint: "Terrace Club, multiple locations"
  },

  // ── Desserts / Sweets ──────────────────────────────────────────

  {
    name: "Salt & Straw Ice Cream",
    description: "Portland-based craft ice cream",
    fare: "Desserts",
    vendor: "Salt & Straw",
    vendorHint: "Sections 111, 328"
  },
  {
    name: "Mister Softee",
    description: "Soft serve ice cream",
    fare: "Desserts",
    vendor: "Mister Softee",
    vendorHint: "Sections 109, 118, 132, 185, 214, 329, 340"
  },
  {
    name: "Chocolate Mousse Moose",
    description: "Mister Softee specialty dessert",
    fare: "Desserts",
    vendor: "Mister Softee",
    vendorHint: "Sections 122, 185"
  },
  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendor: "Dippin' Dots",
    vendorHint: "Carts at Sections 116, 119, 186, 323, 339"
  },
  {
    name: "Churros",
    fare: "Desserts",
    vendor: "Cantina Nacho Carts / The Walking Taco / Fair Territory",
    vendorHint: "Sections 143, 195, 313, 319, 327"
  },
  {
    name: "Funnel Cakes",
    fare: "Desserts",
    vendor: "Fair Territory",
    vendorHint: "Section 327"
  },
  {
    name: "Ube Coconut Rice Krispie",
    description: "Marination specialty dessert",
    fare: "Desserts",
    vendor: "Marination",
    vendorHint: "The 'Pen, Section 119"
  },
  {
    name: "Great State Cookie",
    fare: "Desserts",
    vendor: "Great State Burger",
    vendorHint: "The 'Pen, Section 218"
  },
  {
    name: "Souvenir Ice Cream Helmet",
    description: "Ice cream in a Mariners helmet",
    fare: "Desserts",
    vendor: "Mister Softee",
    vendorHint: "Mister Softee 122/185, Rolling Roof Refreshments"
  },

  // ── Souvenir / Novelty ─────────────────────────────────────────

  {
    name: "Souvenir Ferry Boat",
    description: "Food served in a souvenir Seattle ferry boat vessel",
    fare: "Meals",
    vendorHint: "Double Play Chicken & Sausage 136, The Way Back Crab Shack 187"
  },

  // ── Salads ─────────────────────────────────────────────────────

  {
    name: "Ballpark Salad",
    fare: "Meals",
    vendorHint:
      "Ballard Pizza Co, The Natural 146, Walk-Off Market, Trattoria 216",
    dietary: ["Vegetarian"]
  }
];

export async function parseTMobileParkMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl || SOURCE_URL;

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
      sourceUrl: url
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
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
