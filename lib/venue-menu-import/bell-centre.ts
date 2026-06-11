/**
 * Bell Centre (Montreal Canadiens — NHL) menu parser.
 *
 * Curated from the official Bell Centre dining guide and Canadiens concessions
 * listings. Alcohol lounges, speakeasies, generic snacks, and beverages excluded.
 *
 * Sources:
 *   https://www.centrebell.ca/en/plan-your-visit/dining
 *   https://www.nhl.com/canadiens/arena/bell-centre-food
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

const VENUE_SLUG = "bell-centre";
const VENUE_NAME = "Bell Centre";
const SOURCE_URL = "https://www.centrebell.ca/en/plan-your-visit/dining";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

const MENU_DATA: RawItem[] = [
  {
    name: "The Mega Poutine",
    description: "Shareable tray of fries, cheese curds, and gravy",
    fare: "Meals",
    vendor: "Chquick Chquick",
    vendorHint: "Main Concourse",
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "Hand-Carved Smoked Meat",
    description: "Montreal-style spiced brisket on rye with mustard and pickle",
    fare: "Meals",
    vendor: "Habs Déli",
    vendorHint: "Main Concourse",
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "Smoked Meat Poutine",
    fare: "Meals",
    vendor: "Habs Déli",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "HABSburger & HABSdog",
    description: "Smash burgers and premium hot dogs with custom relishes",
    fare: "Meals",
    vendor: "Habs Déli",
    vendorHint: "Main Concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "HABS Classic Smash Burger",
    fare: "Meals",
    vendor: "Habs Déli",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "The \"Steamie\"",
    description: "Montreal-style steamed hot dog with mustard and onions",
    fare: "Meals",
    vendor: "Bell Centre Hot Dogs",
    vendorHint: "Main Concourse",
    tags: ["nhl", "signature", "local-vendor"]
  },
  {
    name: "La Classique Pizza",
    description: "Individual thin-crust artisan pizza",
    fare: "Meals",
    vendor: "Pizza Pizza Trattoria",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Pizza Pizza Pepperoni Slice",
    fare: "Meals",
    vendor: "Pizza Pizza Trattoria",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "Mito & CHOPA",
    description: "Sushi rolls, poke bowls, and Mediterranean pita bowls",
    fare: "Meals",
    vendor: "Mito & CHOPA",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Mito Salmon Poke Bowl",
    fare: "Meals",
    vendor: "Mito",
    vendorHint: "Main Concourse",
    tags: ["nhl"]
  },
  {
    name: "CHOPA Mediterranean Pita Bowl",
    fare: "Meals",
    vendor: "CHOPA",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Chquick Classic Poutine",
    fare: "Meals",
    vendor: "Chquick Chquick",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Montreal Smoked Meat Sandwich Combo",
    fare: "Meals",
    vendor: "Habs Déli",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Chicken Shawarma Wrap",
    fare: "Meals",
    vendor: "Bell Centre Concessions",
    vendorHint: "Upper Concourse",
    tags: ["nhl"]
  },
  {
    name: "Grilled Chicken Caesar Salad",
    fare: "Meals",
    vendor: "Bell Centre Concessions",
    vendorHint: "Club Level",
    tags: ["nhl"]
  },
  {
    name: "Quebec Cheese Curds Snack Box",
    description: "Fresh cheese curds — not poutine format",
    fare: "Meals",
    vendor: "Chquick Chquick",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Montreal Bagel Sandwich",
    description: "Smoked salmon or cream cheese on Montreal-style bagel",
    fare: "Meals",
    vendor: "Habs Déli",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Poutine Burger",
    fare: "Meals",
    vendor: "Habs Déli",
    vendorHint: "Main Concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "Veggie Burger",
    fare: "Meals",
    vendor: "Habs Déli",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Tourtière Meat Pie Slice",
    description: "Quebec-style savory pie",
    fare: "Meals",
    vendor: "Bell Centre Concessions",
    vendorHint: "Main Concourse",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Maple Sugar Pie",
    fare: "Desserts",
    vendor: "Bell Centre Concessions",
    vendorHint: "Main Concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Beavertails Pastry",
    fare: "Desserts",
    vendor: "Bell Centre Concessions",
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

export async function parseBellCentreMenu(
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
