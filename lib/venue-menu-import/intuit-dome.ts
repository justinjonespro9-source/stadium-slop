/**
 * Intuit Dome (LA Clippers — NBA) menu parser.
 *
 * Curated from 310 Provisions / Levy Dome Dozen, signature menu, and
 * 2025-26 season upgrades. Marketplace-only rows, generic popcorn/pretzels,
 * beverages, and alcohol are excluded.
 *
 * Sources:
 *   https://www.levyrestaurants.com/press-room/2024-06-10-intuit-dome-introduces-menu-with-items-that-fans-crave-served-everywhere
 *   https://intuitdome.com/plan-your-visit/dining
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

const VENUE_SLUG = "intuit-dome";
const VENUE_NAME = "Intuit Dome";
const SOURCE_URL =
  "https://www.levyrestaurants.com/press-room/2024-06-10-intuit-dome-introduces-menu-with-items-that-fans-crave-served-everywhere";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

const MARKET = "Intuit Dome Markets (310 Provisions)";

const MENU_DATA: RawItem[] = [
  {
    name: "Clipper Dog",
    description:
      "Niman Ranch all-beef natural-casing hot dog — a Dome Dozen staple at every marketplace",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    tags: ["nba", "signature"]
  },
  {
    name: "Famous Spicy Tuna Sushi Dog",
    description: "One-handed sushi burrito in hot-dog form; Dome Dozen item",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    tags: ["nba", "signature"]
  },
  {
    name: "Famous California Sushi Dog",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    tags: ["nba", "signature"]
  },
  {
    name: "Clippers Loaded Nachos",
    description: "Blue, red, and white tortilla chips designed for maximum queso pickup",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    tags: ["nba"]
  },
  {
    name: "La Princessa Churros",
    description: "Warm churros with cinnamon sugar and dulce de leche dip",
    fare: "Desserts",
    vendor: "La Princessa",
    vendorHint: MARKET,
    dietary: ["Vegetarian"],
    tags: ["nba", "signature"]
  },
  {
    name: "Butter Toffee Popcorn",
    description: "Signature Dome popcorn flavor",
    fare: "Snacks",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    dietary: ["Vegetarian"],
    tags: ["nba", "signature"]
  },
  {
    name: "Buffalo Cauliflower Wrap",
    description: "Vegan Buffalo sauce, spinach wrap, pickled carrots, kale, tomato, and red peppers",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    dietary: ["Vegan"],
    tags: ["nba"]
  },
  {
    name: "Hand-Rolled Spicy Tuna Maki",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    tags: ["nba"]
  },
  {
    name: "Hand-Rolled Salmon Maki",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    tags: ["nba"]
  },
  {
    name: "Chicken Caesar Market Salad",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    tags: ["nba"]
  },
  {
    name: "Cobb Market Salad",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    tags: ["nba"]
  },
  {
    name: "Double Cheeseburger",
    description:
      "Brisket, short rib, and chuck blend with New School American cheese, pickles, and Clippers sauce on a potato bun",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: "Pick & Roll markets",
    tags: ["nba", "signature"]
  },
  {
    name: "LA Street Dog",
    description:
      "Bacon-wrapped Niman Ranch hot dog with garlic mayo, peppers, onions, ketchup, and mustard on a bolillo bun",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: "Pick & Roll markets",
    tags: ["nba", "signature"]
  },
  {
    name: "K-Town BBQ Chicken & Waffle Fries",
    description: "Korean BBQ chicken thighs from Seoul Sausage over waffle fries",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: "Pick & Roll markets",
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "Four-Edge Pan Pepperoni Pizza",
    description: "Detroit-style square-cut pizza with caramelized edges",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: "Pick & Roll markets",
    tags: ["nba", "signature"]
  },
  {
    name: "Four-Edge Pan Cheese Pizza",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: "Pick & Roll markets",
    dietary: ["Vegetarian"],
    tags: ["nba", "signature"]
  },
  {
    name: "Continental Gourmet Empanadas",
    description: "Rotating empanada fillings from Inglewood's Continental Gourmet Market",
    fare: "Meals",
    vendor: "Continental Gourmet Market",
    vendorHint: "Pick & Roll markets",
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Mushroom Bánh Mì",
    description: "Daikon carrot slaw, jalapeños, cucumber, cilantro, and Sriracha aioli",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Birria Stack",
    description:
      "Slow-roasted beef birria with pickled onions, avocado crema, Chihuahua cheese, corn tostada, and flour tortilla",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    tags: ["nba", "signature"]
  },
  {
    name: "Spam Onigiri",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    tags: ["nba"]
  },
  {
    name: "Esquites",
    description: "Roasted corn with crème, cotija, lime, and tajín",
    fare: "Meals",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "Melissa's Asian Chicken Salad",
    fare: "Meals",
    vendor: "Melissa's Produce",
    vendorHint: MARKET,
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Apple Hand Pie",
    fare: "Desserts",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    dietary: ["Vegetarian"],
    tags: ["nba"]
  },
  {
    name: "The GZ Cookie",
    description: "Gillian Zucker's chocolate chip cookie recipe",
    fare: "Desserts",
    vendor: "310 Provisions",
    vendorHint: MARKET,
    dietary: ["Vegetarian"],
    tags: ["nba", "signature"]
  }
];

function dedupeMenuItems(rawItems: RawItem[]): RawItem[] {
  const byName = new Map<string, RawItem>();
  for (const item of rawItems) {
    const key = normalizeMenuItemName(item.name);
    if (!byName.has(key)) {
      byName.set(key, { ...item });
    }
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

export async function parseIntuitDomeMenu(
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
    skippedDrinks: 0
  };
}
