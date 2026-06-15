/**
 * Grayson Stadium (Savannah Bananas) menu parser.
 *
 * Source: https://thesavannahbananas.com/concessions-menu/
 * Curated static dataset from the official concessions page.
 * Generic beer, soda, candy, chips, popcorn, and peanuts excluded.
 *
 * Re-verify each season to pick up menu changes.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "grayson-stadium";
const VENUE_NAME = "Grayson Stadium";
const SOURCE_URL = "https://thesavannahbananas.com/concessions-menu/";

const BANANA_BALL = ["banana-ball", "baseball"] as const;

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
  // ── All-you-can-eat (included with ticket) ─────────────────────

  {
    name: "Cheeseburger",
    description: "All-you-can-eat cheeseburger at Grayson Stadium concession stands",
    fare: "Meals",
    vendor: "Grayson Stadium Concessions",
    vendorHint: "Plaza, 1st Base, 3rd Base, Left Field Landing, Open Container, Right Field",
    tags: [...BANANA_BALL, "signature"]
  },
  {
    name: "Hamburger",
    description: "All-you-can-eat hamburger",
    fare: "Meals",
    vendor: "Grayson Stadium Concessions",
    vendorHint: "All-you-can-eat locations"
  },
  {
    name: "Hot Dog",
    description: "All-you-can-eat stadium hot dog",
    fare: "Meals",
    vendor: "Grayson Stadium Concessions",
    vendorHint: "All-you-can-eat locations",
    tags: [...BANANA_BALL]
  },
  {
    name: "Chicken Sandwich",
    description: "All-you-can-eat chicken sandwich",
    fare: "Meals",
    vendor: "Grayson Stadium Concessions",
    vendorHint: "All-you-can-eat locations"
  },

  // ── Main concessions ───────────────────────────────────────────

  {
    name: "French Fries",
    description: "Ballpark fries; available in a Glove Bowl souvenir",
    fare: "Snacks",
    vendor: "Main Concessions",
    vendorHint: "Main concourse"
  },
  {
    name: "Chili Cheese Fries",
    description: "Loaded fries with chili and cheese; Glove Bowl souvenir available",
    fare: "Snacks",
    vendor: "Main Concessions",
    vendorHint: "Main concourse",
    tags: [...BANANA_BALL, "signature"]
  },
  {
    name: "Garbage Can Nachos",
    description: "Oversized loaded nachos — specialty item at main and right field stands",
    fare: "Meals",
    vendor: "Main Concessions",
    vendorHint: "Main concourse, Right Field Concessions",
    tags: [...BANANA_BALL, "signature"]
  },
  {
    name: "Pork Carnitas Nachos",
    description: "Specialty nachos topped with pork carnitas",
    fare: "Meals",
    vendor: "Main Concessions",
    vendorHint: "Main concourse",
    tags: [...BANANA_BALL, "signature"]
  },
  {
    name: "Firefighters Buffalo Chicken Fries",
    description:
      "Signature fries topped with buffalo chicken, mozzarella, ranch, and green onion",
    fare: "Snacks",
    vendor: "Main Concessions",
    vendorHint: "Signature fries stand",
    tags: [...BANANA_BALL, "signature"]
  },
  {
    name: "Texas Tailgaters Brisket & Queso Fries",
    description: "Signature fries topped with brisket and queso",
    fare: "Snacks",
    vendor: "Main Concessions",
    vendorHint: "Signature fries stand",
    tags: [...BANANA_BALL, "signature"]
  },

  // ── Ballpark Treats — Dippin' Dots ─────────────────────────────

  {
    name: "Banana Split Dippin' Dots",
    description: "Savannah Bananas team specialty flavor at Ballpark Treats carts",
    fare: "Desserts",
    vendor: "Ballpark Treats",
    vendorHint: "1st Base, Right Field, Plaza, Picnic Area",
    tags: [...BANANA_BALL, "signature"]
  },
  {
    name: "Carnival Cotton Candy Dippin' Dots",
    description: "Team specialty Dippin' Dots flavor",
    fare: "Desserts",
    vendor: "Ballpark Treats",
    vendorHint: "Ballpark Treats carts"
  },
  {
    name: "Cookies N' Cream Dippin' Dots",
    fare: "Desserts",
    vendor: "Ballpark Treats",
    vendorHint: "Ballpark Treats carts"
  },

  // ── Ballpark Treats — Pretzel Stand ────────────────────────────

  {
    name: "Salted Pretzel with Beer Cheese",
    description: "Soft pretzel with beer cheese dipping sauce",
    fare: "Snacks",
    vendor: "Pretzel Stand",
    vendorHint: "Plaza and 3rd Base Area",
    tags: [...BANANA_BALL, "signature"]
  },
  {
    name: "Cinnamon Sugar Pretzel with Icing",
    description: "Sweet pretzel with icing",
    fare: "Snacks",
    vendor: "Pretzel Stand",
    vendorHint: "Plaza and 3rd Base Area"
  },
  {
    name: "Garlic Parmesan Pretzel",
    description: "Soft pretzel with roasted garlic aioli",
    fare: "Snacks",
    vendor: "Pretzel Stand",
    vendorHint: "Plaza and 3rd Base Area",
    tags: [...BANANA_BALL]
  },

  // ── Leopold's Ice Cream ────────────────────────────────────────

  {
    name: "Leopold's Banana Split",
    description: "Savannah institution — banana split at the 3rd Base concourse stand",
    fare: "Desserts",
    vendor: "Leopold's Ice Cream",
    vendorHint: "3rd Base Concourse",
    tags: [...BANANA_BALL, "local-vendor", "signature"]
  },
  {
    name: "Leopold's Banana Cream Soda Float",
    description: "Banana cream soda float from Leopold's",
    fare: "Desserts",
    vendor: "Leopold's Ice Cream",
    vendorHint: "3rd Base Concourse",
    tags: [...BANANA_BALL, "local-vendor", "signature"]
  },
  {
    name: "Leopold's Triple Scoop",
    description: "Three scoops — flavors include vanilla, chocolate, cookies², mint chip, and bananas foster",
    fare: "Desserts",
    vendor: "Leopold's Ice Cream",
    vendorHint: "3rd Base Concourse",
    tags: [...BANANA_BALL, "local-vendor"]
  },
  {
    name: "Leopold's Bananas Foster",
    description: "Leopold's bananas foster ice cream scoop",
    fare: "Desserts",
    vendor: "Leopold's Ice Cream",
    vendorHint: "3rd Base Concourse",
    tags: [...BANANA_BALL, "local-vendor", "signature"]
  },

  // ── Right Field Concessions ────────────────────────────────────

  {
    name: "Soft Pretzel",
    description: "Classic ballpark soft pretzel",
    fare: "Snacks",
    vendor: "Right Field Concessions",
    vendorHint: "Right Field"
  }
];

/** Drinks, beer, generic snacks excluded from MENU_DATA (for reporting). */
const EXCLUDED_MENU_NOTES = [
  "alcohol, beer, wine, cocktails, seltzer",
  "soda, bottled water",
  "generic candy (Sour Patch Kids, cotton candy)",
  "generic chips, popcorn, peanuts, Cracker Jack",
  "rotating team Dippin' Dots flavors (listed when visiting teams play)"
];

function dedupeMenuItems(rawItems: RawItem[]): RawItem[] {
  const byName = new Map<string, RawItem>();
  for (const item of rawItems) {
    const key = normalizeMenuItemName(item.name);
    if (!byName.has(key)) byName.set(key, { ...item });
  }
  return [...byName.values()];
}

function toSourceItem(raw: RawItem): VenueMenuSourceItem {
  return {
    name: raw.name,
    description: raw.description,
    fare: raw.fare,
    category: "Food",
    vendorName: raw.vendor,
    vendorLocationHint: raw.vendorHint,
    dietaryTags: raw.dietary ?? [],
    sourceUrl: SOURCE_URL,
    importTags: raw.tags
  };
}

export async function parseGraysonStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;
  const items = dedupeMenuItems(MENU_DATA).map(toSourceItem);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: EXCLUDED_MENU_NOTES.length
  };
}

export { EXCLUDED_MENU_NOTES };
