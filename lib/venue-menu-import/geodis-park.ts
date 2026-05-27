/**
 * GEODIS Park (Nashville SC — MLS) menu parser.
 *
 * The official concessions page lists stands/carts by name only (no
 * per-stand item menus). Two sections provide explicit item-level data:
 *   1. "New for 2026: Novelty Menu" — 5 named items with stand locations
 *   2. "$4 Value Menu" — items with per-section availability
 *
 * Conservative vendor-product inferences added only where the vendor
 * identity is universally tied to a single product (Ben & Jerry's,
 * Dippin' Dots).
 *
 * Stands like Hattie B's / Prince's Hot Chicken, Rock 'n Dough,
 * Chivanada, etc. are NOT imported because the source page does not
 * expose their item-level menus.
 *
 * Source:
 *   https://geodispark.com/concessions/
 *
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "geodis-park";
const VENUE_NAME = "GEODIS Park";
const SOURCE_URL = "https://geodispark.com/concessions/";

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
  // ── New for 2026: Novelty Menu ──────────────────────────────────

  {
    name: "The Banger Burger",
    fare: "Meals",
    vendor: "Tri Star Tavern",
    vendorHint: "Behind Section 120",
    tags: ["mls", "new-in-2026"]
  },
  {
    name: "Churro Fries",
    fare: "Desserts",
    vendor: "La Banda",
    vendorHint: "Behind Sections 105, 126",
    dietary: ["Vegetarian"],
    tags: ["mls", "new-in-2026"]
  },
  {
    name: "Hot Chicken Loaded Waffle Fries",
    fare: "Meals",
    vendorHint:
      "Wedgewood Ave Grill (Sec. 110), Houston Street Grill (Sec. 133)",
    tags: ["mls", "new-in-2026", "local-specialty"]
  },
  {
    name: "Cherry Coke Float",
    fare: "Desserts",
    vendor: "Tempo The Coyote's Favorites",
    vendorHint: "Behind Section 135",
    dietary: ["Vegetarian"],
    tags: ["mls", "new-in-2026"]
  },
  {
    name: "Nashville Hot Chicken Baked Potato",
    fare: "Meals",
    vendor: "The Global Stage",
    vendorHint: "Behind Section 131",
    tags: ["mls", "new-in-2026", "local-specialty"]
  },

  // ── $4 Value Menu ───────────────────────────────────────────────

  {
    name: "Hot Dog",
    fare: "Meals",
    vendorHint:
      "Sections 104, 109, 110, 114, 122, 133, 135",
    tags: ["mls", "value-menu"]
  },
  {
    name: "Pretzel",
    fare: "Snacks",
    vendorHint: "Sections 104, 110, 120, 131, 133, 135",
    dietary: ["Vegetarian"],
    tags: ["mls", "value-menu"]
  },
  {
    name: "Nachos",
    fare: "Snacks",
    vendorHint: "Sections 104, 105, 126, 135",
    tags: ["mls", "value-menu"]
  },
  {
    name: "Nachos with Cheese",
    fare: "Snacks",
    vendor: "Sideline Smoke BBQ",
    vendorHint: "Section 113",
    dietary: ["Vegetarian"],
    tags: ["mls", "value-menu"]
  },

  // ── Conservative vendor-product inferences ──────────────────────

  {
    name: "Ice Cream",
    fare: "Desserts",
    vendor: "Ben & Jerry's",
    vendorHint: "The Sweet Note / Ben & Jerry's (Stand 1S), Cart 12C",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendorHint: "Carts 8C, 13C",
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

export async function parseGeodisParkMenu(
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
