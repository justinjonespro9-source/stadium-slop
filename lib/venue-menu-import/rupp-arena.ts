/**
 * Rupp Arena (Kentucky Wildcats — NCAA Basketball) menu parser.
 *
 * Curated from Central Bank Center / Levy concessions listings.
 * Alcohol, generic popcorn, and beverage-only rows excluded.
 *
 * Sources:
 *   https://www.centralbankcenter.com/rupp-arena/news/index/76
 *   https://ukathletics.com/sports/mens-basketball
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

const VENUE_SLUG = "rupp-arena";
const VENUE_NAME = "Rupp Arena";
const SOURCE_URL = "https://www.centralbankcenter.com/rupp-arena/news/index/76";

const NCAA_BB = ["ncaa", "college-basketball"] as const;

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
    name: "Kentucky Hot Brown",
    description: "Open-faced turkey and bacon sandwich — Kentucky classic",
    fare: "Meals",
    vendor: "Rupp Arena Concessions",
    vendorHint: "Main Concourse",
    tags: [...NCAA_BB, "local-vendor", "signature"]
  },
  {
    name: "BBQ Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "City BBQ",
    vendorHint: sectionHint("27") + "; " + sectionHint("28"),
    tags: [...NCAA_BB, "local-vendor"]
  },
  {
    name: "City BBQ Pulled Chicken Sandwich",
    fare: "Meals",
    vendor: "City BBQ",
    vendorHint: sectionHint("27"),
    tags: [...NCAA_BB, "local-vendor", "signature"]
  },
  {
    name: "City BBQ Loaded Nachos",
    fare: "Meals",
    vendor: "City BBQ",
    vendorHint: sectionHint("28"),
    tags: [...NCAA_BB, "local-vendor"]
  },
  {
    name: "Personal Pizza",
    fare: "Meals",
    vendor: "Hunt Brothers Pizza",
    vendorHint: sectionHint("13") + "; " + sectionHint("30"),
    tags: [...NCAA_BB]
  },
  {
    name: "Hunt Brothers Pizza Slice",
    fare: "Meals",
    vendor: "Hunt Brothers Pizza",
    vendorHint: sectionHint("212"),
    tags: [...NCAA_BB]
  },
  {
    name: "Loaded Fries",
    fare: "Meals",
    vendor: "Rupp Arena Concessions",
    vendorHint: "Main Concourse",
    tags: [...NCAA_BB]
  },
  {
    name: "Skyline 3-Way Chili Spaghetti",
    description: "Cincinnati-style chili over spaghetti",
    fare: "Meals",
    vendor: "Skyline Chili",
    vendorHint: sectionHint("17") + "; " + sectionHint("18"),
    tags: [...NCAA_BB, "local-vendor", "signature"]
  },
  {
    name: "Skyline Cheese Coney",
    fare: "Meals",
    vendor: "Skyline Chili",
    vendorHint: sectionHint("17"),
    tags: [...NCAA_BB, "local-vendor"]
  },
  {
    name: "Skyline Walking Taco",
    fare: "Meals",
    vendor: "Skyline Chili",
    vendorHint: sectionHint("18"),
    tags: [...NCAA_BB, "local-vendor"]
  },
  {
    name: "Chick-fil-A Chicken Sandwich",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: sectionHint("34"),
    tags: [...NCAA_BB]
  },
  {
    name: "Chick-fil-A Spicy Chicken Sandwich",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: sectionHint("34"),
    tags: [...NCAA_BB]
  },
  {
    name: "Taylor Belle's Soft Serve Ice Cream",
    fare: "Desserts",
    vendor: "Taylor Belle's",
    vendorHint: sectionHint("15") + "; " + sectionHint("24"),
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB, "local-vendor", "signature"]
  },
  {
    name: "Hot Dog",
    fare: "Meals",
    vendor: "Rupp Arena Concessions",
    vendorHint: sectionHint("30") + "; " + sectionHint("33"),
    tags: [...NCAA_BB]
  },
  {
    name: "Soft Pretzel",
    fare: "Meals",
    vendor: "Rupp Arena Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB]
  },
  {
    name: "Kroger Korner Chicken Wrap",
    fare: "Meals",
    vendor: "Kroger Korner",
    vendorHint: sectionHint("37") + "; " + sectionHint("38"),
    tags: [...NCAA_BB]
  },
  {
    name: "Kroger Korner Sushi Roll",
    fare: "Meals",
    vendor: "Kroger Korner",
    vendorHint: sectionHint("37"),
    tags: [...NCAA_BB]
  },
  {
    name: "Benedictine Spread Sandwich",
    description: "Kentucky Derby-region cucumber-onion spread on bread",
    fare: "Meals",
    vendor: "Rupp Arena Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB, "local-vendor", "signature"]
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

export async function parseRuppArenaMenu(
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
