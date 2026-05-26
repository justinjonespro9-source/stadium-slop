/**
 * American Family Field (Milwaukee Brewers) menu parser.
 *
 * Source: User-provided official concessions text + confirmed 2026 new items
 * from media coverage (Urban Milwaukee, BizTimes, Brew Crew Ball, JSON Line).
 *
 * The official MLB Brewers concessions page does not have a static URL.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "american-family-field";
const VENUE_NAME = "American Family Field";
const SOURCE_URL =
  "https://www.mlb.com/brewers/ballpark/concessions";

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
  // ── New 2026 — Fair Foods (Loge Level) ─────────────────────────

  {
    name: "Deep-Fried Kringle",
    description: "Wisconsin State Fair classic — deep-fried Kringle pastry",
    fare: "Desserts",
    vendor: "Fair Foods",
    vendorHint: "Loge Level",
    tags: ["New in 2026"]
  },
  {
    name: "Corn Dogs",
    fare: "Meals",
    vendor: "Fair Foods",
    vendorHint: "Loge Level",
    tags: ["New in 2026"]
  },
  {
    name: "Cream Puffs",
    description: "Flavored cream puffs, State Fair style",
    fare: "Desserts",
    vendor: "Fair Foods",
    vendorHint: "Loge Level",
    tags: ["New in 2026"]
  },
  {
    name: "Funnel Cake Fries",
    fare: "Desserts",
    vendor: "Fair Foods",
    vendorHint: "Loge Level",
    tags: ["New in 2026"]
  },
  {
    name: "Nachos on a Stick",
    fare: "Snacks",
    vendor: "Fair Foods",
    vendorHint: "Loge Level",
    tags: ["New in 2026"]
  },
  {
    name: "BBQ Brisket on Mac & Cheese Waffle",
    description:
      "Mac and cheese pressed in a waffle iron, topped with shredded brisket",
    fare: "Meals",
    vendor: "Fair Foods",
    vendorHint: "Loge Level",
    tags: ["New in 2026"]
  },

  // ── New 2026 — K&L's BBQ (The Alley, Left Field Loge) ────────

  {
    name: "K&L's Brisket Sandwich",
    fare: "Meals",
    vendor: "K&L's BBQ",
    vendorHint: "The Alley — Left Field Loge Level",
    tags: ["New in 2026"]
  },
  {
    name: "K&L's Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "K&L's BBQ",
    vendorHint: "The Alley — Left Field Loge Level",
    tags: ["New in 2026"]
  },
  {
    name: "K&L's Smoked Brisket Burger",
    fare: "Meals",
    vendor: "K&L's BBQ",
    vendorHint: "The Alley — Left Field Loge Level",
    tags: ["New in 2026"]
  },
  {
    name: "K&L's BBQ Loaded Fries",
    description: "Waffle fries loaded with brisket or pulled pork",
    fare: "Meals",
    vendor: "K&L's BBQ",
    vendorHint: "The Alley — Left Field Loge Level",
    tags: ["New in 2026"]
  },
  {
    name: "K&L's BBQ Elote",
    description: "Mexican street corn with brisket or pulled pork",
    fare: "Meals",
    vendor: "K&L's BBQ",
    vendorHint: "The Alley — Left Field Loge Level",
    tags: ["New in 2026"]
  },

  // ── New 2026 — Bebe Zito (3rd Street Market Hall Annex) ───────

  {
    name: "Bebe Zito Spicy Chicken Sandwich",
    fare: "Meals",
    vendor: "Bebe Zito",
    vendorHint: "3rd Street Market Hall Annex — Level 200 RF",
    tags: ["New in 2026"]
  },
  {
    name: "Bebe Zito Honey Butter Chicken Tenders",
    fare: "Meals",
    vendor: "Bebe Zito",
    vendorHint: "3rd Street Market Hall Annex — Level 200 RF",
    tags: ["New in 2026"]
  },
  {
    name: "Bebe Zito Chicken Ice Cream",
    description:
      "Signature sweet — Carmelia chocolate core, butterscotch, caramelized corn flakes in drumstick shape",
    fare: "Desserts",
    vendor: "Bebe Zito",
    vendorHint: "3rd Street Market Hall Annex — Level 200 RF",
    tags: ["New in 2026"]
  },

  // ── New 2026 — Drip Chocolate (3rd Street Market Hall Annex) ──

  {
    name: "Drip Chocolate Dipped Cheesecake",
    description: "Chocolate-dipped cheesecake — Dubai Chocolate or S'mores",
    fare: "Desserts",
    vendor: "Drip Chocolate",
    vendorHint: "3rd Street Market Hall Annex — Level 200 RF",
    tags: ["New in 2026"]
  },
  {
    name: "Drip Chocolate Strawberry Cups",
    description: "Dubai chocolate strawberry cups",
    fare: "Desserts",
    vendor: "Drip Chocolate",
    vendorHint: "3rd Street Market Hall Annex — Level 200 RF",
    tags: ["New in 2026"]
  },

  // ── New 2026 — Concession Stand Items ──────────────────────────

  {
    name: "Cheesesteak",
    fare: "Meals",
    vendorHint: "Field Level kiosk",
    tags: ["New in 2026"]
  },
  {
    name: "Sticky Maple Chicken Sandwich",
    fare: "Meals",
    vendorHint: "Chicken stands",
    tags: ["New in 2026"]
  },
  {
    name: "Al Pastor Topped Dog",
    fare: "Meals",
    vendorHint: "Topped Dog stands",
    tags: ["New in 2026"]
  },

  // ── New 2026 — J. Leinenkugel's Barrel Yard ───────────────────

  {
    name: "Barrel Yard Sampler",
    description:
      "Cheese curds, mini-pretzels, chicken tenders with sweet heat seasoning, house-made chips & queso, sour cream & onion aioli, ranch",
    fare: "Meals",
    vendor: "J. Leinenkugel's Barrel Yard",
    tags: ["New in 2026"]
  },

  // ── Standard Concessions ───────────────────────────────────────

  {
    name: "Hot Dogs & Johnsonville Brats",
    fare: "Meals"
  },
  {
    name: "Topped Hotdogs",
    fare: "Meals"
  },
  {
    name: "Specialty Sausages",
    fare: "Meals"
  },
  {
    name: "Burgers",
    fare: "Meals"
  },
  {
    name: "Chicken Sandwich",
    fare: "Meals",
    vendorHint: "Chicken stands"
  },
  {
    name: "Chicken Strips",
    fare: "Meals"
  },
  {
    name: "Pizza",
    fare: "Meals"
  },
  {
    name: "Cheese Pizza",
    fare: "Meals",
    dietary: ["Vegetarian"]
  },
  {
    name: "Nachos Chips & Cheese",
    fare: "Snacks"
  },
  {
    name: "Nacho Grande",
    fare: "Meals"
  },
  {
    name: "Mac and Cheese",
    fare: "Meals"
  },
  {
    name: "Walking Taco",
    fare: "Meals"
  },
  {
    name: "Cheese Fries",
    fare: "Snacks"
  },
  {
    name: "Tater Tots",
    fare: "Snacks"
  },
  {
    name: "Baked Potatoes",
    fare: "Meals"
  },
  {
    name: "Sargento Fried Cheese Curds",
    description: "Wisconsin classic — Sargento branded",
    fare: "Snacks"
  },
  {
    name: "Soft Pretzel",
    fare: "Snacks"
  },
  {
    name: "Soft Pretzel with Toppings",
    fare: "Snacks"
  },
  {
    name: "Bubble Waffle",
    fare: "Desserts"
  },
  {
    name: "Mini Donuts",
    fare: "Desserts"
  },
  {
    name: "Custard",
    fare: "Desserts"
  },
  {
    name: "Dippin' Dots",
    fare: "Desserts"
  },
  {
    name: "Root Beer Float",
    fare: "Desserts"
  },
  {
    name: "Heavenly Roasted Nuts",
    fare: "Snacks"
  },
  {
    name: "Kettle Corn",
    fare: "Snacks"
  },

  // ── 414 Value Menu ─────────────────────────────────────────────

  {
    name: "Value Junior Hot Dog",
    fare: "Meals"
  },
  {
    name: "Value Junior Nachos",
    fare: "Snacks"
  },

  // ── Sunday Fun-Day ─────────────────────────────────────────────

  {
    name: "Sunday Fun-Day Meal",
    description: "Family-oriented meal deal (Sundays only)",
    fare: "Meals"
  }
];

export async function parseAmericanFamilyFieldMenu(
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
      vendorName: raw.vendor,
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
