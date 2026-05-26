/**
 * Petco Park (San Diego Padres) menu parser.
 *
 * Curated from the official Petco Park Food Guide covering New for 2026,
 * Taste of San Diego, Unique Flavors of Petco Park, and Special Diets
 * sections. Vendor concepts without explicit item names are imported at
 * the concept level; explicit items are imported individually.
 *
 * Source: https://www.mlb.com/padres/ballpark/food
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "petco-park";
const VENUE_NAME = "Petco Park";
const SOURCE_URL = "https://www.mlb.com/padres/ballpark/food";

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
  // ── New for 2026 ────────────────────────────────────────────────

  {
    name: "Curry Rice",
    description: "Japanese curry from Coco Ichibanya (CocoICHI)",
    fare: "Meals",
    vendor: "Coco Ichibanya",
    vendorHint: "Mercado near Section 104",
    tags: ["new-in-2026"]
  },
  {
    name: "Curry Buns",
    description: "Japanese curry-filled buns from CocoICHI",
    fare: "Snacks",
    vendor: "Coco Ichibanya",
    vendorHint: "Mercado near Section 104",
    tags: ["new-in-2026"]
  },
  {
    name: "Keema Cheese Fries",
    description: "Fries topped with Japanese keema curry and cheese",
    fare: "Snacks",
    vendor: "Coco Ichibanya",
    vendorHint: "Mercado near Section 104",
    tags: ["new-in-2026"]
  },
  {
    name: "Garlic Nan Bread",
    fare: "Snacks",
    vendor: "Coco Ichibanya",
    vendorHint: "Mercado near Section 104",
    tags: ["new-in-2026"]
  },
  {
    name: "Classic Chicken Pie",
    description: "Savory chicken pie baked in an all-butter crust",
    fare: "Meals",
    vendor: "Pop Pie Co.",
    vendorHint: "Power Alley near Section 129",
    tags: ["new-in-2026"]
  },
  {
    name: "Green Hog & Cheese Pie",
    description: "Savory pork and cheese pie baked in an all-butter crust",
    fare: "Meals",
    vendor: "Pop Pie Co.",
    vendorHint: "Power Alley near Section 129",
    tags: ["new-in-2026"]
  },
  {
    name: "Mashed Potatoes and Gravy",
    description: "Freshly made side from Pop Pie Co.",
    fare: "Snacks",
    vendor: "Pop Pie Co.",
    vendorHint: "Power Alley near Section 129",
    tags: ["new-in-2026"]
  },
  {
    name: "The Shortstop",
    description:
      "Braised beef short rib, Boursin aioli and au jus on a French roll with kettle chips",
    fare: "Meals",
    vendorHint: "Section 100, Home Plate Gate",
    tags: ["new-in-2026"]
  },
  {
    name: "Chili Cheese Dog",
    description:
      "House-made short rib chili, New School American cheese, onion, and all-beef frank",
    fare: "Meals",
    vendorHint: "Section 100, Home Plate Gate",
    tags: ["new-in-2026"]
  },
  {
    name: "Buffalo Braided Pretzel",
    description: "Braided pretzel with blue cheese ranch",
    fare: "Snacks",
    vendor: "Padre Pretzels",
    vendorHint: "Section 206, Terrace Level",
    tags: ["new-in-2026"]
  },
  {
    name: "Honey Mustard Braided Pretzel",
    description: "Braided pretzel with queso blanco",
    fare: "Snacks",
    vendor: "Padre Pretzels",
    vendorHint: "Section 206, Terrace Level",
    tags: ["new-in-2026"]
  },
  {
    name: "Classic Salted Braided Pretzel",
    description: "Braided pretzel with Bavarian brew mustard",
    fare: "Snacks",
    vendor: "Padre Pretzels",
    vendorHint: "Section 206, Terrace Level",
    tags: ["new-in-2026"]
  },
  {
    name: "S'mores Braided Pretzel",
    description:
      "Braided pretzel with chocolate, graham cracker crumble and marshmallow whipped cream",
    fare: "Desserts",
    vendor: "Padre Pretzels",
    vendorHint: "Section 206, Terrace Level",
    tags: ["new-in-2026"]
  },
  {
    name: "Cinnamon Sugar Pretzel Bites",
    description: "Pretzel bites with vanilla icing",
    fare: "Snacks",
    vendor: "Padre Pretzels",
    vendorHint: "Section 206, Terrace Level",
    tags: ["new-in-2026"]
  },
  {
    name: "Classic Salted Pretzel Bites",
    description: "Pretzel bites with cheese sauce",
    fare: "Snacks",
    vendor: "Padre Pretzels",
    vendorHint: "Section 206, Terrace Level",
    tags: ["new-in-2026"]
  },

  // ── Explicit Items (from Dietary / Vendor Sections) ─────────────

  {
    name: "Baja Lobster Roll",
    fare: "Meals",
    vendor: "Santa Maria Grill at Pacifico",
    vendorHint: "Power Alley near Section 129"
  },
  {
    name: "Baja Fish Taco",
    fare: "Meals",
    vendor: "Deckman's at the Draft",
    vendorHint: "Above Section 105"
  },
  {
    name: "Veggie Burger",
    description: "Available lettuce-wrapped for gluten-free",
    fare: "Meals",
    vendor: "Hodad's",
    vendorHint: "Sections 104, 131, 230, 300",
    dietary: ["Vegan", "Vegetarian"]
  },
  {
    name: "Veggie Roll",
    fare: "Meals",
    vendor: "Negihama Sushi",
    vendorHint: "Mercado near Section 104",
    dietary: ["Vegan", "Vegetarian"]
  },
  {
    name: "Berry Acai Bowl",
    fare: "Meals",
    vendor: "Sambazon",
    vendorHint: "Section 109",
    dietary: ["Vegan", "Vegetarian"]
  },
  {
    name: "Veggie Supreme Sandwich",
    fare: "Meals",
    vendor: "Board & Brew",
    vendorHint: "Section 211",
    dietary: ["Vegetarian"]
  },
  {
    name: "Kosher Hot Dog",
    fare: "Meals",
    vendor: "Seaside Market",
    vendorHint: "Section 105"
  },
  {
    name: "Chamoy Tajin Fruit Cup",
    description: "Fresh fruit cup seasoned with chamoy and Tajin",
    fare: "Snacks",
    vendor: "Puesto",
    vendorHint: "Section 204",
    dietary: ["Vegan"]
  },
  {
    name: "Banana Pudding",
    fare: "Desserts",
    vendor: "Seaside Market",
    vendorHint: "Section 105"
  },
  {
    name: "Veggie Pizza",
    fare: "Meals",
    vendor: "Gelati & Peccati",
    vendorHint: "Mercado near Section 104",
    dietary: ["Vegetarian"]
  },
  {
    name: "Roman-Style Cheese Pizza",
    fare: "Meals",
    vendor: "Gelati & Peccati",
    vendorHint: "Mercado near Section 104",
    dietary: ["Vegetarian"]
  },
  {
    name: "Garlic Fries",
    fare: "Snacks",
    vendor: "Gaglione Brothers",
    vendorHint: "Section 124",
    dietary: ["Gluten Free"]
  },
  {
    name: "Nachos",
    fare: "Snacks",
    vendorHint: "Ballpark Eats, various locations",
    dietary: ["Vegetarian", "Gluten Free"]
  },
  {
    name: "Soft Serve Ice Cream",
    fare: "Desserts",
    vendor: "Mister Softee / Ballpark Eats",
    vendorHint: "Sections 109, 133, and various locations",
    dietary: ["Gluten Free"]
  },

  // ── Taste of San Diego (Concept-Level Vendor Imports) ───────────

  {
    name: "Carnitas Snack Shack",
    description: "Iconic San Diego carnitas restaurant",
    fare: "Meals",
    vendor: "Carnitas Snack Shack",
    vendorHint: "Sections 130, 319"
  },
  {
    name: "Gaglione Brothers",
    description: "Famous San Diego cheesesteaks",
    fare: "Meals",
    vendor: "Gaglione Brothers",
    vendorHint: "Section 124"
  },
  {
    name: "Grand Ole BBQ",
    description: "San Diego BBQ pit",
    fare: "Meals",
    vendor: "Grand Ole BBQ",
    vendorHint: "Gallagher Square"
  },
  {
    name: "Hodad's",
    description: "Legendary Ocean Beach burger joint",
    fare: "Meals",
    vendor: "Hodad's",
    vendorHint: "Sections 104, 131, 230, 300"
  },
  {
    name: "Jack in the Box",
    fare: "Meals",
    vendor: "Jack in the Box",
    vendorHint: "Section 323"
  },
  {
    name: "Negihama Sushi",
    description: "Fresh sushi and rolls featuring local catches",
    fare: "Meals",
    vendor: "Negihama Sushi",
    vendorHint: "Mercado near Section 104"
  },
  {
    name: "Pizza Port",
    description: "San Diego craft pizza",
    fare: "Meals",
    vendor: "Pizza Port",
    vendorHint: "Sections 121, 213, 311, 320"
  },
  {
    name: "Puesto",
    description: "Mexican street food and tacos with fresh corn tortillas",
    fare: "Meals",
    vendor: "Puesto",
    vendorHint: "Sections 119, 120, 202",
    dietary: ["Gluten Free"]
  },
  {
    name: "Spiro's Mediterranean",
    description: "Mediterranean cuisine",
    fare: "Meals",
    vendor: "Spiro's Mediterranean",
    vendorHint: "Section 124"
  },
  {
    name: "Randy Jones Grill",
    description: "Grill named for Padres legend Randy Jones",
    fare: "Meals",
    vendor: "Randy Jones Grill",
    vendorHint: "Sections 118, 305, 306, 323"
  },
  {
    name: "San Diego's Finest Hot Chicken",
    description: "Nashville-style hot chicken",
    fare: "Meals",
    vendor: "San Diego's Finest Hot Chicken",
    vendorHint: "Section 316"
  },

  // ── Dessert Concepts ────────────────────────────────────────────

  {
    name: "An's Field Services Gelato",
    description: "Artisan gelato",
    fare: "Desserts",
    vendor: "An's Field Services Gelato",
    vendorHint: "Mercado near Section 104",
    dietary: ["Vegetarian"]
  },
  {
    name: "Mini Donut Company",
    description: "Freshly made mini donuts",
    fare: "Desserts",
    vendor: "Mini Donut Company",
    vendorHint: "Section 107"
  },
  {
    name: "Frozen Friar",
    description: "Frozen treats and desserts",
    fare: "Desserts",
    vendorHint: "Section 228"
  }
];

function toSourceItem(raw: RawItem): VenueMenuSourceItem {
  return {
    name: raw.name,
    description: raw.description,
    fare: raw.fare,
    category: "Food",
    vendorName: raw.vendor,
    vendorLocationHint: raw.vendorHint,
    dietaryTags: raw.dietary ?? [],
    sourceUrl: SOURCE_URL
  };
}

export async function parsePetcoParkMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;
  const items: VenueMenuSourceItem[] = MENU_DATA.map(toSourceItem);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
