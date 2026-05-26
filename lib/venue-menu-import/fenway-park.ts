/**
 * Fenway Park (Boston Red Sox) menu parser.
 *
 * Source: https://www.mlb.com/redsox/ballpark/concessions
 * Curated static dataset from the official MLB concessions guide.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "fenway-park";
const VENUE_NAME = "Fenway Park";
const SOURCE_URL = "https://www.mlb.com/redsox/ballpark/concessions";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

const MENU_DATA: RawItem[] = [
  // ── Desserts / Bakery ──────────────────────────────────────────
  {
    name: "Boston Crème Pie",
    fare: "Desserts",
    vendorHint: "Big Concourse, Gate E Concourse"
  },

  // ── Burgers ────────────────────────────────────────────────────
  {
    name: "Burger and Cavendish Farm French Fries Combo",
    fare: "Meals",
    vendorHint:
      "Home Plate Concourse, Home Plate Grandstand, Left Field Aura Pavilion, Right Field Aura Pavilion, Sam Deck"
  },
  {
    name: "Cowboy Up! Burger",
    fare: "Meals",
    vendorHint: "Angry Orchard Terrace, Home Plate Concourse, Sam Deck"
  },
  {
    name: "Specialty Burger",
    description: "Burger Kitchen rotating specialty",
    fare: "Meals",
    vendor: "Burger Kitchen",
    vendorHint: "Kids Concourse"
  },

  // ── Mexican ────────────────────────────────────────────────────
  {
    name: "Burrito Bowl",
    fare: "Meals",
    vendorHint: "Big Concourse"
  },
  {
    name: "Tacos",
    fare: "Meals",
    vendorHint: "Big Concourse"
  },
  {
    name: "Elote",
    fare: "Snacks",
    vendorHint: "Big Concourse"
  },

  // ── Cheesesteak ────────────────────────────────────────────────
  {
    name: "Savenor's Cheesesteak",
    fare: "Meals",
    vendor: "Savenor's",
    vendorHint: "Jersey Street, Right Field Concourse"
  },

  // ── Chicken ────────────────────────────────────────────────────
  {
    name: "Chicken Tenders & Cavendish Farms French Fries",
    fare: "Meals",
    vendorHint:
      "Big Concourse, Home Plate Concourse, Home Plate Grandstand, Left Field Aura Pavilion, Right Field Aura Pavilion, Right Field Concourse, Sam Deck"
  },
  {
    name: "Krispy Krunchy Chicken Tenders & Sandwich",
    fare: "Meals",
    vendor: "Krispy Krunchy Chicken",
    vendorHint: "Angry Orchard Terrace, Gate E Concourse, Kids Concourse"
  },
  {
    name: "Grilled Chicken Sandwich",
    fare: "Meals",
    vendorHint: "Ketel One Vodka 3rd Base Deck, Sam Deck"
  },

  // ── Churros ────────────────────────────────────────────────────
  {
    name: "Churros",
    fare: "Desserts",
    vendorHint: "Kids Concourse"
  },

  // ── Clam Chowder ──────────────────────────────────────────────
  {
    name: "Clam Chowder",
    fare: "Meals",
    vendorHint:
      "Angry Orchard Terrace, Home Plate Concourse, Jersey Street, Left Field Aura Pavilion, Right Field Aura Pavilion, Right Field Concourse"
  },

  // ── Cookies ────────────────────────────────────────────────────
  {
    name: "Monster Cookie",
    fare: "Desserts",
    vendorHint: "Big Concourse, Gate E Concourse"
  },

  // ── Cotton Candy ───────────────────────────────────────────────
  {
    name: "Cotton Candy",
    fare: "Snacks",
    vendorHint: "Throughout Fenway Park concourses"
  },

  // ── Cuban Sandwich ─────────────────────────────────────────────
  {
    name: "Cuban Sandwich",
    fare: "Meals",
    vendor: "El Tiante",
    vendorHint: "Angry Orchard Terrace, Jersey Street, Sam Deck"
  },

  // ── Dumplings ──────────────────────────────────────────────────
  {
    name: "Dumplings",
    fare: "Meals",
    vendorHint: "Jersey Street"
  },

  // ── Farmer's Fridge ────────────────────────────────────────────
  {
    name: "Farmer's Fridge",
    description: "Pre-made salads and bowls",
    fare: "Meals",
    vendor: "Farmer's Fridge",
    vendorHint: "Kids Concourse"
  },

  // ── Fried Dough ────────────────────────────────────────────────
  {
    name: "Fried Dough",
    fare: "Desserts",
    vendor: "J&J Snacks",
    vendorHint: "Big Concourse, Kids Concourse"
  },

  // ── French Fries ───────────────────────────────────────────────
  {
    name: "Cavendish Farm French Fries",
    fare: "Snacks",
    vendorHint:
      "Big Concourse, Gate E Concourse, Home Plate Concourse, Home Plate Grandstand, Right Field Concourse, Sam Deck"
  },
  {
    name: "Monster Loaded Fries",
    description: "Loaded fry variant at select locations",
    fare: "Snacks",
    vendorHint:
      "Angry Orchard Terrace, Home Plate Concourse, Left Field Aura Pavilion, Right Field Aura Pavilion"
  },

  // ── Grilled Cheese ─────────────────────────────────────────────
  {
    name: "Cabot Creamery Grilled Cheese Sandwich",
    fare: "Meals",
    vendor: "Cabot Creamery",
    vendorHint: "Jersey Street"
  },
  {
    name: "Cabot Creamery Pimento Cheese Dip",
    fare: "Snacks",
    vendor: "Cabot Creamery",
    vendorHint: "Jersey Street"
  },

  // ── Grillo's Pickles ──────────────────────────────────────────
  {
    name: "Grillo's Pickles",
    fare: "Snacks",
    vendor: "Grillo's",
    vendorHint:
      "Home Plate Concourse, Left Field Aura Pavilion, Right Field Aura Pavilion, Right Field Concourse"
  },

  // ── Hot Dogs ───────────────────────────────────────────────────
  {
    name: "Kayem Fenway Frank",
    fare: "Meals",
    vendor: "Kayem",
    vendorHint:
      "Throughout Fenway Park — Big Concourse, Gate E, Home Plate, Jersey Street, Kids Concourse, and more"
  },
  {
    name: "Kayem Jumbo Dog",
    fare: "Meals",
    vendor: "Kayem",
    vendorHint:
      "Big Concourse, Gate E Concourse, Green Monster, Home Plate Concourse, Jersey Street, Sam Deck"
  },

  // ── Ice Cream ──────────────────────────────────────────────────
  {
    name: "Dippin' Dots Ice Cream",
    fare: "Desserts",
    vendor: "Dippin' Dots",
    vendorHint:
      "Home Plate Concourse, Ketel One Vodka 3rd Base Deck, Left Field Aura Pavilion, Right Field Concourse"
  },
  {
    name: "Hood Soft Serve Ice Cream",
    fare: "Desserts",
    vendor: "Hood",
    vendorHint:
      "Big Concourse, Gate E Concourse, Kids Concourse, Left Field Aura Pavilion, Right Field Aura Pavilion"
  },

  // ── Italian Sausage ────────────────────────────────────────────
  {
    name: "Kayem Italian Sausage",
    fare: "Meals",
    vendor: "Kayem",
    vendorHint:
      "Throughout Fenway Park — Angry Orchard Terrace, Big Concourse, Gate E, Home Plate, Jersey Street, and more"
  },

  // ── King's Hawaiian ────────────────────────────────────────────
  {
    name: "King's Hawaiian Sandwich",
    fare: "Meals",
    vendor: "King's Hawaiian",
    vendorHint: "Right Field Concourse, Right Field Roof Box"
  },

  // ── Luke's Lobster ─────────────────────────────────────────────
  {
    name: "Luke's Lobster Roll",
    fare: "Meals",
    vendor: "Luke's Lobster",
    vendorHint: "Jersey Street, Right Field Concourse"
  },
  {
    name: "Luke's Crab Roll",
    fare: "Meals",
    vendor: "Luke's Lobster",
    vendorHint: "Jersey Street, Right Field Concourse"
  },
  {
    name: "Luke's Lobster Bisque",
    fare: "Meals",
    vendor: "Luke's Lobster",
    vendorHint: "Jersey Street, Right Field Concourse"
  },

  // ── Nachos ─────────────────────────────────────────────────────
  {
    name: "Nachos",
    fare: "Snacks",
    vendorHint:
      "Gate E Concourse, Home Plate Concourse, Home Plate Grandstand, Right Field Aura Pavilion, Right Field Concourse, Sam Deck"
  },
  {
    name: "Nachos Grande",
    description: "Larger nachos portion",
    fare: "Snacks",
    vendorHint: "Right Field Concourse"
  },

  // ── Pizza ──────────────────────────────────────────────────────
  {
    name: "Sal's Pizza",
    fare: "Meals",
    vendor: "Sal's Pizza",
    vendorHint:
      "Big Concourse, Gate E Concourse, Home Plate Concourse, Home Plate Grandstand, Right Field Aura Pavilion, Right Field Concourse, Sam Deck"
  },

  // ── Pretzels ───────────────────────────────────────────────────
  {
    name: "SUPERPRETZEL",
    fare: "Snacks",
    vendor: "J&J Snacks",
    vendorHint:
      "Throughout Fenway Park — Big Concourse, Gate E, Home Plate, Jersey Street, Kids Concourse, and more"
  },

  // ── Soup Bread Bowl ────────────────────────────────────────────
  {
    name: "Soup Bread Bowl",
    fare: "Meals",
    vendorHint: "Home Plate Concourse"
  },

  // ── Kid Friendly ───────────────────────────────────────────────
  {
    name: "Rookie Meal",
    description: "Kid-friendly meal combo",
    fare: "Meals",
    vendorHint: "Kids Concourse, Left Field Aura Pavilion"
  }
];

export async function parseFenwayParkMenu(
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
