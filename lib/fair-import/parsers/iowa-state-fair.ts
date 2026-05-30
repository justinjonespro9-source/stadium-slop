/**
 * Iowa State Fair — 2025 new foods (preview listing).
 * Source: https://www.iowastatefair.org/food/whats-new
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairMenuParseResult, FairRawMenuItem } from "../types";

const VENUE_SLUG = "iowa-state-fair";
const VENUE_NAME = "Iowa State Fair";
const SOURCE_URL = "https://www.iowastatefair.org/food/whats-new";

const MENU_2025: FairRawMenuItem[] = [
  {
    name: "Bacon Chicken Ranch Eggroll",
    vendor: "Winn & Sara's Kitchen",
    fare: "Meals",
    description: "Hand-wrapped eggroll with chicken, bacon, cheddar, and ranch drizzle.",
    price: 15,
    location: "The Lawn by the Jacobson Building"
  },
  {
    name: "The Scotcheroo Shake",
    vendor: "Over The Top",
    fare: "Desserts",
    description: "Scotcheroo ice cream shake with fudge, caramel, and a scotcheroo slice.",
    price: 12
  },
  {
    name: "Three Little Pigs",
    vendor: "Whatcha Smokin? BBQ",
    fare: "Meals",
    description: "Trio of smoked ham balls with honey mustard, cherry soda, and vanilla glazes.",
    price: 13
  },
  {
    name: "Chicken Pickle Ranch Rocket on a Stick",
    vendor: "JR's SouthPork Ranch",
    fare: "Meals",
    description: "Grilled chicken and pickle slices with ranch butter glaze on a stick.",
    price: 9
  },
  {
    name: "Potato Half & Half Korean Corn Dog",
    vendor: "GoldenKDog",
    fare: "Meals",
    description: "Crinkle-fry coated Korean corn dog with half cheese and half hot dog.",
    price: 18
  },
  {
    name: "The Butter Cow Tornado",
    vendor: "Dairy Zone",
    fare: "Desserts",
    description: "Butter cake swirl with butterscotch and a white-chocolate butter cow candy.",
    price: 10
  },
  {
    name: "Sweet Granny's Apple Delight Sundae",
    vendor: "Applishus",
    fare: "Desserts",
    description: "Granny Smith ice cream sundae with apple filling, caramel, and whipped cream.",
    price: 10
  },
  {
    name: "Hawaiian Hog",
    vendor: "Iowa Pork Producers — Iowa Pork Tent",
    fare: "Meals",
    description: "Shaved pork loin sandwich with coleslaw and brown sugar pineapple.",
    price: 10
  },
  {
    name: "HoQ Lamb Wrap",
    vendor: "HoQ",
    fare: "Meals",
    description: "Iowa lamb in tomato cream sauce with rice and kale on naan.",
    price: 18
  },
  {
    name: "Nashville Hot Chicken Mac N' Cheese Pizza Slice",
    vendor: "Wiseguys Woodfired Pizza",
    fare: "Meals",
    description: "Wood-fired slice with smoked chicken, mac sauce, mozzarella, and hot honey.",
    price: 8
  },
  {
    name: "Maple Bacon Bourbon Grilled Cheese",
    vendor: "What's Your Cheez",
    fare: "Meals",
    description: "Maple bourbon cheddar grilled cheese with candied bacon and dipping sauce.",
    price: 12
  },
  {
    name: "Beignets (2 Count)",
    vendor: "Beans & Beignets, LLC",
    fare: "Desserts",
    description: "Deep-fried beignets dusted with powdered sugar.",
    price: 6
  },
  {
    name: "Footlong Hot Cheetos Corn Dog",
    vendor: "Smith's",
    fare: "Meals",
    description: "Footlong corn dog in nacho cheese rolled in Hot Cheeto crumbles.",
    price: 12
  },
  {
    name: "Flamin' Hot Pickle Pizza",
    vendor: "Leimon's Pizzeria",
    fare: "Meals",
    description: "Garlic ranch pickle pizza topped with Flamin' Hot Cheetos dust.",
    price: 9
  },
  {
    name: "Fairgrounds Fiesta Wonton",
    vendor: "Cluckin' Coop",
    fare: "Meals",
    description: "Giant wonton with egg salad, bacon, cheddar, hot honey, and pico.",
    price: 10
  },
  {
    name: "Voodoo Fries",
    vendor: "Po-Boys",
    fare: "Snacks",
    description: "Fries with chili queso, bacon, ranch, and black magic seasoning.",
    price: 12
  },
  {
    name: "Lobster Biscuits & Gravy",
    vendor: "JR's SouthPork Ranch",
    fare: "Meals",
    description: "Cheesy biscuit with buttery lobster gravy.",
    price: 12
  },
  {
    name: "Saigon Lobster Bomb",
    vendor: "Saigonais",
    fare: "Meals",
    description: "Fried French baguette with lobster, hoisin, and sriracha.",
    price: 18
  },
  {
    name: "Smoked Meatloaf Platter",
    vendor: "Blue Ribbon Bar & Eatery",
    fare: "Meals",
    description: "Smoked meatloaf with bourbon glaze, cheesy potatoes, and slaw.",
    price: 16
  },
  {
    name: "Steak Tips Gnocchi",
    vendor: "Destination Grille",
    fare: "Meals",
    description: "Gluten-free gnocchi with cheese blend and seared steak tips.",
    price: 14
  },
  {
    name: "High Roller Roll",
    vendor: "JR's SouthPork Ranch",
    fare: "Meals",
    description: "Lobster roll topped with caviar and edible gold leaf.",
    price: 100,
    location: "JR's SouthPork Ranch"
  },
  {
    name: "Watermelon Lemonade",
    vendor: "Jada's Funnel Cake",
    beverageCategory: "Non-Alcoholic Drink",
    description: "Watermelon lemonade (2025 Best New Drink, alcohol-free).",
    price: 6
  },
  {
    name: "Pink Pony Cooler",
    vendor: "JR's SouthPork Ranch",
    beverageCategory: "Alcoholic Drink",
    allowBeverage: true,
    description: "Pink guava and cotton candy sour blend (21+).",
    location: "JR's SouthPork Ranch"
  }
];

export async function parseIowaStateFairMenu(): Promise<FairMenuParseResult> {
  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: MENU_2025,
    warnings: [
      "Skipped generic drink menu rows from the official list; specialty 2025 drink winners included.",
      "High Roller Roll retained as a priced specialty item — verify availability."
    ]
  });
}
