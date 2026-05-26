/**
 * loanDepot park (Miami Marlins) menu parser.
 *
 * Source: https://www.mlb.com/marlins/ballpark/food
 * Curated static dataset from the official Marlins Ballpark Bites guide.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "loandepot-park";
const VENUE_NAME = "loanDepot park";
const SOURCE_URL = "https://www.mlb.com/marlins/ballpark/food";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

const MENU_DATA: RawItem[] = [
  // ── 3o5 Value Menu staples ─────────────────────────────────────
  {
    name: "Nacho",
    fare: "Snacks",
    vendorHint:
      "3o5 Menu at Familia Faves (Section 36), D'Town Faves (Section 210), FanFeast (Section 314), The Press Box (Section 28)"
  },
  {
    name: "Pretzel Bites",
    fare: "Snacks",
    vendorHint:
      "3o5 Menu at Familia Faves (Section 36), D'Town Faves (Section 210), FanFeast (Section 314), The Press Box (Section 28)"
  },

  // ── The Bullpen Bar and Grill (Left Field Corner) ──────────────
  {
    name: "Wings",
    fare: "Meals",
    vendor: "The Bullpen Bar and Grill",
    vendorHint: "Field Level, Left Field Corner"
  },
  {
    name: "Sliders",
    fare: "Meals",
    vendor: "The Bullpen Bar and Grill",
    vendorHint: "Field Level, Left Field Corner"
  },
  {
    name: "Hand-breaded Chicken Tenders",
    fare: "Meals",
    vendor: "The Bullpen Bar and Grill",
    vendorHint: "Left Field Corner; also Batter'd Up (Section 40)"
  },

  // ── The Change Up (Section 1) ──────────────────────────────────
  {
    name: "Build-your-own Hot Dog",
    description: "Customizable hot dog; local Miami bites on select homestands",
    fare: "Meals",
    vendor: "The Change Up powered by Pepsi",
    vendorHint: "Section 1"
  },

  // ── Sahlen's Top Dog (Section 4) ───────────────────────────────
  {
    name: "Sahlen's Hot Dog",
    fare: "Meals",
    vendor: "Sahlen's Top Dog",
    vendorHint:
      "Section 4; also available on 3o5 Menu at Familia Faves, D'Town Faves, FanFeast, The Press Box"
  },

  // ── Fowl Pole (Section 5) ─────────────────────────────────────
  {
    name: "Hot Chicken",
    fare: "Meals",
    vendor: "Fowl Pole",
    vendorHint: "Section 5"
  },
  {
    name: "Crispy Chicken Sandwich",
    fare: "Meals",
    vendor: "Fowl Pole",
    vendorHint: "Section 5"
  },

  // ── Magic City BBQ (Section 8) ─────────────────────────────────
  {
    name: "Hickory Slow Smoked Pork Nachos",
    fare: "Meals",
    vendor: "Magic City BBQ",
    vendorHint: "Section 8"
  },
  {
    name: "Shredded Pork Sandwich",
    fare: "Meals",
    vendor: "Magic City BBQ",
    vendorHint: "Section 8"
  },
  {
    name: "BBQ Hot Dog",
    fare: "Meals",
    vendor: "Magic City BBQ",
    vendorHint: "Section 8"
  },

  // ── Oppo Taco presented by Goya (Section 8) ───────────────────
  {
    name: "Tacos",
    description: "Four types available",
    fare: "Meals",
    vendor: "Oppo Taco presented by Goya",
    vendorHint: "Section 8"
  },
  {
    name: "Chilaquiles Nachos",
    fare: "Meals",
    vendor: "Oppo Taco presented by Goya",
    vendorHint: "Section 8"
  },
  {
    name: "Quesadillas",
    fare: "Meals",
    vendor: "Oppo Taco presented by Goya",
    vendorHint: "Section 8"
  },

  // ── Diamond Dough (Sections 10, 226, 307) ─────────────────────
  {
    name: "Cheese Personal Pizza",
    fare: "Meals",
    vendor: "Diamond Dough",
    vendorHint: "Sections 10, 226, 307",
    dietary: ["Vegetarian"]
  },
  {
    name: "Pepperoni Personal Pizza",
    fare: "Meals",
    vendor: "Diamond Dough",
    vendorHint: "Sections 10, 226, 307"
  },
  {
    name: "Mushroom & Veggie Personal Pizza",
    fare: "Meals",
    vendor: "Diamond Dough",
    vendorHint: "Sections 10, 226, 307",
    dietary: ["Vegetarian"]
  },

  // ── Sliderz (Section 19) ──────────────────────────────────────
  {
    name: "Single Smash Burger",
    fare: "Meals",
    vendor: "Sliderz",
    vendorHint: "Section 19"
  },
  {
    name: "Double Smash Burger",
    fare: "Meals",
    vendor: "Sliderz",
    vendorHint: "Section 19"
  },
  {
    name: "Waffle Fries",
    fare: "Snacks",
    vendor: "Sliderz",
    vendorHint: "Section 19"
  },

  // ── Walk-Off Market (Section 24) ───────────────────────────────
  {
    name: "Cheeseburger",
    fare: "Meals",
    vendor: "Walk-Off Market",
    vendorHint:
      "Section 24; also Rincon Habana (Section 223), Burger 305 (Sections 310, 321)"
  },
  {
    name: "Flatbread Pizza",
    fare: "Meals",
    vendor: "Walk-Off Market",
    vendorHint: "Section 24"
  },

  // ── The Lineup / Beisbowl (Sections 18, 28) ───────────────────
  {
    name: "Beisbowl",
    description:
      "Chicken, steak, or tofu with fresh rice and unique sauces",
    fare: "Meals",
    vendor: "Beisbowl",
    vendorHint: "The Lineup Food Hall (Section 28); also Section 18 portable"
  },

  // ── The Press Box (Section 28) ─────────────────────────────────
  {
    name: "Cuban Sandwich",
    fare: "Meals",
    vendor: "The Press Box",
    vendorHint:
      "The Lineup Food Hall (Section 28); also Pan Con Beisbol (Section 40)"
  },

  // ── Sweet Spot (Section 28) ────────────────────────────────────
  {
    name: "Sweet Spot Soft Serve Ice Cream",
    fare: "Desserts",
    vendor: "Sweet Spot",
    vendorHint: "The Lineup Food Hall (Section 28)"
  },
  {
    name: "Sweet Spot Cookies",
    fare: "Desserts",
    vendor: "Sweet Spot",
    vendorHint: "The Lineup Food Hall (Section 28)"
  },
  {
    name: "Sweet Spot Pastries",
    fare: "Desserts",
    vendor: "Sweet Spot",
    vendorHint: "The Lineup Food Hall (Section 28)"
  },

  // ── Coffee Counter (Section 34) ────────────────────────────────
  {
    name: "Croquettes",
    fare: "Snacks",
    vendor: "Coffee Counter",
    vendorHint: "Section 34"
  },
  {
    name: "Empanadas",
    fare: "Meals",
    vendor: "Coffee Counter",
    vendorHint: "Section 34; also P.A.N. Portable (Section 11)"
  },

  // ── Billy's Bites (Section 34) ─────────────────────────────────
  {
    name: "Billy's Slugger's Kids Combo",
    fare: "Meals",
    vendor: "Billy's Bites",
    vendorHint: "Section 34"
  },

  // ── Batter'd Up (Section 40) ──────────────────────────────────
  {
    name: "Batter'd Up Chicken Sandwich",
    fare: "Meals",
    vendor: "Batter'd Up",
    vendorHint: "Section 40"
  },

  // ── Chicken Tenders (standard, multiple stands) ────────────────
  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendorHint:
      "Sahlen's Top Dog (4), Fowl Pole (5), Sliderz (19), Heavy Hitters (23), Walk-Off Market (24), Rincon Habana (223), Burger 305 (310, 321)"
  },

  // ── SuViche (Section 210) ─────────────────────────────────────
  {
    name: "SuViche Sushi Rolls",
    description: "Japanese-Peruvian fusion sushi",
    fare: "Meals",
    vendor: "SuViche",
    vendorHint: "Section 210"
  },
  {
    name: "SuViche Ceviche",
    fare: "Meals",
    vendor: "SuViche",
    vendorHint: "Section 210"
  },

  // ── Los Verdes (Section 220) ───────────────────────────────────
  {
    name: "Los Verdes Loaded Fries",
    description: "Latin-inspired comfort food with savory meats and house-made sauces",
    fare: "Meals",
    vendor: "Los Verdes",
    vendorHint: "Section 220"
  },

  // ── Kosher Portable (Section 2) ────────────────────────────────
  {
    name: "Kosher Hot Dog",
    fare: "Meals",
    vendor: "Kosher Portable",
    vendorHint: "Section 2 (closed Fri/Sat)"
  },
  {
    name: "Kosher Hamburger",
    fare: "Meals",
    vendor: "Kosher Portable",
    vendorHint: "Section 2 (closed Fri/Sat)"
  },

  // ── P.A.N. Portable (Section 11) ──────────────────────────────
  {
    name: "P.A.N. Arepas",
    fare: "Meals",
    vendor: "P.A.N. Portable",
    vendorHint: "Section 11"
  },
  {
    name: "Tequeños",
    fare: "Snacks",
    vendor: "P.A.N. Portable",
    vendorHint: "Section 11"
  },
  {
    name: "P.A.N. Latin Hot Dog",
    fare: "Meals",
    vendor: "P.A.N. Portable",
    vendorHint: "Section 11"
  },

  // ── Kimberly's Frozen Treats (Sections 10, 28) ────────────────
  {
    name: "Frozen Lemonades",
    fare: "Desserts",
    vendor: "Kimberly's Frozen Treats",
    vendorHint: "Sections 10, 28"
  },

  // ── Pardon My Cheesesteak (Section 13) ─────────────────────────
  {
    name: "Gourmet Cheesesteak",
    fare: "Meals",
    vendor: "Pardon My Cheesesteak",
    vendorHint: "Section 13"
  },
  {
    name: "Grilled Sausage",
    fare: "Meals",
    vendor: "Pardon My Cheesesteak",
    vendorHint: "Section 13"
  },

  // ── Classics Con Sazon (Section 19) — Coming Soon ──────────────
  {
    name: "Machete",
    description: "Two-foot Latin street food specialty",
    fare: "Meals",
    vendor: "Classics Con Sazon",
    vendorHint: "Section 19 (coming soon)"
  },
  {
    name: "Pan con Lechón",
    fare: "Meals",
    vendor: "Classics Con Sazon",
    vendorHint: "Section 19 (coming soon)"
  },
  {
    name: "Frita Smash",
    fare: "Meals",
    vendor: "Classics Con Sazon",
    vendorHint: "Section 19 (coming soon)"
  },
  {
    name: "Masita Dog",
    fare: "Meals",
    vendor: "Classics Con Sazon",
    vendorHint: "Section 19 (coming soon)"
  },

  // ── Street Dawgz (Section 39) ──────────────────────────────────
  {
    name: "Street Dawgz Hot Dog",
    description: "Ballpark franks with attitude",
    fare: "Meals",
    vendor: "Street Dawgz",
    vendorHint: "Section 39"
  },

  // ── Pan Con Beisbol (Section 40) ───────────────────────────────
  {
    name: "Pan Con Bistec",
    fare: "Meals",
    vendor: "Pan Con Beisbol",
    vendorHint: "Section 40"
  },

  // ── Mister Softee (Sections 8, 23) ────────────────────────────
  {
    name: "Mister Softee Ice Cream",
    fare: "Desserts",
    vendor: "Mister Softee",
    vendorHint: "Sections 8, 23"
  },

  // ── Dippin' Dots (Sections 3, 32) ─────────────────────────────
  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendor: "Dippin' Dots",
    vendorHint: "Sections 3, 32"
  },
  {
    name: "Dippin' Dots Specialty Popcorn",
    fare: "Snacks",
    vendor: "Dippin' Dots",
    vendorHint: "Sections 3, 32"
  }
];

export async function parseLoanDepotParkMenu(
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
