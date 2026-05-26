/**
 * Rogers Centre (Toronto Blue Jays) menu parser.
 *
 * Source: https://www.mlb.com/bluejays/ballpark/food-finder
 * Curated static dataset from the official Blue Jays Food Finder.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "rogers-centre";
const VENUE_NAME = "Rogers Centre";
const SOURCE_URL = "https://www.mlb.com/bluejays/ballpark/food-finder";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

const MENU_DATA: RawItem[] = [
  // ── Fries ──────────────────────────────────────────────────────
  {
    name: "Bulgogi Fries",
    fare: "Snacks",
    vendorHint: "100 Level: Section 109"
  },
  {
    name: "Classic Poutine",
    fare: "Meals",
    vendorHint: "100, 200, 500 Levels"
  },
  {
    name: "French Fries with Gravy",
    fare: "Snacks",
    vendorHint: "200 Level: Section 219"
  },
  {
    name: "Kosher Curly Fries",
    fare: "Snacks",
    vendorHint: "200 Level: Section 210"
  },
  {
    name: "Loaded Shawarma Fries",
    description: "Beef or chicken",
    fare: "Meals",
    vendorHint: "100 Level: Section 127"
  },
  {
    name: "Mary Brown's Taters",
    fare: "Snacks",
    vendor: "Mary Brown's",
    vendorHint: "100 Level: Section 140; 500 Level: Section 511"
  },
  {
    name: "Mary Brown's Tater Poutine",
    fare: "Meals",
    vendor: "Mary Brown's",
    vendorHint: "100 Level: Section 140; 500 Level: Section 511"
  },
  {
    name: "McCain French Fries",
    fare: "Snacks",
    vendorHint: "100, 200, 500 Levels — multiple locations"
  },
  {
    name: "Sagi-Papa Fries",
    fare: "Snacks",
    vendorHint: "500 Level: Section 519"
  },

  // ── Grab & Go ──────────────────────────────────────────────────
  {
    name: "Poke Bowl",
    fare: "Meals",
    vendorHint: "100 Level: The Stop, Section 104"
  },

  // ── Hot Dogs & Sausage ─────────────────────────────────────────
  {
    name: "Ace's Crunch Dog",
    fare: "Meals",
    vendorHint: "200 Level: Section 208; 500 Level: TD Park Social"
  },
  {
    name: "Al Pastor Dog",
    fare: "Meals",
    vendorHint: "200 Level: Section 208; 500 Level: TD Park Social"
  },
  {
    name: "Barrio Eats Dog",
    fare: "Meals",
    vendorHint: "500 Level: Section 519"
  },
  {
    name: "Bulgogi Dog",
    fare: "Meals",
    vendorHint: "100 Level: Section 109"
  },
  {
    name: "Chungchun Chocolate Dog",
    fare: "Meals",
    vendor: "Chungchun Rice Dog",
    vendorHint: "100 Level: Section 110"
  },
  {
    name: "Chungchun Domer Rice Dog",
    fare: "Meals",
    vendor: "Chungchun Rice Dog",
    vendorHint: "100 Level: Section 110"
  },
  {
    name: "Chungchun Gamsung Dog",
    description: "Potato-crusted corn dog",
    fare: "Meals",
    vendor: "Chungchun Rice Dog",
    vendorHint: "100 Level: Section 110"
  },
  {
    name: "Chungchun Half Mozzarella Dog",
    fare: "Meals",
    vendor: "Chungchun Rice Dog",
    vendorHint: "100 Level: Section 110"
  },
  {
    name: "Chungchun Whole Mozzarella Dog",
    fare: "Meals",
    vendor: "Chungchun Rice Dog",
    vendorHint: "100 Level: Section 110"
  },
  {
    name: "Field Roast Frank",
    description: "Veggie dog",
    fare: "Meals",
    vendorHint: "100 Level: Section 109; 200 Level: Sections 219, 229; 500 Level: Section 514",
    dietary: ["Vegan"]
  },
  {
    name: "Gluten Free Hot Dog",
    fare: "Meals",
    vendorHint: "100 Level: Section 109; 200 Level: Section 229; 500 Level: Section 514",
    dietary: ["Gluten Free"]
  },
  {
    name: "Hot Maple & Bacon Hot Dog",
    fare: "Meals",
    vendorHint:
      "100 Level: The Stop; 200 Level: WestJet Flight Deck, Section 208; 500 Level: TD Park Social"
  },
  {
    name: "Hot Maple & Bacon Footlong Hot Dog",
    fare: "Meals",
    vendorHint: "100, 200, 500 Levels — multiple locations"
  },
  {
    name: "Kosher Chicken Dog",
    fare: "Meals",
    vendorHint: "200 Level: Section 210"
  },
  {
    name: "Kosher Footlong Dog",
    fare: "Meals",
    vendorHint: "200 Level: Section 210"
  },
  {
    name: "Kosher Hot Dog",
    fare: "Meals",
    vendorHint: "200 Level: Section 210"
  },
  {
    name: "Kosher Veggie Dog",
    fare: "Meals",
    vendorHint: "200 Level: Section 210",
    dietary: ["Vegetarian"]
  },
  {
    name: "Schneiders Ballpark Hot Dog",
    fare: "Meals",
    vendor: "Schneiders",
    vendorHint: "Throughout Rogers Centre — 100, 200, 500 Levels"
  },
  {
    name: "Schneiders Footlong Hot Dog",
    fare: "Meals",
    vendor: "Schneiders",
    vendorHint: "100, 200, 500 Levels — multiple locations"
  },
  {
    name: "The Captain's Dog",
    fare: "Meals",
    vendorHint: "200 Level: Section 219"
  },

  // ── Ice Cream ──────────────────────────────────────────────────
  {
    name: "Apple Turnover Sundae",
    fare: "Desserts",
    vendorHint: "100 Level: Section 103"
  },
  {
    name: "Drumstick Ice Cream Cone",
    fare: "Desserts",
    vendorHint: "100, 200, 500 Levels"
  },
  {
    name: "Häagen-Dazs Bar",
    fare: "Desserts",
    vendor: "Häagen-Dazs",
    vendorHint: "100, 200, 500 Levels"
  },
  {
    name: "Ice Cream Float",
    description: "Crush Orange, Crush Cream Soda, or Dr. Pepper",
    fare: "Desserts",
    vendorHint: "100 Level: Section 103; 500 Level: Section 524, TD Park Social"
  },
  {
    name: "Shaved Ice",
    fare: "Desserts",
    vendorHint: "500 Level: TD Park Social"
  },
  {
    name: "Souvenir Ice Cream Helmet",
    fare: "Desserts",
    vendorHint: "100, 200, 500 Levels — multiple locations"
  },
  {
    name: "Sundae in a Souvenir Helmet",
    fare: "Desserts",
    vendorHint: "500 Level: TD Park Social"
  },

  // ── Mains ──────────────────────────────────────────────────────
  {
    name: "Applewood Smoked Brisket Nachos",
    fare: "Meals",
    vendorHint:
      "200 Level: WestJet Flight Deck; 500 Level: Corona Rooftop Patio"
  },
  {
    name: "Brisket Grilled Cheese",
    fare: "Meals",
    vendorHint: "500 Level: TD Park Social"
  },
  {
    name: "Cubano Sliders",
    description: "Served with kettle chips",
    fare: "Meals",
    vendorHint:
      "100 Level: The Catch Bar; 500 Level: TD Park Social"
  },
  {
    name: "Chicken Tenders with Fries",
    fare: "Meals",
    vendorHint: "100, 200, 500 Levels — multiple locations"
  },
  {
    name: "Chorizo Queso",
    fare: "Meals",
    vendorHint:
      "100 Level: Section 143; 200 Level: WestJet Flight Deck; 500 Level: Corona Rooftop Patio"
  },
  {
    name: "Fish & Chips",
    fare: "Meals",
    vendorHint: "200 Level: Section 219"
  },
  {
    name: "Homerun Skewers",
    fare: "Meals",
    vendorHint: "100 Level: The Stop"
  },
  {
    name: "Jerk Chicken Nachos",
    fare: "Meals",
    vendorHint: "100 Level: The Stop"
  },
  {
    name: "Junior Grilled Cheese",
    fare: "Meals",
    vendorHint: "500 Level: TD Park Social"
  },
  {
    name: "Kaz-adilla",
    description: "Cheese, chicken, or smoked brisket quesadilla",
    fare: "Meals",
    vendorHint:
      "100 Level: Section 143; 500 Level: Corona Rooftop Patio, TD Park Social"
  },
  {
    name: "Korean BBQ Dumplings",
    fare: "Meals",
    vendorHint: "500 Level: Section 529"
  },
  {
    name: "Kosher Fried Chicken Sub",
    fare: "Meals",
    vendorHint: "200 Level: Section 210"
  },
  {
    name: "Kosher Chicken Tenders with Curly Fries",
    fare: "Meals",
    vendorHint: "200 Level: Section 210"
  },
  {
    name: "Loaded Mac & Cheese",
    description: "Maple bacon or brisket",
    fare: "Meals",
    vendorHint: "100 Level: The Catch Bar"
  },
  {
    name: "Mac & Cheese",
    fare: "Meals",
    vendorHint: "100 Level: The Catch Bar"
  },
  {
    name: "Mary Brown's Chicken Wings",
    fare: "Meals",
    vendor: "Mary Brown's",
    vendorHint: "100 Level: Section 140"
  },
  {
    name: "Mary Brown's Original Big Mary",
    fare: "Meals",
    vendor: "Mary Brown's",
    vendorHint: "500 Level: Section 511"
  },
  {
    name: "Mary Brown's Original Big Mary with Taters",
    fare: "Meals",
    vendor: "Mary Brown's",
    vendorHint: "100 Level: Section 140; 500 Level: Section 511"
  },
  {
    name: "Mary Brown's Original Chicken Tenders with Taters",
    fare: "Meals",
    vendor: "Mary Brown's",
    vendorHint: "100 Level: Section 140; 500 Level: Section 511"
  },
  {
    name: "Mary Brown's Spicy Big Mary with Taters",
    fare: "Meals",
    vendor: "Mary Brown's",
    vendorHint: "100 Level: Section 140; 500 Level: Section 511"
  },
  {
    name: "Shawarma Bowl",
    description: "Beef",
    fare: "Meals",
    vendorHint: "100 Level: Section 127"
  },
  {
    name: "Shawarma Wrap",
    description: "Chicken or beef",
    fare: "Meals",
    vendorHint: "100 Level: Section 127"
  },
  {
    name: "Smash Burger with Kettle Chips",
    fare: "Meals",
    vendorHint: "100 Level: Section 137; 500 Level: Section 520"
  },
  {
    name: "Smoked Brisket Sandwich",
    fare: "Meals",
    vendorHint: "200 Level: WestJet Flight Deck"
  },
  {
    name: "Steamed Buns",
    description: "Chicken or pork",
    fare: "Meals",
    vendorHint: "100 Level: The Stop"
  },
  {
    name: "Tacos with Chips & Pico",
    description: "Brisket, chicken, or vegan steak",
    fare: "Meals",
    vendorHint: "100 Level: Section 143"
  },

  // ── Pizza ──────────────────────────────────────────────────────
  {
    name: "Pizza Nova Cheese Slice",
    fare: "Meals",
    vendor: "Pizza Nova",
    vendorHint: "100, 200, 500 Levels",
    dietary: ["Vegetarian"]
  },
  {
    name: "Pizza Nova Pepperoni Slice",
    fare: "Meals",
    vendor: "Pizza Nova",
    vendorHint: "100, 200, 500 Levels"
  },
  {
    name: "Pizza Nova Signature Slices",
    fare: "Meals",
    vendor: "Pizza Nova",
    vendorHint: "100, 200, 500 Levels"
  },
  {
    name: "Pizza Nova Vegetarian Slice",
    fare: "Meals",
    vendor: "Pizza Nova",
    vendorHint: "100, 200, 500 Levels",
    dietary: ["Vegetarian"]
  },
  {
    name: "Pizza Nova Dips",
    description: "Creamy garlic or cheddar jalapeño",
    fare: "Snacks",
    vendor: "Pizza Nova",
    vendorHint: "100, 200, 500 Levels"
  },

  // ── Sandwiches ─────────────────────────────────────────────────
  {
    name: "Cheesesteak",
    fare: "Meals",
    vendorHint: "100 Level: The Stop"
  },
  {
    name: "Panini",
    description: "Meatball or Montreal smoked meat",
    fare: "Meals",
    vendorHint: "100 Level: The Catch Bar"
  },
  {
    name: "Kosher Pastrami Sandwich on Rye",
    fare: "Meals",
    vendorHint: "200 Level: Section 210"
  },
  {
    name: "Shaved Beef Sandwich",
    fare: "Meals",
    vendorHint: "100 Level: The Stop; 500 Level: Section 539"
  },

  // ── Snacks ─────────────────────────────────────────────────────
  {
    name: "Andrea's Cookies",
    fare: "Desserts",
    vendorHint: "100 Level: Section 103"
  },
  {
    name: "Bavarian Pretzel",
    fare: "Snacks",
    vendorHint:
      "100 Level: The Stop, The Catch Bar, Sections 121, 126; 200 Level: Section 219; 500 Level: Sections 514, 519, 529, 534, TD Park Social"
  },
  {
    name: "Biscotti",
    fare: "Desserts",
    vendorHint: "100 Level: Section 103"
  },
  {
    name: "Cheesy Garlic Knots",
    fare: "Snacks",
    vendorHint:
      "100 Level: The Catch Bar; 200 Level: Section 219; 500 Level: Section 519"
  },
  {
    name: "Chicharron Plantain Cup",
    fare: "Snacks",
    vendorHint: "500 Level: Section 519"
  },
  {
    name: "Churros",
    description: "Biscoff or Blueberry Pie",
    fare: "Desserts",
    vendorHint: "100 Level: Section 103; 500 Level: TD Park Social"
  },
  {
    name: "Crispy Calamari",
    fare: "Snacks",
    vendorHint: "200 Level: Section 219"
  },
  {
    name: "Jamaican Beef Patty",
    fare: "Snacks",
    vendorHint: "100 Level: The Stop"
  },
  {
    name: "Kosher Chocolate Chunk Cookies",
    fare: "Desserts",
    vendorHint: "200 Level: Section 210"
  },
  {
    name: "Kosher Deep Fried Pickle Chips",
    fare: "Snacks",
    vendorHint: "200 Level: Section 210"
  },
  {
    name: "Kosher Pretzel",
    fare: "Snacks",
    vendorHint: "200 Level: Section 210"
  },
  {
    name: "Nachos with Cheese",
    fare: "Snacks",
    vendorHint:
      "100, 200, 500 Levels — multiple locations"
  },
  {
    name: "Schneiders Pepperettes",
    description: "Maple or BBQ",
    fare: "Snacks",
    vendor: "Schneiders",
    vendorHint: "100, 200, 500 Levels"
  },
  {
    name: "Smuckers Uncrustables",
    fare: "Snacks",
    vendorHint: "100, 200, 500 Levels"
  },
  {
    name: "Specialty Popcorn",
    fare: "Snacks",
    vendorHint: "100, 200, 500 Levels"
  },
  {
    name: "Specialty Stuffed Jamaican Patty",
    fare: "Snacks",
    vendorHint: "100 Level: The Stop"
  },
  {
    name: "Uncrustables French Toast",
    fare: "Snacks",
    vendorHint: "100 Level: Section 103"
  },
  {
    name: "Value Pretzel Bites",
    fare: "Snacks",
    vendorHint: "200 Level: Section 240; 500 Level: Section 537"
  },
  {
    name: "Cotton Candy",
    fare: "Snacks",
    vendorHint: "100, 200, 500 Levels"
  }
];

export async function parseRogersCentreMenu(
  _sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const items: VenueMenuSourceItem[] = MENU_DATA.map((raw) => ({
    name: raw.name,
    description: raw.description,
    fare: raw.fare,
    category: "Food" as const,
    vendorName: raw.vendor,
    vendorLocationHint: raw.vendorHint,
    dietaryTags: raw.dietary ?? [],
    sourceUrl: SOURCE_URL
  }));

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
