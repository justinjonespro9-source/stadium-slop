/**
 * Nu Stadium (Inter Miami CF — MLS) menu parser.
 *
 * Nu Stadium at Miami Freedom Park opened for the 2026 MLS season,
 * replacing Chase Stadium (Fort Lauderdale) as Inter Miami CF's home.
 *
 * Source is the official food & beverage announcement, which names
 * specific restaurant partners and explicit menu items. Vendor/stand
 * names are stored as vendorName metadata only.
 *
 * All bars, cocktails, beers, coffee-as-drink, water stations, and
 * premium all-inclusive/buffet items without explicit names are excluded.
 *
 * Source:
 *   https://www.intermiamicf.com/news/nu-stadium-brings-miami-s-hottest-restaurants-premium-hospitality-and-next-generation-technology-to-matchday
 *
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "nu-stadium";
const VENUE_NAME = "Nu Stadium";
const SOURCE_URL =
  "https://www.intermiamicf.com/news/nu-stadium-brings-miami-s-hottest-restaurants-premium-hospitality-and-next-generation-technology-to-matchday";

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
  // ── Mercado MIA (Michelle Bernstein, James Beard winner) ────────

  {
    name: "Ham and Cheese Croquettes",
    description: "Featured menu item from James Beard Award-winning chef Michelle Bernstein",
    fare: "Snacks",
    vendor: "Mercado MIA",
    vendorHint: "Main concourse",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Buffalo Chicken Empanadas",
    fare: "Snacks",
    vendor: "Mercado MIA",
    vendorHint: "Main concourse",
    tags: ["mls"]
  },
  {
    name: "Argentine Choripán",
    description:
      "Argentine chorizo on a baguette with chimichurri; also at Mr. Chory",
    fare: "Meals",
    vendor: "Mr. Chory",
    vendorHint: "Mercado MIA (main concourse), Mr. Chory (North side + Lowe's Terraces)",
    tags: ["mls", "local-specialty"]
  },

  // ── Coyo Taco ───────────────────────────────────────────────────

  {
    name: "Coyo Tacos",
    description: "Signature tacos from Miami's Coyo Taco",
    fare: "Meals",
    vendor: "Coyo Taco",
    vendorHint: "Publix Terrace",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Burritos",
    fare: "Meals",
    vendor: "Coyo Taco",
    vendorHint: "Publix Terrace",
    tags: ["mls"]
  },
  {
    name: "Quesadillas",
    fare: "Meals",
    vendor: "Coyo Taco",
    vendorHint: "Publix Terrace",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── La Birra Bar ────────────────────────────────────────────────

  {
    name: "Burgers",
    description:
      "From La Birra Bar, two-time winner of South Beach Wine & Food Festival Burger Bash",
    fare: "Meals",
    vendor: "La Birra Bar",
    vendorHint: "North side, near supporter section",
    tags: ["mls", "local-specialty"]
  },

  // ── Club de la Milanesa ─────────────────────────────────────────

  {
    name: "Milanesa",
    description: "Argentine milanesa — the dish famously favored by Leo Messi",
    fare: "Meals",
    vendor: "Club de la Milanesa",
    vendorHint: "Northeast corner",
    tags: ["mls", "local-specialty"]
  },

  // ── Doggi's Arepas ─────────────────────────────────────────────

  {
    name: "Venezuelan Arepas",
    description: "Stuffed with classic fillings",
    fare: "Meals",
    vendor: "Doggi's Venezuelan Arepas",
    vendorHint: "East side (two locations)",
    tags: ["mls", "local-specialty"]
  },

  // ── Churromanía + ¡Dale! Dog ────────────────────────────────────

  {
    name: "Churros",
    description: "Freshly fried churros from Churromanía",
    fare: "Desserts",
    vendor: "Churromanía",
    vendorHint: "North side, outside West Club",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Hot Dogs",
    description: "Specialty hot dogs from ¡Dale! Dog",
    fare: "Meals",
    vendor: "¡Dale! Dog",
    vendorHint: "North side, outside West Club",
    tags: ["mls"]
  },

  // ── Vice City Pie ───────────────────────────────────────────────

  {
    name: "Pizza",
    description: "Hand-tossed pizza by the slice",
    fare: "Meals",
    vendor: "Vice City Pie",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── Miami Style Nachos ──────────────────────────────────────────

  {
    name: "Miami Style Nachos",
    description: "Two-foot nacho box",
    fare: "Snacks",
    vendor: "Miami Style Nachos",
    vendorHint: "Main concourse",
    tags: ["mls"]
  },

  // ── Churrasco 305 ──────────────────────────────────────────────

  {
    name: "Churrasco Skewers",
    description: "Brazilian-style churrasco skewers from Churrasco 305",
    fare: "Meals",
    vendor: "Churrasco 305",
    vendorHint: "Main concourse",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Pintxos",
    description: "Basque-style small bites from Churrasco 305",
    fare: "Snacks",
    vendor: "Churrasco 305",
    vendorHint: "Main concourse",
    tags: ["mls"]
  },

  // ── Café Bustelo / Caracas Bakery ───────────────────────────────

  {
    name: "Cachitos",
    description: "Venezuelan ham-filled pastry from Caracas Bakery",
    fare: "Snacks",
    vendor: "Caracas Bakery",
    vendorHint: "Café Bustelo Bar & Ventanita, main concourse",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Tequeños",
    description: "Venezuelan cheese sticks from Caracas Bakery",
    fare: "Snacks",
    vendor: "Caracas Bakery",
    vendorHint: "Café Bustelo Bar & Ventanita, main concourse",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Pastries",
    description: "From Caracas Bakery at Café Bustelo",
    fare: "Snacks",
    vendor: "Caracas Bakery",
    vendorHint: "Café Bustelo Bar & Ventanita, main concourse",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── Desserts & Frozen Treats ────────────────────────────────────

  {
    name: "Gelato",
    fare: "Desserts",
    vendor: "Ola Gelato",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Ice Cream",
    fare: "Desserts",
    vendor: "Jackson Brothers Ice Cream",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Italian Ice",
    fare: "Desserts",
    vendor: "Italian Vice",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls"]
  },
  {
    name: "Artisan Pops",
    description: "Artisan popsicles",
    fare: "Desserts",
    vendor: "Cielito Artisan Pops",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── East Club (premium, named item) ─────────────────────────────

  {
    name: "Crispy Rice",
    description: "From Miss Crispy Rice; East Club premium level",
    fare: "Snacks",
    vendor: "Miss Crispy Rice",
    vendorHint: "East Club (premium)",
    tags: ["mls", "local-specialty"]
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

export async function parseNuStadiumMenu(
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
