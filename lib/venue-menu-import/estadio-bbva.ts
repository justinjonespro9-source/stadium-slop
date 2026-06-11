/**
 * Estadio BBVA (Monterrey — FIFA World Cup 2026) menu parser.
 *
 * Curated from regional Norteño stadium fare and World Cup planning guides.
 * Generic beverages and alcohol-only concepts excluded. Starter rows preserved.
 *
 * Sources:
 *   https://stadiumslop.com/world-cup-stadium-food-guide
 *   https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026
 *
 * Re-verify with fan reviews and official 2026 concessions when published.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "estadio-bbva";
const VENUE_NAME = "Estadio BBVA";
const SOURCE_URL =
  "https://stadiumslop.com/world-cup-stadium-food-guide#estadio-bbva";

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
    name: "Tacos",
    description: "Stadium taco stand staple",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup", "signature"]
  },
  {
    name: "Tacos de Carne Asada",
    description: "Grilled arrachera-style beef on flour tortillas",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Tacos de Cabrito",
    description: "Monterrey regional goat taco",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Tortas",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup", "signature"]
  },
  {
    name: "Torta de Milanesa",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Nachos",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Nachos con Queso Fundido",
    description: "Melted cheese over chips — Norteño stadium favorite",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Queso Fundido con Chorizo",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Hot Dog",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Burger",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Hamburguesa Norteña",
    description: "Beef patty with grilled onions and regional toppings",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Pizza",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Fajitas Norteñas",
    description: "Sizzling peppers and grilled meat with tortillas",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Burrito de Arrachera",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Esquites",
    fare: "Snacks",
    vendor: "Estadio BBVA Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Elote Asado",
    description: "Grilled corn on the cob with toppings",
    fare: "Snacks",
    vendor: "Estadio BBVA Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Churros",
    fare: "Desserts",
    vendor: "Estadio BBVA Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "signature"]
  },
  {
    name: "Glorias",
    description: "Cajeta-and-pecan regional candy pastry",
    fare: "Desserts",
    vendor: "Estadio BBVA Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Flautas de Pollo",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Papa Asada con Toppings",
    description: "Loaded baked potato cup",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Tostadas de Frijol con Veneno",
    description: "Regional bean tostada with pickled toppings",
    fare: "Meals",
    vendor: "Estadio BBVA Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Empanadas de Queso",
    fare: "Snacks",
    vendor: "Estadio BBVA Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup"]
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

export async function parseEstadioBbvaMenu(
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
