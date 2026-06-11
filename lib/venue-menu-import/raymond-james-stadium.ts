/**
 * Raymond James Stadium (Tampa Bay Buccaneers — NFL) menu parser.
 *
 * Curated from official Buccaneers concessions coverage and league import data.
 * Alcohol bars, Bucs Beach drink rails, and beverage-only rows excluded.
 *
 * Source: https://www.buccaneers.com/stadium/food-beverage
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

const VENUE_SLUG = "raymond-james-stadium";
const VENUE_NAME = "Raymond James Stadium";
const SOURCE_URL = "https://www.buccaneers.com/stadium/food-beverage";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function sectionHint(section: string): string {
  return `Section ${section}`;
}

const MENU_DATA: RawItem[] = [
  {
    name: "The Tampa Cuban Dog",
    description: "Frank with smoked pork, ham, Swiss, pickles, and mustard",
    fare: "Meals",
    vendor: "Raymond James Stadium Concessions",
    vendorHint: sectionHint("107") + "; " + sectionHint("132"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Tampa Mojo Chicken & Yellow Rice Bowl",
    description: "Citrus-marinated chicken with yellow rice and plantains",
    fare: "Meals",
    vendor: "Raymond James Stadium Concessions",
    vendorHint: sectionHint("115") + "; " + sectionHint("208"),
    tags: ["nfl", "signature"]
  },
  {
    name: "The \"Sweet Stack\"",
    description: "Waffles with strawberries, whipped cream, and chocolate",
    fare: "Desserts",
    vendor: "Raymond James Stadium Concessions",
    vendorHint: sectionHint("129") + "; " + sectionHint("233"),
    dietary: ["Vegetarian"],
    tags: ["nfl", "signature"]
  },
  {
    name: "Hot Pastrami Marble Rye",
    description: "Shaved pastrami with Swiss and spicy brown mustard",
    fare: "Meals",
    vendor: "Desoto Deli",
    vendorHint: sectionHint("107") + "; " + sectionHint("132"),
    tags: ["nfl", "signature"]
  },
  {
    name: "Jalapeño Honey Mustard Wings",
    fare: "Meals",
    vendor: "The Galley",
    vendorHint: "Various Sections",
    tags: ["nfl", "signature"]
  },
  {
    name: "Colony Grill",
    description: "Ultra-thin Hot Oil pizza — local Tampa favorite",
    fare: "Meals",
    vendor: "Colony Grill",
    vendorHint: sectionHint("109") + "; " + sectionHint("310"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Colony Grill Hot Oil Pizza Slice",
    fare: "Meals",
    vendor: "Colony Grill",
    vendorHint: sectionHint("109"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "PDQ",
    description: "Tampa-born hand-breaded chicken tenders",
    fare: "Meals",
    vendor: "PDQ",
    vendorHint: sectionHint("103") + "; " + sectionHint("217"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "PDQ Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "PDQ",
    vendorHint: sectionHint("103"),
    tags: ["nfl", "local-vendor"]
  },
  {
    name: "Aussie Grill",
    description: "Outback founders' sirloin sliders and onion petals",
    fare: "Meals",
    vendor: "Aussie Grill",
    vendorHint: sectionHint("118") + "; " + sectionHint("241"),
    tags: ["nfl", "local-vendor"]
  },
  {
    name: "Center-Cut Sirloin Sliders",
    fare: "Meals",
    vendor: "Aussie Grill",
    vendorHint: sectionHint("118"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Tampa Fried Chicken Co.",
    description: "South Florida hot chicken with citrus-cayenne rub",
    fare: "Meals",
    vendor: "Tampa Fried Chicken Co.",
    vendorHint: sectionHint("317") + "; " + sectionHint("329"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Tampa Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Tampa Fried Chicken Co.",
    vendorHint: sectionHint("317"),
    tags: ["nfl", "local-vendor"]
  },
  {
    name: "The Pressed Cuban",
    description: "Mojo pork on locally-sourced Cuban bread",
    fare: "Meals",
    vendor: "Ybor Press",
    vendorHint: sectionHint("208") + "; " + sectionHint("233"),
    tags: ["nfl", "local-vendor", "signature"]
  },
  {
    name: "Healthy Bowl",
    description: "Vegetarian and vegan quinoa and roasted vegetable bowls",
    fare: "Meals",
    vendor: "Healthy Bowl",
    vendorHint: sectionHint("140"),
    dietary: ["Vegetarian", "Vegan"],
    tags: ["nfl"]
  },
  {
    name: "Quinoa Roasted Vegetable Bowl",
    fare: "Meals",
    vendor: "Healthy Bowl",
    vendorHint: sectionHint("140"),
    dietary: ["Vegetarian", "Vegan"],
    tags: ["nfl"]
  },
  {
    name: "Loaded Stadium Nachos",
    fare: "Meals",
    vendor: "Raymond James Stadium Concessions",
    vendorHint: "Main Concourse",
    tags: ["nfl"]
  },
  {
    name: "Key Lime Pie Cup",
    fare: "Desserts",
    vendor: "Raymond James Stadium Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nfl", "local-vendor", "signature"]
  }
];

function dedupeMenuItems(rawItems: RawItem[]): RawItem[] {
  const byName = new Map<string, RawItem>();
  for (const item of rawItems) {
    const key = normalizeMenuItemName(item.name);
    if (!byName.has(key)) byName.set(key, { ...item });
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

export async function parseRaymondJamesStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;
  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items: dedupeMenuItems(MENU_DATA).map(toSourceItem),
    skippedDrinks: 0
  };
}
