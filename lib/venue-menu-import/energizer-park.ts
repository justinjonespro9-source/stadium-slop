/**
 * Energizer Park (St. Louis CITY SC — MLS) menu parser.
 *
 * The interactive stadium map at stadium.stlcitysc.com is fully JS-rendered
 * with no extractable content. Items are instead compiled from official CITY
 * Flavor announcements across multiple seasons (2023–2026), which name
 * specific menu items per vendor.
 *
 * Energizer Park runs a 100% local food program (CITY Flavor) curated by
 * James Beard Award–winning chef Gerard Craft. Every vendor is a St. Louis
 * local restaurant. Items are tagged local-specialty accordingly.
 *
 * No section numbers are provided in the source announcements — the
 * interactive map (or the STL CITY SC app) provides stand locations.
 *
 * Sources:
 *   2026: https://www.stlcitysc.com/news/from-biscuit-sammies-to-detroit-style-pizza-st-louis-city-sc-serves-up-four-new-partners-at-energizer-parks-local-food-program
 *   2025: https://www.stlcitysc.com/news/st-louis-city-sc-reveals-new-local-stadium-food-partners-for-2025-season
 *   2024: https://www.stlcitysc.com/news/citypark-elevates-food-experience-for-city-sc-upcoming-season
 *   2023: https://www.stlcitysc.com/news/additional-stl-made-food-partners
 *
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "citypark"; // DB slug is still "citypark" (pre-rename)
const VENUE_NAME = "Energizer Park";
const SOURCE_URL =
  "https://stadium.stlcitysc.com/#/category?category=Food%20%26%20Beverage";

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
  // ── 2026 New Partners ───────────────────────────────────────────

  {
    name: "Tacos",
    description: "Bold, globally inspired Southwestern Tex-Mex fusion tacos",
    fare: "Meals",
    vendor: "Taco Buddha",
    vendorHint: "Taco Buddha — University City / Kirkwood / Botanical Heights",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Biscuit Sandwich",
    description: "Savory and sweet biscuit sandwiches; new for 2026",
    fare: "Meals",
    vendor: "Biscuit Town",
    vendorHint: "Biscuit Town — from the team behind Neon Greens (The Grove)",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Detroit-Style Pizza",
    description:
      "Rectangular deep-dish with caramelized cheese and crispy corners; new for 2026",
    fare: "Meals",
    vendor: "Motor Town Pizza",
    vendorHint: "Motor Town Pizza — from the Revel Kitchen team",
    tags: ["mls", "local-specialty"]
  },

  // ── 2025 Partners ───────────────────────────────────────────────

  {
    name: "Burnt Ends Sandwich",
    description: "From Pappy's Smokehouse; added 2025",
    fare: "Meals",
    vendor: "Pappy's Smokehouse",
    vendorHint: "Pappy's Smokehouse — Midtown",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Buffalo Chicken Dip Hand Pie",
    description: "From Damn Fine Hand Pies; added 2025",
    fare: "Meals",
    vendor: "Damn Fine Hand Pies",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Pork Panini",
    description: "From Bolyard's; added 2025",
    fare: "Meals",
    vendor: "Bolyard's",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Pulled Rotisserie Chicken Sandwich",
    description: "From Chicken Scratch; added 2025",
    fare: "Meals",
    vendor: "Chicken Scratch",
    tags: ["mls", "local-specialty"]
  },

  // ── 2024 Partners ───────────────────────────────────────────────

  {
    name: "O+O Burger",
    description: "Olive + Oak's signature burger",
    fare: "Meals",
    vendor: "Olive + Oak",
    vendorHint: "Olive + Oak — Webster Groves",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Hummus",
    fare: "Snacks",
    vendor: "Olio",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Chicken Shawarma",
    fare: "Meals",
    vendor: "Olio",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Sunday Best",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Kimchi Rice Burrito",
    description: "Burrito with kimchi rice from Seoul Taco",
    fare: "Meals",
    vendor: "Seoul Taco",
    tags: ["mls", "local-specialty"]
  },

  // ── Original 2023 Partners ──────────────────────────────────────

  {
    name: "Hot Dogs",
    fare: "Meals",
    vendor: "Steve's Hot Dogs",
    vendorHint: "Steve's Hot Dogs — South Grand",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Pizza",
    description: "From Dewey's Pizza (in addition to Motor Town's Detroit-style)",
    fare: "Meals",
    vendor: "Dewey's Pizza",
    vendorHint: "Dewey's Pizza — multiple STL locations",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Toasted Ravioli",
    description: "St. Louis classic; referenced in the original CITY Flavor announcement",
    fare: "Snacks",
    vendor: "Anthonino's Taverna",
    vendorHint: "Anthonino's Taverna — The Hill",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Sausages",
    fare: "Meals",
    vendor: "G&W Sausage and Meats",
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Ice Cream",
    fare: "Desserts",
    vendor: "Bold Spoon Creamery",
    vendorHint: "Bold Spoon Creamery; also Ices Plain & Fancy",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
  },
  {
    name: "Donuts",
    fare: "Desserts",
    vendor: "Donut Drive-In",
    vendorHint: "Donut Drive-In — Chippewa",
    dietary: ["Vegetarian"],
    tags: ["mls", "local-specialty"]
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

export async function parseEnergizerParkMenu(
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
