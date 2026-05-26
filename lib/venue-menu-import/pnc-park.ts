/**
 * PNC Park (Pittsburgh Pirates) menu parser.
 *
 * Source: https://www.mlb.com/pirates/ballpark/concessions/ballpark-food
 * Curated static dataset from the official Pirates Ballpark Bites page.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "pnc-park";
const VENUE_NAME = "PNC Park";
const SOURCE_URL =
  "https://www.mlb.com/pirates/ballpark/concessions/ballpark-food";

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
  // ── Hot Dogs & Sausage ─────────────────────────────────────────

  {
    name: "Jumbo Hot Dog",
    fare: "Meals",
    vendorHint: "Sections 105, 108, 119, 123, 314, 318, 328"
  },
  {
    name: "Classic Dog",
    fare: "Meals",
    vendor: "Deli Dogs",
    vendorHint: "Section 135"
  },
  {
    name: "Chicago Dog",
    fare: "Meals",
    vendor: "Deli Dogs",
    vendorHint: "Section 135"
  },
  {
    name: "Chili Dog",
    fare: "Meals",
    vendor: "Deli Dogs",
    vendorHint: "Section 135"
  },
  {
    name: "Clemente Dog",
    fare: "Meals",
    vendor: "Deli Dogs",
    vendorHint: "Section 135"
  },
  {
    name: "Cheddar & Chive Brat",
    fare: "Meals",
    vendorHint: "Section 119"
  },
  {
    name: "Hot Italian Sausage",
    fare: "Meals",
    vendor: "Ballpark Burghers",
    vendorHint: "Section 120"
  },

  // ── Burgers ────────────────────────────────────────────────────

  {
    name: "All-Star Burger",
    fare: "Meals",
    vendorHint: "Sections 108, 120, 314, 332"
  },
  {
    name: "Beer Burger",
    fare: "Meals",
    vendor: "Cannonball",
    vendorHint: "Section 146"
  },

  // ── Chicken ────────────────────────────────────────────────────

  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendorHint:
      "Sections 108, 109, 115, 118, 120, 127, 144, 310, 322"
  },

  // ── Chicken Sandwiches ─────────────────────────────────────────

  {
    name: "Classic Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Chicken on the Hill",
    vendorHint: "Section 144"
  },
  {
    name: "Nashville Hot Chicken Sandwich",
    fare: "Meals",
    vendor: "Chicken on the Hill",
    vendorHint: "Section 144"
  },
  {
    name: "Coop Puppy Sandwich",
    fare: "Meals",
    vendor: "Chicken on the Hill",
    vendorHint: "Section 144"
  },

  // ── Sandwiches ─────────────────────────────────────────────────

  {
    name: "Pittsburgher Cheesesteak",
    fare: "Meals",
    vendor: "Primanti's",
    vendorHint: "Section 110"
  },
  {
    name: "Pastrami with Cheese",
    fare: "Meals",
    vendor: "Primanti's",
    vendorHint: "Section 110"
  },
  {
    name: "Capicola with Cheese",
    fare: "Meals",
    vendor: "Primanti's",
    vendorHint: "Section 110"
  },

  // ── Chickie & Pete's ──────────────────────────────────────────

  {
    name: "Chickie & Pete's Cheesesteak",
    fare: "Meals",
    vendor: "Chickie & Pete's",
    vendorHint: "Sections 115, 132, 310"
  },

  // ── BBQ ────────────────────────────────────────────────────────

  {
    name: "Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Manny's BBQ",
    vendorHint: "Section 142"
  },
  {
    name: "Pulled Chicken Sandwich",
    fare: "Meals",
    vendor: "Manny's BBQ",
    vendorHint: "Section 142"
  },

  // ── Pizza ──────────────────────────────────────────────────────

  {
    name: "Caliente Pizza",
    fare: "Meals",
    vendor: "Caliente Pizza",
    vendorHint: "Sections 105, 114, 123, 128, 305, 318"
  },

  // ── Ballpark Classics ──────────────────────────────────────────

  {
    name: "Bavarian Pretzel",
    fare: "Snacks",
    vendorHint: "Sections 105, 108, 119, 123, 305, 307, 314, 318"
  },

  // ── Fries & Fried Snacks ───────────────────────────────────────

  {
    name: "Chickie & Pete's Fries",
    fare: "Snacks",
    vendor: "Chickie & Pete's",
    vendorHint: "Sections 115, 132"
  },
  {
    name: "Crab Fries",
    fare: "Snacks",
    vendor: "Chickie & Pete's",
    vendorHint: "Section 310"
  },
  {
    name: "Big Mozz Cheesesticks",
    fare: "Snacks",
    vendorHint: "Sections 127, 146, 322"
  },
  {
    name: "Nutella Beignets",
    fare: "Desserts",
    vendor: "Cannonball",
    vendorHint: "Section 146"
  },
  {
    name: "Haluski Cannonballs",
    fare: "Snacks",
    vendor: "Cannonball",
    vendorHint: "Section 146"
  },

  // ── Nachos / Nachorita (Section 138) ───────────────────────────

  {
    name: "Nacho Supreme",
    fare: "Snacks",
    vendorHint:
      "Sections 108, 114, 119, 120, 123, 128, 307, 314, 318, 332"
  },
  {
    name: "Nachorita Nachos",
    fare: "Meals",
    vendor: "Nachorita",
    vendorHint: "Section 138"
  },
  {
    name: "Mojo Chicken Nachos",
    fare: "Meals",
    vendor: "Nachorita",
    vendorHint: "Section 138"
  },
  {
    name: "Chips & Queso",
    fare: "Snacks",
    vendor: "Nachorita",
    vendorHint: "Section 138"
  },
  {
    name: "Empanadas",
    description: "Meat or vegan",
    fare: "Meals",
    vendor: "Nachorita",
    vendorHint: "Section 138"
  },
  {
    name: "Street Corn",
    fare: "Snacks",
    vendor: "Nachorita",
    vendorHint: "Section 138"
  },
  {
    name: "Caramel Stuffed Churro",
    fare: "Desserts",
    vendor: "Nachorita",
    vendorHint: "Section 138"
  },

  // ── Pittsburgh Favorites ───────────────────────────────────────

  {
    name: "Pierogies",
    fare: "Meals",
    vendorHint: "Sections 105, 119, 128, 142"
  },
  {
    name: "Cold Pierogi Salad",
    fare: "Meals",
    vendorHint: "Section 118"
  },
  {
    name: "Chipped Ham Fries",
    fare: "Meals",
    vendorHint: "Section 118"
  },

  // ── Lighter Options ────────────────────────────────────────────

  {
    name: "Berry Parfait",
    fare: "Desserts",
    vendorHint: "Section 118"
  },
  {
    name: "Caesar Salad",
    fare: "Meals",
    vendorHint: "Section 118"
  },

  // ── Desserts ───────────────────────────────────────────────────

  {
    name: "Helmet Sundae",
    fare: "Desserts",
    vendorHint: "Sections 107, 119, 144"
  },
  {
    name: "Cookie Sundae",
    fare: "Desserts",
    vendorHint: "Section 107"
  },
  {
    name: "Waffle Cone Soft Serve",
    fare: "Desserts",
    vendorHint: "Sections 107, 119, 135, 144, 318"
  },
  {
    name: "Mini Melts",
    fare: "Desserts",
    vendorHint: "Sections 105, 118"
  },
  {
    name: "Lemon Chill",
    fare: "Desserts",
    vendorHint: "Sections 105, 118, Pop's Plaza"
  }
];

export async function parsePncParkMenu(
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
