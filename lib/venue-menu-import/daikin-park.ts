/**
 * Daikin Park (Houston Astros) menu parser.
 *
 * Source: https://www.mlb.com/astros/ballpark/information/concessions
 * Curated static dataset from the official Astros concessions page.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "daikin-park";
const VENUE_NAME = "Daikin Park";
const SOURCE_URL =
  "https://www.mlb.com/astros/ballpark/information/concessions";

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
  // ── Butcher / Butcher Express ──────────────────────────────────

  {
    name: "18 Hour Smoked Brisket",
    fare: "Meals",
    vendor: "Butcher / Butcher Express",
    vendorHint: "Sections 105, 116, 152, 224, 408, 434"
  },
  {
    name: "Pork Loin",
    fare: "Meals",
    vendor: "Butcher / Butcher Express",
    vendorHint: "Sections 105, 116, 152, 224, 408, 434"
  },
  {
    name: "Half Chicken",
    fare: "Meals",
    vendor: "Butcher / Butcher Express",
    vendorHint: "Sections 105, 116, 152, 224, 408, 434"
  },
  {
    name: "Butcher Sausages",
    fare: "Meals",
    vendor: "Butcher / Butcher Express",
    vendorHint: "Sections 105, 116, 152, 224, 408, 434"
  },
  {
    name: "Ribs",
    fare: "Meals",
    vendor: "Butcher / Butcher Express",
    vendorHint: "Sections 105, 116, 152, 224, 408, 434"
  },
  {
    name: "Brisket Loaded Baked Potato",
    fare: "Meals",
    vendor: "Butcher / Butcher Express",
    vendorHint: "Sections 105, 116, 152, 224, 408, 434"
  },
  {
    name: "Chicken Loaded Baked Potato",
    fare: "Meals",
    vendor: "Butcher / Butcher Express",
    vendorHint: "Sections 105, 116, 152, 224, 408, 434"
  },
  {
    name: "Chopped Brisket Sandwich",
    fare: "Meals",
    vendor: "Butcher / Butcher Express",
    vendorHint: "Sections 105, 116, 152, 224, 408, 434"
  },

  // ── Chick-fil-A ────────────────────────────────────────────────

  {
    name: "Chick-fil-A Chicken Sandwich",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: "Sections 106, 122, 151, 413, 427, 431"
  },
  {
    name: "Chick-fil-A Wrap",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: "Sections 106, 122, 151, 413, 427, 431"
  },

  // ── Cookies & Creamery ─────────────────────────────────────────

  {
    name: "Brownie Sundae",
    description: "Blue Bell ice cream brownie sundae",
    fare: "Desserts",
    vendor: "Cookies & Creamery",
    vendorHint: "Sections 106, 128, 153, 224, 251, 411, 429"
  },
  {
    name: "Blue Bell Ice Cream",
    description: "Served in waffle cone or souvenir helmet",
    fare: "Desserts",
    vendor: "Cookies & Creamery",
    vendorHint: "Sections 106, 128, 153, 224, 251, 411, 429"
  },

  // ── Dippin' Dots ───────────────────────────────────────────────

  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendorHint: "Sections 105, 134, 156, 405, 424"
  },

  // ── Elote & Pupusas ────────────────────────────────────────────

  {
    name: "Elote",
    fare: "Snacks",
    vendor: "Elote & Pupusas",
    vendorHint: "Sections 124, 157, 410"
  },
  {
    name: "Pupusas",
    fare: "Meals",
    vendor: "Elote & Pupusas",
    vendorHint: "Sections 124, 157, 410"
  },
  {
    name: "Empanadas",
    fare: "Meals",
    vendor: "Elote & Pupusas",
    vendorHint: "Sections 124, 157, 410"
  },
  {
    name: "Paletas",
    fare: "Desserts",
    vendor: "Elote & Pupusas",
    vendorHint: "Sections 124, 157, 410"
  },

  // ── Fry-4-3 ────────────────────────────────────────────────────

  {
    name: "Loaded Fries",
    fare: "Meals",
    vendor: "Fry-4-3",
    vendorHint: "Sections 206, 420"
  },
  {
    name: "Funnel Cakes",
    fare: "Desserts",
    vendor: "Fry-4-3",
    vendorHint: "Section 206"
  },

  // ── Kicken Nachos ──────────────────────────────────────────────

  {
    name: "Chicken or Beef Nachos",
    fare: "Meals",
    vendor: "Kicken Nachos",
    vendorHint: "Sections 113, 126, 408, 420"
  },

  // ── OSSO ───────────────────────────────────────────────────────

  {
    name: "Brick-Oven Pizza",
    fare: "Meals",
    vendor: "OSSO",
    vendorHint: "Section 226"
  },
  {
    name: "OSSO Wings",
    fare: "Meals",
    vendor: "OSSO",
    vendorHint: "Section 226"
  },

  // ── Pizza Stands ───────────────────────────────────────────────

  {
    name: "Pizza Slices",
    description: "Fresh cheese or pepperoni",
    fare: "Meals",
    vendorHint: "Sections 116, 153, 411, 429"
  },

  // ── Pluckers Wing Bar ──────────────────────────────────────────

  {
    name: "Pluckers Wings",
    description: "Wings with assorted sauces",
    fare: "Meals",
    vendor: "Pluckers Wing Bar",
    vendorHint: "Section 156"
  },

  // ── Quesadilla Cart ────────────────────────────────────────────

  {
    name: "Cheese Quesadilla",
    fare: "Meals",
    vendor: "Quesadilla Cart",
    vendorHint: "Section 132"
  },
  {
    name: "Chicken Quesadilla",
    fare: "Meals",
    vendor: "Quesadilla Cart",
    vendorHint: "Section 132"
  },
  {
    name: "Fajita Beef Quesadilla",
    fare: "Meals",
    vendor: "Quesadilla Cart",
    vendorHint: "Section 132"
  },

  // ── Loaded Footlong Hot Dog Cart ───────────────────────────────

  {
    name: "Loaded Footlong Hot Dog",
    fare: "Meals",
    vendor: "Loaded Footlong Hot Dog Cart",
    vendorHint: "Section 155"
  },
  {
    name: "Slovacek's Sausages",
    fare: "Meals",
    vendor: "Loaded Footlong Hot Dog Cart",
    vendorHint: "Section 155"
  },

  // ── Taqueria Arandas ───────────────────────────────────────────

  {
    name: "Taqueria Arandas",
    description: "Tex-Mex favorites and desserts",
    fare: "Meals",
    vendorHint: "Sections 154, 420"
  },

  // ── Texas Legend Grill ─────────────────────────────────────────

  {
    name: "Prime Burger",
    fare: "Meals",
    vendor: "Texas Legend Grill",
    vendorHint: "Section 134"
  },

  // ── Chicken Tenders (multiple stands) ──────────────────────────

  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendorHint:
      "Fry-4-3 (206, 420), Texas Legend Grill (134), TLC Tender Love & Chicken (116, 418)"
  },

  // ── Whataburger ────────────────────────────────────────────────

  {
    name: "Whataburger",
    description: "Burgers, fries, and shakes",
    fare: "Meals",
    vendor: "Whataburger",
    vendorHint: "Section 156"
  },

  // ── Healthy Options ────────────────────────────────────────────

  {
    name: "Beyond Burger",
    fare: "Meals",
    vendor: "H-Town Grill",
    vendorHint: "Sections 109, 231, 409",
    dietary: ["Vegetarian"]
  },
  {
    name: "Salads, Wraps & Fruit",
    fare: "Meals",
    vendor: "19th Hole",
    vendorHint: "Section 156 (Center Field)"
  },

  // ── Honda Club Level ───────────────────────────────────────────

  {
    name: "Crawford Sausages",
    fare: "Meals",
    vendor: "Club Grill",
    vendorHint: "Club Level — Sections 213, 231"
  },

  // ── New Food Items For 2026 ────────────────────────────────────

  {
    name: "Onion Blossom",
    description:
      "Super Colossal Onion breaded and deep fried, served with boom boom sauce or ranch",
    fare: "Snacks",
    vendorHint: "Section 106",
    tags: ["New in 2026"]
  },
  {
    name: "H-Town Hot Onion Blossom",
    description:
      "Super Colossal Onion breaded, deep fried, topped with popcorn chicken, hot honey aioli, H-Town hot sauce",
    fare: "Meals",
    vendorHint: "Section 106",
    tags: ["New in 2026"]
  },
  {
    name: "BBQ Pork Burnt End Onion Blossom",
    description:
      "Super Colossal Onion breaded, deep fried, topped with pork burnt ends, queso blanco, pickled red onions, BBQ sauce & BBQ aioli",
    fare: "Meals",
    vendorHint: "Section 106",
    tags: ["New in 2026"]
  },
  {
    name: "Fried Pickle Spears",
    description:
      "Buttermilk marinated pickle spears, signature cereal blend breading, fried golden brown, served with ranch",
    fare: "Snacks",
    vendorHint: "Sections 206, 420",
    tags: ["New in 2026"]
  },
  {
    name: "Maple Brisket Wafflewich",
    description:
      "Shredded brisket, Rico's cheese sauce, pickled red onions between two waffles, drizzled with maple syrup",
    fare: "Meals",
    vendorHint: "Section 109",
    tags: ["New in 2026"]
  },
  {
    name: "Brisket Donut",
    description:
      "Two fried brisket \"donuts\" drizzled with BBQ sauce, served with homemade mac and cheese",
    fare: "Meals",
    vendorHint: "Sections 134, 409",
    tags: ["New in 2026"]
  },
  {
    name: "Bahn Mi Dog",
    description:
      "Footlong hot dog topped with daikon radish slaw, diced bacon, chopped cilantro, sriracha aioli",
    fare: "Meals",
    vendorHint: "Sections 113, 129, 155, 416, 427",
    tags: ["New in 2026"]
  },
  {
    name: "Crawlache",
    description:
      "Puff pastry wrapped Slovacek pepperjack sausage on a stick, served with honey mustard",
    fare: "Meals",
    vendorHint: "Sections 113, 427",
    tags: ["New in 2026"]
  }
];

export async function parseDaikinParkMenu(
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
