/**
 * Canada Life Centre (Winnipeg Jets — NHL) menu parser.
 *
 * Curated from official concession stand menus and Jets venue announcements.
 * Alcohol bars, generic snacks, and beverage-only rows are excluded.
 *
 * Sources:
 *   https://www.canadalifeplace.com/plan-your-night/concessions
 *   https://www.nhl.com/jets/news/venue-updates-and-new-gameday-experiences-for-2024-25
 *   https://www.nhl.com/jets/news/true-north-unveils-13m-in-canada-life-centre-renovations-and-introduces-expanded-food-beverage-offerings
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

const VENUE_SLUG = "canada-life-centre";
const VENUE_NAME = "Canada Life Centre";
const SOURCE_URL = "https://www.canadalifeplace.com/plan-your-night/concessions";

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
    name: "BTRMLK Chicken Tenders",
    description: "Four chicken tenders with plum sauce",
    fare: "Meals",
    vendor: "BTRMLK",
    vendorHint: sectionHint("111", "Stand 3"),
    tags: ["nhl"]
  },
  {
    name: "Canada Life Centre Poutine",
    fare: "Meals",
    vendor: "Canada Life Centre Concessions",
    vendorHint: `${sectionHint("111", "Stand 3")}; ${sectionHint("312", "Stand 7")}`,
    tags: ["nhl", "signature"]
  },
  {
    name: "All Beef Jet Dog",
    description: "All-beef hot dog on a Martin's roll",
    fare: "Meals",
    vendor: "Jet Dogs",
    vendorHint: `${sectionHint("108", "Stand 4")}; ${sectionHint("103", "Stand 6")}; ${sectionHint("308", "Stand 8")}`,
    tags: ["nhl", "signature"]
  },
  {
    name: "Bavarian Sausage",
    description: "Sikorski sausage on a Martin's long roll",
    fare: "Meals",
    vendor: "Jet Dogs",
    vendorHint: sectionHint("108", "Stand 4"),
    tags: ["nhl"]
  },
  {
    name: "Cheddar Jalapeño Sausage",
    description: "Sikorski sausage on a Martin's long roll",
    fare: "Meals",
    vendor: "Jet Dogs",
    vendorHint: sectionHint("108", "Stand 4"),
    tags: ["nhl"]
  },
  {
    name: "Smash Burger",
    description: "Beef patty, American cheddar, diced onion, pickles, and garlic mayo",
    fare: "Meals",
    vendor: "Canada Life Centre Concessions",
    vendorHint: `${sectionHint("103", "Stand 6")}; ${sectionHint("308", "Stand 8")}`,
    tags: ["nhl"]
  },
  {
    name: "Cheese Pizza Slice",
    fare: "Meals",
    vendor: "Pizza Pizza",
    vendorHint: sectionHint("105", "Stand 5"),
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Pepperoni Pizza Slice",
    fare: "Meals",
    vendor: "Pizza Pizza",
    vendorHint: sectionHint("105", "Stand 5"),
    tags: ["nhl"]
  },
  {
    name: "Canadian Pizza Slice",
    fare: "Meals",
    vendor: "Pizza Pizza",
    vendorHint: sectionHint("105", "Stand 5"),
    tags: ["nhl"]
  },
  {
    name: "Meat Lovers Pizza Slice",
    fare: "Meals",
    vendor: "Pizza Pizza",
    vendorHint: sectionHint("105", "Stand 5"),
    tags: ["nhl"]
  },
  {
    name: "Aviators' Grill Totchos",
    description: "Totcho platter from the arena's largest concession stand",
    fare: "Meals",
    vendor: "Aviators' Grill",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Aviators' Grill Poutine",
    fare: "Meals",
    vendor: "Aviators' Grill",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Burrito 204 Burrito",
    fare: "Meals",
    vendor: "Burrito 204",
    vendorHint: "North main concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Burrito 204 Gourmet Nachos",
    fare: "Meals",
    vendor: "Burrito 204",
    vendorHint: "North main concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Burrito 204 Churros",
    fare: "Desserts",
    vendor: "Burrito 204",
    vendorHint: "North main concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Hot or Not Chicken Tenders",
    description: "House-made kettle chips with True North spice blend",
    fare: "Meals",
    vendor: "Hot or Not Chicken",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Hot or Not Chicken Sandwich",
    fare: "Meals",
    vendor: "Hot or Not Chicken",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "The Social Burger",
    description: "YWG Burger signature — classic Manitoba social buffet flavors",
    fare: "Meals",
    vendor: "YWG Burger",
    vendorHint: "Main concourse",
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "Salisbury House Nip Burger",
    description: "Winnipeg-famous Salisbury House Nip at the Jets' home arena",
    fare: "Meals",
    vendor: "YWG Burger",
    vendorHint: "Main concourse",
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "Hand-Carved Smoked Brisket Sandwich",
    description: "Slow-roasted carved brisket from Carvery Sandwiches",
    fare: "Meals",
    vendor: "Carvery Sandwiches",
    vendorHint: "Main concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "Porchetta Cuban Melt",
    fare: "Meals",
    vendor: "Carvery Sandwiches",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Carved Hot Herb Marinated Beef Sandwich",
    fare: "Meals",
    vendor: "Carvery Sandwiches",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Carvery Mac & Cheese",
    fare: "Meals",
    vendor: "Carvery Sandwiches",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Mac Jet Dog",
    description:
      "October feature Jet Dog with cheddar, lettuce, sesame seeds, Thousand Island, and pickle on a buttered bun",
    fare: "Meals",
    vendor: "Jet Dogs",
    vendorHint: "Rotating Jet Dog features",
    tags: ["nhl", "signature"]
  },
  {
    name: "Sweet Spot Banana Bread",
    description: "Executive Chef Richard Duncan's grandmother's recipe",
    fare: "Desserts",
    vendor: "The Sweet Spot",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Sweet Spot Warm Cookies",
    fare: "Desserts",
    vendor: "The Sweet Spot",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
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

export async function parseCanadaLifeCentreMenu(
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
