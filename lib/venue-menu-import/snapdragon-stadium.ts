/**
 * Snapdragon Stadium (San Diego FC / San Diego Wave FC / SDSU Aztecs —
 * MLS / NWSL / College Football) menu parser.
 *
 * The official concessions page lists founding hospitality partners with
 * neighborhood locations and a one-line "Speciality" description each,
 * but no explicit item-level menus or section numbers. Items are inferred
 * only where the vendor's food identity is universally tied to a specific
 * product (e.g. Hodad's → burgers, Empanada Kitchen → empanadas).
 *
 * Vendors with ambiguous or overly broad descriptions are skipped:
 *   - Sandbar ("Authentic SoCal food and culture") — too vague
 *   - The Girls Deli ("Sandwiches") — no specific items named
 *   - Michelob Ultra Classics ("fan favorites") — no items listed
 *
 * No section/location numbers are provided on the source page.
 *
 * Source: https://www.snapdragonstadium.com/visit/concessions
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "snapdragon-stadium";
const VENUE_NAME = "Snapdragon Stadium";
const SOURCE_URL =
  "https://www.snapdragonstadium.com/visit/concessions";

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
  // ── Cali BBQ ────────────────────────────────────────────────────

  {
    name: "BBQ Sandwich",
    description: "Slow-cooked San Diego BBQ",
    fare: "Meals",
    vendor: "Cali BBQ",
    vendorHint: "Cali BBQ — Barrio Logan / Spring Valley",
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },

  // ── Buona Forchetta ─────────────────────────────────────────────

  {
    name: "Pizza",
    description: "Authentic Italian / Neapolitan-style from Buona Forchetta",
    fare: "Meals",
    vendor: "Buona Forchetta",
    vendorHint: "Buona Forchetta — Coronado / South Park / Liberty Station",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },

  // ── The Crack Shack ─────────────────────────────────────────────

  {
    name: "Fried Chicken Sandwich",
    description: "Fried chicken and egg fare",
    fare: "Meals",
    vendor: "The Crack Shack",
    vendorHint: "The Crack Shack — Encinitas / Little Italy",
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },

  // ── Empanada Kitchen ────────────────────────────────────────────

  {
    name: "Argentine Empanadas",
    description: "Argentine style empanadas",
    fare: "Meals",
    vendor: "Empanada Kitchen",
    vendorHint: "Empanada Kitchen — Downtown / La Jolla / North Park",
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },

  // ── The Fish Shop ───────────────────────────────────────────────

  {
    name: "Poke Bowl",
    description: "Fresh poke from The Fish Shop",
    fare: "Meals",
    vendor: "The Fish Shop",
    vendorHint: "The Fish Shop — Pacific Beach / Point Loma / Encinitas / Oceanside",
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },
  {
    name: "Fish and Chips",
    fare: "Meals",
    vendor: "The Fish Shop",
    vendorHint: "The Fish Shop — Pacific Beach / Point Loma / Encinitas / Oceanside",
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },

  // ── Gaglione Bros ───────────────────────────────────────────────

  {
    name: "Steak Sub",
    description: "Famous steaks and subs from Gaglione Bros",
    fare: "Meals",
    vendor: "Gaglione Bros",
    vendorHint: "Gaglione Bros — Mission Valley / Point Loma",
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },

  // ── Hodad's ─────────────────────────────────────────────────────

  {
    name: "Burger",
    description: "Hodad's — \"World's greatest burgers\" (Ocean Beach / Downtown)",
    fare: "Meals",
    vendor: "Hodad's",
    vendorHint: "Hodad's — Downtown / Ocean Beach",
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },

  // ── Shawarma Guys ───────────────────────────────────────────────

  {
    name: "Wagyu Shawarma",
    description: "Australian Wagyu shawarma",
    fare: "Meals",
    vendor: "Shawarma Guys",
    vendorHint: "Shawarma Guys — La Mesa / Mira Mesa / South Park",
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },
  {
    name: "Chicken Shawarma",
    fare: "Meals",
    vendor: "Shawarma Guys",
    vendorHint: "Shawarma Guys — La Mesa / Mira Mesa / South Park",
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },

  // ── The Taco Stand ──────────────────────────────────────────────

  {
    name: "Tacos",
    description: "Authentic handmade tacos",
    fare: "Meals",
    vendor: "The Taco Stand",
    vendorHint: "The Taco Stand — Downtown / Encinitas / La Jolla / North Park",
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },

  // ── Seaside Market ──────────────────────────────────────────────

  {
    name: "Cardiff Tri-Tip Sandwich",
    description: "Seaside Market World Famous Cardiff Tri-Tip",
    fare: "Meals",
    vendor: "Seaside Market",
    vendorHint: "Seaside Market — Cardiff-by-the-Sea",
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
  },

  // ── Batch & Box ─────────────────────────────────────────────────

  {
    name: "Cookies",
    description: "Extraordinary cookie experiences from Batch & Box",
    fare: "Desserts",
    vendor: "Batch & Box",
    vendorHint: "Batch & Box — Del Mar",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "college-football", "local-specialty"]
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

export async function parseSnapdragonStadiumMenu(
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
