/**
 * Dodger Stadium (Los Angeles Dodgers) menu parser.
 *
 * Curated from the official Dodger Stadium Food & Beverage Directory,
 * which covers Food, Beverages, Desserts, Specialty Items, Vegetarian,
 * Gluten Avoiding, and Vegan sections across Field / Loge / Reserve / Top Deck levels.
 *
 * Source: https://www.mlb.com/dodgers/ballpark/information/concessions-directory
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "dodger-stadium";
const VENUE_NAME = "Dodger Stadium";
const SOURCE_URL =
  "https://www.mlb.com/dodgers/ballpark/information/concessions-directory";

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
  // ── BBQ ─────────────────────────────────────────────────────────

  {
    name: "BBQ Brisket Nacho Helmet",
    fare: "Meals",
    vendor: "Think Blue BBQ & Grill",
    vendorHint: "Left Centerfield"
  },
  {
    name: "BBQ Chicken Platter",
    fare: "Meals",
    vendor: "Think Blue BBQ & Grill",
    vendorHint: "Left Centerfield"
  },
  {
    name: "Burnt End Sliders",
    fare: "Meals",
    vendor: "King's Hawaiian",
    vendorHint: "Reserve 32"
  },
  {
    name: "Chicken Wing Platter",
    fare: "Meals",
    vendor: "Think Blue BBQ & Grill",
    vendorHint: "Left Centerfield"
  },
  {
    name: "Loaded BBQ Potato",
    fare: "Meals",
    vendor: "Think Blue BBQ & Grill",
    vendorHint: "Left Centerfield"
  },
  {
    name: "Pulled Pork Sliders",
    fare: "Meals",
    vendor: "King's Hawaiian",
    vendorHint: "Reserve 32"
  },
  {
    name: "The Slugger",
    fare: "Meals",
    vendor: "Think Blue BBQ & Grill",
    vendorHint: "Left Centerfield"
  },

  // ── Burgers ─────────────────────────────────────────────────────

  {
    name: "Bacon Cheeseburger",
    fare: "Meals",
    vendor: "Elysian Park Grill",
    vendorHint: "Field 2 & 23, Top Deck 4"
  },
  {
    name: "Charburger",
    fare: "Meals",
    vendor: "The Habit",
    vendorHint: "Right Centerfield"
  },
  {
    name: "Double Charburger",
    fare: "Meals",
    vendor: "The Habit",
    vendorHint: "Right Centerfield"
  },
  {
    name: "Bacon BBQ Charburger",
    fare: "Meals",
    vendor: "The Habit",
    vendorHint: "Right Centerfield"
  },
  {
    name: "Veggie Charburger",
    fare: "Meals",
    vendor: "The Habit",
    vendorHint: "Right Centerfield",
    dietary: ["Vegetarian"]
  },
  {
    name: "Smash Burger",
    fare: "Meals",
    vendor: "Grand Slam Burgers",
    vendorHint: "Reserve 12"
  },

  // ── Carne Asada ─────────────────────────────────────────────────

  {
    name: "Carne Asada Taco Platter",
    fare: "Meals",
    vendor: "Hornitos Cantina / LA Taqueria",
    vendorHint: "Right Centerfield, Loge 106, Reserve 17"
  },
  {
    name: "Collector Carne Asada Nacho Helmet",
    fare: "Meals",
    vendor: "Hornitos Cantina / Fan Fare / LA Taqueria",
    vendorHint: "Right Centerfield, Field 10, Loge 106, Loge 133, Reserve 17"
  },
  {
    name: "XL Nacho Helmet",
    fare: "Meals",
    vendor: "Hornitos Cantina / Fan Fare / LA Taqueria",
    vendorHint: "Right Centerfield, Loge 106, Loge 133, Reserve 17",
    dietary: ["Vegetarian"]
  },

  // ── Chili Cheese ────────────────────────────────────────────────

  {
    name: "Cheese Nacho Helmet",
    fare: "Snacks",
    vendor: "Dodger Dog Traditional / Dodgertown Nachos & Beer",
    vendorHint: "Field 40 & 41, Reserve 5, Reserve 43/44/55, Loge 137"
  },
  {
    name: "Chili Cheese Dodger Dog",
    fare: "Meals",
    vendor: "Dodger Dog Traditional",
    vendorHint: "Field 40 & 41, Reserve 43/44/55"
  },

  // ── Chicken ─────────────────────────────────────────────────────

  {
    name: "Buffalo Tenders & Fries Bucket",
    fare: "Meals",
    vendor: "Flamin' Hot Corner",
    vendorHint: "Field 47"
  },
  {
    name: "Chicken Tender & Fries Bucket",
    fare: "Meals",
    vendor: "Elysian Park Grill / Flamin' Hot Corner / Top Deck Dogs",
    vendorHint: "Field 2 & 23, Field 47, Top Deck 4, Top Deck 5"
  },
  {
    name: "Korean Wing Platter",
    fare: "Meals",
    vendor: "King's Hawaiian",
    vendorHint: "Reserve 32"
  },

  // ── Fries / Sides ──────────────────────────────────────────────

  {
    name: "French Fries",
    fare: "Snacks",
    vendor: "The Habit",
    vendorHint: "Right Centerfield"
  },
  {
    name: "Onion Rings",
    fare: "Snacks",
    vendor: "The Habit",
    vendorHint: "Right Centerfield"
  },
  {
    name: "Fry Cup",
    fare: "Snacks",
    vendorHint: "Field, Loge, Reserve & Top Deck levels",
    dietary: ["Vegan", "Vegetarian", "Gluten Free"]
  },
  {
    name: "Garlic Fry Helmet",
    fare: "Snacks",
    vendor: "Dodger Dog Express / Elysian Park Grill / King's Hawaiian",
    vendorHint: "Loge 140 & 141, Field 2 & 23, Reserve 6 & 7, Reserve 32, Top Deck 4",
    dietary: ["Vegan", "Vegetarian", "Gluten Free"]
  },
  {
    name: "Lomo Saltado Fry Helmet",
    description: "Peruvian-style loaded fry helmet",
    fare: "Meals",
    vendor: "Hornitos Cantina / LA Taqueria",
    vendorHint: "Right Centerfield, Reserve 17",
    tags: ["specialty"]
  },

  // ── Platters ────────────────────────────────────────────────────

  {
    name: "Home Run Platter",
    fare: "Meals",
    vendor: "DH – Delicious Hospitality",
    vendorHint: "Field 8",
    tags: ["specialty"]
  },
  {
    name: "Major League Loaded Box",
    fare: "Meals",
    vendor: "Hornitos Cantina / LA Taqueria",
    vendorHint: "Right Centerfield, Reserve 17",
    tags: ["specialty"]
  },

  // ── Hot Dogs ────────────────────────────────────────────────────

  {
    name: "Aloha Dog",
    fare: "Meals",
    vendor: "King's Hawaiian",
    vendorHint: "Reserve 32"
  },
  {
    name: "Bacon Wrapped Dog",
    fare: "Meals",
    vendor: "Dueling Dogs",
    vendorHint: "Left Centerfield"
  },
  {
    name: "Brooklyn Dog",
    fare: "Meals",
    vendor: "Dodger Dog Traditional / Dodgertown Nachos & Beer / Dueling Dogs",
    vendorHint: "Reserve 43/44/55, Loge 137, Left Centerfield"
  },
  {
    name: "Footlong Corn Dog",
    fare: "Meals",
    vendor: "Top Deck Dogs",
    vendorHint: "Top Deck 5"
  },
  {
    name: "Gluten Free Dog",
    fare: "Meals",
    vendor: "Dodger Dog Traditional / Top Deck Dogs",
    vendorHint: "Loge 154 & 157, Reserve 35 & 36, Top Deck 5",
    dietary: ["Gluten Free"]
  },
  {
    name: "Grilled Dodger Dog",
    description: "The iconic Dodger Dog",
    fare: "Meals",
    vendorHint: "Most concessions throughout the ballpark"
  },
  {
    name: "Super Dodger Dog",
    description: "Larger version of the classic Dodger Dog",
    fare: "Meals",
    vendorHint: "Most concessions throughout the ballpark"
  },
  {
    name: "Kosher Hot Dog",
    fare: "Meals",
    vendor: "Jeff's Kosher",
    vendorHint: "Loge 166"
  },
  {
    name: "Kosher Spicy Dog",
    fare: "Meals",
    vendor: "Jeff's Kosher",
    vendorHint: "Loge 166"
  },
  {
    name: "Kosher Bratwurst",
    fare: "Meals",
    vendor: "Jeff's Kosher",
    vendorHint: "Loge 166"
  },
  {
    name: "Kurobuta Terimayo Dog",
    description: "Premium kurobuta pork hot dog with teriyaki mayo",
    fare: "Meals",
    vendor: "DH – Delicious Hospitality",
    vendorHint: "Field 8",
    tags: ["specialty"]
  },
  {
    name: "Plant Based Dog",
    fare: "Meals",
    vendor: "Dodger Dog Traditional / Dueling Dogs / Top Deck Dogs / Tsukiji Gindaco",
    vendorHint: "Loge 154 & 157, Reserve 35 & 36, Left Centerfield, Top Deck 5, Field 45",
    dietary: ["Vegan", "Vegetarian", "Gluten Free"]
  },

  // ── Korean ──────────────────────────────────────────────────────

  {
    name: "Korean Fried Chicken Bowl",
    fare: "Meals",
    vendor: "Fan Fare",
    vendorHint: "Loge 133, Reserve 4",
    tags: ["specialty"]
  },

  // ── Nachos ──────────────────────────────────────────────────────

  {
    name: "Flamin' Hot Nacho Helmet",
    fare: "Snacks",
    vendor: "Flamin' Hot Corner",
    vendorHint: "Field 47",
    dietary: ["Vegetarian"]
  },
  {
    name: "Carne Asada Nacho",
    fare: "Meals",
    vendor: "Fan Fare / Hornitos Cantina / LA Taqueria",
    vendorHint: "Field 10, Loge 106, Loge 133, Right Centerfield, Reserve 4, Reserve 17, Reserve 31"
  },
  {
    name: "Chili Cheese Nacho Helmet",
    fare: "Snacks",
    vendor: "Surfside / Dodgertown Nachos & Beer / Top Deck Dogs",
    vendorHint: "Field 5, Loge 137, Centerfield Plaza, Top Deck 5"
  },
  {
    name: "Nachos",
    fare: "Snacks",
    vendorHint: "Most concessions throughout the ballpark",
    dietary: ["Vegetarian"]
  },
  {
    name: "Nacho Helmet",
    fare: "Snacks",
    vendorHint: "Field, Loge, Reserve & Top Deck levels",
    dietary: ["Vegetarian"]
  },
  {
    name: "Nacho Platter",
    fare: "Snacks",
    vendorHint: "Reserve 43, Loge 163"
  },

  // ── Pizza ───────────────────────────────────────────────────────

  {
    name: "Pepperoni Pizza",
    fare: "Meals",
    vendor: "Home Plate Pizza",
    vendorHint: "Field 48, Loge 130, Reserve 3"
  },
  {
    name: "Cheese Pizza",
    fare: "Meals",
    vendor: "Home Plate Pizza",
    vendorHint: "Field 48, Loge 130, Reserve 3",
    dietary: ["Vegetarian"]
  },
  {
    name: "Pizza & Wing Combo",
    fare: "Meals",
    vendor: "Home Plate Pizza",
    vendorHint: "Field 48"
  },

  // ── Pretzels ────────────────────────────────────────────────────

  {
    name: "Pretzel",
    fare: "Snacks",
    vendorHint: "Field, Loge, Reserve & Top Deck levels",
    dietary: ["Vegetarian"]
  },

  // ── Salads ──────────────────────────────────────────────────────

  {
    name: "Caesar Salad",
    fare: "Meals",
    vendor: "Home Plate Pizza",
    vendorHint: "Field 48, Reserve 3",
    dietary: ["Vegetarian"]
  },
  {
    name: "Spring Onion Salad",
    fare: "Meals",
    vendor: "Dodger Dogs / Home Plate Pizza",
    vendorHint: "Loge 164, Field 48, Reserve 3",
    dietary: ["Vegetarian"]
  },
  {
    name: "Kale Power Salad",
    fare: "Meals",
    vendor: "Dodger Dogs",
    vendorHint: "Loge 164",
    dietary: ["Vegetarian"],
    tags: ["specialty"]
  },
  {
    name: "Ground Beef Taco Salad",
    fare: "Meals",
    vendor: "Tsukiji Gindaco",
    vendorHint: "Field 45"
  },
  {
    name: "Plant-Based Taco Salad",
    fare: "Meals",
    vendor: "Tsukiji Gindaco",
    vendorHint: "Field 45",
    dietary: ["Vegetarian"]
  },

  // ── Tacos ───────────────────────────────────────────────────────

  {
    name: "Carne Asada Tacos",
    fare: "Meals",
    vendor: "Hornitos Cantina / LA Taqueria",
    vendorHint: "Centerfield Plaza, Loge 106, Reserve 17"
  },
  {
    name: "Taco Platter",
    fare: "Meals",
    vendor: "LA Taqueria",
    vendorHint: "Loge 106, Reserve 17"
  },

  // ── Takoyaki ────────────────────────────────────────────────────

  {
    name: "Assorted Takoyaki",
    description: "Japanese octopus balls by Tsukiji Gindaco",
    fare: "Snacks",
    vendor: "Tsukiji Gindaco",
    vendorHint: "Field 45",
    tags: ["specialty"]
  },

  // ── Specialty Items ─────────────────────────────────────────────

  {
    name: "Burrito Bowl",
    description: "Available in chicken, steak, or veggie",
    fare: "Meals",
    vendor: "Fan Fare",
    vendorHint: "Field 10",
    tags: ["specialty"]
  },
  {
    name: "Cheet-O-Lote",
    description: "Elote topped with Flamin' Hot Cheetos",
    fare: "Snacks",
    vendor: "Flamin' Hot Corner",
    vendorHint: "Field 47",
    dietary: ["Vegetarian", "Gluten Free"],
    tags: ["specialty"]
  },
  {
    name: "Chicken Katsu Club",
    fare: "Meals",
    vendor: "DH – Delicious Hospitality",
    vendorHint: "Field 8",
    tags: ["specialty"]
  },
  {
    name: "Chow Mein Burrito",
    fare: "Meals",
    vendor: "Fan Fare",
    vendorHint: "Reserve 4",
    tags: ["specialty"]
  },
  {
    name: "Fried Chicken Bucket",
    fare: "Meals",
    vendor: "Fan Fare",
    vendorHint: "Reserve 31",
    tags: ["specialty"]
  },
  {
    name: "Loco Moco Bowl",
    description: "Hawaiian-style rice bowl with hamburger patty, gravy, and egg",
    fare: "Meals",
    vendor: "DH – Delicious Hospitality",
    vendorHint: "Field 8",
    tags: ["specialty"]
  },

  // ── Vendor Specialties (from stand listings) ────────────────────

  {
    name: "Yakisoba Bowl",
    description: "Available in chicken or veggie",
    fare: "Meals",
    vendor: "Basebowls",
    vendorHint: "Right Centerfield"
  },
  {
    name: "Chicken Teriyaki Bowl",
    fare: "Meals",
    vendor: "Basebowls",
    vendorHint: "Right Centerfield"
  },
  {
    name: "Short Rib Bowl",
    fare: "Meals",
    vendor: "Basebowls",
    vendorHint: "Right Centerfield",
    tags: ["specialty"]
  },
  {
    name: "Spring Rolls",
    fare: "Snacks",
    vendor: "Basebowls / Fan Fare",
    vendorHint: "Right Centerfield, Reserve 4",
    dietary: ["Vegetarian"]
  },
  {
    name: "Hot Chicken Sandwich",
    fare: "Meals",
    vendor: "Flamin' Hot Corner",
    vendorHint: "Field 47"
  },
  {
    name: "Tempura Green Beans",
    fare: "Snacks",
    vendor: "The Habit",
    vendorHint: "Right Centerfield",
    dietary: ["Vegetarian", "Gluten Free"]
  },
  {
    name: "Crab Rangoons",
    fare: "Snacks",
    vendor: "Fan Fare",
    vendorHint: "Reserve 4"
  },
  {
    name: "Chalupas",
    fare: "Meals",
    vendor: "Fan Fare",
    vendorHint: "Field 10"
  },
  {
    name: "Chicken Sandwich",
    fare: "Meals",
    vendor: "Fan Fare",
    vendorHint: "Reserve 31"
  },
  {
    name: "Deli Ham Sandwich",
    fare: "Meals",
    vendor: "Dodger Dogs",
    vendorHint: "Loge 164"
  },
  {
    name: "Portobello Croissant",
    fare: "Meals",
    vendor: "Dodger Dogs",
    vendorHint: "Loge 164",
    dietary: ["Vegetarian"]
  },
  {
    name: "Hand Breaded Chicken Tender Bucket",
    fare: "Meals",
    vendor: "Frozen Rope / Chicken Changeup",
    vendorHint: "Reserve 12"
  },
  {
    name: "Potato Taquitos",
    fare: "Snacks",
    vendor: "Fan Fare",
    vendorHint: "Field 10",
    dietary: ["Vegetarian"]
  },
  {
    name: "Mashed Potatoes and Gravy",
    fare: "Snacks",
    vendor: "Fan Fare",
    vendorHint: "Reserve 31",
    dietary: ["Vegetarian"]
  },

  // ── Desserts ────────────────────────────────────────────────────

  {
    name: "Blue Wave Shake",
    fare: "Desserts",
    vendor: "The Habit",
    vendorHint: "Right Centerfield"
  },
  {
    name: "Cereal Malt",
    fare: "Desserts",
    vendor: "The Sweet Spot",
    vendorHint: "Field 46",
    dietary: ["Vegetarian"]
  },
  {
    name: "Chocolate Malt",
    fare: "Desserts",
    vendor: "Dodger Dog Traditional / Flamin' Hot Corner",
    vendorHint: "Field 40 & 41, Loge 154 & 157, Reserve 43/44/55, Field 47",
    dietary: ["Vegetarian"]
  },
  {
    name: "Churros",
    fare: "Desserts",
    vendorHint: "Hornitos Cantina, LA Taqueria, The Sweet Spot, Trolley Treats, Craft Corner",
    dietary: ["Vegetarian"]
  },
  {
    name: "Churro Sundae Helmet",
    fare: "Desserts",
    vendor: "The Sweet Spot / Trolley Treats",
    vendorHint: "Field 46, Loge 136, Reserve 2",
    dietary: ["Vegetarian"]
  },
  {
    name: "Choco Flan",
    fare: "Desserts",
    vendor: "The Sweet Spot",
    vendorHint: "Field 46",
    tags: ["specialty"]
  },
  {
    name: "Dole Whip Helmet",
    description: "Pineapple Dole Whip served in a souvenir helmet",
    fare: "Desserts",
    vendor: "Elysian Park Grill / Think Blue BBQ & Grill",
    vendorHint: "Top Deck 4, Left Centerfield",
    dietary: ["Vegan", "Vegetarian", "Gluten Free"]
  },
  {
    name: "Popping Boba Dole Whip Helmet",
    fare: "Desserts",
    vendor: "Elysian Park Grill / Think Blue BBQ & Grill",
    vendorHint: "Top Deck 4, Left Centerfield",
    dietary: ["Vegan", "Vegetarian", "Gluten Free"]
  },
  {
    name: "Funnel Cake",
    fare: "Desserts",
    vendor: "The Sweet Spot",
    vendorHint: "Field 46",
    dietary: ["Vegetarian"]
  },
  {
    name: "Strawberry Loaded Funnel Cake",
    fare: "Desserts",
    vendor: "The Sweet Spot / Trolley Treats",
    vendorHint: "Field 46, Reserve 2",
    dietary: ["Vegetarian"]
  },
  {
    name: "Soft Serve Helmet",
    fare: "Desserts",
    vendorHint: "Field, Loge, Reserve & Top Deck levels",
    dietary: ["Vegetarian"]
  },
  {
    name: "Melissa's Fruit Cup",
    fare: "Snacks",
    vendorHint: "Field 1, Field 8, Field 46, Field 48",
    dietary: ["Vegan", "Vegetarian", "Gluten Free"]
  },
  {
    name: "Hot Nuts",
    fare: "Snacks",
    vendor: "Grand Slam & Strike Out / Think Blue Craft Beer Bar",
    vendorHint: "Reserve 23 & 24, Loge 165 & 166",
    dietary: ["Vegan", "Vegetarian", "Gluten Free"]
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

export async function parseDodgerStadiumMenu(
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
