/**
 * PPG Paints Arena (Pittsburgh Penguins — NHL) menu parser.
 *
 * Curated from official Penguins arena announcements and Aramark concepts.
 * Generic popcorn and beverage-only rows excluded.
 *
 * Sources:
 *   https://www.nhl.com/penguins/news/what-s-new-at-ppg-paints-arena
 *   https://www.ppgpaintsarena.com/ppg-paints-arena/faqs
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

const VENUE_SLUG = "ppg-paints-arena";
const VENUE_NAME = "PPG Paints Arena";
const SOURCE_URL = "https://www.nhl.com/penguins/news/what-s-new-at-ppg-paints-arena";

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
    name: "The Lord Stanley Hoagie",
    fare: "Meals",
    vendor: "Fifth Ave Food Hall",
    vendorHint: sectionHint("116"),
    tags: ["nhl", "signature"]
  },
  {
    name: "The Smoked Like a Bad Cigar Pastrami Hoagie",
    fare: "Meals",
    vendor: "Fifth Ave Food Hall",
    vendorHint: sectionHint("116"),
    tags: ["nhl", "signature"]
  },
  {
    name: "The Slap Me Silly Braised Beef Nachos",
    fare: "Meals",
    vendor: "PPG Paints Arena Concessions",
    vendorHint: "Main concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "The Sausalito Seal Sandwich",
    fare: "Meals",
    vendor: "Ital Yinz",
    vendorHint: sectionHint("116"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Ital Yinz Pickled Pierogies",
    fare: "Meals",
    vendor: "Ital Yinz",
    vendorHint: sectionHint("116"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Dippy's Combo Platter",
    description: "Cheesesteak eggrolls, raspberry cheesecake rolls, and sauces",
    fare: "Meals",
    vendor: "Dippy's",
    vendorHint: sectionHint("105"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Cherry Coke BBQ Loaded Smash Burger",
    fare: "Meals",
    vendor: "Steel City Smash",
    vendorHint: `${sectionHint("108")}; ${sectionHint("206")}`,
    tags: ["nhl", "signature"]
  },
  {
    name: "Lobster Nachos",
    fare: "Meals",
    vendor: "Dahtahn Lobster",
    vendorHint: sectionHint("110"),
    tags: ["nhl", "signature"]
  },
  {
    name: "Smoked Golden BBQ Chicken Mac 'n Cheese",
    fare: "Meals",
    vendor: "Smokehouse",
    vendorHint: sectionHint("109"),
    tags: ["nhl"]
  },
  {
    name: "The Shaved Kielbasa Sandwich",
    fare: "Meals",
    vendor: "PPG Paints Arena Concessions",
    vendorHint: "Main concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Jake's Shake",
    description: "Chocolate shake with hot fudge, cookies, and brownies",
    fare: "Desserts",
    vendor: "Milkshake Factory",
    vendorHint: sectionHint("107"),
    dietary: ["Vegetarian"],
    tags: ["nhl", "signature"]
  },
  {
    name: "Fuku Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Fuku by Chef David Chang",
    vendorHint: "Hall of Favs · Section 205",
    tags: ["nhl", "signature"]
  },
  {
    name: "Steel City Smash Loaded Waffle Fries",
    fare: "Meals",
    vendor: "Steel City Smash",
    vendorHint: `${sectionHint("108")}; ${sectionHint("206")}`,
    tags: ["nhl"]
  },
  {
    name: "Dahtahn Lobster Roll",
    description: "Butter-braised lobster roll with housemade chips",
    fare: "Meals",
    vendor: "Dahtahn Lobster",
    vendorHint: sectionHint("110"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Hall of Favs Primanti Bros. Sandwich",
    fare: "Meals",
    vendor: "Hall of Favs",
    vendorHint: sectionHint("205"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Hall of Favs Chickie's & Pete's Crab Fries",
    fare: "Meals",
    vendor: "Hall of Favs",
    vendorHint: sectionHint("205"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Fox's Pizza Pepperoni Slice",
    fare: "Meals",
    vendor: "Fox's Pizza",
    vendorHint: "Multiple concourse locations",
    tags: ["nhl"]
  },
  {
    name: "Mic Drop Smash Burger",
    description: "Mike Lang call-inspired smash burger concept",
    fare: "Meals",
    vendor: "Steel City Smash",
    vendorHint: sectionHint("206"),
    tags: ["nhl"]
  },
  {
    name: "New Showcase Rotating Feature",
    description: "Rotating chef feature from New Showcase stand",
    fare: "Meals",
    vendor: "New Showcase",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Snacks N'at Loaded Pierogy Bowl",
    fare: "Meals",
    vendor: "Snacks N'at",
    vendorHint: "Main concourse",
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

export async function parsePpgPaintsArenaMenu(
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
