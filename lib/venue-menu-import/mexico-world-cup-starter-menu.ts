/**
 * Generic starter menu for Mexico 2026 World Cup host venues.
 *
 * No official per-item concession menus were available at import time.
 * These rows are planning placeholders — not a complete or official menu.
 *
 * Fans attending matches can expand coverage with verified reviews.
 */

import type {
  VenueMenuFare,
  VenueMenuItemCategory,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

export const MEXICO_WC_STARTER_DESCRIPTION =
  "Starter coverage for World Cup planning. Fans attending matches can help expand and rank food items at this venue.";

const STARTER_SOURCE_PATH = "/world-cup-stadium-food-guide#starter-coverage";

type StarterRow = {
  name: string;
  fare?: VenueMenuFare;
  category: VenueMenuItemCategory;
};

const STARTER_ROWS: StarterRow[] = [
  { name: "Tacos", fare: "Meals", category: "Food" },
  { name: "Tortas", fare: "Meals", category: "Food" },
  { name: "Nachos", fare: "Snacks", category: "Food" },
  { name: "Hot Dog", fare: "Meals", category: "Food" },
  { name: "Burger", fare: "Meals", category: "Food" },
  { name: "Pizza", fare: "Meals", category: "Food" },
  { name: "Churros", fare: "Desserts", category: "Food" },
  { name: "Esquites", fare: "Snacks", category: "Food" },
  { name: "Aguas Frescas", category: "Non-Alcoholic Drink" },
  { name: "Soft Drinks", category: "Non-Alcoholic Drink" }
];

export type MexicoWorldCupStarterVenue = {
  venueSlug: string;
  venueName: string;
};

function starterSourceUrl(venueSlug: string): string {
  return `https://stadiumslop.com/venues/${venueSlug}${STARTER_SOURCE_PATH}`;
}

export function parseMexicoWorldCupStarterMenu(
  venue: MexicoWorldCupStarterVenue,
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? starterSourceUrl(venue.venueSlug);
  const items: VenueMenuSourceItem[] = STARTER_ROWS.map((row) => ({
    name: row.name,
    description: MEXICO_WC_STARTER_DESCRIPTION,
    fare: row.fare,
    category: row.category,
    dietaryTags: [],
    sourceUrl: url
  }));

  return Promise.resolve({
    venueSlug: venue.venueSlug,
    venueName: venue.venueName,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  });
}
