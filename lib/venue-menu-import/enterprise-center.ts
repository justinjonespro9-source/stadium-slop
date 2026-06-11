/**
 * Enterprise Center (St. Louis Blues — NHL) menu parser.
 *
 * Curated from the official Blues arena dining guide and Delaware North
 * concessions announcements. Alcohol slushie bars, generic snacks, and
 * beverages excluded.
 *
 * Sources:
 *   https://www.nhl.com/blues/arena/dining
 *   https://www.enterprise-center.com/plan-your-visit/dining
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

const VENUE_SLUG = "enterprise-center";
const VENUE_NAME = "Enterprise Center";
const SOURCE_URL = "https://www.nhl.com/blues/arena/dining";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function portalHint(portal: string): string {
  return `Portal ${portal}`;
}

const MENU_DATA: RawItem[] = [
  {
    name: "The Gastropub Steak Sandwich",
    description: "Sliced steak with fried onions, arugula, and horseradish aioli",
    fare: "Meals",
    vendor: "STL Kitchen Gastropub",
    vendorHint: portalHint("15"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Sugarfire Smoke House & Hi-Pointe Drive-In",
    description: "Local BBQ burnt ends and lace-edged smash burgers",
    fare: "Meals",
    vendor: "Sugarfire & Hi-Pointe",
    vendorHint: portalHint("3") + "; " + portalHint("11") + "; " + portalHint("45"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Sugarfire BBQ Burnt End Nachos",
    fare: "Meals",
    vendor: "Sugarfire Smoke House",
    vendorHint: portalHint("11"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Hi-Pointe Smash Burger",
    fare: "Meals",
    vendor: "Hi-Pointe Drive-In",
    vendorHint: portalHint("45"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "FarmTruk",
    description: "Brisket mac & cheese, Reubens, and gooey butter cake",
    fare: "Meals",
    vendor: "FarmTruk",
    vendorHint: portalHint("36") + " · Mezzanine Level",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "FarmTruk Famous Brisket Mac & Cheese",
    fare: "Meals",
    vendor: "FarmTruk",
    vendorHint: portalHint("36"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "FarmTruk Scratch-Made Reuben",
    fare: "Meals",
    vendor: "FarmTruk",
    vendorHint: portalHint("36"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "St. Louis Gooey Butter Cake",
    fare: "Desserts",
    vendor: "FarmTruk",
    vendorHint: portalHint("36"),
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Byrd & Barrel",
    description: "Pressure-fried buttermilk chicken tenders and sandwiches",
    fare: "Meals",
    vendor: "Byrd & Barrel",
    vendorHint: portalHint("117"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Byrd & Barrel Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Byrd & Barrel",
    vendorHint: portalHint("117"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Kohn's Kosher Deli",
    description: "Home of The Gloria pastrami-and-ribeye sandwich",
    fare: "Meals",
    vendor: "Kohn's Kosher Deli",
    vendorHint: portalHint("11"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "The Gloria Sandwich",
    description: "Shaved ribeye, pastrami, caramelized onions, and cranberry-horseradish sauce",
    fare: "Meals",
    vendor: "Kohn's Kosher Deli",
    vendorHint: portalHint("11"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Lion's Choice",
    description: "Ultra-thin shaved roast beef on a salted bun",
    fare: "Meals",
    vendor: "Lion's Choice",
    vendorHint: portalHint("4") + "; " + portalHint("327"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Lion's Choice Roast Beef Sandwich",
    fare: "Meals",
    vendor: "Lion's Choice",
    vendorHint: portalHint("4"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "The Revamped Wok",
    description: "Philly cheesesteak egg rolls, General Tso's chicken, and crab rangoon",
    fare: "Meals",
    vendor: "The Wok Stand",
    vendorHint: portalHint("11"),
    tags: ["nhl"]
  },
  {
    name: "Philly Cheesesteak Egg Rolls",
    fare: "Meals",
    vendor: "The Wok Stand",
    vendorHint: portalHint("11"),
    tags: ["nhl"]
  },
  {
    name: "General Tso's Chicken",
    fare: "Meals",
    vendor: "The Wok Stand",
    vendorHint: portalHint("11"),
    tags: ["nhl"]
  },
  {
    name: "Crispy Crab Rangoon",
    fare: "Meals",
    vendor: "The Wok Stand",
    vendorHint: portalHint("11"),
    tags: ["nhl"]
  },
  {
    name: "Gourmet Cookie Drop",
    description: "Rotation of fresh-baked Crumbl cookies",
    fare: "Desserts",
    vendor: "Crumbl Cookies",
    vendorHint: portalHint("52"),
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "STL Kitchen Poutine",
    fare: "Meals",
    vendor: "STL Kitchen Gastropub",
    vendorHint: portalHint("15"),
    tags: ["nhl"]
  },
  {
    name: "Sugarfire Brisket Sandwich",
    fare: "Meals",
    vendor: "Sugarfire Smoke House",
    vendorHint: portalHint("315"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Ice's Plain & Fancy Flash-Frozen Ice Cream",
    description: "Liquid-nitrogen ice cream made to order",
    fare: "Desserts",
    vendor: "Ice's Plain & Fancy",
    vendorHint: portalHint("20"),
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor", "signature"]
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

export async function parseEnterpriseCenterMenu(
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
