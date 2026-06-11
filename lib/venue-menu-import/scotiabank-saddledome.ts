/**
 * Scotiabank Saddledome (Calgary Flames — NHL) menu parser.
 *
 * Curated from the official Saddledome concourse vendor listing with
 * item-level entries where menus are published or vendor concepts are
 * well documented. Alcohol bars, generic popcorn/peanuts, and grab-and-go
 * markets are excluded.
 *
 * Source: https://www.scotiabanksaddledome.com/concourse/
 * Re-verify each season to pick up menu changes.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "scotiabank-saddledome";
const VENUE_NAME = "Scotiabank Saddledome";
const SOURCE_URL = "https://www.scotiabanksaddledome.com/concourse/";

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
    name: "Shorty's Short Rib Sandwich",
    description: "Slow-braised short rib on a bun from Shorty's",
    fare: "Meals",
    vendor: "Shorty's",
    vendorHint: "Main concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "The Angry Chicken Sandwich",
    description: "Nashville-style hot chicken sandwich",
    fare: "Meals",
    vendor: "The Angry Chicken",
    vendorHint: "Main concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Madam Tiger Bao Bun",
    description: "Asian-inspired bao from Madam Tiger",
    fare: "Meals",
    vendor: "Madam Tiger",
    vendorHint: "Main concourse",
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Foothills Creamery Ice Cream",
    description: "Local Calgary ice cream cups and cones",
    fare: "Desserts",
    vendor: "Foothills Creamery",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl", "local-vendor"]
  },
  {
    name: "Banded Peak Craft Nachos",
    description: "Loaded nachos from the Banded Peak craft nacho stand",
    fare: "Meals",
    vendor: "Banded Peak Craft Nacho Stand",
    vendorHint: "Main concourse",
    tags: ["nhl", "local-vendor", "signature"]
  },
  {
    name: "Coca-Cola Test Kitchen Feature Plate",
    description: "Rotating chef-driven feature from the Test Kitchen",
    fare: "Meals",
    vendor: "Coca-Cola Test Kitchen",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "The Rotisserie Quarter Chicken",
    fare: "Meals",
    vendor: "The Rotisserie",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "The Rotisserie Pulled Chicken Sandwich",
    fare: "Meals",
    vendor: "The Rotisserie",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Tacos and Tequila Street Tacos",
    fare: "Meals",
    vendor: "Tacos and Tequila",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Tacos and Tequila Loaded Nachos",
    fare: "Meals",
    vendor: "Tacos and Tequila",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Pizza 73 Pepperoni Pizza",
    fare: "Meals",
    vendor: "Pizza 73",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Pocket Dawg Bacon Wrapped Hot Dog",
    fare: "Meals",
    vendor: "Pocket Dawg",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Burgers and Brew Smash Burger",
    fare: "Meals",
    vendor: "Burgers and Brew",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Skyline Deli Pastrami Sandwich",
    fare: "Meals",
    vendor: "Skyline Deli",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Tim Hortons Chili Bowl",
    fare: "Meals",
    vendor: "Tim Hortons",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "The Rotisserie Poutine",
    fare: "Meals",
    vendor: "The Rotisserie",
    vendorHint: "Main concourse",
    tags: ["nhl", "signature"]
  },
  {
    name: "Mezzanine Chicken Tenders Plate",
    fare: "Meals",
    vendor: "Mezzanine Stands",
    vendorHint: "Mezzanine level",
    tags: ["nhl"]
  },
  {
    name: "Time Out Stand All-Beef Hot Dog",
    fare: "Meals",
    vendor: "Time Out Stands",
    vendorHint: "Upper concourse",
    tags: ["nhl"]
  },
  {
    name: "Saddleroom Grill Prime Rib Sandwich",
    description: "Carved prime rib sandwich from the terrace-level restaurant",
    fare: "Meals",
    vendor: "Saddleroom Grill",
    vendorHint: "Terrace Level · East side",
    tags: ["nhl", "signature"]
  },
  {
    name: "Center Ice Loaded Chili Dog",
    description: "Classic stadium chili dog from Center Ice stands",
    fare: "Meals",
    vendor: "Center Ice",
    vendorHint: "Main concourse",
    tags: ["nhl"]
  },
  {
    name: "Test Kitchen Vegetarian Bowl",
    description: "Vegetarian option from the rotating Test Kitchen menu",
    fare: "Meals",
    vendor: "Coca-Cola Test Kitchen",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["nhl"]
  },
  {
    name: "Pizza 73 Hawaiian Pizza",
    fare: "Meals",
    vendor: "Pizza 73",
    vendorHint: "Main concourse",
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

export async function parseScotiabankSaddledomeMenu(
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
