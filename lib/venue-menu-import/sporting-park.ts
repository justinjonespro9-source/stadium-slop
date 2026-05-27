/**
 * Sporting Park (Sporting Kansas City — MLS) menu parser.
 *
 * Item-level concessions data from the official concessions page, which
 * lists each stand by section with full menu items grouped under
 * Favorites, Value Menu, Snacks & Sides, Desserts, and Sporting Fare.
 *
 * Stands/sections:
 *   101 Brat & Bräu, 114 Kickin' Chicken, 122 El Capitan,
 *   127 American Royal, 129 State Line Burger, 134 Kan-za City Pizza Co.,
 *   300 Shield Club South Grill, Budweiser Brew House
 *
 * Vendor/stand names are stored as vendorName metadata only.
 * All beverages (alcoholic & non-alcoholic), popcorn, generic chips,
 * cotton candy, and frozen drinks are excluded.
 *
 * Source:
 *   https://www.sportingkc.com/stadium/concessions/
 *
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "sporting-park";
const VENUE_NAME = "Sporting Park";
const SOURCE_URL = "https://www.sportingkc.com/stadium/concessions/";

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
  // ── 101 Brat & Bräu ────────────────────────────────────────────

  {
    name: "9' Polish Sausage",
    fare: "Meals",
    vendor: "Brat & Bräu",
    vendorHint: "Section 101",
    tags: ["mls"]
  },
  {
    name: "Smoked Bratwurst",
    fare: "Meals",
    vendor: "Brat & Bräu",
    vendorHint: "Section 101",
    tags: ["mls"]
  },
  {
    name: "Vegan Sausage",
    fare: "Meals",
    vendor: "Brat & Bräu",
    vendorHint: "Section 101",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Big Jumbo Pretzel",
    fare: "Snacks",
    vendor: "Brat & Bräu",
    vendorHint: "Section 101",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Cookie Ice Cream",
    fare: "Desserts",
    vendor: "Brat & Bräu",
    vendorHint: "Section 101",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── 114 Kickin' Chicken ─────────────────────────────────────────

  {
    name: "Buffalo Chicken Sandwich",
    fare: "Meals",
    vendor: "Kickin' Chicken",
    vendorHint: "Section 114",
    tags: ["mls"]
  },
  {
    name: "Popcorn Chicken Bucket",
    fare: "Meals",
    vendor: "Kickin' Chicken",
    vendorHint: "Section 114",
    tags: ["mls"]
  },
  {
    name: "Chicken Tenders and Fries",
    fare: "Meals",
    vendorHint:
      "Kickin' Chicken (Sec. 114), Shield Club South Grill (Sec. 300), Budweiser Brew House",
    tags: ["mls"]
  },
  {
    name: "Buffalo Cauliflower Bites",
    fare: "Snacks",
    vendorHint: "Kickin' Chicken (Sec. 114), Shield Club South Grill (Sec. 300)",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls"]
  },
  {
    name: "Jr Naked Chicken Sandwich",
    fare: "Meals",
    vendor: "Kickin' Chicken",
    vendorHint: "Section 114",
    tags: ["mls"]
  },
  {
    name: "Curly Fries",
    fare: "Snacks",
    vendor: "Kickin' Chicken",
    vendorHint: "Section 114",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls"]
  },

  // ── 122 El Capitan ──────────────────────────────────────────────

  {
    name: "Chili Verde Street Tacos",
    fare: "Meals",
    vendor: "El Capitan",
    vendorHint: "Section 122",
    tags: ["mls"]
  },
  {
    name: "Carne Asada",
    fare: "Meals",
    vendor: "El Capitan",
    vendorHint: "Section 122",
    tags: ["mls"]
  },
  {
    name: "El Capitan Nachos Box",
    fare: "Snacks",
    vendor: "El Capitan",
    vendorHint: "Section 122",
    tags: ["mls"]
  },
  {
    name: "Big Cheese Quesadilla",
    fare: "Meals",
    vendor: "El Capitan",
    vendorHint: "Section 122",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Elote Empanadas",
    fare: "Snacks",
    vendor: "El Capitan",
    vendorHint: "Section 122",
    tags: ["mls"]
  },
  {
    name: "Dessert Filled Churros",
    fare: "Desserts",
    vendor: "El Capitan",
    vendorHint: "Section 122",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── 127 American Royal (KC BBQ) ─────────────────────────────────

  {
    name: "Rope Sausage",
    fare: "Meals",
    vendor: "American Royal",
    vendorHint: "Section 127",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Smoked Turkey Sandwich",
    fare: "Meals",
    vendor: "American Royal",
    vendorHint: "Section 127",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Pulled Pork Nachos",
    fare: "Meals",
    vendor: "American Royal",
    vendorHint: "Section 127",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Brisket Nachos",
    fare: "Meals",
    vendor: "American Royal",
    vendorHint: "Section 127",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Baked Beans",
    description: "BBQ side",
    fare: "Snacks",
    vendor: "American Royal",
    vendorHint: "Section 127",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Mac and Cheese",
    fare: "Snacks",
    vendor: "American Royal",
    vendorHint: "Section 127",
    tags: ["mls"]
  },
  {
    name: "Bread Pudding Bites",
    fare: "Desserts",
    vendor: "American Royal",
    vendorHint: "Section 127",
    tags: ["mls"]
  },

  // ── 129 State Line Burger ───────────────────────────────────────

  {
    name: "Stateline Slider Box",
    fare: "Meals",
    vendor: "State Line Burger",
    vendorHint: "Section 129",
    tags: ["mls"]
  },
  {
    name: "Stateline Deluxe Burger",
    fare: "Meals",
    vendor: "State Line Burger",
    vendorHint: "Section 129",
    tags: ["mls"]
  },
  {
    name: "Hamburger",
    fare: "Meals",
    vendorHint: "State Line Burger (Sec. 129), Budweiser Brew House",
    tags: ["mls"]
  },
  {
    name: "Cheeseburger",
    fare: "Meals",
    vendorHint: "State Line Burger (Sec. 129), Budweiser Brew House",
    tags: ["mls"]
  },
  {
    name: "Caliburger",
    fare: "Meals",
    vendor: "State Line Burger",
    vendorHint: "Section 129",
    tags: ["mls"]
  },
  {
    name: "Brisket Chili Fries",
    fare: "Snacks",
    vendor: "State Line Burger",
    vendorHint: "Section 129",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Mozz Nuggies",
    fare: "Snacks",
    vendorHint: "State Line Burger (Sec. 129), Budweiser Brew House",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Blue Ribbon Malt Shake",
    fare: "Desserts",
    vendor: "State Line Burger",
    vendorHint: "Section 129",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── 134 Kan-za City Pizza Co. ───────────────────────────────────

  {
    name: "Cheese Pizza",
    fare: "Meals",
    vendor: "Kan-za City Pizza Co.",
    vendorHint: "Section 134",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Pepperoni Pizza",
    fare: "Meals",
    vendor: "Kan-za City Pizza Co.",
    vendorHint: "Section 134",
    tags: ["mls"]
  },
  {
    name: "Veggie Pizza",
    fare: "Meals",
    vendor: "Kan-za City Pizza Co.",
    vendorHint: "Section 134",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Oreo Brownie with Ice Cream",
    fare: "Desserts",
    vendorHint: "Kan-za City Pizza Co. (Sec. 134), Budweiser Brew House",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── 300 Shield Club South Grill ─────────────────────────────────

  {
    name: "Chicken Wings",
    description:
      "Plain, Buffalo, Buffalo Lemon Pepper Dry Rub, or Garlic Parmesan",
    fare: "Meals",
    vendor: "Shield Club South Grill",
    vendorHint: "Section 300 (Shield Club)",
    tags: ["mls"]
  },
  {
    name: "Big Mozz Nuggets",
    fare: "Snacks",
    vendor: "Shield Club South Grill",
    vendorHint: "Section 300 (Shield Club)",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Bacon Cheeseburger",
    fare: "Meals",
    vendorHint: "Shield Club South Grill (Sec. 300), Budweiser Brew House",
    tags: ["mls"]
  },
  {
    name: "Pastrami Burger",
    fare: "Meals",
    vendor: "Shield Club South Grill",
    vendorHint: "Section 300 (Shield Club)",
    tags: ["mls"]
  },
  {
    name: "Double Double with Sporting Sauce",
    fare: "Meals",
    vendor: "Shield Club South Grill",
    vendorHint: "Section 300 (Shield Club)",
    tags: ["mls"]
  },
  {
    name: "Kids Sliders",
    fare: "Meals",
    vendor: "Shield Club South Grill",
    vendorHint: "Section 300 (Shield Club)",
    tags: ["mls"]
  },
  {
    name: "Cali Veggie Burger",
    fare: "Meals",
    vendor: "Shield Club South Grill",
    vendorHint: "Section 300 (Shield Club)",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },
  {
    name: "Chicken Parm Sandwich",
    fare: "Meals",
    vendor: "Shield Club South Grill",
    vendorHint: "Section 300 (Shield Club)",
    tags: ["mls"]
  },
  {
    name: "Philly",
    description: "Philly cheesesteak",
    fare: "Meals",
    vendor: "Shield Club South Grill",
    vendorHint: "Section 300 (Shield Club)",
    tags: ["mls"]
  },
  {
    name: "Foot Long Corndog",
    fare: "Meals",
    vendor: "Shield Club South Grill",
    vendorHint: "Section 300 (Shield Club)",
    tags: ["mls"]
  },
  {
    name: "Shield Gameday Box",
    description: "6 sliders, 6 buffalo wings, fries, big mozz nuggets",
    fare: "Meals",
    vendor: "Shield Club South Grill",
    vendorHint: "Section 300 (Shield Club)",
    tags: ["mls"]
  },

  // ── Budweiser Brew House ────────────────────────────────────────

  {
    name: "Blue Ribbon Chocolate Malt",
    fare: "Desserts",
    vendor: "Budweiser Brew House",
    vendorHint: "Budweiser Brew House",
    dietary: ["Vegetarian"],
    tags: ["mls"]
  },

  // ── Value Menu (consolidated, available throughout) ─────────────

  {
    name: "Hot Dog",
    fare: "Meals",
    vendorHint:
      "Brat & Bräu (Sec. 101), Kickin' Chicken (Sec. 114), State Line Burger (Sec. 129), Shield Club (Sec. 300), Budweiser Brew House",
    tags: ["mls"]
  },
  {
    name: "Nachos with Cheese",
    fare: "Snacks",
    vendorHint:
      "Brat & Bräu (Sec. 101), Kickin' Chicken (Sec. 114), El Capitan (Sec. 122)",
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

export async function parseSportingParkMenu(
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
