/**
 * Canadian Tire Centre (Ottawa Senators — NHL) menu parser.
 *
 * Curated from the official CTC concessions finder and arena concessions page.
 * Alcohol bars, grab-and-go markets, generic popcorn/candy, and beverages excluded.
 *
 * Sources:
 *   https://www.canadiantirecentre.com/food-beverage/concessions
 *   https://www.canadiantirecentre.com/food-beverage/arena-concessions
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

const VENUE_SLUG = "canadian-tire-centre";
const VENUE_NAME = "Canadian Tire Centre";
const SOURCE_URL =
  "https://www.canadiantirecentre.com/food-beverage/concessions";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function sectionHint(section: string, note?: string): string {
  return note ? `Section ${section} · ${note}` : `Section ${section}`;
}

const MENU_DATA: RawItem[] = [
  {
    name: "Tourtière Kettle Nachos",
    description: "Quebec tourtière-spiced kettle chips with nacho toppings",
    fare: "Meals",
    vendor: "Capital Eats",
    vendorHint: `${sectionHint("203")}; ${sectionHint("217")}; ${sectionHint("227")}`,
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "The Canadian Cubano",
    fare: "Meals",
    vendor: "ByTown GRILL",
    vendorHint: sectionHint("105"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Gabriel Pizza Slice",
    description: "Official pizza of the Ottawa Senators",
    fare: "Meals",
    vendor: "Gabriel Pizza",
    vendorHint: `${sectionHint("105")}; ${sectionHint("207")}; ${sectionHint("223")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Smoke's Poutinerie Poutine",
    fare: "Meals",
    vendor: "Smoke's Poutinerie",
    vendorHint: sectionHint("220"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Golden Palace Egg Rolls",
    description: "Ottawa's famous egg rolls at the TSN Lounge",
    fare: "Meals",
    vendor: "Golden Palace",
    vendorHint: sectionHint("113", "TSN Lounge"),
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "ByTown Grill Burger",
    fare: "Meals",
    vendor: "ByTown GRILL",
    vendorHint: sectionHint("105"),
    tags: ["nhl"]
  },
  {
    name: "Law & Orders Sandwich",
    fare: "Meals",
    vendor: "Law & Orders",
    vendorHint: sectionHint("214"),
    tags: ["nhl"]
  },
  {
    name: "Meatings Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Meatings",
    vendorHint: sectionHint("226"),
    tags: ["nhl"]
  },
  {
    name: "Tenders Love & Chicken Tenders",
    fare: "Meals",
    vendor: "Tenders Love & Chicken",
    vendorHint: sectionHint("228"),
    tags: ["nhl"]
  },
  {
    name: "Ottawa Street Eats Rotating Special",
    description: "Food-truck concept with seasonal rotational items",
    fare: "Meals",
    vendor: "Ottawa Street Eats",
    vendorHint: sectionHint("212"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Chef's Kitchen Feature Plate",
    description: "Rotating chef-driven feature from Chef's Kitchen",
    fare: "Meals",
    vendor: "Chef's Kitchen",
    vendorHint: sectionHint("219"),
    tags: ["nhl"]
  },
  {
    name: "Corn Rib Nacho",
    fare: "Meals",
    vendor: "Capital Eats",
    vendorHint: `${sectionHint("203")}; ${sectionHint("217")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Cubano Sandwich",
    fare: "Meals",
    vendor: "Capital Eats",
    vendorHint: sectionHint("105"),
    tags: ["nhl"]
  },
  {
    name: "Capital Eats Pulled Pork",
    fare: "Meals",
    vendor: "Capital Eats",
    vendorHint: `${sectionHint("203")}; ${sectionHint("217")}; ${sectionHint("227")}`,
    tags: ["nhl"]
  },
  {
    name: "Sparty's Chocolate Chunk Cookie",
    fare: "Desserts",
    vendor: "Sparty's Faves",
    vendorHint: sectionHint("220"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Six 1 Three Specialty Burger",
    fare: "Meals",
    vendor: "Six 1 Three",
    vendorHint: sectionHint("322"),
    tags: ["nhl"]
  },
  {
    name: "Sens Express Loaded Pretzel Bites",
    description: "Notable loaded pretzel bites — not a plain stadium pretzel",
    fare: "Meals",
    vendor: "Sens Express",
    vendorHint: `${sectionHint("206")}; ${sectionHint("224")}`,
    tags: ["nhl"]
  },
  {
    name: "Tim Horton's Chili Bowl",
    fare: "Meals",
    vendor: "Tim Horton's",
    vendorHint: `${sectionHint("105")}; ${sectionHint("203")}`,
    tags: ["nhl"]
  },
  {
    name: "Sens Bar Chicken Wrap",
    fare: "Meals",
    vendor: "Sens Bar",
    vendorHint: sectionHint("308"),
    tags: ["nhl"]
  },
  {
    name: "Lone Star Cantina Nachos",
    fare: "Meals",
    vendor: "Lone Star CANTINA",
    vendorHint: sectionHint("314"),
    tags: ["nhl"]
  },
  {
    name: "Lone Star Cantina Quesadilla",
    fare: "Meals",
    vendor: "Lone Star CANTINA",
    vendorHint: sectionHint("314"),
    tags: ["nhl"]
  },
  {
    name: "Hard Rock Club Carved Sandwich",
    fare: "Meals",
    vendor: "Hard Rock Club",
    vendorHint: "Club level",
    tags: ["nhl"]
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

export async function parseCanadianTireCentreMenu(
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
