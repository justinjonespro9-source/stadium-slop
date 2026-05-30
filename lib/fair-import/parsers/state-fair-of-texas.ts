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
    vendor: "Mr. Ramen Fusion",
    fare: "Meals",
    description:
      "Ramen with birria, corn, cilantro, crispy onion, Monterey Jack, and consommé.",
    location: "Midway"
  },
  {
    name: "Baja Fish Tacos",
    vendor: "Tony's Taco Shop",
    fare: "Meals",
    description: "Three crispy fish tacos with creamy zesty sauce.",
    location: "Mamacita's, Old Mill Inn patio on Grand Ave"
  },
  {
    name: "Fried Pickle Bombs",
    vendor: "Stiffler Concessions",
    fare: "Snacks",
    description: "Fried pickles on Crispy Dillies with spicy ranch.",
    location: "Front Gate, Midway, Funway, and Grand Area"
  },
  {
    name: "Churro Cheesecake Jalapeño Popper",
    vendor: "Velasquez Catering & Concessions",
    fare: "Desserts",
    description:
      "2025 Big Tex semi-finalist — jalapeño popper with cheesecake filling, churro batter, cinnamon sugar, and dulce de leche.",
    location: "Funway and MLK Blvd"
  },
  {
    name: "Deep Fried Carbonara",
    vendor: "EATALY Dallas",
    fare: "Meals",
    description: "Breaded and fried spaghetti carbonara with guanciale and Pecorino Romano.",
    location: "Cotton Bowl Plaza"
  },
  {
    name: "Vegan Crunchwrap Supreme",
    vendor: "Vegan Vibrationz",
    fare: "Meals",
    description:
      "Plant-based crunchwrap with seasoned crumble, nacho cheese, chipotle aioli, lettuce, and tomatoes.",
    location: "Nimitz Ave"
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
    vendor: "Texas Holy Fried Ribs and Fusion BBQ",
    beverageCategory: "Alcoholic Drink",
    allowBeverage: true,
    description: "2025 semi-finalist frozen margarita with Pop Rocks (21+).",
    location: "Tower Building; Cotton Bowl Plaza (sopapilla stand)"
  },
  {
    name: "Texas Water",
    vendor: "Vandalay Industries",
    beverageCategory: "Non-Alcoholic Drink",
    description: "Generic beverage — skipped by import filter.",
    location: "Funway"
  }
];

export async function parseStateFairOfTexasMenu(): Promise<FairMenuParseResult> {
  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: MENU_2025,
    warnings: [
      "Vendor names and locations from BigTex.com 2025 new foods announcement.",
      "Use BigTex.com/NewFoods map for exact stand pins before visiting."
    ]
  });
}
