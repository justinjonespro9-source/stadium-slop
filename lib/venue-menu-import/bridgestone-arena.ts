/**
 * Bridgestone Arena (Nashville Predators — NHL) menu parser.
 *
 * Curated from Predators arena food coverage and Bridgestone Arena concessions
 * listings. Local craft beer hubs and frozen drink bar preserved as matches;
 * alcohol-only expansions excluded.
 *
 * Source:
 *   https://www.bridgestonearena.com/plan-your-visit/dining
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

const VENUE_SLUG = "bridgestone-arena";
const VENUE_NAME = "Bridgestone Arena";
const SOURCE_URL = "https://www.bridgestonearena.com/plan-your-visit/dining";

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
    name: "The Broadway Glazed Honey Stack",
    description: "Burger with cheddar, bacon, and sweet BBQ sauce on glazed doughnuts",
    fare: "Meals",
    vendor: "Food Court Burgers",
    vendorHint: "Stand S102",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "The Puck & Stick Grinder",
    description: "Smoked turkey and ham sub with pepper jack and buttermilk ranch",
    fare: "Meals",
    vendor: "Gnash Grilled Cheese & Grinders",
    vendorHint: "Stand F122",
    tags: ["nhl", "signature"]
  },
  {
    name: "Gnash Grilled Cheese",
    fare: "Meals",
    vendor: "Gnash Grilled Cheese & Grinders",
    vendorHint: "Stand F122",
    tags: ["nhl", "signature"]
  },
  {
    name: "Cheeseburger Fries",
    description: "Fries smothered in seasoned beef, cheese sauce, and Preds Sauce",
    fare: "Meals",
    vendor: "Smashville State Fair Stands",
    vendorHint: "Main concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "Puckett\u2019s BBQ",
    description: "Downtown Nashville BBQ on the main concourse",
    fare: "Meals",
    vendor: "Puckett\u2019s BBQ",
    vendorHint: `${sectionHint("101")}; ${sectionHint("112")}; ${sectionHint("323")}`,
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Puckett's BBQ Pork Nachos",
    fare: "Meals",
    vendor: "Puckett\u2019s BBQ",
    vendorHint: sectionHint("101"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Puckett's Smoked BBQ Burrito",
    fare: "Meals",
    vendor: "Puckett\u2019s BBQ",
    vendorHint: sectionHint("112"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Banjo\u2019s Pickin\u2019 Chicken",
    description: "Nashville hot chicken destination near section 109",
    fare: "Meals",
    vendor: "Banjo\u2019s Pickin\u2019 Chicken",
    vendorHint: sectionHint("109"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Nashville Hot Chicken Mac & Cheese",
    fare: "Meals",
    vendor: "Banjo\u2019s Pickin\u2019 Chicken",
    vendorHint: sectionHint("109"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Korean Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Banjo\u2019s Pickin\u2019 Chicken",
    vendorHint: sectionHint("109"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Hunt Brothers Pizza",
    description: "Personal pepperoni and cheese pies",
    fare: "Meals",
    vendor: "Hunt Brothers Pizza",
    vendorHint: `${sectionHint("116")}; ${sectionHint("310")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Hunt Brothers Pepperoni Personal Pizza",
    fare: "Meals",
    vendor: "Hunt Brothers Pizza",
    vendorHint: sectionHint("116"),
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Christie Cookie Co.",
    description: "Warm Nashville-baked cookies",
    fare: "Desserts",
    vendor: "Christie Cookie Co.",
    vendorHint: sectionHint("118"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Christie Cookie Chocolate Chip Cookie",
    fare: "Desserts",
    vendor: "Christie Cookie Co.",
    vendorHint: sectionHint("118"),
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Local Craft Hubs",
    description: "Local brewery tap stands — preserved as existing venue row",
    fare: "Meals",
    vendor: "Local Craft Hubs",
    vendorHint: `${sectionHint("114")}; ${sectionHint("118")}`,
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "The Upper Concourse Frozen Drink Bar",
    description: "Frozen cocktail bar — preserved as existing venue row",
    fare: "Meals",
    vendor: "The Upper Concourse Frozen Drink Bar",
    vendorHint: sectionHint("313"),
    tags: ["nhl"]
  },
  {
    name: "Hot Dog",
    fare: "Meals",
    vendor: "Bridgestone Arena Concessions",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Soft Pretzel",
    fare: "Meals",
    vendor: "Bridgestone Arena Concessions",
    vendorHint: "Upper concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "Bridgestone Arena Concessions",
    vendorHint: "Main concourse",
    tags: ["nhl"]
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

export async function parseBridgestoneArenaMenu(
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
