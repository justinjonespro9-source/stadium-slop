/**
 * Estadio Akron (Guadalajara — FIFA World Cup 2026) menu parser.
 *
 * Curated from regional Jalisco stadium fare and World Cup planning guides.
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

const VENUE_SLUG = "estadio-akron";
const VENUE_NAME = "Estadio Akron";
const SOURCE_URL =
  "https://stadiumslop.com/world-cup-stadium-food-guide#estadio-akron";

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
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "signature"]
  },
  {
    name: "Tacos al Pastor",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Tacos de Birria",
    description: "Braised beef tacos — Jalisco staple",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Birria Quesadilla",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Tortas",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "signature"]
  },
  {
    name: "Torta Ahogada",
    description: "Birote roll with carnitas drowned in spicy tomato sauce",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Nachos",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Hot Dog",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Burger",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Pizza",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup"]
  },
  {
    name: "Pozole Jalisciense",
    description: "Hominy stew cup — regional match-day option",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Carne en su Jugo",
    description: "Beef simmered in bacon-and-bean broth with tortillas",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Esquites",
    fare: "Snacks",
    vendor: "Estadio Akron Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Elote Preparado",
    fare: "Snacks",
    vendor: "Estadio Akron Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Churros",
    fare: "Desserts",
    vendor: "Estadio Akron Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "signature"]
  },
  {
    name: "Jericalla",
    description: "Baked Jalisco custard dessert",
    fare: "Desserts",
    vendor: "Estadio Akron Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Quesabirria",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "local-vendor", "signature"]
  },
  {
    name: "Tostadas de Pescado",
    description: "Crispy tostada with fish and cabbage slaw",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Lonche de Pierna",
    description: "Pork leg sandwich on bolillo",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Empanadas de Cajeta",
    fare: "Desserts",
    vendor: "Estadio Akron Concessions",
    dietary: ["Vegetarian"],
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Sopes",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
    tags: ["world-cup", "local-vendor"]
  },
  {
    name: "Flautas Doradas",
    fare: "Meals",
    vendor: "Estadio Akron Concessions",
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

export async function parseEstadioAkronMenu(
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
