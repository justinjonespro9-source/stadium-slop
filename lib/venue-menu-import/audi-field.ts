/**
 * Audi Field (D.C. United — MLS, Washington Spirit — NWSL) menu parser.
 *
 * Cross-referenced from five official concourse pages with item-level detail:
 *   - Upper Concourse: Sec. 101, 104, 106, 108
 *   - South Concourse: Sec. 115, 116, 117, 118, 119, 120
 *   - North Concourse: Sec. 134, 135, 136, 137
 *   - West Concourse: Sec. 124, 125, 129, 130, 132
 *   - East Concourse: Sec. F1, F5, F8, F9, F10, F12
 *
 * Vendor/stand names are stored as vendorName metadata only.
 * Beverage-only stands, bars, and Grab 'N Go Markets are excluded.
 * Generic sides (fries, chips, popcorn, pretzels, tater tots, cotton candy)
 * are excluded unless distinctively prepared.
 *
 * Washington Spirit (NWSL) confirmed to play home games at Audi Field
 * per official matchday guide.
 *
 * Sources:
 *   https://www.dcunited.com/matchday/concessions
 *   https://www.dcunited.com/matchday/upper-concourse
 *   https://www.dcunited.com/matchday/south-concourse
 *   https://www.dcunited.com/matchday/north-concourse
 *   https://www.dcunited.com/matchday/west-concourse
 *   https://www.dcunited.com/matchday/east-concourse
 *
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "audi-field";
const VENUE_NAME = "Audi Field";
const SOURCE_URL = "https://www.dcunited.com/matchday/concessions";

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
  // ── DC Specialties ──────────────────────────────────────────────

  {
    name: "Half Smoke",
    description: "DC's signature smoked sausage; available at stands throughout the stadium",
    fare: "Meals",
    vendor: "Black-and-Red Grill",
    vendorHint:
      "Audi Essentials (Sec. 104), Black-and-Red Grill (Sec. 108, 117, 136, F8), Kick 'N Chicken (Sec. 115, 125), District Dog (Sec. 120)",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "DC Dog",
    description: "District-style hot dog",
    fare: "Meals",
    vendor: "District Dog",
    vendorHint: "District Dog (Sec. 120), Southwest Landing (Sec. 120)",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Taste of DC (local restaurants, Sec. 116) ──────────────────

  {
    name: "Miss Toya's Catfish",
    description: "Local DC restaurant featured at Taste of DC",
    fare: "Meals",
    vendor: "Taste of DC",
    vendorHint: "Section 116",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Queen Mothers Chicken Sandwich",
    description: "Local DC restaurant featured at Taste of DC",
    fare: "Meals",
    vendor: "Taste of DC",
    vendorHint: "Section 116",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Maria's Pupuseria (Salvadoran, local) ──────────────────────

  {
    name: "Pupusas",
    description:
      "Salvadoran stuffed corn tortillas — Cheese, Pork & Cheese, Bean & Cheese, Chicken, Bean & Squash",
    fare: "Meals",
    vendor: "Maria's Pupuseria",
    vendorHint: "Sections 101, 116, 129",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Arepa Zone (Venezuelan, local DC vendor) ───────────────────

  {
    name: "Arepas",
    description:
      "Venezuelan stuffed corn cakes — Canosa (Beef), Catira (Chicken), Pernil (Pork), Vegana (Vegan)",
    fare: "Meals",
    vendor: "Arepa Zone",
    vendorHint: "Section 118",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Chicharron con Yuca",
    description: "Fried pork and yuca from Arepa Zone",
    fare: "Snacks",
    vendor: "Arepa Zone",
    vendorHint: "Section 118",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Yucca Fritters",
    fare: "Snacks",
    vendor: "Arepa Zone",
    vendorHint: "Section 118",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "nwsl"]
  },

  // ── CoCo Bred ──────────────────────────────────────────────────

  {
    name: "CoCo Bred",
    description: "Jamaican coconut bread",
    fare: "Snacks",
    vendor: "CoCo Bred",
    vendorHint: "Section 118",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Burgers ────────────────────────────────────────────────────

  {
    name: "Social Burger",
    fare: "Meals",
    vendor: "Social Burger",
    vendorHint: "Section 119",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Smash Burger",
    fare: "Meals",
    vendor: "Black-and-Red Grill",
    vendorHint: "Section F8 (East / Field Level)",
    tags: ["mls", "nwsl"]
  },

  // ── Grills & Essentials ────────────────────────────────────────

  {
    name: "Hot Dog",
    fare: "Meals",
    vendorHint:
      "Audi Essentials (Sec. 104), Black-and-Red Grill (Sec. 108, 117, 136, F8), Kick 'N Chicken (Sec. 115, 125), Southwest Landing (Sec. 120)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Chicken Tenders",
    description: "Served with fries",
    fare: "Meals",
    vendorHint:
      "Audi Essentials (Sec. 104), Black-and-Red Grill (Sec. 108, 117, 136), Kick 'N Chicken (Sec. 115, 125), Southwest Landing (Sec. 120), Sec. F12",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Chicken Sandwich",
    fare: "Meals",
    vendor: "Kick 'N Chicken",
    vendorHint: "Sections 115, 125",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Dill Pickle Tater Tots",
    fare: "Snacks",
    vendor: "Audi Essentials",
    vendorHint: "Audi Essentials (Sec. 104), Taste of DC (Sec. 116)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Loaded Nachos",
    fare: "Snacks",
    vendorHint: "Taste of DC (Sec. 116), Upper 90 Pizza (Sec. 135), Taco Stand (Sec. 135)",
    tags: ["mls", "nwsl"]
  },

  // ── Pizza ──────────────────────────────────────────────────────

  {
    name: "Pizza",
    description: "Cheese, pepperoni, and specialty slices",
    fare: "Meals",
    vendor: "Upper 90 Pizza",
    vendorHint: "Upper 90 Pizza (Sec. 135), Section F12",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Tacos ──────────────────────────────────────────────────────

  {
    name: "Tacos",
    fare: "Meals",
    vendor: "Taco Stand",
    vendorHint: "Section 135",
    tags: ["mls", "nwsl"]
  },

  // ── Sweet Carousel (Sec. 117) ──────────────────────────────────

  {
    name: "Fried Corn Dog",
    fare: "Snacks",
    vendor: "Sweet Carousel",
    vendorHint: "Section 117",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Fried Oreos",
    fare: "Desserts",
    vendor: "Sweet Carousel",
    vendorHint: "Section 117",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Funnel Cake Fries",
    fare: "Desserts",
    vendor: "Sweet Carousel",
    vendorHint: "Section 117",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Churros",
    fare: "Desserts",
    vendor: "Sweet Carousel",
    vendorHint: "Sweet Carousel (Sec. 117), Black-and-Red Grill (Sec. 117)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Other Distinctive Items ────────────────────────────────────

  {
    name: "S'more Nachos",
    description: "Dessert nachos from Black-and-Red Grill",
    fare: "Desserts",
    vendor: "Black-and-Red Grill",
    vendorHint: "Section 117",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendorHint: "Sections 136, F9",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
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

export async function parseAudiFieldMenu(
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
