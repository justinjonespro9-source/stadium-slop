/**
 * Rogers Arena (Vancouver Canucks — NHL) menu parser.
 *
 * Curated from the official Canucks food & beverage guide and arena concessions
 * listings. Alcohol lounges, beer taprooms, generic snacks, and beverages excluded.
 *
 * Sources:
 *   https://www.nhl.com/canucks/info/food-and-beverage
 *   https://www.rogersarena.com/
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

const VENUE_SLUG = "rogers-arena";
const VENUE_NAME = "Rogers Arena";
const SOURCE_URL = "https://www.nhl.com/canucks/info/food-and-beverage";

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

const MENU_DATA: RawItem[] = [
  {
    name: "The AAA Prime Rib Sandwich",
    description: "Hot-carved Top Grade AAA Alberta roast beef on a fresh roll",
    fare: "Meals",
    vendor: "Carve",
    vendorHint: sectionHint("110") + "; " + sectionHint("117") + "; " + sectionHint("310"),
    tags: ["nhl", "signature"]
  },
  {
    name: "The Glendon Perogy Dog",
    description: "Premium frank loaded with mini perogies, sauerkraut, and sour cream",
    fare: "Meals",
    vendor: "Steamer's Hot Dogs",
    vendorHint: sectionHint("120") + "; " + sectionHint("330"),
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "The Lumberjack Sandwich",
    description: "House-smoked meats, Canadian cheddar, coleslaw, and BBQ drizzle",
    fare: "Meals",
    vendor: "Carve",
    vendorHint: sectionHint("117"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Gourmet Grilled Cheese",
    description: "Multi-cheese blend pressed on Texas toast",
    fare: "Meals",
    vendor: "Melt",
    vendorHint: sectionHint("121"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Pulled Pork Grilled Cheese",
    description: "Melt stand variation with slow-smoked pulled pork",
    fare: "Meals",
    vendor: "Melt",
    vendorHint: sectionHint("121"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Triple O's",
    description: "White Spot spin-off smash burger with dill pickle and secret sauce",
    fare: "Meals",
    vendor: "Triple O's",
    vendorHint: sectionHint("115") + "; " + sectionHint("307") + "; Club Levels",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Triple O's Bacon Double Cheese Burger",
    fare: "Meals",
    vendor: "Triple O's",
    vendorHint: sectionHint("115"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Panago Pizza",
    description: "Individual personal pizza with thick cheesy crust",
    fare: "Meals",
    vendor: "Panago Pizza",
    vendorHint: sectionHint("118") + "; " + sectionHint("318"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Panago Veggie Mediterranean Pizza",
    fare: "Meals",
    vendor: "Panago Pizza",
    vendorHint: sectionHint("118"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Santé",
    description: "Fresh bowls, salads, and lighter arena fare",
    fare: "Meals",
    vendor: "Santé",
    vendorHint: sectionHint("109") + "; " + sectionHint("122") + "; " + sectionHint("326"),
    tags: ["nhl"]
  },
  {
    name: "Santé Tofu Poke Bowl",
    description: "Tofu poke bowl with vegan glaze",
    fare: "Meals",
    vendor: "Santé",
    vendorHint: sectionHint("122"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Santé Greek Village Salad",
    fare: "Meals",
    vendor: "Santé",
    vendorHint: sectionHint("109"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Butter Chicken Poutine",
    fare: "Meals",
    vendor: "Rogers Arena Concessions",
    vendorHint: "Main Concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "Loaded Carvery Nachos",
    fare: "Meals",
    vendor: "Carve",
    vendorHint: sectionHint("321"),
    tags: ["nhl"]
  },
  {
    name: "Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "Rogers Arena Concessions",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "Fish and Chips Basket",
    fare: "Meals",
    vendor: "Rogers Arena Concessions",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Japadog Classic Dog",
    description: "Vancouver street-food icon with bonito flakes and Japanese toppings",
    fare: "Meals",
    vendor: "Japadog",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Rogers Arena Chicken Wings",
    fare: "Meals",
    vendor: "Rogers Arena Concessions",
    vendorHint: "Upper Concourse",
    tags: ["nhl"]
  },
  {
    name: "Club Level Prime Rib Carving Station",
    description: "Carved prime rib with seasonal sides in club seating areas",
    fare: "Meals",
    vendor: "Carve",
    vendorHint: "Club Levels",
    tags: ["nhl"]
  },
  {
    name: "Mini Donut Bites",
    fare: "Desserts",
    vendor: "Rogers Arena Concessions",
    vendorHint: "Upper Concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Nanaimo Bar",
    description: "Classic BC dessert bar",
    fare: "Desserts",
    vendor: "Rogers Arena Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Beavertails Pastry",
    description: "Canadian fried pastry with sweet toppings",
    fare: "Desserts",
    vendor: "Rogers Arena Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
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

export async function parseRogersArenaMenu(
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
