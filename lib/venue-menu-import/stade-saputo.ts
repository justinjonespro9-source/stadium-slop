/**
 * Stade Saputo (CF Montréal — MLS) menu parser.
 *
 * Manually transcribed from the official 2026 concessions PDF, which is
 * entirely image-based (no extractable text layer). The PDF has two pages:
 *   Page 1: Stadium map with section-by-section food category listings
 *   Page 2: Vendor photos with names and section numbers
 *
 * The source is category-level — items are listed as food types (Hot Dog,
 * Poutine, Hamburger, etc.) per section, not as detailed named menu items.
 * Item count is intentionally lower than venues with item-level sources.
 *
 * Vendor/stand names are stored as vendorName metadata only.
 *
 * Named vendors from Page 2:
 *   - Le Dep (convenience store, Sec. 112/120/123/133) — skipped
 *   - La Limonade (Sec. 132) — beverage, skipped
 *   - Chida Mexicain (Sec. 112) — no specific items listed
 *   - Gaspésien (Sec. 114) — seafood truck, no specific items listed
 *   - Les Malfamés (Sec. 128) — no specific items listed
 *   - Queues de Castor (Sec. 120) — BeaverTails pastry
 *   - Le Diner - Short Cut (Sec. 134) — diner concept
 *   - Le Bar Rustique (Sec. 125) — bar, skipped
 *   - Famoso Italien (Sec. 132) — Italian/pizza
 *
 * Source PDF:
 *   https://res.cloudinary.com/mls-soccer/image/upload/v1778612841/assets/mtl/pdf/EN_Concessions_2026_Stade_Saputo.pdf
 *
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "stade-saputo";
const VENUE_NAME = "Stade Saputo";
const SOURCE_URL =
  "https://res.cloudinary.com/mls-soccer/image/upload/v1778612841/assets/mtl/pdf/EN_Concessions_2026_Stade_Saputo.pdf";

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
  // ── Stadium Classics ────────────────────────────────────────────

  {
    name: "Hot Dog",
    description: "Available at nearly every concession section",
    fare: "Meals",
    vendorHint:
      "Sections 113, 114, 115, 116, 118, 121, 124, 125, 126, 128, 130, 131, 132, 135",
    tags: ["mls"]
  },
  {
    name: "Hamburger",
    fare: "Meals",
    vendor: "Le Diner - Short Cut",
    vendorHint:
      "Le Diner - Short Cut (Sec. 134), also Sec. 113, 115, 118, 125, 128, 135",
    tags: ["mls"]
  },
  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendorHint:
      "Sections 114, 118, 121, 124, 128, 130, 132, 135",
    tags: ["mls"]
  },

  // ── Montréal Specialties ────────────────────────────────────────

  {
    name: "Poutine",
    description: "Montréal classic — fries, cheese curds, and gravy",
    fare: "Meals",
    vendorHint: "Sections 118, 128, 135",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Smoked Meat Sandwich",
    description: "Montréal-style smoked meat",
    fare: "Meals",
    vendorHint: "Sections 118, 128, 135",
    tags: ["mls", "local-specialty"]
  },

  // ── Sides ───────────────────────────────────────────────────────

  {
    name: "French Fries",
    fare: "Snacks",
    vendorHint: "Sections 118, 128, 135",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls"]
  },

  // ── Pizza ───────────────────────────────────────────────────────

  {
    name: "Pizza",
    fare: "Meals",
    vendor: "Famoso Italien",
    vendorHint:
      "Famoso Italien (Sec. 132), also Sec. 116, 118, 126, 128, 135",
    tags: ["mls"]
  },

  // ── Desserts ────────────────────────────────────────────────────

  {
    name: "BeaverTails",
    description:
      "Queues de Castor — classic Canadian stretched fried dough pastry with toppings",
    fare: "Desserts",
    vendor: "Queues de Castor",
    vendorHint: "Queues de Castor (Sec. 120), also Sec. 118",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Ice Cream",
    fare: "Desserts",
    vendorHint: "Section 128",
    dietary: ["Vegetarian"],
    tags: ["mls"]
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

export async function parseStadeSaputoMenu(
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
