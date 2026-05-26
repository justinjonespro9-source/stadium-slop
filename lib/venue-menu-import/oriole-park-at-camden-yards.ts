/**
 * Oriole Park at Camden Yards (Baltimore Orioles) menu parser.
 *
 * Source: https://www.mlb.com/orioles/ballpark/food/concessions-roster
 * Curated static dataset from the official MLB concessions roster.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "oriole-park-at-camden-yards";
const VENUE_NAME = "Oriole Park at Camden Yards";
const SOURCE_URL =
  "https://www.mlb.com/orioles/ballpark/food/concessions-roster";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

const MENU_DATA: RawItem[] = [
  // ── Bleacher Grill (Eutaw St.) ─────────────────────────────────
  {
    name: "The Warehouse Dog",
    fare: "Meals",
    vendor: "Bleacher Grill",
    vendorHint: "Eutaw St. near Gate H"
  },
  {
    name: "B'More Chicken Box",
    fare: "Meals",
    vendor: "Bleacher Grill",
    vendorHint: "Eutaw St. near Gate H"
  },
  {
    name: "Big Scrap",
    description: "Crispy scrapple, two smashed all-beef patties, toppings, potato bun",
    fare: "Meals",
    vendor: "Bleacher Grill",
    vendorHint: "Eutaw St. near Gate H"
  },
  {
    name: "Big Mozz Sticks",
    fare: "Snacks",
    vendor: "Bleacher Grill",
    vendorHint: "Eutaw St. near Gate H"
  },

  // ── Boog's BBQ (Eutaw St., Sec. 242) ──────────────────────────
  {
    name: "Boog's Shaved Beef",
    fare: "Meals",
    vendor: "Boog's BBQ",
    vendorHint: "Eutaw St., Section 242"
  },
  {
    name: "Boog's Turkey",
    fare: "Meals",
    vendor: "Boog's BBQ",
    vendorHint: "Eutaw St., Section 242"
  },
  {
    name: "Beans and Coleslaw",
    fare: "Snacks",
    vendor: "Boog's BBQ",
    vendorHint: "Eutaw St. only"
  },

  // ── Eutaw Street Butchery by Pat LaFrieda ──────────────────────
  {
    name: "Meatball Smash",
    fare: "Meals",
    vendor: "Pat LaFrieda Meats",
    vendorHint: "Eutaw St. near Gate A, Section 334"
  },
  {
    name: "B'More Yak",
    description: "Noodles, shrimp, sliced hot dog, boiled egg, green onion",
    fare: "Meals",
    vendor: "Pat LaFrieda Meats",
    vendorHint: "Eutaw St. near Gate A"
  },
  {
    name: "Cheddar Bratwurst",
    fare: "Meals",
    vendor: "Pat LaFrieda Meats",
    vendorHint: "Eutaw St. near Gate A, Section 334"
  },
  {
    name: "Patty Smash",
    fare: "Meals",
    vendor: "Pat LaFrieda Meats",
    vendorHint: "Section 334"
  },

  // ── Baltimore Seafood House (Sec. 5, 228, 248) ────────────────
  {
    name: "True Blue Crab Cake Sando",
    description: "Made with certified Maryland Blue Crab, limited per game",
    fare: "Meals",
    vendor: "Baltimore Seafood House",
    vendorHint: "Section 5 only"
  },
  {
    name: "'92 Crab Cake Sandwich",
    fare: "Meals",
    vendor: "Baltimore Seafood House",
    vendorHint: "Sections 5, 228, 248; also Boog's BBQ Section 242"
  },
  {
    name: "Crab Smash Tacos",
    fare: "Meals",
    vendor: "Baltimore Seafood House",
    vendorHint: "Sections 5, 228, 248"
  },
  {
    name: "Shrimp Basket",
    fare: "Meals",
    vendor: "Baltimore Seafood House",
    vendorHint: "Section 5 only"
  },
  {
    name: "The Chessie",
    description: "Footlong Chesapeake sausage with crab dip",
    fare: "Meals",
    vendor: "Baltimore Seafood House",
    vendorHint: "Section 5 only"
  },
  {
    name: "Drunken Crab Soup",
    description: "Seasonal",
    fare: "Meals",
    vendor: "Baltimore Seafood House",
    vendorHint: "Section 5 only"
  },
  {
    name: "Crab Fries",
    fare: "Snacks",
    vendor: "Baltimore Seafood House",
    vendorHint: "Section 5; also All-Star Kitchen Sections 214, 258"
  },

  // ── B&O Market (Eutaw St.) ─────────────────────────────────────
  {
    name: "B&O Grab & Go Sandwich",
    fare: "Meals",
    vendor: "B&O Market",
    vendorHint: "Eutaw St. near Gate A"
  },
  {
    name: "B&O Grab & Go Salad",
    fare: "Meals",
    vendor: "B&O Market",
    vendorHint: "Eutaw St. near Gate A"
  },

  // ── Birdland Kosher (Sec. 80) ──────────────────────────────────
  {
    name: "Hot Pastrami Sandwich on Rye",
    fare: "Meals",
    vendor: "Birdland Kosher",
    vendorHint: "Section 80",
    dietary: ["Gluten Free"]
  },
  {
    name: "Kosher Chicken Nuggets",
    fare: "Snacks",
    vendor: "Birdland Kosher",
    vendorHint: "Section 80"
  },

  // ── The Local Fry (Sec. 27) ────────────────────────────────────
  {
    name: "Loaded Fries",
    description: "Crab, chicken bacon ranch, and taco varieties",
    fare: "Snacks",
    vendor: "The Local Fry",
    vendorHint: "Section 27"
  },
  {
    name: "Seasoned Fries",
    description: "Plain, Old Bay, Cajun, Garlic Parmesan",
    fare: "Snacks",
    vendor: "The Local Fry",
    vendorHint: "Section 27"
  },
  {
    name: "Chicken Sliders",
    fare: "Meals",
    vendor: "The Local Fry",
    vendorHint: "Section 27"
  },

  // ── Vida Taco (Sec. 31) ────────────────────────────────────────
  {
    name: "Standard Nacho",
    description: "With option to add crab",
    fare: "Snacks",
    vendor: "Vida Taco",
    vendorHint: "Section 31",
    dietary: ["Vegetarian", "Gluten Free"]
  },
  {
    name: "Vida Taco Rice Bowl",
    description: "With option to add crab",
    fare: "Meals",
    vendor: "Vida Taco",
    vendorHint: "Section 31",
    dietary: ["Gluten Free"]
  },
  {
    name: "Gringo Tacos",
    description: "Beef, chicken, or sweet potato",
    fare: "Meals",
    vendor: "Vida Taco",
    vendorHint: "Section 31",
    dietary: ["Gluten Free"]
  },

  // ── Factoria Maria Pupuseria (Sec. 44) ─────────────────────────
  {
    name: "Pupusas",
    description: "Pork & cheese, chicken & cheese, bean & cheese, cheese, or bean & vegetable",
    fare: "Meals",
    vendor: "Factoria Maria Pupuseria",
    vendorHint: "Section 44",
    dietary: ["Gluten Free"]
  },
  {
    name: "Quesadillas",
    description: "Chicken, steak, or cheese",
    fare: "Meals",
    vendor: "Factoria Maria Pupuseria",
    vendorHint: "Section 44"
  },
  {
    name: "The Chorizo Dog",
    fare: "Meals",
    vendor: "Factoria Maria Pupuseria",
    vendorHint: "Section 44"
  },

  // ── Fuzzies Burgers (Sec. 46) ──────────────────────────────────
  {
    name: "The Fuzzy Burger",
    fare: "Meals",
    vendor: "Fuzzies Burgers",
    vendorHint: "Section 46"
  },
  {
    name: "Basic-B Burger",
    fare: "Meals",
    vendor: "Fuzzies Burgers",
    vendorHint: "Section 46"
  },
  {
    name: "Plainy Janie Burger",
    fare: "Meals",
    vendor: "Fuzzies Burgers",
    vendorHint: "Section 46"
  },
  {
    name: "Fuzzies Seasoned Fries",
    description: "Shore-Style, Pickleback, Classic",
    fare: "Snacks",
    vendor: "Fuzzies Burgers",
    vendorHint: "Section 46"
  },

  // ── Ekiben (Sec. 73) ──────────────────────────────────────────
  {
    name: "Neighborhood Bird Bun",
    description: "Regular and Spicy",
    fare: "Meals",
    vendor: "Ekiben",
    vendorHint: "Section 73"
  },
  {
    name: "Tofu Brah Bun",
    fare: "Meals",
    vendor: "Ekiben",
    vendorHint: "Section 73",
    dietary: ["Vegan"]
  },
  {
    name: "Ramen Broccoli",
    fare: "Meals",
    vendor: "Ekiben",
    vendorHint: "Section 73",
    dietary: ["Vegan"]
  },
  {
    name: "Crispy Tofu Nuggets",
    fare: "Snacks",
    vendor: "Ekiben",
    vendorHint: "Section 73",
    dietary: ["Vegan"]
  },
  {
    name: "Crab Rangoon Eggroll",
    fare: "Snacks",
    vendor: "Ekiben",
    vendorHint: "Section 73"
  },

  // ── Attman's Deli (Sec. 53) ────────────────────────────────────
  {
    name: "Hot Corned Beef Sandwich",
    fare: "Meals",
    vendor: "Attman's Deli",
    vendorHint: "Section 53"
  },
  {
    name: "Attman's Hot Pastrami Sandwich",
    fare: "Meals",
    vendor: "Attman's Deli",
    vendorHint: "Section 53"
  },
  {
    name: "Oven Roasted Turkey Sandwich",
    fare: "Meals",
    vendor: "Attman's Deli",
    vendorHint: "Section 53"
  },
  {
    name: "Cloak & Dagger Sandwich",
    fare: "Meals",
    vendor: "Attman's Deli",
    vendorHint: "Section 53"
  },
  {
    name: "Shrimp Salad Wrap",
    fare: "Meals",
    vendor: "Attman's Deli",
    vendorHint: "Section 53"
  },
  {
    name: "Reuben",
    fare: "Meals",
    vendor: "Attman's Deli",
    vendorHint: "Section 53"
  },
  {
    name: "Potato Latke",
    fare: "Snacks",
    vendor: "Attman's Deli",
    vendorHint: "Section 53"
  },

  // ── Deddle's Donuts & Shaved Ice (Sec. 33) ────────────────────
  {
    name: "Shaved Ice",
    fare: "Desserts",
    vendor: "Deddle's Donuts & Shaved Ice",
    vendorHint: "Section 33"
  },
  {
    name: "Deddle's Donut Box",
    description: "10 ct. or 20 ct. mini donuts",
    fare: "Desserts",
    vendor: "Deddle's Donuts & Shaved Ice",
    vendorHint: "Section 33"
  },

  // ── The Nutty Pitch (Sec. 70) ──────────────────────────────────
  {
    name: "Bavarian Glazed Nuts",
    description: "Pecans, Cashews, Almonds",
    fare: "Snacks",
    vendor: "The Nutty Pitch",
    vendorHint: "Section 70"
  },
  {
    name: "Churros",
    description: "Traditional or Oreo",
    fare: "Desserts",
    vendor: "The Nutty Pitch",
    vendorHint: "Section 70"
  },
  {
    name: "Specialty Churro",
    fare: "Desserts",
    vendor: "The Nutty Pitch",
    vendorHint: "Section 70"
  },

  // ── Stuggy's (Sec. 71) ────────────────────────────────────────
  {
    name: "Crab Mac Dog",
    fare: "Meals",
    vendor: "Stuggy's",
    vendorHint: "Section 71"
  },
  {
    name: "Stuggy's Mac & Cheese",
    fare: "Meals",
    vendor: "Stuggy's",
    vendorHint: "Section 71"
  },
  {
    name: "Frank-In-A-Blanket",
    fare: "Meals",
    vendor: "Stuggy's",
    vendorHint: "Section 71"
  },
  {
    name: "Bacon Wrapped Cheese Dog",
    fare: "Meals",
    vendor: "Stuggy's",
    vendorHint: "Section 71"
  },
  {
    name: "Jumbo Crab Pretzel",
    fare: "Snacks",
    vendor: "Stuggy's",
    vendorHint: "Section 71"
  },
  {
    name: "Fisher's Popcorn",
    fare: "Snacks",
    vendor: "Stuggy's",
    vendorHint: "Section 71"
  },

  // ── Kat's King of Steaks (Sec. 71) ────────────────────────────
  {
    name: "Kat's Japanese Cheesesteak",
    fare: "Meals",
    vendor: "Kat's King of Steaks",
    vendorHint: "Section 71; also All-Star Kitchen Sections 214, 258"
  },
  {
    name: "Kat's Loaded Tots",
    fare: "Snacks",
    vendor: "Kat's King of Steaks",
    vendorHint: "Section 71"
  },

  // ── Baltimore Chop (Sec. 226) ──────────────────────────────────
  {
    name: "Baltimore Chop Hand-Carved Sandwich",
    description: "Rotating menu",
    fare: "Meals",
    vendor: "Baltimore Chop",
    vendorHint: "Section 226"
  },

  // ── The All-Star Kitchen (Sec. 214, 258) ──────────────────────
  {
    name: "B&O Burger",
    fare: "Meals",
    vendor: "The All-Star Kitchen",
    vendorHint: "Section 214"
  },
  {
    name: "Honey Stung Chicken Tenders",
    fare: "Meals",
    vendor: "The All-Star Kitchen",
    vendorHint: "Sections 214, 258"
  },
  {
    name: "The Baltimore Dawg",
    fare: "Meals",
    vendor: "The All-Star Kitchen",
    vendorHint: "Sections 214, 258"
  },

  // ── Knots & Hops Pretzel Shop (Sec. 216) ──────────────────────
  {
    name: "Bavarian Pretzel with Dips",
    description: "Beer Cheese, Sweet Cream Cheese, or Whole Grain Mustard",
    fare: "Snacks",
    vendor: "Knots & Hops Pretzel Shop",
    vendorHint: "Section 216"
  },

  // ── Wingsmith (Sec. 264) ───────────────────────────────────────
  {
    name: "Wingsmith Wings & Chicken Bites",
    description: "Chef-inspired wings and chicken bites with fries",
    fare: "Meals",
    vendor: "Wingsmith",
    vendorHint: "Section 264"
  },

  // ── Squire's Pizza (Sec. 270) ──────────────────────────────────
  {
    name: "Pepperoni Pizza Slice",
    fare: "Meals",
    vendor: "Squire's Pizza",
    vendorHint: "Section 270"
  },
  {
    name: "Cheese Pizza Slice",
    fare: "Meals",
    vendor: "Squire's Pizza",
    vendorHint: "Section 270",
    dietary: ["Vegetarian"]
  },

  // ── Pat & Stuggs (Sec. 67) ─────────────────────────────────────
  {
    name: "Shaved Ribeye Cheesesteak",
    fare: "Meals",
    vendor: "Pat & Stuggs",
    vendorHint: "Section 67"
  },
  {
    name: "Pat's Double Bacon Cheeseburger",
    fare: "Meals",
    vendor: "Pat & Stuggs",
    vendorHint: "Section 67"
  },
  {
    name: "BBQ Bacon Burger",
    fare: "Meals",
    vendor: "Pat & Stuggs",
    vendorHint: "Section 67"
  },
  {
    name: "Wagyu Hot Dog",
    fare: "Meals",
    vendor: "Pat & Stuggs",
    vendorHint: "Section 67"
  },

  // ── Sweet Graffiti Desserts (Sec. 230) ─────────────────────────
  {
    name: "Mini Dubai Bars",
    fare: "Desserts",
    vendor: "Sweet Graffiti Desserts",
    vendorHint: "Section 230"
  },
  {
    name: "Baltimore Fudge Cookie",
    fare: "Desserts",
    vendor: "Sweet Graffiti Desserts",
    vendorHint: "Section 230"
  },
  {
    name: "Whoopie Pies",
    fare: "Desserts",
    vendor: "Sweet Graffiti Desserts",
    vendorHint: "Section 230"
  },
  {
    name: "Dulce de Leche Mallomars",
    fare: "Desserts",
    vendor: "Sweet Graffiti Desserts",
    vendorHint: "Section 230"
  },
  {
    name: "Thai Peanut Butter Cookies",
    fare: "Desserts",
    vendor: "Sweet Graffiti Desserts",
    vendorHint: "Section 230"
  },
  {
    name: "Bon Bons",
    fare: "Desserts",
    vendor: "Sweet Graffiti Desserts",
    vendorHint: "Section 230"
  },

  // ── Ice Cream / Frozen Desserts ────────────────────────────────
  {
    name: "Turkey Hill Soft Serve Ice Cream",
    fare: "Desserts",
    vendor: "Turkey Hill",
    vendorHint: "Sections 17, 62, 78, 230, 334, 362"
  },
  {
    name: "Turkey Hill Hand Dipped Ice Cream",
    fare: "Desserts",
    vendor: "Nothing But Desserts",
    vendorHint: "Section 230"
  },
  {
    name: "Rita's Italian Ice",
    fare: "Desserts",
    vendor: "Rita's",
    vendorHint: "Sections 8, 85"
  },
  {
    name: "Dippin Dots",
    fare: "Desserts",
    vendor: "Dippin Dots",
    vendorHint: "Eutaw St., Sections 8, 17, 62, 78, 318, 334, 358, 374"
  },
  {
    name: "Funnel Cakes",
    fare: "Desserts",
    vendor: "Camden Yards Concessions",
    vendorHint: "Sections 17, 62, 78, 318, 334"
  },

  // ── Standard Locations (unique items) ──────────────────────────
  {
    name: "Berks Jumbo Camden Frank",
    fare: "Meals",
    vendor: "Camden Franks",
    vendorHint: "Available throughout — Sections 11, 39, 53, 83, 312, 318, 360, 378, 384, Eutaw St."
  },
  {
    name: "Encore Italian Sausage",
    fare: "Meals",
    vendor: "Camden Franks",
    vendorHint: "Sections 39, 49, 248, 334"
  },
  {
    name: "Chili Dog",
    fare: "Meals",
    vendor: "Camden Franks",
    vendorHint: "Sections 11, 39, 53, 83, 310, 316, 360"
  },
  {
    name: "Squire's Personal Pizza",
    fare: "Meals",
    vendor: "Camden Franks",
    vendorHint: "Sections 11, 53, 83, 316, 360"
  },
  {
    name: "Stadium Nachos",
    fare: "Snacks",
    vendor: "Camden Franks",
    vendorHint: "Sections 11, 39, 53, 83, 312, 318, 360, 378, 384"
  },
  {
    name: "Chicken Tenders and Fries",
    fare: "Meals",
    vendor: "Charm City Chicken Shack",
    vendorHint: "Sections 15, 49, 65, 79, 334, 368; also B&O Market"
  },
  {
    name: "Biscoff Banana Pudding",
    fare: "Desserts",
    vendor: "Charm City Chicken Shack",
    vendorHint: "Sections 15, 65, 79, 334, 368"
  },
  {
    name: "O's Hand Rolled Salted Pretzel",
    fare: "Snacks",
    vendor: "O's Pretzel",
    vendorHint: "Section 23"
  },
  {
    name: "O's Hand Rolled Cinnamon Sugar Pretzel",
    fare: "Snacks",
    vendor: "O's Pretzel",
    vendorHint: "Section 23"
  },
  {
    name: "The Camden Smash Burger",
    fare: "Meals",
    vendor: "Baseline Burgers",
    vendorHint: "Sections 23, 326, 352, 372"
  },
  {
    name: "Fuku Chicken Sandwich",
    fare: "Meals",
    vendor: "Baseline Burgers",
    vendorHint: "Sections 23, 326, 352, 372"
  },
  {
    name: "Waffle Fries",
    fare: "Snacks",
    vendor: "Bleacher Grill",
    vendorHint: "Eutaw St. near Gate H"
  },
  {
    name: "Cinnamon Pretzels & Dipping Sauce",
    fare: "Snacks",
    vendor: "Birdland Value Menu",
    vendorHint: "Sections 11, 39, 53, 83, 310, 316, 360, 378, 384"
  },
  {
    name: "Cotton Candy",
    fare: "Snacks",
    vendor: "Camden Yards Concessions",
    vendorHint: "Eutaw St., Sections 8, 17, 62, 78, 318, 334, 358, 374"
  },
  {
    name: "Attman's Jumbo Chocolate Chip Cookie",
    fare: "Desserts",
    vendor: "Attman's Deli",
    vendorHint: "Section 53"
  }
];

export async function parseOrioleParkMenu(
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
