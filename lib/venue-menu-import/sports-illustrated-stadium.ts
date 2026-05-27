/**
 * Sports Illustrated Stadium (New York Red Bulls / NJ/NY Gotham FC — MLS / NWSL)
 * menu parser.
 *
 * Curated from the official concessions guide which provides a structured table
 * of every concession stand: section number, vendor name, dietary notes, and
 * menu items. Vendor/stand names are stored as vendorName metadata only.
 *
 * Dietary tags from the "Notes" column are applied conservatively — only to
 * items that are inherently that dietary type, not to the stand as a whole.
 *
 * Gotham FC (NWSL) plays at this venue, so nwsl tag is applied.
 *
 * Source: https://www.newyorkredbulls.com/sportsillustratedstadium/matchday/concessions
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "sports-illustrated-stadium";
const VENUE_NAME = "Sports Illustrated Stadium";
const SOURCE_URL =
  "https://www.newyorkredbulls.com/sportsillustratedstadium/matchday/concessions";

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
  // ── Pizzadoni (Sections 103, 115, 126) + Golazo Grill ──────────

  {
    name: "Sicilian Pizza",
    fare: "Meals",
    vendor: "Pizzadoni",
    vendorHint:
      "Pizzadoni (Sec. 103, 115), Golazo Grill (Sec. 126, 226)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Sicilian Pepperoni",
    fare: "Meals",
    vendor: "Pizzadoni",
    vendorHint:
      "Pizzadoni (Sec. 103, 115), Golazo Grill (Sec. 126, 226)",
    tags: ["mls", "nwsl"]
  },

  // ── Hot Dogs ────────────────────────────────────────────────────

  {
    name: "Hot Dog",
    fare: "Meals",
    vendorHint:
      "Pizzadoni (Sec. 103, 115), Bodega (Sec. 112), The Roost (Sec. 116, 133), Golazo Grill (Sec. 124, 126, 226), Downtown Dog (Sec. 128)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Specialty Hot Dog",
    fare: "Meals",
    vendorHint:
      "Golazo Grill (Sec. 124, 126, 226), Downtown Dog (Sec. 128)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Chili Dogs",
    description: "Featured in Red Member matchday combo",
    fare: "Meals",
    vendor: "Downtown Dog",
    vendorHint: "Section 128",
    tags: ["mls", "nwsl"]
  },

  // ── Nachos ──────────────────────────────────────────────────────

  {
    name: "Nachos",
    fare: "Snacks",
    vendorHint:
      "Pizzadoni (Sec. 103, 115), Bodega (Sec. 112), The Roost (Sec. 116, 133), Golazo Grill (Sec. 124, 126, 226), Downtown Dog (Sec. 128)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Build Your Own Loaded Nachos",
    fare: "Meals",
    vendor: "Nachos Amigos",
    vendorHint: "Sections 105, 118, 125, 224",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Ben's Soft Pretzels (Sections 103, 115) ─────────────────────

  {
    name: "Salted Pretzel",
    fare: "Snacks",
    vendor: "Ben's Soft Pretzels",
    vendorHint: "Sections 103, 115",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Unsalted Pretzel",
    fare: "Snacks",
    vendor: "Ben's Soft Pretzels",
    vendorHint: "Sections 103, 115",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Cinnamon Pretzel",
    fare: "Snacks",
    vendor: "Ben's Soft Pretzels",
    vendorHint: "Sections 103, 115",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Pretzels with Dips",
    description: "Salted, unsalted, or cinnamon pretzels served with dipping sauces",
    fare: "Snacks",
    vendor: "Ben's Soft Pretzels",
    vendorHint: "Sections 103, 115",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── The Sausage Haus (Sections 104, 115, 126, 229) ─────────────

  {
    name: "Specialty Sausages & Peppers",
    fare: "Meals",
    vendor: "The Sausage Haus",
    vendorHint: "Sections 104, 115, 126, 229",
    tags: ["mls", "nwsl"]
  },

  // ── Bodega (Section 112) ────────────────────────────────────────

  {
    name: "Fresh Cut Deli Sandwiches",
    fare: "Meals",
    vendor: "Bodega",
    vendorHint: "Section 112",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Carson's Cookies",
    fare: "Desserts",
    vendorHint:
      "Bodega (Sec. 112), The Roost (Sec. 116, 133), Golazo Grill (Sec. 124, 126)",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── The Roost (Sections 116, 133) ───────────────────────────────

  {
    name: "Hand Breaded Chicken Tenders",
    fare: "Meals",
    vendor: "The Roost",
    vendorHint:
      "The Roost (Sec. 116, 133), Golazo Grill (Sec. 124, 126, 226)",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Chicken Sandwich",
    fare: "Meals",
    vendor: "The Roost",
    vendorHint: "Sections 116, 133",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Chicken Salad",
    fare: "Meals",
    vendor: "The Roost",
    vendorHint: "Sections 116, 133",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Boneless Wings",
    fare: "Meals",
    vendor: "The Roost",
    vendorHint: "Sections 116, 133",
    tags: ["mls", "nwsl"]
  },

  // ── Ice Cream & Desserts ────────────────────────────────────────

  {
    name: "Dippin' Dots Ice Cream",
    fare: "Desserts",
    vendor: "Dippin' Dots",
    vendorHint: "Sections 118, 127, 133, 226",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Hand Scooped Ice Cream",
    fare: "Desserts",
    vendor: "Stadium Cone",
    vendorHint: "Sections 119, 132",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Classic Italian Ice",
    fare: "Desserts",
    vendor: "Stadium Cone",
    vendorHint: "Sections 119, 132",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "nwsl"]
  },

  // ── Nuchas Empanadas Reimagined (Sections 120, 126, 132) ────────

  {
    name: "Specialty Empanadas",
    description: "Vegetarian and vegan varieties available",
    fare: "Meals",
    vendor: "Nuchas Empanadas Reimagined",
    vendorHint: "Sections 120, 126, 132",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Hudson County Steak Co (Sections 120, 127, 132) ─────────────

  {
    name: "Philly Cheesesteak Sandwich",
    fare: "Meals",
    vendor: "Hudson County Steak Co",
    vendorHint: "Sections 120, 127, 132",
    tags: ["mls", "nwsl"]
  },

  // ── Hearth & Spoon (Section 121) ────────────────────────────────

  {
    name: "Build Your Own Rice Bowl",
    description: "Gluten-free; vegetarian and vegan build options available",
    fare: "Meals",
    vendor: "Hearth & Spoon",
    vendorHint: "Section 121",
    dietary: ["Gluten Free", "Vegetarian", "Vegan"],
    tags: ["mls", "nwsl"]
  },

  // ── Urban Smash (Sections 121, 125, 131) ────────────────────────

  {
    name: "Single Smashburger",
    fare: "Meals",
    vendor: "Urban Smash",
    vendorHint: "Sections 121, 125, 131",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Double Smashburger",
    fare: "Meals",
    vendor: "Urban Smash",
    vendorHint: "Sections 121, 125, 131",
    tags: ["mls", "nwsl"]
  },

  // ── Golazo Grill (Sections 124, 126, 226) ──────────────────────

  {
    name: "Fries",
    fare: "Snacks",
    vendor: "Golazo Grill",
    vendorHint: "Golazo Grill (Sec. 124, 126, 226)",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Meatball Parm Smashburger",
    fare: "Meals",
    vendor: "Golazo Grill",
    vendorHint: "Section 124",
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

export async function parseSportsIllustratedStadiumMenu(
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
