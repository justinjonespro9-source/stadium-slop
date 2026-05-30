/**
 * State Fair of Texas — 2025 new foods (preview listing).
 * Sources:
 *   https://bigtex.com/new-foods-announced-for-2025-state-fair-of-texas/
 *   https://bigtex.com/winners-of-the-2025-big-tex-choice-awards-announced/
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairMenuParseResult, FairRawMenuItem } from "../types";

const VENUE_SLUG = "state-fair-of-texas";
const VENUE_NAME = "State Fair of Texas";
const SOURCE_URL =
  "https://bigtex.com/new-foods-announced-for-2025-state-fair-of-texas/";

const MENU_2025: FairRawMenuItem[] = [
  {
    name: "Crab & Mozzarella Arancini",
    vendor: "Stefan T. Nedwetzky",
    fare: "Snacks",
    description: "2025 Big Tex Choice Award — Best Taste Savory."
  },
  {
    name: "Chill & Thrill Delight",
    vendor: "Tony & Terry Bednar",
    fare: "Desserts",
    description: "2025 Big Tex Choice Award — Best Taste Sweet."
  },
  {
    name: "Cookie Chaos Milkshake",
    vendor: "Brad Weiss",
    fare: "Desserts",
    description: "2025 Big Tex Choice Award — Best Taste Sipper.",
    allowBeverage: true,
    beverageCategory: "Non-Alcoholic Drink"
  },
  {
    name: "Wagyu Bacon Cheeseburger Deviled Egg Sliders",
    vendor: "Kendall Williams",
    fare: "Meals",
    description: "2025 Big Tex Choice Award — Most Creative."
  },
  {
    name: "Birria Ramen Bowl",
    vendor: "State Fair of Texas concessionaire",
    fare: "Meals",
    description: "2025 new fair food item.",
    location: "See BigTex.com/NewFoods map"
  },
  {
    name: "Baja Fish Tacos",
    vendor: "State Fair of Texas concessionaire",
    fare: "Meals",
    description: "2025 new fair food item."
  },
  {
    name: "Fried Pickle Bombs",
    vendor: "State Fair of Texas concessionaire",
    fare: "Snacks",
    description: "2025 new fair food item."
  },
  {
    name: "Churro Cheesecake Jalapeño Popper",
    vendor: "State Fair of Texas concessionaire",
    fare: "Desserts",
    description: "2025 Big Tex semi-finalist new food."
  },
  {
    name: "Deep Fried Carbonara",
    vendor: "State Fair of Texas concessionaire",
    fare: "Meals",
    description: "2025 new fair food item."
  },
  {
    name: "Vegan Crunchwrap Supreme",
    vendor: "State Fair of Texas concessionaire",
    fare: "Meals",
    description: "2025 new fair food item."
  },
  {
    name: "Dubai Chocolate Cheesecake",
    vendor: "Stephen El Gidi",
    fare: "Desserts",
    description: "2025 Big Tex semi-finalist."
  },
  {
    name: "Rousso's Dubai Chocolate Funnel Cake Fries",
    vendor: "Isaac & Joey Rousso",
    fare: "Desserts",
    description: "2025 Big Tex semi-finalist."
  },
  {
    name: "Vietnamese Crunch Dog",
    vendor: "The Le Family",
    fare: "Meals",
    description: "2025 Big Tex semi-finalist."
  },
  {
    name: "Deep Fried Deli Tacos",
    vendor: "Brent & Juan Reaves",
    fare: "Meals",
    description: "2025 Big Tex semi-finalist."
  },
  {
    name: "Pop Rocks Margarita",
    vendor: "State Fair of Texas concessionaire",
    beverageCategory: "Alcoholic Drink",
    allowBeverage: true,
    description: "2025 new beverage (21+). Verify stand on official map."
  },
  {
    name: "Texas Water",
    vendor: "State Fair of Texas concessionaire",
    beverageCategory: "Non-Alcoholic Drink",
    description: "Generic beverage — skipped by import filter."
  }
];

export async function parseStateFairOfTexasMenu(): Promise<FairMenuParseResult> {
  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: MENU_2025,
    warnings: [
      "Several 2025 items list concessionaire TBD — assign stand locations from BigTex.com/NewFoods before apply.",
      "Vendor names follow Big Tex Choice Awards announcements where available."
    ]
  });
}
