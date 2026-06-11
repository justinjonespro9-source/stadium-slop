/**
 * Rogers Place (Edmonton Oilers — NHL) menu parser.
 *
 * Curated from the official Rogers Place food finder and arena guide.
 * Alcohol bars, grab-and-go markets, generic snacks, and beverages excluded.
 *
 * Sources:
 *   https://www.rogersplace.com/food-finder/locations/
 *   https://www.rogersplace.com/arena-guide/food-and-beverage/
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

const VENUE_SLUG = "rogers-place";
const VENUE_NAME = "Rogers Place";
const SOURCE_URL = "https://www.rogersplace.com/food-finder/locations/";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function sectionHint(section: string, level?: string): string {
  return level ? `${level} · Section ${section}` : `Section ${section}`;
}

const MAIN = "Main Concourse";
const UPPER = "Upper Concourse";

const MENU_DATA: RawItem[] = [
  {
    name: "Loaded Beef Birria Nachos",
    fare: "Meals",
    vendor: "104th Nacho and Carvery Bar",
    vendorHint: sectionHint("112", MAIN),
    tags: ["nhl", "signature"]
  },
  {
    name: "The Hat Trick Grilled Cheese",
    fare: "Meals",
    vendor: "Downtown Grill",
    vendorHint: sectionHint("115", MAIN),
    tags: ["nhl", "signature"]
  },
  {
    name: "The BBQ Double Dog",
    fare: "Meals",
    vendor: "Whyte Ave Bistro",
    vendorHint: sectionHint("132", MAIN),
    tags: ["nhl", "signature"]
  },
  {
    name: "The Jalapeño Popper Brat on a Bun",
    fare: "Meals",
    vendor: "Whyte Ave Bistro",
    vendorHint: sectionHint("132", MAIN),
    tags: ["nhl", "signature"]
  },
  {
    name: "Whyte Ave Perogy Dog",
    description: "Hot dog topped with perogy-inspired fillings",
    fare: "Meals",
    vendor: "Whyte Ave Bistro",
    vendorHint: sectionHint("132", MAIN),
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "The Potato Tottine",
    description: "Tater tot poutine-style dish",
    fare: "Meals",
    vendor: "Market Perogies",
    vendorHint: `${sectionHint("120", MAIN)}; ${sectionHint("204", UPPER)}; ${sectionHint("229", UPPER)}`,
    tags: ["nhl", "signature"]
  },
  {
    name: "Triple O's Burger",
    fare: "Meals",
    vendor: "Triple O's",
    vendorHint: sectionHint("127", MAIN),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Butcher's Cuts Carved Sandwich",
    fare: "Meals",
    vendor: "Butcher's Cuts",
    vendorHint: `${sectionHint("107", MAIN)}; ${sectionHint("120", MAIN)}; ${sectionHint("210", UPPER)}`,
    tags: ["nhl"]
  },
  {
    name: "RP Smashburger",
    fare: "Meals",
    vendor: "Downtown Grill",
    vendorHint: sectionHint("115", MAIN),
    tags: ["nhl"]
  },
  {
    name: "Pizza 73 Pepperoni Pizza",
    fare: "Meals",
    vendor: "Pizza 73",
    vendorHint: `${sectionHint("109", MAIN)}; ${sectionHint("124", MAIN)}; ${sectionHint("208", UPPER)}; ${sectionHint("217", UPPER)}`,
    tags: ["nhl"]
  },
  {
    name: "Pizza 73 Hawaiian Pizza",
    fare: "Meals",
    vendor: "Pizza 73",
    vendorHint: `${sectionHint("109", MAIN)}; ${sectionHint("124", MAIN)}`,
    tags: ["nhl"]
  },
  {
    name: "Market Perogies Smoked Brisket Perogy",
    description: "Signature Edmonton perogy filling",
    fare: "Meals",
    vendor: "Market Perogies",
    vendorHint: `${sectionHint("120", MAIN)}; ${sectionHint("204", UPPER)}; ${sectionHint("229", UPPER)}`,
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "Market Perogies Reuben Taco Perogy",
    fare: "Meals",
    vendor: "Market Perogies",
    vendorHint: `${sectionHint("120", MAIN)}; ${sectionHint("229", UPPER)}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Market Perogies Cheeseburger Perogy",
    fare: "Meals",
    vendor: "Market Perogies",
    vendorHint: `${sectionHint("120", MAIN)}; ${sectionHint("204", UPPER)}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "104th Nacho and Carvery Bar Nachos",
    fare: "Meals",
    vendor: "104th Nacho and Carvery Bar",
    vendorHint: sectionHint("112", MAIN),
    tags: ["nhl"]
  },
  {
    name: "Jasper Ave Eatery Chicken Tenders",
    fare: "Meals",
    vendor: "Jasper Ave Eatery",
    vendorHint: sectionHint("234", UPPER),
    tags: ["nhl"]
  },
  {
    name: "Jasper Ave Eatery Vegan Tacos",
    fare: "Meals",
    vendor: "Jasper Ave Eatery",
    vendorHint: sectionHint("234", UPPER),
    dietary: ["Vegan"],
    tags: ["nhl"]
  },
  {
    name: "Wrapped Roasted Vegetable Wrap",
    fare: "Meals",
    vendor: "Wrapped",
    vendorHint: sectionHint("129", MAIN),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Wrapped Flatbread and Hummus",
    fare: "Meals",
    vendor: "Wrapped",
    vendorHint: sectionHint("129", MAIN),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Mott's Caesar Salad",
    description: "Signature Canadian Caesar from Mott's Caesar House",
    fare: "Meals",
    vendor: "Mott's Caesar House",
    vendorHint: sectionHint("122", MAIN),
    tags: ["nhl", "signature"]
  },
  {
    name: "Whitemud Kitchen Feature Bowl",
    fare: "Meals",
    vendor: "Whitemud Kitchen",
    vendorHint: sectionHint("220", UPPER),
    tags: ["nhl"]
  },
  {
    name: "Ice Cafe Specialty Sandwich",
    fare: "Meals",
    vendor: "Ice Cafe",
    vendorHint: sectionHint("127", MAIN),
    tags: ["nhl"]
  },
  {
    name: "Studio 99 Pre-Game Buffet Plate",
    description: "Elevated sports-bar buffet plate from Studio 99 on the PCL Loge level",
    fare: "Meals",
    vendor: "Studio 99",
    vendorHint: "PCL Loge level",
    tags: ["nhl", "signature"]
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

export async function parseRogersPlaceMenu(
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
