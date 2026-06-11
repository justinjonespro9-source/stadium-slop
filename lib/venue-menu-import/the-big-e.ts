/**
 * The Big E (Eastern States Exposition — State Fair) menu parser.
 *
 * Curated from official Big E food pages and the fair's annual media food
 * preview (Eastern States Exposition officials). Alcohol, mocktails, generic
 * snacks, and marketplace-only rows are excluded.
 *
 * Sources:
 *   https://www.thebige.com/p/food2
 *   https://www.westernmassnews.com/2024/08/22/big-e-unveils-new-foods-2024-fair/
 *
 * Re-verify each fair season when the official Food Finder publishes listings.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "the-big-e";
const VENUE_NAME = "The Big E";
const SOURCE_URL = "https://www.thebige.com/p/food2";

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
    name: "Big E Cream Puff",
    description: "Fair signature dessert since 2002; original flavor at the Big E Bakery",
    fare: "Desserts",
    vendor: "The Big E Bakery",
    vendorHint: "Better Living Center; New England Center; Avenue ShowPlace",
    dietary: ["Vegetarian"],
    tags: ["state-fair", "signature"]
  },
  {
    name: "Big E Cookies & Cream Cream Puff",
    description: "Rotating flavor-of-the-year cream puff variant",
    fare: "Desserts",
    vendor: "The Big E Bakery",
    vendorHint: "Better Living Center",
    dietary: ["Vegetarian"],
    tags: ["state-fair", "signature"]
  },
  {
    name: "Big E Chocolate Chip Cookie",
    description: "Ghirardelli chocolate chip cookie introduced by the fair in 2006",
    fare: "Desserts",
    vendor: "The Big E Bakery",
    vendorHint: "New England Center",
    dietary: ["Vegetarian"],
    tags: ["state-fair", "signature"]
  },
  {
    name: "Big E Eclair",
    description: "The Big (Chocolate) Eclair — fair-branded dessert since 2004",
    fare: "Desserts",
    vendor: "The Big E Bakery",
    vendorHint: "New England Center",
    dietary: ["Vegetarian"],
    tags: ["state-fair", "signature"]
  },
  {
    name: "Reimagined Craz-E Burger",
    description:
      "Angus smash burger with cheese, bacon, and onion rings between two glazed donuts",
    fare: "Meals",
    vendor: "The Emporium",
    vendorHint: "Better Living Center",
    tags: ["state-fair", "signature"]
  },
  {
    name: "Ferrindino Maple Creemee Cannoli",
    description: "Maple creemee in a crispy cannoli shell with powdered sugar and maple syrup",
    fare: "Desserts",
    vendor: "Ferrindino Maple",
    vendorHint: "Better Living Center; Springfield Road",
    dietary: ["Vegetarian"],
    tags: ["state-fair", "local-vendor"]
  },
  {
    name: "NOLA Maryland Cajun Crab Cakes",
    fare: "Meals",
    vendor: "NOLA Cajun Kitchen and Raw Bar",
    vendorHint: "New England Avenue",
    tags: ["state-fair", "local-vendor"]
  },
  {
    name: "NOLA Jambalaya",
    fare: "Meals",
    vendor: "NOLA Cajun Kitchen and Raw Bar",
    vendorHint: "New England Avenue",
    tags: ["state-fair", "local-vendor"]
  },
  {
    name: "NOLA Beignets",
    fare: "Desserts",
    vendor: "NOLA Cajun Kitchen and Raw Bar",
    vendorHint: "New England Avenue",
    dietary: ["Vegetarian"],
    tags: ["state-fair", "local-vendor"]
  },
  {
    name: "Birria Vampiros",
    description: "Two birria tacos with consommé for dipping",
    fare: "Meals",
    vendor: "Macho Taco",
    vendorHint: "Commonwealth Avenue",
    tags: ["state-fair"]
  },
  {
    name: "Buffalo Chicken Chompers",
    description: "Fried chicken and cheese balls in Buffalo sauce with ranch",
    fare: "Meals",
    vendor: "Chompers",
    vendorHint: "New England Avenue",
    tags: ["state-fair"]
  },
  {
    name: "Korean Corn Dog",
    fare: "Meals",
    vendor: "Meatball Factory",
    vendorHint: "Avenue of States",
    tags: ["state-fair"]
  },
  {
    name: "Storrowton Blackened Mac and Cheese Bowl",
    fare: "Meals",
    vendor: "Storrowton Tavern",
    vendorHint: "Avenue of States",
    dietary: ["Vegetarian"],
    tags: ["state-fair", "local-vendor"]
  },
  {
    name: "Storrowton Crab Dip",
    fare: "Meals",
    vendor: "Storrowton Tavern",
    vendorHint: "Avenue of States",
    tags: ["state-fair", "local-vendor"]
  },
  {
    name: "Buffalo Chicken Poutine",
    fare: "Meals",
    vendor: "Poutine Gourmet",
    vendorHint: "Springfield Road",
    tags: ["state-fair"]
  },
  {
    name: "The Big Mozz",
    description: "Hand-cut mozzarella deep fried on a stick",
    fare: "Meals",
    vendor: "Hot Wisconsin Cheese",
    vendorHint: "Springfield Road",
    dietary: ["Vegetarian"],
    tags: ["state-fair", "signature"]
  },
  {
    name: "Apple Cider Pulled Pork Grilled Cheese",
    description: "Smoked pulled pork with Angry Orchard cider glaze and sharp cheddar on sourdough",
    fare: "Meals",
    vendor: "Sam Adams Beer Garden",
    vendorHint: "Avenue of States",
    tags: ["state-fair"]
  },
  {
    name: "The Hub Cajun Burger",
    description: "Chorizo and beef patty with remoulade, grilled onions, and American cheese",
    fare: "Meals",
    vendor: "The Hub",
    vendorHint: "New England Avenue",
    tags: ["state-fair"]
  },
  {
    name: "Crab Rangoon Pizza",
    fare: "Meals",
    vendor: "Top The Crust",
    vendorHint: "Food Court",
    tags: ["state-fair"]
  },
  {
    name: "International Lobster House Jackalope Sausage",
    fare: "Meals",
    vendor: "International Lobster House",
    vendorHint: "West Road",
    tags: ["state-fair"]
  },
  {
    name: "Dribbles Mini Donuts",
    description: "Fresh mini donuts with Bavarian cream, strawberry, chocolate, or cinnamon sugar",
    fare: "Desserts",
    vendor: "Dribbles",
    vendorHint: "Better Living Center",
    dietary: ["Vegetarian"],
    tags: ["state-fair"]
  },
  {
    name: "White Hut Quad Father Burger",
    description: "Four patties, bacon, pickles, fried onions, and house sauce",
    fare: "Meals",
    vendor: "White Hut",
    vendorHint: "Food Court",
    tags: ["state-fair", "local-vendor"]
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
    importTags: raw.tags,
    seasonIntroduced: "2024"
  };
}

export async function parseTheBigEMenu(
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
