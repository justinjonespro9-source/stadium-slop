/**
 * Wisconsin State Fair — 2025 new foods (preview listing).
 * Source: https://wistatefair.com/fair/new-foods/ and 2025 Sporkies announcements.
 */

import { buildFairMenuParseResult } from "../build-parse-result";
import type { FairMenuParseResult, FairRawMenuItem } from "../types";

const VENUE_SLUG = "wisconsin-state-fair";
const VENUE_NAME = "Wisconsin State Fair";
const SOURCE_URL = "https://wistatefair.com/fair/new-foods/";

const MENU_2025: FairRawMenuItem[] = [
  {
    name: "Ube Butter Banana French Toast Lumpia",
    vendor: "Lumpia City",
    fare: "Desserts",
    description: "2025 Sporkies champion — fried lumpia with ube butter French toast and banana."
  },
  {
    name: "Brat Rangoon",
    vendor: "WürstBar",
    fare: "Meals",
    description: "2025 Sporkies second place — brat-filled fried wontons with sweet-and-sour sauce."
  },
  {
    name: "Mexican Street Corn Pizza",
    vendor: "Charlie's Pizza",
    fare: "Meals",
    description: "2025 Sporkies third place — elote-inspired pizza slice."
  },
  {
    name: "Dubai Funnel Cake",
    vendor: "Sweet Factory",
    fare: "Desserts",
    description: "2025 new fair food item."
  },
  {
    name: "Dill Dawg Dorito Bombs",
    vendor: "Wisconsin State Fair vendor",
    fare: "Snacks",
    description: "2025 new fair food item."
  },
  {
    name: "Glickles",
    vendor: "Wisconsin State Fair vendor",
    fare: "Snacks",
    description: "Glitter pickles — 2025 new fair food item."
  },
  {
    name: "A Hunk A Hunk Elvis Donut Ice Cream Sandwich",
    vendor: "Badger Bites",
    fare: "Desserts",
    description: "2025 new fair food item."
  },
  {
    name: "Blueberry Breakfast Bratwurst",
    vendor: "Milwaukee Brat House",
    fare: "Meals",
    description: "Usinger blueberry brat with bourbon bacon jam in a pancake bun — 2025 Sporkies finalist."
  },
  {
    name: "Crookie",
    vendor: "Buzzy Badger",
    fare: "Desserts",
    description: "2025 new fair food item."
  },
  {
    name: "Wisconsin Old Fashioned Wings",
    vendor: "Bud Pavilion",
    fare: "Meals",
    description: "2025 new fair food item."
  },
  {
    name: "Bavarian Cream Bug Donut",
    vendor: "Wisconsin State Fair vendor",
    fare: "Desserts",
    description: "Fair novelty dessert with edible insects (shellfish allergy notice on fair site)."
  },
  {
    name: "Purple Rain Refresher",
    vendor: "Rock & Roll Beer Garden",
    beverageCategory: "Non-Alcoholic Drink",
    allowBeverage: true,
    description: "2025 Drinkies winner — grape, lemonade, grapefruit soda with glitter and Pop Rocks."
  }
];

export async function parseWisconsinStateFairMenu(): Promise<FairMenuParseResult> {
  return buildFairMenuParseResult({
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    items: MENU_2025,
    warnings: [
      "Official 2026 list not published yet on WiStateFair.com — data reflects 2025 fair season.",
      "Use Food Finder on WiStateFair.com for stand-level locations before visiting."
    ]
  });
}
