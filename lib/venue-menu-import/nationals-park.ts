/**
 * Nationals Park (Washington Nationals) menu parser.
 *
 * Source: https://www.mlb.com/nationals/ballpark/concessions-guide
 * Curated static dataset from the official Nationals concessions guide.
 *
 * NOTE: This source is mostly stand/concept-level rather than item-level.
 * Each entry represents a named food concept. Future passes can expand
 * individual stand entries into specific menu items as detail becomes
 * available.
 *
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "nationals-park";
const VENUE_NAME = "Nationals Park";
const SOURCE_URL =
  "https://www.mlb.com/nationals/ballpark/concessions-guide";

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
  // ── Specialty Food — Main Concourse ────────────────────────────

  {
    name: "Fuzzies Burgers",
    fare: "Meals",
    vendorHint: "Section 106",
    tags: ["New in 2026"]
  },
  {
    name: "Stuggy's Gourmet Dogs",
    fare: "Meals",
    vendorHint: "Section 106",
    tags: ["New in 2026"]
  },
  {
    name: "Rita's Italian Ice & Custard",
    fare: "Desserts",
    vendorHint: "Sections 106, 235 (Club), 320 (Gallery)"
  },
  {
    name: "Kam and 46",
    fare: "Meals",
    vendorHint: "Section 106"
  },
  {
    name: "Chesapeake Crab Cake Company",
    description: "Crab cakes",
    fare: "Meals",
    vendorHint: "Section 109"
  },
  {
    name: "Haute Dogs & Fries",
    fare: "Meals",
    vendorHint: "Sections 110, 232 (Club), 315 (Gallery)"
  },
  {
    name: "Don Churro",
    fare: "Desserts",
    vendorHint: "Sections 112, 309 (Gallery)",
    tags: ["New in 2026"]
  },
  {
    name: "Eli's Crepes",
    fare: "Meals",
    vendorHint: "Section 113"
  },
  {
    name: "Taqueria Picoso",
    fare: "Meals",
    vendorHint: "Section 117"
  },
  {
    name: "Rocklands BBQ",
    fare: "Meals",
    vendorHint: "Section 118"
  },
  {
    name: "Ssongs Korean Corn Dogs",
    fare: "Snacks",
    vendorHint: "Sections 130, 305 (Gallery)"
  },
  {
    name: "Loaded Nachos",
    fare: "Snacks",
    vendorHint: "Section 132",
    tags: ["New in 2026"]
  },
  {
    name: "Hard Times Café",
    description: "Chili and Tex-Mex",
    fare: "Meals",
    vendorHint: "Section 133"
  },
  {
    name: "Melissa's Field of Greens",
    description: "Plant-based options featuring Eatopian Eats",
    fare: "Meals",
    vendor: "Melissa's Field of Greens featuring Eatopian Eats",
    vendorHint: "Section 136",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["New in 2026"]
  },
  {
    name: "Los Cinco Tacos",
    fare: "Meals",
    vendorHint: "Section 136"
  },
  {
    name: "Capo Deli",
    fare: "Meals",
    vendorHint: "Section 136"
  },
  {
    name: "Swizzler",
    fare: "Meals",
    vendorHint: "Sections 141, 320 (Gallery)"
  },
  {
    name: "Ben's Chili Bowl",
    description: "D.C. institution — chili dogs and half-smokes",
    fare: "Meals",
    vendorHint: "Sections 141, 238 (Club), 307 (Gallery)"
  },
  {
    name: "Char Bar Kosher",
    description: "Kosher ballpark food",
    fare: "Meals",
    vendor: "Char Bar",
    vendorHint: "Section 143"
  },
  {
    name: "Arepa Zone",
    description: "Arepas — also the Avoiding Gluten stand",
    fare: "Meals",
    vendorHint: "Section 148 (Avoiding Gluten), Section 304 (Gallery)",
    dietary: ["Gluten Free"]
  },

  // ── Specialty Food — FIS Champions Club ────────────────────────

  {
    name: "Nachos & Burrito Bowl",
    fare: "Meals",
    vendorHint: "Section 208 (FIS Champions Club)",
    tags: ["New in 2026"]
  },
  {
    name: "Lunas de Buenos Aires Empanadas",
    fare: "Meals",
    vendorHint: "Section 214 (FIS Champions Club)",
    tags: ["New in 2026"]
  },
  {
    name: "Champions Carvery",
    description: "Carved meats",
    fare: "Meals",
    vendorHint: "Section 216 (FIS Champions Club)"
  },

  // ── Specialty Food — Club Level ────────────────────────────────

  {
    name: "Little Miner Taco",
    fare: "Meals",
    vendorHint: "Section 231 (Club)"
  },
  {
    name: "Roaming Rooster",
    description: "Fried chicken",
    fare: "Meals",
    vendorHint: "Section 239 (Club)"
  },
  {
    name: "Shake Shack",
    description: "Burgers, shakes, fries",
    fare: "Meals",
    vendorHint: "Section 240 (Club)"
  },
  {
    name: "ULTRA Loft Grill",
    fare: "Meals",
    vendorHint: "Section 244 (Club)",
    tags: ["New in 2026"]
  },

  // ── Traditional Ballpark Food ──────────────────────────────────

  {
    name: "Funnel Cake",
    fare: "Desserts",
    vendorHint: "Section 105"
  },
  {
    name: "Taste of the Majors",
    fare: "Meals",
    vendorHint: "Sections 114, 308 (Gallery)"
  },
  {
    name: "South Mountain Creamery",
    description: "Soft-serve ice cream; also featuring Coneacopia",
    fare: "Desserts",
    vendorHint:
      "Sections 115, 136, 209 (FIS Champions Club), 314 (Gallery)"
  },
  {
    name: "Colony Grill Pizza",
    fare: "Meals",
    vendorHint: "Sections 115, 227 (Club), 311 (Gallery)",
    tags: ["New in 2026"]
  },
  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendorHint: "Sections 134, 143"
  }
];

export async function parseNationalsParkMenu(
  _sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const items: VenueMenuSourceItem[] = [];

  for (const raw of MENU_DATA) {
    const dietaryTags = raw.dietary ?? [];
    const extraTags = raw.tags ?? [];

    items.push({
      name: raw.name,
      description: raw.description,
      fare: raw.fare,
      category: "Food",
      vendorName: raw.vendor ?? raw.name,
      vendorLocationHint: raw.vendorHint,
      dietaryTags,
      sourceUrl: SOURCE_URL
    });

    if (extraTags.length > 0) {
      const last = items[items.length - 1];
      last.dietaryTags = [
        ...dietaryTags,
        ...extraTags.filter((t): t is VenueMenuDietaryTag =>
          ["Gluten Free", "Lactose Free", "Vegan", "Vegetarian"].includes(t)
        )
      ];
    }
  }

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
