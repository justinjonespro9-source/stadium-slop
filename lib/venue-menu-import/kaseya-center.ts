/**
 * Kaseya Center (Miami Heat — NBA) menu parser.
 *
 * Curated from the official Kaseya Center food & beverage page and Heat
 * concessions announcements. Alcohol lounges and beverage-only rows excluded.
 *
 * Source:
 *   https://www.kaseyacenter.com/plan-your-visit/food-beverage
 *
 * Re-verify each season to pick up menu changes.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "kaseya-center";
const VENUE_NAME = "Kaseya Center";
const SOURCE_URL = "https://www.kaseyacenter.com/plan-your-visit/food-beverage";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function sectionHint(section: string): string {
  return `Section ${section}`;
}

const MENU_DATA: RawItem[] = [
  {
    name: "The Wagyu Tequeño Dog",
    description: "Wagyu beef dog with potato stix, cilantro, and passion fruit-pineapple salsa",
    fare: "Meals",
    vendor: "601 Miami",
    vendorHint: "AT&T East Plaza",
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "Nachos Encendidos",
    description: "Wonton chips with ropa vieja and aji amarillo cheese crema",
    fare: "Meals",
    vendor: "601 Miami",
    vendorHint: sectionHint("601"),
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "Queso Frito Slider",
    description: "Griddled queso blanco with guava-bacon maduros and beef slider patty",
    fare: "Meals",
    vendor: "Bacardi Ocho Lounge",
    vendorHint: "Suite level",
    tags: ["nba", "signature"]
  },
  {
    name: "Chicharrón Arepa",
    description: "Crispy corn arepa infused with chicharrones and local fillings",
    fare: "Meals",
    vendor: "601 Miami",
    vendorHint: "AT&T East Plaza",
    tags: ["nba", "signature", "local-vendor"]
  },
  {
    name: "Skinny Louie",
    description: "2025 Burger Bash champion smash burgers",
    fare: "Meals",
    vendor: "Skinny Louie",
    vendorHint: `${sectionHint("105")}; ${sectionHint("120")}; ${sectionHint("308")}; ${sectionHint("324")}`,
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Skinny Louie Smash Burger",
    description: "100% fresh Black Angus smash patty with crispy fries",
    fare: "Meals",
    vendor: "Skinny Louie",
    vendorHint: sectionHint("105"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Tacotomia",
    description: "Chef Karla Hoyos street tacos and quesadillas",
    fare: "Meals",
    vendor: "Tacotomia",
    vendorHint: `${sectionHint("124")}; ${sectionHint("304")}`,
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Tacotomia Street Tacos",
    fare: "Meals",
    vendor: "Tacotomia",
    vendorHint: sectionHint("124"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Tacotomia Chicken Quesadilla",
    fare: "Meals",
    vendor: "Tacotomia",
    vendorHint: sectionHint("124"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Vice City Smokehouse",
    description: "North Carolina-style low-and-slow barbecue",
    fare: "Meals",
    vendor: "Vice City Smokehouse",
    vendorHint: `${sectionHint("117")}; ${sectionHint("406")}`,
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Vice City Smoked Brisket Plate",
    description: "Brisket with white cheddar mac, jalapeño cornbread, and family-recipe sauce",
    fare: "Meals",
    vendor: "Vice City Smokehouse",
    vendorHint: sectionHint("117"),
    tags: ["nba", "local-vendor", "signature"]
  },
  {
    name: "Chicken Ciao",
    description: "Buttermilk chicken tenders and waffle fries",
    fare: "Meals",
    vendor: "Chicken Ciao",
    vendorHint: `${sectionHint("108")}; ${sectionHint("117")}; ${sectionHint("309")}; ${sectionHint("325")}`,
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Chicken Ciao Chicken Tenders",
    fare: "Meals",
    vendor: "Chicken Ciao",
    vendorHint: sectionHint("108"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "Chicken Ciao Waffle Fries",
    fare: "Meals",
    vendor: "Chicken Ciao",
    vendorHint: sectionHint("108"),
    tags: ["nba", "local-vendor"]
  },
  {
    name: "FIT Cart Vegan Plus",
    description: "Plant-powered bowls and dairy-free taco alternatives",
    fare: "Meals",
    vendor: "FIT Cart Vegan Plus",
    vendorHint: sectionHint("105"),
    dietary: ["Vegetarian", "Vegan"],
    tags: ["nba"]
  },
  {
    name: "FIT Cart Plant-Based Bowl",
    fare: "Meals",
    vendor: "FIT Cart Vegan Plus",
    vendorHint: sectionHint("105"),
    dietary: ["Vegetarian", "Vegan"],
    tags: ["nba"]
  },
  {
    name: "Flaming Hot Family Fun Zone",
    description: "Upper-concourse family value hub",
    fare: "Meals",
    vendor: "Flaming Hot Family Fun Zone",
    vendorHint: sectionHint("315"),
    tags: ["nba"]
  },
  {
    name: "Papa Johns Personal Pepperoni Pizza",
    fare: "Meals",
    vendor: "Papa Johns",
    vendorHint: "Multiple concourse locations",
    tags: ["nba"]
  },
  {
    name: "Loaded Nachos",
    fare: "Meals",
    vendor: "Kaseya Center Concessions",
    vendorHint: "Main concourse",
    tags: ["nba"]
  },
  {
    name: "Chocolate Chip Cookie",
    fare: "Desserts",
    vendor: "Kaseya Center Concessions",
    vendorHint: "Main concourse",
    dietary: ["Vegetarian"],
    tags: ["nba"]
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

export async function parseKaseyaCenterMenu(
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
