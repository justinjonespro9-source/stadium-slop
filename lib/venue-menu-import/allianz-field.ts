/**
 * Allianz Field (Minnesota United FC) menu parser.
 *
 * Source: https://www.allianzfield.com/plan-your-visit/menus-maps
 * The page is JS-rendered (Webflow CMS). This parser uses a curated
 * static dataset extracted from the official page. Re-run the extract
 * step each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "allianz-field";
const VENUE_NAME = "Allianz Field";
const SOURCE_URL =
  "https://www.allianzfield.com/plan-your-visit/menus-maps?fare=Meals#guide";

type RawItem = {
  name: string;
  price?: number;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  isDrink?: boolean;
};

const MENU_DATA: RawItem[] = [
  // ── Meals ──────────────────────────────────────────────────────
  {
    name: "Bibigo Chicken Dumpling",
    price: 11.49,
    description: "Chicken and vegetable-stuffed dumpling",
    fare: "Meals",
    vendor: "Nice Slice & World's Fare",
    vendorHint: "Section 12 / Section 29"
  },
  {
    name: "Bibigo Gochujang Crunchy Chicken",
    price: 14.09,
    description:
      "Crunchy chicken in a hot and sweet gochujang sauce, served with vegetable fried rice",
    fare: "Meals",
    vendor: "Nice Slice & World's Fare",
    vendorHint: "Section 12 / Section 29"
  },
  {
    name: "Bibigo Vegetable Springroll",
    price: 11.49,
    description:
      "A light mix of jícama, edamame, carrot, cabbage, and sweet potato in a crispy mini spring roll shell",
    fare: "Meals",
    vendor: "Nice Slice & World's Fare",
    vendorHint: "Section 12 / Section 29",
    dietary: ["Vegetarian"]
  },
  {
    name: "Fireball BBQ Burger",
    price: 15.99,
    description:
      "Burger with cheese, bacon, onion, and a Fireball Whisky BBQ Sauce",
    fare: "Meals",
    vendor: "Grand Casino Brew Hall Kitchen",
    vendorHint: "Section 06"
  },
  {
    name: "Fried Walleye Sandwich",
    price: 15.99,
    description:
      "Classic Minnesotan breaded walleye on a bun",
    fare: "Meals",
    vendor: "Grand Casino Brew Hall Kitchen",
    vendorHint: "Section 06"
  },
  {
    name: "Wild Rice Bratwurst",
    price: 12.49,
    description: "Wild-rice bratwurst with toppings",
    fare: "Meals",
    vendor: "Grand Casino Brew Hall Kitchen",
    vendorHint: "Section 06"
  },
  {
    name: "Union Hmong Kitchen Bowl – Chicken",
    price: 14.09,
    description: "Union Hmong Kitchen chicken bowl",
    fare: "Meals",
    vendor: "Union Hmong Kitchen",
    vendorHint: "Section 16"
  },
  {
    name: "Union Hmong Kitchen Bowl – Vegan",
    price: 14.09,
    description: "Union Hmong Kitchen vegan bowl",
    fare: "Meals",
    vendor: "Union Hmong Kitchen",
    vendorHint: "Section 16",
    dietary: ["Vegan"]
  },
  {
    name: "Union Hmong Kitchen Bowl – United Special",
    price: 14.09,
    description: "Union Hmong Kitchen United Special bowl",
    fare: "Meals",
    vendor: "Union Hmong Kitchen",
    vendorHint: "Section 16"
  },
  {
    name: "Philly Cheesesteak",
    price: 14.09,
    description: "Classic Philly cheesesteak",
    fare: "Meals",
    vendor: "Tono's",
    vendorHint: "Section 12"
  },
  {
    name: "Italian Caprese Sandwich",
    price: 13.49,
    description: "Signature Italian Caprese sandwich",
    fare: "Meals",
    vendor: "Street Fare",
    vendorHint: "Section 34 / Section 20 / Section 10"
  },
  {
    name: "Cubano Sandwich",
    price: 13.49,
    description: "Signature Cubano sandwich",
    fare: "Meals",
    vendor: "Street Fare",
    vendorHint: "Section 34 / Section 20 / Section 10"
  },
  {
    name: "Broccolini Sandwich",
    price: 13.49,
    description: "Signature Broccolini sandwich",
    fare: "Meals",
    vendor: "Street Fare",
    vendorHint: "Section 34 / Section 20 / Section 10",
    dietary: ["Vegetarian"]
  },
  {
    name: "Burrito",
    price: 13.49,
    description: "Flavor-filled burrito",
    fare: "Meals",
    vendor: "Street Fare",
    vendorHint: "Section 10"
  },
  {
    name: "Quesadilla",
    price: 12.49,
    description: "Loaded quesadilla",
    fare: "Meals",
    vendor: "Street Fare",
    vendorHint: "Section 10"
  },
  {
    name: "Nachos",
    price: 12.49,
    description: "Loaded nachos",
    fare: "Meals",
    vendor: "Street Fare",
    vendorHint: "Section 20 / Section 10"
  },
  {
    name: "Tacos",
    price: 12.49,
    description: "Street tacos",
    fare: "Meals",
    vendor: "Street Fare",
    vendorHint: "Section 20"
  },
  {
    name: "Soul Bowl",
    price: 13.49,
    description: "Soul food reimagined",
    fare: "Meals",
    vendor: "Soul Bowl",
    vendorHint: "Section 24"
  },
  {
    name: "Pizza Slice",
    price: 8.49,
    description: "Pizza by the slice",
    fare: "Meals",
    vendor: "Nice Slice & World's Fare",
    vendorHint: "Section 12 / Section 29"
  },
  {
    name: "Wild Rice Soup",
    price: 10.49,
    description: "Classic Minnesotan wild rice soup",
    fare: "Meals",
    vendor: "Grand Casino Brew Hall",
    vendorHint: "Brew Hall"
  },
  {
    name: "Crispy Chicken Sandwich",
    price: 13.49,
    description: "Crispy chicken sandwich",
    fare: "Meals",
    vendor: "Fry Club",
    vendorHint: "Section 16"
  },
  {
    name: "Corn Dog",
    price: 8.49,
    description: "Classic corn dog",
    fare: "Meals",
    vendor: "Fry Club",
    vendorHint: "Section 16"
  },

  // ── Snacks ─────────────────────────────────────────────────────
  {
    name: "Cheese Fries",
    price: 11.49,
    description: "Crispy French fries topped with nacho cheese sauce",
    fare: "Snacks",
    vendor: "Fry Club",
    vendorHint: "Section 16"
  },
  {
    name: "Cheese Curds",
    price: 10.49,
    description: "Golden-fried Wisconsin cheese curds",
    fare: "Snacks",
    vendor: "Fry Club",
    vendorHint: "Section 16"
  },
  {
    name: "Soft Pretzel",
    price: 8.49,
    description: "Fresh-baked giant soft pretzel",
    fare: "Snacks",
    vendor: "Hungry Loon",
    vendorHint: "Section 34 / Section 10 / Section 13 / Section 22"
  },
  {
    name: "French Fries",
    price: 8.49,
    description: "Crispy golden French fries",
    fare: "Snacks",
    vendor: "Hungry Loon",
    vendorHint: "Section 34 / Section 10 / Section 13 / Section 22"
  },
  {
    name: "Chicken Tenders",
    price: 12.49,
    description: "Golden-fried chicken tenders",
    fare: "Snacks",
    vendor: "Hungry Loon",
    vendorHint: "Section 34 / Section 10 / Section 13 / Section 22"
  },

  // ── Desserts ───────────────────────────────────────────────────
  {
    name: "Beignets",
    price: 10.49,
    description: "Deep-fried sugary confections",
    fare: "Desserts",
    vendor: "Café Beignet",
    vendorHint: "Section 20"
  },
  {
    name: "Soft Serve Ice Cream",
    price: 7.49,
    description: "Classic soft serve ice cream",
    fare: "Desserts",
    vendor: "Nice Slice & World's Fare",
    vendorHint: "Section 12 / Section 29"
  },
  {
    name: "Hard Scoop Ice Cream",
    price: 8.49,
    description:
      "Assorted hard scoop flavors in a cup or cone, dairy and non-dairy options",
    fare: "Desserts",
    vendor: "Ice Cream",
    vendorHint: "Section 22"
  }
];

export async function parseAllianzFieldMenu(
  _sourceUrl?: string
): Promise<VenueMenuParseResult> {
  let skippedDrinks = 0;
  const items: VenueMenuSourceItem[] = [];

  for (const raw of MENU_DATA) {
    if (raw.isDrink) {
      skippedDrinks++;
      continue;
    }

    items.push({
      name: raw.name,
      price: raw.price,
      description: raw.description,
      fare: raw.fare,
      category: "Food",
      vendorName: raw.vendor,
      vendorLocationHint: raw.vendorHint,
      dietaryTags: raw.dietary ?? [],
      sourceUrl: SOURCE_URL
    });
  }

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks
  };
}
