/**
 * Estadio Azteca (Mexico City — FIFA World Cup 2026) menu parser.
 *
 * Curated from regional Mexico City stadium fare and World Cup planning guides.
 * Generic beverage rows and alcohol-only concepts excluded. Starter rows
 * preserved for matching.
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

const VENUE_SLUG = "estadio-azteca";
const VENUE_NAME = "Estadio Azteca";
const SOURCE_URL =
  "https://stadiumslop.com/world-cup-stadium-food-guide#estadio-azteca";

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
    description: "Stadium taco stand staple — fillings vary by stand",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup", "signature"]
  },
  {
    name: "Tacos al Pastor",
    description: "Marinated pork with pineapple on corn tortillas",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Tortas",
    description: "Mexican sandwich on bolillo bread",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup", "signature"]
  },
  {
    name: "Torta de Carnitas",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Guajolota",
    description: "Tamal served inside a bolillo roll — CDMX street classic",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Nachos",
    description: "Tortilla chips with melted cheese and toppings",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Nachos con Queso y Jalapeños",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Hot Dog",
    description: "Stadium frank with classic condiments",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Hot Dog Sonora Style",
    description: "Bacon-wrapped frank with pinto beans and toppings",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Burger",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Hamburguesa con Jalapeños",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Pizza",
    description: "Individual pizza slice or personal pie",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Quesadillas",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Sopes",
    description: "Thick corn base with beans, meat, and crema",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Flautas",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Tacos de Birria",
    fare: "Meals",
    vendor: "Estadio Azteca Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Esquites",
    description: "Corn in a cup with mayo, chili, and cheese",
    fare: "Snacks",
    vendor: "Estadio Azteca Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Elote en Vaso",
    description: "Street-style corn cup",
    fare: "Snacks",
    vendor: "Estadio Azteca Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Churros",
    fare: "Desserts",
    vendor: "Estadio Azteca Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "signature"]
  },
  {
    name: "Churros con Cajeta",
    fare: "Desserts",
    vendor: "Estadio Azteca Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Marquesitas",
    description: "Crispy rolled crepe with Edam cheese and sweet toppings",
    fare: "Desserts",
    vendor: "Estadio Azteca Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Paleta de Hielo",
    fare: "Desserts",
    vendor: "Estadio Azteca Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor"]
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

export async function parseEstadioAztecaMenu(
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
