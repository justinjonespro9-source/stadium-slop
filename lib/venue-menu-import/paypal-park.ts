/**
 * PayPal Park (San Jose Earthquakes — MLS, Bay FC — NWSL) menu parser.
 *
 * The official OVG page (sjearthquakes.com/paypalpark/ovg) is a stadium map
 * shell only — no item-level concessions in static HTML or embedded JS.
 *
 * Menu data is curated from:
 *   - Earthquakes 2020 stadium enhancements (named stands, sections, items)
 *   - MLS venue import notes (Big Chicken, Bibo's NY Pizza, Steep)
 *   - PayPal Park / OVG social announcements (Big Chicken at Epicenter)
 *
 * FanFest food trucks rotate per match (not imported). Grab-and-Go markets
 * and generic stadium fare are excluded.
 *
 * Sources:
 *   https://www.sjearthquakes.com/paypalpark/ovg
 *   https://www.sjearthquakes.com/news/news-earthquakes-announce-stadium-enhancements-2020
 *
 * Re-verify each season; trucks and rotating specials change frequently.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "paypal-park";
const VENUE_NAME = "PayPal Park";
const SOURCE_URL = "https://www.sjearthquakes.com/paypalpark/ovg";

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
  // ── Big Chicken (Shaq's) ──────────────────────────────────────────

  {
    name: "Chicken Sandwich",
    description:
      "Hand-breaded crispy chicken sandwiches with custom sauces and buffalo variants",
    fare: "Meals",
    vendor: "Big Chicken",
    vendorHint: "East side, next to Epicenter Fan Zone",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Bibo's NY Pizza (Section 12) ────────────────────────────────

  {
    name: "Pizza Slice",
    description: "Giant New York-style slices",
    fare: "Meals",
    vendor: "Bibo's NY Pizza",
    vendorHint: "Section 12",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Meatball Sub",
    description: "South Bay favorite meatball sub",
    fare: "Meals",
    vendor: "Bibo's NY Pizza",
    vendorHint: "Section 12",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Steep Tea & Creamery (Section 12) ───────────────────────────

  {
    name: "Chicken Kimchi Fried Rice Bowl",
    fare: "Meals",
    vendor: "Steep Tea & Creamery",
    vendorHint: "Stand 10, Section 12",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Potstickers",
    fare: "Snacks",
    vendor: "Steep Tea & Creamery",
    vendorHint: "Stand 10, Section 12",
    tags: ["mls", "nwsl"]
  },

  // ── Stand 7 — Section 113 (Grilled Stand) ───────────────────────

  {
    name: "Filthy Burger",
    description:
      "1/4 lb all-beef burger with maple bacon, pepper jack, BBQ pulled pork, and BBQ sauce on brioche",
    fare: "Meals",
    vendorHint: "Stand 7, Section 113",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Plant-Based Burger",
    description: "Impossible patty with field lettuce on an open-faced brioche bun",
    fare: "Meals",
    vendorHint: "Stand 7, Section 113",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Grilled Chicken Pesto Sandwich",
    description: "6 oz grilled chicken breast, provolone, and basil pesto on brioche",
    fare: "Meals",
    vendorHint: "Stand 7, Section 113",
    tags: ["mls", "nwsl"]
  },

  // ── BBQ Cart — Section 116 ────────────────────────────────────────

  {
    name: "BBQ Pulled Pork",
    fare: "Meals",
    vendor: "BBQ Cart",
    vendorHint: "Section 116",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "BBQ Beef Brisket",
    fare: "Meals",
    vendor: "BBQ Cart",
    vendorHint: "Section 116",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Mac and Cheese",
    fare: "Snacks",
    vendor: "BBQ Cart",
    vendorHint: "Section 116",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Carvery Cart — Section 119 ──────────────────────────────────

  {
    name: "Smoked Turkey Sandwich",
    description: "Smoked breast of turkey on brioche with assorted accoutrements",
    fare: "Meals",
    vendor: "Carvery Cart",
    vendorHint: "Section 119",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Roasted Pork Loin Sandwich",
    description: "Rosemary-scented roasted pork loin on brioche",
    fare: "Meals",
    vendor: "Carvery Cart",
    vendorHint: "Section 119",
    tags: ["mls", "nwsl"]
  },

  // ── Pizza Stand — Section 120 ───────────────────────────────────

  {
    name: "Pepperoni Pizza",
    fare: "Meals",
    vendor: "Pizza Stand",
    vendorHint: "Stand 9, Section 120",
    tags: ["mls", "nwsl"]
  },
  {
    name: "Cheese Pizza",
    fare: "Meals",
    vendor: "Pizza Stand",
    vendorHint: "Stand 9, Section 120",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },
  {
    name: "Margherita Pizza",
    description: "Pizza sauce, fresh mozzarella, tomatoes, basil, sea salt",
    fare: "Meals",
    vendor: "Pizza Stand",
    vendorHint: "Stand 9, Section 120",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl"]
  },

  // ── Carnitas Nachos (multiple stands) ───────────────────────────

  {
    name: "Carnitas Nachos",
    description:
      "Pulled pork, green chili queso blanco, sour cream, and cilantro",
    fare: "Snacks",
    vendorHint:
      "Stand 2 (Epicenter), Stand 4 (Section 110), Stand 11 (Section 130)",
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Churwaffles ───────────────────────────────────────────────────

  {
    name: "Churwaffle and Chicken",
    description: "Savory cornbread waffle with chicken, butter, maple syrup, and hot sauce",
    fare: "Meals",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Churwaffle and Hotlink",
    description: "Savory cornbread waffle with hotlink and honey",
    fare: "Meals",
    tags: ["mls", "nwsl", "local-specialty"]
  },
  {
    name: "Dessert Churwaffle",
    description: "Cinnamon, whipped cream, and powdered sugar",
    fare: "Desserts",
    dietary: ["Vegetarian"],
    tags: ["mls", "nwsl", "local-specialty"]
  },

  // ── Stand 3 — Section 101 ───────────────────────────────────────

  {
    name: "Protein Box",
    description: "Rolled meats, cubed cheese, mixed nuts, boiled eggs, and grapes",
    fare: "Snacks",
    vendorHint: "Stand 3, Section 101",
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

export async function parsePayPalParkMenu(
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
