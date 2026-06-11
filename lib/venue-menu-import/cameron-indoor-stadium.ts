/**
 * Cameron Indoor Stadium (Duke Blue Devils — NCAA Basketball) menu parser.
 *
 * Curated from Duke A-Z game day guides and Proof of the Pudding concessions
 * coverage. Alcohol upper-concourse bars, peanuts, popcorn, candy, and soda excluded.
 *
 * Sources:
 *   https://goduke.com/sports/2012/1/5/mbb-az-guide
 *   https://goduke.com/sports/mens-basketball
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

const VENUE_SLUG = "cameron-indoor-stadium";
const VENUE_NAME = "Cameron Indoor Stadium";
const SOURCE_URL = "https://goduke.com/sports/2012/1/5/mbb-az-guide";

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
    name: "BBQ Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: "North Lobby · Section 18",
    tags: [...NCAA_BB, "signature"]
  },
  {
    name: "Hog Heaven BBQ Sandwich",
    description: "Carolina-style BBQ sandwich at Hog Heaven stands",
    fare: "Meals",
    vendor: "Hog Heaven",
    vendorHint: "Hall of Honor",
    tags: [...NCAA_BB, "local-vendor", "signature"]
  },
  {
    name: "Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: "Upper concourse",
    tags: [...NCAA_BB]
  },
  {
    name: "Bojangles Chicken Sandwich",
    fare: "Meals",
    vendor: "Bojangles",
    vendorHint: "Hall of Honor · Sections 13–16",
    tags: [...NCAA_BB, "local-vendor", "signature"]
  },
  {
    name: "Bojangles Chicken Tenders",
    fare: "Meals",
    vendor: "Bojangles",
    vendorHint: "Hall of Honor",
    tags: [...NCAA_BB, "local-vendor"]
  },
  {
    name: "Fully Loaded Double Stack Cheeseburger",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: "Upper concourse",
    tags: [...NCAA_BB, "signature"]
  },
  {
    name: "All Beef Grilled Hot Dog",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: "Upper concourse food windows",
    tags: [...NCAA_BB]
  },
  {
    name: "Pepperoni Pizza",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: "Upper concourse",
    tags: [...NCAA_BB]
  },
  {
    name: "Cheese Pizza",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: "Upper concourse",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB]
  },
  {
    name: "Loaded Nachos",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: "Upper concourse",
    tags: [...NCAA_BB]
  },
  {
    name: "Pimiento Cheese Sandwich",
    description: "Southern stadium classic in the Hall of Honor",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: "Hall of Honor",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB, "local-vendor", "signature"]
  },
  {
    name: "Soft Pretzel",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: "Upper concourse",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB]
  },
  {
    name: "Philly Cheesesteak",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: sectionHint("2") + "; " + sectionHint("7"),
    tags: [...NCAA_BB]
  },
  {
    name: "Grilled Chicken Sandwich",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: sectionHint("10") + "; " + sectionHint("15"),
    tags: [...NCAA_BB]
  },
  {
    name: "Chocolate Chip Cookie",
    fare: "Desserts",
    vendor: "Duke Bakery",
    vendorHint: "Concourse stands",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB, "local-vendor"]
  },
  {
    name: "Brownie",
    fare: "Desserts",
    vendor: "Duke Bakery",
    vendorHint: "Concourse stands",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB]
  },
  {
    name: "Chicken Caesar Wrap",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: sectionHint("3") + "; " + sectionHint("11"),
    tags: [...NCAA_BB]
  },
  {
    name: "Veggie Burger",
    fare: "Meals",
    vendor: "Proof of the Pudding",
    vendorHint: "Upper concourse",
    dietary: ["Vegetarian"],
    tags: [...NCAA_BB]
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

export async function parseCameronIndoorStadiumMenu(
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
