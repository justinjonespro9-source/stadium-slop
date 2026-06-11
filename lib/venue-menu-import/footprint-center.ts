/**
 * Footprint Center (Phoenix Suns / Mercury — NBA/WNBA) menu parser.
 *
 * Curated from OVG Hospitality / Suns season menu rollout (ABC15 chef
 * interview) and documented local concession partners. Generic popcorn,
 * marketplace rows, and alcohol are excluded.
 *
 * Sources:
 *   https://www.abc15.com/entertainment/events/new-suns-food-menu-includes-a-gorilla-souvenir-popcorn-bucket-a-12-inch-taco-and-brisket-dishes
 *   https://www.footprintcenter.com/venue/food-and-beverage/
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

const VENUE_SLUG = "footprint-center";
const VENUE_NAME = "Footprint Center";
const SOURCE_URL =
  "https://www.abc15.com/entertainment/events/new-suns-food-menu-includes-a-gorilla-souvenir-popcorn-bucket-a-12-inch-taco-and-brisket-dishes";

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
    name: "The Foot-Long Corndog",
    fare: "Meals",
    vendor: "Footprint Center Concessions",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba", "signature"]
  },
  {
    name: "The Jumbo Glazed Donut Burger",
    fare: "Meals",
    vendor: "Footprint Center Concessions",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba", "signature"]
  },
  {
    name: "Shaq's OG Chicken Sandwich",
    description: "Signature fried chicken sandwich from Shaq's Big Chicken",
    fare: "Meals",
    vendor: "Shaq's Big Chicken",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba", "signature"]
  },
  {
    name: "Shaq's Mac & Cheese Bites",
    fare: "Meals",
    vendor: "Shaq's Big Chicken",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba"]
  },
  {
    name: "Crispy Sonoran Chicken Sandwich",
    description:
      "Ghost pepper cheese, crispy jalapeños, ancho bacon, cactus pear ranch, and pico de gallo",
    fare: "Meals",
    vendor: "Shaq's Big Chicken",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba"]
  },
  {
    name: "Elote Burger",
    description: "K4 beef patty with queso fresco, elote mix, and pico on a Martin's bun",
    fare: "Meals",
    vendor: "Shaq's Big Chicken",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba", "local-vendor"]
  },
  {
    name: "Smoked 18-Hour Brisket Plate",
    description: "K4 Ranch brisket with mac & cheese, coleslaw, and bread",
    fare: "Meals",
    vendor: "Smoked",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba", "signature", "local-vendor"]
  },
  {
    name: "Smoked Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Smoked",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba", "local-vendor"]
  },
  {
    name: "Smoked Wings",
    fare: "Meals",
    vendor: "Smoked",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba"]
  },
  {
    name: "The Big Taco",
    description: "12-inch shareable taco with carne asada, guacamole, and pico de gallo",
    fare: "Meals",
    vendor: "Los Soles Taqueria",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba", "signature"]
  },
  {
    name: "Fried Mac and Cheese Bites",
    fare: "Meals",
    vendor: "Smoked",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba"]
  },
  {
    name: "Beyond Meat Dirty Fries",
    fare: "Meals",
    vendor: "Footprint Center Concessions",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["nba", "wnba"]
  },
  {
    name: "Cold Beers & Cheeseburgers Signature Burger",
    fare: "Meals",
    vendor: "Cold Beers & Cheeseburgers",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba", "local-vendor"]
  },
  {
    name: "Benihana Chicken Fried Rice Bowl",
    fare: "Meals",
    vendor: "Benihana",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba"]
  },
  {
    name: "Spinatos Pepperoni Pizza Slice",
    fare: "Meals",
    vendor: "Spinatos Pizza",
    vendorHint: "Upper concourse",
    tags: ["nba", "wnba", "local-vendor"]
  },
  {
    name: "Pork on a Fork Brisket Slider",
    description: "BBQ brisket slider from local Phoenix vendor",
    fare: "Meals",
    vendor: "Pork on a Fork",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba", "local-vendor"]
  },
  {
    name: "Benthana Sushi Roll",
    fare: "Meals",
    vendor: "Benthana Sushi",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba", "local-vendor"]
  },
  {
    name: "Dos Equis Beer Garden Carnitas Mac & Cheese",
    description: "Carnitas mac & cheese from the patio beer garden food menu",
    fare: "Meals",
    vendor: "Dos Equis Beer Garden",
    vendorHint: "North plaza patio",
    tags: ["nba", "wnba"]
  },
  {
    name: "Dos Equis Beer Garden Clay Pot Wings",
    fare: "Meals",
    vendor: "Dos Equis Beer Garden",
    vendorHint: "North plaza patio",
    tags: ["nba", "wnba"]
  },
  {
    name: "Roasted Green Chile Sausage",
    fare: "Meals",
    vendor: "Footprint Center Concessions",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba"]
  },
  {
    name: "Andouille Sausage",
    fare: "Meals",
    vendor: "Footprint Center Concessions",
    vendorHint: "Main concourse",
    tags: ["nba", "wnba"]
  },
  {
    name: "Impossible Burger",
    fare: "Meals",
    vendor: "Footprint Center Concessions",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["nba", "wnba"]
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

export async function parseFootprintCenterMenu(
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
