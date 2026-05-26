/**
 * Sutter Health Park (Athletics) menu parser.
 *
 * Source: https://www.mlb.com/athletics/ballpark/food-and-beverage
 * Curated static dataset from the official Athletics food & beverage page.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "sutter-health-park";
const VENUE_NAME = "Sutter Health Park";
const SOURCE_URL =
  "https://www.mlb.com/athletics/ballpark/food-and-beverage";

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
  // ── Bridges Grille ─────────────────────────────────────────────

  {
    name: "Home Run Smash",
    description:
      "Double burger — beef belly, brisket & chuck blend, caramelized onions, American cheese, pickles, Home Run sauce, Martin's potato bun",
    fare: "Meals",
    vendor: "Bridges Grille"
  },
  {
    name: "Spicy Chicken Bacon Ranch Sub",
    description:
      "Crispy chicken, bacon, lettuce, tomato, spicy ranch on Max's French roll",
    fare: "Meals",
    vendor: "Bridges Grille"
  },

  // ── Shared concourse items (multiple stands) ───────────────────

  {
    name: "Chicken Tenders & Fries",
    description: "Crispy golden tenders with dipping sauces",
    fare: "Meals",
    vendorHint: "Bridges Grille, Coop & Kennel Pub, Golden Spike Chophouse"
  },
  {
    name: "Cheeseburger & Fries",
    fare: "Meals",
    vendorHint: "Bridges Grille, Golden Spike Chophouse"
  },
  {
    name: "Footlong Hot Dog",
    description: "Served on Martin's potato bun",
    fare: "Meals",
    vendorHint: "Bridges Grille, Cadillac Diner, Golden Spike Chophouse"
  },
  {
    name: "Garlic Fries",
    description: "Crinkle-cut fries tossed in garlic and parmesan",
    fare: "Snacks",
    vendorHint: "Bridges Grille, Coop & Kennel Pub, Golden Spike Chophouse"
  },

  // ── Cadillac Diner ─────────────────────────────────────────────

  {
    name: "Cadillac Diner Sausage",
    description:
      "Savory sausage on Martin's potato bun with sweet caramelized onions",
    fare: "Meals",
    vendor: "Cadillac Diner"
  },
  {
    name: "Chili Cheese Hot Dog",
    description: "Slow-cooked short rib chili and creamy cheese sauce",
    fare: "Meals",
    vendor: "Cadillac Diner"
  },
  {
    name: "Soft Serve",
    fare: "Desserts",
    vendor: "Cadillac Diner"
  },
  {
    name: "Milkshakes",
    description: "Thick, hand-spun milkshakes",
    fare: "Desserts",
    vendor: "Cadillac Diner"
  },

  // ── Coop & Kennel Pub ──────────────────────────────────────────

  {
    name: "River City Hot Tenders & Fries Combo",
    description:
      "Foster Farms tenders tossed in chili oil and River City spices, served with fries and pickles",
    fare: "Meals",
    vendor: "Coop & Kennel Pub",
    dietary: ["Gluten Free"]
  },
  {
    name: "River City Hot Chicken Sandwich",
    description:
      "Hand-breaded chicken breast, chili oil, River City sauce, pickle slaw, pickles on Martin's potato bun",
    fare: "Meals",
    vendor: "Coop & Kennel Pub"
  },
  {
    name: "Street Dog",
    description: "Bacon-wrapped hot dog with sautéed peppers and onions",
    fare: "Meals",
    vendor: "Coop & Kennel Pub"
  },

  // ── Golden Spike Chophouse ─────────────────────────────────────

  {
    name: "Bacon Cheeseburger & Fries Combo",
    description:
      "Angus patty, American cheese, lettuce, tomato on Martin's potato bun with fries",
    fare: "Meals",
    vendor: "Golden Spike Chophouse"
  },
  {
    name: "Dugout Fries",
    description:
      "Loaded with American cheese, grilled onions, Home Run sauce, pickled chili peppers",
    fare: "Snacks",
    vendor: "Golden Spike Chophouse",
    dietary: ["Vegetarian", "Gluten Free"]
  },
  {
    name: "Chicken Sandwich & Fries",
    fare: "Meals",
    vendor: "Golden Spike Chophouse"
  },

  // ── Oso's Mexican Cantina ──────────────────────────────────────

  {
    name: "Jackfruit Tacos",
    description:
      "Seasoned jackfruit, cilantro, onion, lime on corn tortillas",
    fare: "Meals",
    vendor: "Oso's Mexican Cantina",
    dietary: ["Vegan", "Gluten Free"]
  },
  {
    name: "California Burrito",
    description: "Carne asada, fries, guacamole, cheese, pico de gallo",
    fare: "Meals",
    vendor: "Oso's Mexican Cantina"
  },
  {
    name: "Carne Asada Fries",
    description:
      "Loaded fries with cheese, pico de gallo, guacamole, sour cream",
    fare: "Meals",
    vendor: "Oso's Mexican Cantina"
  },
  {
    name: "Tacos",
    description: "Chicken tinga or beef barbacoa",
    fare: "Meals",
    vendor: "Oso's Mexican Cantina"
  },
  {
    name: "Burritos",
    fare: "Meals",
    vendor: "Oso's Mexican Cantina"
  },
  {
    name: "Fiesta Salad",
    description:
      "Roasted corn, black beans, tomatoes, crispy tortilla strips, salsa ranch dressing",
    fare: "Meals",
    vendor: "Oso's Mexican Cantina"
  },

  // ── Pizza & Pints ──────────────────────────────────────────────

  {
    name: "Cheese Pizza",
    fare: "Meals",
    vendor: "Pizza & Pints",
    dietary: ["Vegetarian"]
  },
  {
    name: "Pepperoni Pizza",
    fare: "Meals",
    vendor: "Pizza & Pints"
  },
  {
    name: "Caesar Salad",
    description:
      "Chopped romaine, parmesan, pangrattato, lemon, Caesar dressing",
    fare: "Meals",
    vendor: "Pizza & Pints",
    dietary: ["Vegetarian"]
  },

  // ── The Sweet Spot ─────────────────────────────────────────────

  {
    name: "Soft Pretzel",
    fare: "Snacks",
    vendor: "The Sweet Spot"
  },

  // ── Portable Stands ────────────────────────────────────────────

  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendorHint: "Portable carts"
  },
  {
    name: "Helmet Nachos",
    fare: "Snacks",
    vendorHint: "Portable carts"
  },
  {
    name: "Jalapeño Cheddar Bratwurst",
    fare: "Meals",
    vendorHint: "Portable carts"
  },
  {
    name: "Merlino's Freeze",
    fare: "Desserts",
    vendorHint: "Portable carts"
  },
  {
    name: "Tri Tip Sandwich",
    fare: "Meals",
    vendorHint: "Portable carts"
  }
];

export async function parseSutterHealthParkMenu(
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
