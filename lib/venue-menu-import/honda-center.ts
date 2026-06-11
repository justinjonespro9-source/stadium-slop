/**
 * Honda Center (Anaheim Ducks — NHL) menu parser.
 *
 * Curated from the official Honda Center concessions page with item-level
 * entries for named stands. Grab-and-go markets, generic snacks, beverages,
 * and alcohol bars are excluded.
 *
 * Source: https://www.hondacenter.com/arena-info/concessions/
 * Re-verify each season to pick up menu changes.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "honda-center";
const VENUE_NAME = "Honda Center";
const SOURCE_URL = "https://www.hondacenter.com/arena-info/concessions/";

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
    name: "Deep Dish Cheese Pizza",
    fare: "Meals",
    vendor: "Anaheim Pizza Co.",
    vendorHint: `${sectionHint("203", "Plaza Level")}; ${sectionHint("419", "Terrace Level")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Deep Dish Pepperoni Pizza",
    fare: "Meals",
    vendor: "Anaheim Pizza Co.",
    vendorHint: `${sectionHint("203")}; ${sectionHint("419")}`,
    tags: ["nhl"]
  },
  {
    name: "Deep Dish Supreme Pizza",
    description: "Supreme deep-dish slice from Anaheim Pizza Co.",
    fare: "Meals",
    vendor: "Anaheim Pizza Co.",
    vendorHint: `${sectionHint("203")}; ${sectionHint("419")}`,
    tags: ["nhl", "signature"]
  },
  {
    name: "Assorted Tiramisu",
    fare: "Desserts",
    vendor: "Anaheim Pizza Co.",
    vendorHint: `${sectionHint("203")}; ${sectionHint("419")}`,
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Wild Wings Buffalo Wings",
    description: "Fried chicken wings — Buffalo flavor",
    fare: "Meals",
    vendor: "Wild Wings",
    vendorHint: sectionHint("212"),
    tags: ["nhl"]
  },
  {
    name: "Wild Wings Nashville Boneless Wings",
    fare: "Meals",
    vendor: "Wild Wings",
    vendorHint: sectionHint("212"),
    tags: ["nhl"]
  },
  {
    name: "Wild Wings Honey Mustard Chicken Wrap",
    fare: "Meals",
    vendor: "Wild Wings",
    vendorHint: sectionHint("212"),
    tags: ["nhl"]
  },
  {
    name: "Snapshot Grill Smash Burger",
    fare: "Meals",
    vendor: "Snapshot Grill",
    vendorHint: `${sectionHint("217", "Plaza Level")}; ${sectionHint("441", "Terrace Level")}`,
    tags: ["nhl"]
  },
  {
    name: "The Smokehouse Burger",
    fare: "Meals",
    vendor: "Snapshot Grill",
    vendorHint: sectionHint("217"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Snapshot Grill Hot Chicken Sandwich",
    fare: "Meals",
    vendor: "Snapshot Grill",
    vendorHint: sectionHint("217"),
    tags: ["nhl"]
  },
  {
    name: "Snapshot Grill Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Snapshot Grill",
    vendorHint: sectionHint("441"),
    tags: ["nhl"]
  },
  {
    name: "Chili Cheese Curly Fries",
    fare: "Meals",
    vendor: "Snapshot Grill",
    vendorHint: sectionHint("441"),
    tags: ["nhl"]
  },
  {
    name: "Blue Line Taqueria Loaded Nachos",
    fare: "Meals",
    vendor: "Blue Line Taqueria",
    vendorHint: sectionHint("219"),
    tags: ["nhl"]
  },
  {
    name: "Blue Line Taqueria Soft Tacos",
    fare: "Meals",
    vendor: "Blue Line Taqueria",
    vendorHint: sectionHint("219"),
    tags: ["nhl"]
  },
  {
    name: "Hat Trick Hawaiian BBQ Bowl",
    description: "Hawaiian BBQ rice bowl from Hat Trick Hawaiian BBQ",
    fare: "Meals",
    vendor: "Hat Trick Hawaiian BBQ",
    vendorHint: sectionHint("228"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Pineapple & Vanilla Soft-Serve",
    fare: "Desserts",
    vendor: "Hat Trick Hawaiian BBQ",
    vendorHint: sectionHint("228"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "El Patito Soft Tacos",
    fare: "Meals",
    vendor: "El Patito",
    vendorHint: sectionHint("404"),
    tags: ["nhl"]
  },
  {
    name: "El Patito Masa Quesadilla",
    fare: "Meals",
    vendor: "El Patito",
    vendorHint: sectionHint("404"),
    tags: ["nhl"]
  },
  {
    name: "El Patito Tres Leches Cake",
    fare: "Desserts",
    vendor: "El Patito",
    vendorHint: sectionHint("404"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Feather & Flame Tri Tip Plate",
    description: "Smoked tri-tip plate with sides",
    fare: "Meals",
    vendor: "Feather & Flame",
    vendorHint: sectionHint("426"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Feather & Flame Smoked Turkey Sandwich",
    fare: "Meals",
    vendor: "Feather & Flame",
    vendorHint: sectionHint("426"),
    tags: ["nhl"]
  },
  {
    name: "Feather & Flame Tri Tip Sandwich",
    fare: "Meals",
    vendor: "Feather & Flame",
    vendorHint: sectionHint("426"),
    tags: ["nhl"]
  },
  {
    name: "Feather & Flame Mac & Cheese",
    fare: "Meals",
    vendor: "Feather & Flame",
    vendorHint: sectionHint("426"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Feather & Flame Smoked Corn on the Cob",
    fare: "Meals",
    vendor: "Feather & Flame",
    vendorHint: sectionHint("426"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Sweet Sensations Fully-Loaded Milkshake",
    fare: "Desserts",
    vendor: "Sweet Sensations",
    vendorHint: sectionHint("307", "Club Level"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Sweet Spot Warm Cookies with Soft Serve",
    fare: "Desserts",
    vendor: "Sweet Spot Soft Serve",
    vendorHint: sectionHint("408"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Arena Classics Beyond Burger",
    fare: "Meals",
    vendor: "Arena Classics",
    vendorHint: sectionHint("434"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Arena Classics Peruvian Grilled Chicken Sandwich",
    fare: "Meals",
    vendor: "Arena Classics",
    vendorHint: sectionHint("434"),
    tags: ["nhl"]
  },
  {
    name: "Jack Daniel's Club Carved Entrée",
    description: "Rotating carved item from club chef tables",
    fare: "Meals",
    vendor: "Jack Daniel's Old No. 7 Club",
    vendorHint: `${sectionHint("312")}; ${sectionHint("315")}`,
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

export async function parseHondaCenterMenu(
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
