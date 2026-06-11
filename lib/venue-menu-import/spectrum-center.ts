/**
 * Spectrum Center (Charlotte Hornets — NBA) menu parser.
 *
 * Curated from Hornets/Levy hospitality announcements and 2025-26 renovation
 * dining coverage. Hugo's Hive value-menu generics, soda, water, and popcorn excluded.
 *
 * Source:
 *   https://www.spectrumcentercharlotte.com/news/detail/hospitality-experience-at-spectrum-center
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

const VENUE_SLUG = "spectrum-center";
const VENUE_NAME = "Spectrum Center";
const SOURCE_URL =
  "https://www.spectrumcentercharlotte.com/news/detail/hospitality-experience-at-spectrum-center";

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
    name: "704 Kitchen",
    description: "Rotating monthly Charlotte neighborhood restaurant pop-up",
    fare: "Meals",
    vendor: "704 Kitchen",
    vendorHint: sectionHint("108"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Piedmont Pit",
    description: "Carolina-style BBQ stand on the Belk Concourse",
    fare: "Meals",
    vendor: "Piedmont Pit",
    vendorHint: sectionHint("114"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Carolina Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Piedmont Pit",
    vendorHint: sectionHint("114"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Double-Smoked Burnt Ends",
    fare: "Meals",
    vendor: "Piedmont Pit",
    vendorHint: sectionHint("114"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Baked Mac and Cheese",
    fare: "Meals",
    vendor: "Piedmont Pit",
    vendorHint: sectionHint("114"),
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor"]
  },
  {
    name: "NoDa Cantina",
    description: "West Coast-meets-East Coast cantina on the Belk Concourse",
    fare: "Meals",
    vendor: "NoDa Cantina",
    vendorHint: sectionHint("110"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Super Loaded Nachos",
    fare: "Meals",
    vendor: "NoDa Cantina",
    vendorHint: sectionHint("110"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Baja Fish Tacos",
    fare: "Meals",
    vendor: "NoDa Cantina",
    vendorHint: sectionHint("110"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Southern Cheesesteak",
    description: "Chef-attended Lunazul North District specialty",
    fare: "Meals",
    vendor: "Lunazul North District",
    vendorHint: "Belk Concourse north gathering space",
    tags: ["nba", "signature"]
  },
  {
    name: "Falafel Bowl",
    fare: "Meals",
    vendor: "Lunazul North District",
    vendorHint: "Belk Concourse north gathering space",
    dietary: ["Vegetarian", "Vegan"],
    tags: ["nba", "signature"]
  },
  {
    name: "Carolina Quesadilla",
    description: "Waffle, hot chicken, and mac-and-cheese mash-up from South District",
    fare: "Meals",
    vendor: "The South District",
    vendorHint: "Belk Concourse south gathering space",
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "House-Smoked BBQ Plate",
    fare: "Meals",
    vendor: "The South District",
    vendorHint: "Belk Concourse south gathering space",
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Lamb Gyro",
    fare: "Meals",
    vendor: "Wrap & Roast",
    vendorHint: sectionHint("103"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Brixx Pizza",
    description: "Local wood-fired personal pizzas",
    fare: "Meals",
    vendor: "Brixx Pizza",
    vendorHint: `${sectionHint("105")}; ${sectionHint("203")}; ${sectionHint("218")}`,
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Personal Wood-Fired Pizza",
    fare: "Meals",
    vendor: "Brixx Pizza",
    vendorHint: sectionHint("105"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Chick-fil-A & Freddy's",
    description: "Upper-concourse Chick-fil-A cart and Freddy's custard",
    fare: "Meals",
    vendor: "Chick-fil-A & Freddy's",
    vendorHint: "Upper concourse",
    tags: ["nba"]
  },
  {
    name: "Chick-fil-A Chicken Sandwich",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: "Upper concourse cart",
    tags: ["nba"]
  },
  {
    name: "Queen City Cravings",
    description: "Amélie's, Knowledge Perk, Bruster's, and Gnam Gnam dessert stand",
    fare: "Desserts",
    vendor: "Queen City Cravings",
    vendorHint: sectionHint("109"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Bruster's Real Ice Cream",
    fare: "Desserts",
    vendor: "Bruster's Ice Cream",
    vendorHint: sectionHint("109"),
    dietary: ["Vegetarian"],
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Fastbreak Markets",
    description: "Frictionless grab-and-go markets",
    fare: "Meals",
    vendor: "Fastbreak Markets",
    vendorHint: `${sectionHint("102")}; ${sectionHint("116")}; ${sectionHint("208")}; ${sectionHint("226")}`,
    tags: ["nba"]
  },
  {
    name: "Hugo's Hive Items",
    description: "Fan value menu — hot dog item retained; beverages excluded from import",
    fare: "Meals",
    vendor: "Hugo's Hive",
    vendorHint: `${sectionHint("108")}; ${sectionHint("116")}; ${sectionHint("208")}; ${sectionHint("225")}`,
    tags: ["nba"]
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

export async function parseSpectrumCenterMenu(
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
