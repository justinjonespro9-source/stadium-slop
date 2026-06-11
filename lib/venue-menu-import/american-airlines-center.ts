/**
 * American Airlines Center (Dallas Mavericks / Stars — NBA/NHL) menu parser.
 *
 * Curated from the official AAC concessions page with item-level entries.
 * Alcohol bars, slurpees, bottomless popcorn, snack assortments, and
 * marketplace grab-and-go rows are excluded.
 *
 * Source: https://www.americanairlinescenter.com/food-beverage/concessions
 * Re-verify each season to pick up menu changes.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "american-airlines-center";
const VENUE_NAME = "American Airlines Center";
const SOURCE_URL =
  "https://www.americanairlinescenter.com/food-beverage/concessions";

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

const PLAZA = "Plaza Concourse";
const TERRACE = "Terrace Concourse";

const MENU_DATA: RawItem[] = [
  {
    name: "Zavala's Chopped Brisket Sandwich",
    fare: "Meals",
    vendor: "Zavala's Barbeque",
    vendorHint: sectionHint("121", PLAZA),
    tags: ["nba", "nhl", "local-vendor", "signature"]
  },
  {
    name: "Zavala's Sloppy Juan Tacos",
    fare: "Meals",
    vendor: "Zavala's Barbeque",
    vendorHint: sectionHint("121", PLAZA),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Zavala's Smoked Brisket Dog",
    fare: "Meals",
    vendor: "Zavala's Barbeque",
    vendorHint: sectionHint("121", PLAZA),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "El Taco Tex Carne Asada Street Tacos",
    fare: "Meals",
    vendor: "El Taco Tex",
    vendorHint: `${sectionHint("105", PLAZA)}; ${sectionHint("117", PLAZA)}`,
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "El Taco Tex Loaded Nachos",
    fare: "Meals",
    vendor: "El Taco Tex",
    vendorHint: `${sectionHint("105", PLAZA)}; ${sectionHint("117", PLAZA)}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "El Taco Tex Elote Cup",
    fare: "Meals",
    vendor: "El Taco Tex",
    vendorHint: sectionHint("117", PLAZA),
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl"]
  },
  {
    name: "El Taco Tex Churros",
    fare: "Desserts",
    vendor: "El Taco Tex",
    vendorHint: `${sectionHint("105", PLAZA)}; ${sectionHint("117", PLAZA)}`,
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl"]
  },
  {
    name: "Cheetos Flamin' Hot Elote Dog",
    fare: "Meals",
    vendor: "Tostitos Cantina",
    vendorHint: sectionHint("104", PLAZA),
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Tostitos Salsa Verde Street Corn Nachos",
    fare: "Meals",
    vendor: "Tostitos Cantina",
    vendorHint: sectionHint("104", PLAZA),
    tags: ["nba", "nhl"]
  },
  {
    name: "S'mores Nachos",
    fare: "Desserts",
    vendor: "High Steaks",
    vendorHint: `${sectionHint("108", PLAZA)}; ${sectionHint("120", PLAZA)}`,
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl", "signature"]
  },
  {
    name: "Texas Cheese Steak Sandwich Basket",
    fare: "Meals",
    vendor: "High Steaks",
    vendorHint: `${sectionHint("108", PLAZA)}; ${sectionHint("120", PLAZA)}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "Waffle Fry Nachos",
    fare: "Meals",
    vendor: "High Steaks",
    vendorHint: `${sectionHint("108", PLAZA)}; ${sectionHint("120", PLAZA)}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "Bonanno Brothers Cheese Pizza",
    fare: "Meals",
    vendor: "Bonanno Brothers Pizzeria",
    vendorHint: `${sectionHint("102", PLAZA)}; ${sectionHint("107", PLAZA)}; ${sectionHint("312", TERRACE)}`,
    dietary: ["Vegetarian"],
    tags: ["nba", "nhl"]
  },
  {
    name: "Bonanno Brothers Pepperoni Pizza",
    fare: "Meals",
    vendor: "Bonanno Brothers Pizzeria",
    vendorHint: `${sectionHint("102", PLAZA)}; ${sectionHint("111", PLAZA)}; ${sectionHint("329", TERRACE)}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "Bud and Burger Signature Smashburger Basket",
    fare: "Meals",
    vendor: "Bud and Burger",
    vendorHint: `${sectionHint("114", PLAZA)}; ${sectionHint("124", PLAZA)}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "Bud and Burger Thick Cut Bacon Smashburger Basket",
    fare: "Meals",
    vendor: "Bud and Burger",
    vendorHint: `${sectionHint("114", PLAZA)}; ${sectionHint("124", PLAZA)}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "Grill Zone Signature Smashburger Basket",
    fare: "Meals",
    vendor: "Grill Zone",
    vendorHint: `${sectionHint("106", PLAZA)}; ${sectionHint("326", TERRACE)}`,
    tags: ["nba", "nhl"]
  },
  {
    name: "DBQ Chopped Smoked Brisket Sandwich",
    fare: "Meals",
    vendor: "DBQ",
    vendorHint: sectionHint("334", TERRACE),
    tags: ["nba", "nhl"]
  },
  {
    name: "DBQ Loaded BBQ Nachos",
    fare: "Meals",
    vendor: "DBQ",
    vendorHint: sectionHint("334", TERRACE),
    tags: ["nba", "nhl"]
  },
  {
    name: "DBQ BBQ Brisket Mac and Cheese",
    fare: "Meals",
    vendor: "DBQ",
    vendorHint: sectionHint("334", TERRACE),
    tags: ["nba", "nhl"]
  },
  {
    name: "Big D Dogs Sonoran Dog",
    fare: "Meals",
    vendor: "Big D Dogs + Brews",
    vendorHint: sectionHint("318", TERRACE),
    tags: ["nba", "nhl", "local-vendor"]
  },
  {
    name: "Market to Go Vegan Power Bowl",
    fare: "Meals",
    vendor: "Market to Go",
    vendorHint: `${sectionHint("104", PLAZA)}; ${sectionHint("319", TERRACE)}`,
    dietary: ["Vegan"],
    tags: ["nba", "nhl"]
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

export async function parseAmericanAirlinesCenterMenu(
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
