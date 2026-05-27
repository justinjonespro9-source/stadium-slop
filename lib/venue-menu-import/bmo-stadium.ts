/**
 * BMO Stadium (LAFC / Angel City FC — MLS / NWSL) menu parser.
 *
 * The official LAFC food page is a brief teaser that links to the Eater LA
 * guide as its food guide. Items are cross-referenced between both sources:
 *   - Official page: tteokbokki, Peruvian chicken, conchas, tortas,
 *     chicharron, duros de harina, wings
 *   - Eater LA guide: full item-level detail with vendor names, sections,
 *     and descriptions for every concession stand
 *
 * Vendor/stand names are stored as vendorName metadata only — never as
 * FoodItem names. Nacho varieties from North End (Sec. 104) and South End
 * (Sec. 126) are consolidated since they serve identical menus.
 *
 * BMO Stadium is NOT a 2026 World Cup host venue (SoFi Stadium is the LA
 * host). Angel City FC (NWSL) also plays here, so nwsl tag is applied.
 *
 * Sources:
 *   https://www.lafc.com/stadium/food
 *   https://la.eater.com/2024/4/16/24131718/where-to-eat-at-bmo-stadium-best-food-los-angeles
 *
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "bmo-stadium";
const VENUE_NAME = "BMO Stadium";
const SOURCE_URL = "https://www.lafc.com/stadium/food";

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
  // ── Goal-Mok (Section 119) ─────────────────────────────────────

  {
    name: "Tteokbokki",
    description: "Crispy fried rice cakes in gochujang sauce with rice on the side",
    fare: "Meals",
    vendor: "Goal-Mok",
    vendorHint: "Section 119",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Seoul Bowl",
    description: "Sweet and spicy boneless Korean fried chicken",
    fare: "Meals",
    vendor: "Goal-Mok",
    vendorHint: "Section 119",
    tags: ["mls", "nwsl"]
  },

  // ── La Rotisserie (Section 109) ─────────────────────────────────

  {
    name: "Peruvian Rotisserie Chicken",
    description: "Peruvian-style rotisserie chicken and fries",
    fare: "Meals",
    vendor: "La Rotisserie",
    vendorHint: "Section 109",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Nashville Hot Chicken Sandwich",
    fare: "Meals",
    vendor: "La Rotisserie",
    vendorHint: "Section 109",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Pupusas Revueltas",
    fare: "Meals",
    vendor: "La Rotisserie",
    vendorHint: "Section 109",
    tags: ["mls", "nwsl"]
  },

  // ── East Los Eats (Section 117) ─────────────────────────────────

  {
    name: "Spicy Wings",
    description:
      "Chile-forward seasoning, served on a bed of crispy waffle fries",
    fare: "Meals",
    vendor: "East Los Eats",
    vendorHint: "Section 117",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Carne Asada Fries",
    fare: "Meals",
    vendor: "East Los Eats",
    vendorHint: "Section 117",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Chorizo Torta",
    fare: "Meals",
    vendor: "East Los Eats",
    vendorHint: "Section 117",
    tags: ["mls", "nwsl"]
  },

  // ── North End / South End Nachos (Sections 104, 126) ────────────

  {
    name: "Chicken Chipotle Nachos",
    description: "Topped with sour cream, cilantro, pico de gallo, refried pinto beans, salsa verde",
    fare: "Snacks",
    vendorHint:
      "North End Nachos (Sec. 104), South End Nachos (Sec. 126)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Carne Asada Nachos",
    description: "White queso; topped with sour cream, cilantro, pico de gallo, refried pinto beans, salsa verde",
    fare: "Snacks",
    vendorHint:
      "North End Nachos (Sec. 104), South End Nachos (Sec. 126)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Classic Nachos",
    fare: "Snacks",
    vendorHint:
      "North End Nachos (Sec. 104), South End Nachos (Sec. 126)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Il Campo Pizza (Sections 104, 125) ──────────────────────────

  {
    name: "Pepperoni Pizza",
    fare: "Meals",
    vendor: "Il Campo Pizza",
    vendorHint: "Il Campo Pizza North (Sec. 104), Il Campo Pizza South (Sec. 125)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Cheese Pizza",
    fare: "Meals",
    vendor: "Il Campo Pizza",
    vendorHint: "Il Campo Pizza North (Sec. 104), Il Campo Pizza South (Sec. 125)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Garlic Knots",
    fare: "Snacks",
    vendor: "Il Campo Pizza",
    vendorHint: "Il Campo Pizza North (Sec. 104), Il Campo Pizza South (Sec. 125)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Burger Stand (Sections 113, 135) ────────────────────────────

  {
    name: "Smash Burger",
    fare: "Meals",
    vendor: "Burger Stand",
    vendorHint: "Sections 113, 135",
    tags: ["mls", "nwsl"]
  },

  // ── Northgate Stand (Section 126) ───────────────────────────────

  {
    name: "Tortas",
    fare: "Meals",
    vendor: "Northgate Stand",
    vendorHint: "Section 126",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Chicharrones",
    fare: "Snacks",
    vendor: "Northgate Stand",
    vendorHint: "Northgate Stand (Sec. 126), Mercadito Northgate Market (Sec. 126)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Duros de Harina",
    fare: "Snacks",
    vendor: "Northgate Stand",
    vendorHint: "Northgate Stand (Sec. 126), Mercadito Northgate Market (Sec. 126)",
    tags: ["mls", "nwsl"]
  },

  // ── La Monarca (Section 129) ────────────────────────────────────

  {
    name: "Conchas",
    description: "Black and gold conchas",
    fare: "Desserts",
    vendor: "La Monarca",
    vendorHint: "Section 129",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Orejitas",
    fare: "Desserts",
    vendor: "La Monarca",
    vendorHint: "Section 129",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Wolfie's Hot Chicken (Section 133) ──────────────────────────

  {
    name: "Vegan Buffalo Chicken Sandwich",
    fare: "Meals",
    vendor: "Wolfie's Hot Chicken",
    vendorHint: "Section 133",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Vegan Chicken Tenders",
    description: "Wolfie's plant-based chicken tenders and fries",
    fare: "Meals",
    vendor: "Wolfie's Hot Chicken",
    vendorHint: "Section 133",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "nwsl"]
  },

  // ── Black & Gold Taqueria (Section 119) ─────────────────────────

  {
    name: "Tacos",
    description: "Chipotle chicken, chorizo, and carne asada varieties",
    fare: "Meals",
    vendor: "Black & Gold Taqueria",
    vendorHint: "Section 119",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Carne Asada Burrito",
    fare: "Meals",
    vendor: "Black & Gold Taqueria",
    vendorHint: "Section 119",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Corn Ribs",
    description: "Melissa's corn ribs",
    fare: "Snacks",
    vendor: "Black & Gold Taqueria",
    vendorHint: "Section 119",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "nwsl"]
  },

  // ── King's Hawaiian Grill (Director's Box) ──────────────────────

  {
    name: "Thai Chicken Sandwich",
    fare: "Meals",
    vendor: "King's Hawaiian Grill",
    vendorHint: "Director's Box",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Grilled Mac and Cheese Sandwich",
    fare: "Meals",
    vendor: "King's Hawaiian Grill",
    vendorHint: "Director's Box",
    tags: ["mls", "nwsl"]
  },
  {
    name: "SoCal Dog",
    description: "Farmer John SoCal Dog",
    fare: "Meals",
    vendor: "King's Hawaiian Grill",
    vendorHint: "Director's Box",
    tags: ["mls", "nwsl"]
  },

  // ── Supporters Section (Section 204) ────────────────────────────

  {
    name: "Loaded Bacon Hot Dog",
    fare: "Meals",
    vendorHint: "Supporters Section (Sec. 204)",
    tags: ["mls", "nwsl"]
  },

  // ── Sweet Kick (Director's Box) ─────────────────────────────────

  {
    name: "Dole Whip",
    fare: "Desserts",
    vendor: "Sweet Kick",
    vendorHint: "Director's Box",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "nwsl"]
  },

  // ── Mercadito Northgate Market (Section 126) ────────────────────

  {
    name: "Paletas",
    fare: "Desserts",
    vendor: "Mercadito Northgate Market",
    vendorHint: "Section 126",
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

export async function parseBmoStadiumMenu(
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
