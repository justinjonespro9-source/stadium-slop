/**
 * Nationwide Arena (Columbus Blue Jackets — NHL) menu parser.
 *
 * Curated from the official Blue Jackets arena food guide and Nationwide Arena
 * concessions listings. Alcohol tequila bars, generic snacks, and beverages excluded.
 *
 * Sources:
 *   https://www.nhl.com/bluejackets/arena/nationwide-arena-food
 *   https://www.nationwidearena.com/plan-your-visit/dining
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

const VENUE_SLUG = "nationwide-arena";
const VENUE_NAME = "Nationwide Arena";
const SOURCE_URL = "https://www.nhl.com/bluejackets/arena/nationwide-arena-food";

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
    name: "The CBJ vs. East Coast Nachos",
    description: "Half local queso, half opponent-region toppings on one plate",
    fare: "Meals",
    vendor: "Blue Tortilla",
    vendorHint: sectionHint("121") + "; " + sectionHint("217"),
    tags: ["nhl", "signature"]
  },
  {
    name: "The 61 Stack",
    description: "Lacy-edged smash burger with caramelized onions and bistro sauce",
    fare: "Meals",
    vendor: "The 61 Stack",
    vendorHint: "Concessions & Clubs",
    tags: ["nhl", "signature"]
  },
  {
    name: "Mediterranean Nachos",
    description: "Za'atar pita chips with shawarma chicken, harissa yogurt, and feta",
    fare: "Meals",
    vendor: "The 61 Stack",
    vendorHint: "Concessions & Clubs",
    tags: ["nhl", "signature"]
  },
  {
    name: "The Croissant Dog",
    description: "All-beef hot dog wrapped in croissant dough with everything seasoning",
    fare: "Meals",
    vendor: "Nationwide Arena Concessions",
    vendorHint: "Main Concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "The Sloppy \"No\"",
    description: "Vegan Korean sloppy joe with Asian slaw on a gluten-free bun",
    fare: "Meals",
    vendor: "Nationwide Arena Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegan"],
    tags: ["nhl", "signature"]
  },
  {
    name: "Schmidt's Sausage Haus",
    description: "German Village Bahama Mama sausages and arena-exclusive cream puff",
    fare: "Meals",
    vendor: "Schmidt's Sausage Haus",
    vendorHint: sectionHint("115"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Schmidt's Bahama Mama Sausage",
    description: "Hickory-smoked German Village sausage",
    fare: "Meals",
    vendor: "Schmidt's Sausage Haus",
    vendorHint: sectionHint("115"),
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "CBJ Cream Puff",
    description: "Arena-exclusive giant pastry shell with sweet filling",
    fare: "Desserts",
    vendor: "Schmidt's Sausage Haus",
    vendorHint: sectionHint("115"),
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Jet's CBJ Pizza",
    description: "8-corner deep dish with chicken, bacon, jalapeños, and ranch",
    fare: "Meals",
    vendor: "Jet's Pizza",
    vendorHint: "Multiple Sections",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Skyline Chili",
    description: "Cincinnati 3-way chili spaghetti and cheese coney dogs",
    fare: "Meals",
    vendor: "Skyline Chili",
    vendorHint: "Multiple Sections",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Skyline 3-Way Chili Spaghetti",
    fare: "Meals",
    vendor: "Skyline Chili",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Skyline Cheese Coney Dog",
    fare: "Meals",
    vendor: "Skyline Chili",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Puck Luck Pretzels",
    description: "Flash-fried pretzel bites with queso blanco and pico",
    fare: "Meals",
    vendor: "Fanatics Sportsbook",
    vendorHint: "Sportsbook Lounge",
    tags: ["nhl"]
  },
  {
    name: "Umami Fries",
    description: "Fries with umami-braised beef, yum-yum sauce, sesame, and scallions",
    fare: "Meals",
    vendor: "Premium Clubs",
    vendorHint: "Club Level",
    tags: ["nhl", "signature"]
  },
  {
    name: "Dessert Nachos",
    description: "Cinnamon-sugar chips with fruit, chocolate sauce, and whipped cream",
    fare: "Desserts",
    vendor: "Luxury Suites",
    vendorHint: "Suite Level",
    dietary: ["Vegetarian"],
    tags: ["nhl", "signature"]
  },
  {
    name: "Walking Taco",
    fare: "Meals",
    vendor: "Nationwide Arena Concessions",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "Chicken Bacon Ranch Wrap",
    fare: "Meals",
    vendor: "Nationwide Arena Concessions",
    vendorHint: "Upper Concourse",
    tags: ["nhl"]
  },
  {
    name: "Grilled Chicken Sandwich",
    fare: "Meals",
    vendor: "Nationwide Arena Concessions",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "Pretzel Bites with Beer Cheese",
    fare: "Meals",
    vendor: "Nationwide Arena Concessions",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "Mac & Cheese Cup",
    fare: "Meals",
    vendor: "Nationwide Arena Concessions",
    vendorHint: "Upper Concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Loaded Brisket Fries",
    fare: "Meals",
    vendor: "Nationwide Arena Concessions",
    vendorHint: "Club Level",
    tags: ["nhl"]
  },
  {
    name: "Tim Hortons Timbits",
    description: "Attached Tim Hortons location for donut holes",
    fare: "Desserts",
    vendor: "Tim Hortons",
    vendorHint: "Southwest Corner",
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

export async function parseNationwideArenaMenu(
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
