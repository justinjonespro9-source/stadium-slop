/**
 * Rate Field (Chicago White Sox) menu parser.
 *
 * Source: https://www.mlb.com/whitesox/ballpark/concessions
 * Curated static dataset from the official White Sox concessions page.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "guaranteed-rate-field";
const VENUE_NAME = "Rate Field";
const SOURCE_URL = "https://www.mlb.com/whitesox/ballpark/concessions";

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
  // ── What's New — NEW FOR 2026 ─────────────────────────────────

  {
    name: "35th St. Muffaletta",
    description:
      "Dry-cured salami, mortadella, prosciutto, provolone, house-giardiniera olive spread on sun-dried tomato focaccia",
    fare: "Meals",
    vendor: "DB Kaplan's Express",
    vendorHint: "Section 330, Stadium Club Bar",
    tags: ["New in 2026"]
  },
  {
    name: "All-Star Chicago Lineup",
    description:
      "Sampler platter: Vienna Chicago-style hot dog, charred kielbasa with caramelized onion & mustard, Buona Italian beef with sweet peppers & giardiniera, Garrett Stadium buttery popcorn",
    fare: "Meals",
    vendor: "Chicago Bites Rotating Portable",
    vendorHint: "The Rotation — Sections 320 & 344",
    tags: ["New in 2026"]
  },
  {
    name: "Arepa Burger",
    description:
      "Corn griddle cakes with honey-glazed pork belly, sofrito, coleslaw, garlic aioli, aji sauce",
    fare: "Meals",
    vendor: "Polombia/Fusion",
    vendorHint: "Section 152, also 518 (500 Level)",
    tags: ["New in 2026"]
  },
  {
    name: "Bridgeport Taqueria",
    description:
      "Barbacoa, chicken tinga, and mushroom al pastor street tacos with chopped onion, cilantro, tortilla chips, elote",
    fare: "Meals",
    vendor: "Chicago Bites Rotating Portable",
    vendorHint: "The Rotation — Sections 320 & 344",
    tags: ["New in 2026"]
  },
  {
    name: "Campfire Milkshake 2",
    description: "2026 edition of the viral Campfire Milkshake",
    fare: "Desserts",
    vendor: "Topo Chico Hard Seltzer Cantina",
    vendorHint: "Section 159",
    tags: ["New in 2026"]
  },
  {
    name: "Chicken & Waffle",
    description:
      "Belgian Liège waffle, house-buttermilk fried chicken, local honey, seasonal fruit, DB Kaplan's latkes",
    fare: "Meals",
    vendor: "Stadium Club Bar",
    tags: ["New in 2026"]
  },
  {
    name: "Crispy Chicken Wings & Fries",
    description:
      "Crispy wings with fries; sauces: Buffalo, Mango Habanero, Garlic Parmesan, Lemon Pepper",
    fare: "Meals",
    vendor: "Wingman",
    vendorHint: "Section 101; also Leinenkugel's / Patio",
    tags: ["New in 2026"]
  },
  {
    name: "Fajita Dog",
    description:
      "Foot-long Vienna beef hot dog, sautéed onions, sautéed peppers, avocado crema",
    fare: "Meals",
    vendor: "Specialty Hot Dogs",
    vendorHint: "Section 113",
    tags: ["New in 2026"]
  },
  {
    name: "Jibarito",
    description:
      "Fried plantain sandwich with steak, lettuce, tomato, cheese, special sauce",
    fare: "Meals",
    vendor: "Jibaritos",
    vendorHint: "Sections 102, 104",
    tags: ["New in 2026"]
  },
  {
    name: "Korean Dog",
    description:
      "Vienna beef hot dog, hash browns, chipotle ketchup (\"Papas Freedom\")",
    fare: "Meals",
    vendor: "Lucky's",
    vendorHint: "Section 154",
    tags: ["New in 2026"]
  },
  {
    name: "Machete",
    description:
      "Giant quesadilla with chicken chorizo, queso Oaxaca, orange salsa; vegetarian option available",
    fare: "Meals",
    vendor: "Machete",
    vendorHint: "Section 111",
    tags: ["New in 2026"]
  },
  {
    name: "Mrs. Levy's Original Carrot Cake",
    description: "Cream cheese frosting and toasted coconut",
    fare: "Desserts",
    vendor: "DB Kaplan's Express",
    vendorHint: "Section 330",
    tags: ["New in 2026"]
  },
  {
    name: "Puerto Rican Rice Bowl",
    description:
      "Puerto Rican rice with grilled steak or roasted pork, jalapeños, hot sauce, sofrito aioli, pickled onions",
    fare: "Meals",
    vendor: "La Esquinita Boricus",
    vendorHint: "Section 155",
    tags: ["New in 2026"]
  },
  {
    name: "Rainbow Bubble Waffle",
    description: "Vanilla ice cream, gummy bears, Nerd Clusters, sprinkles",
    fare: "Desserts",
    vendor: "Lucky's",
    vendorHint: "Section 154",
    tags: ["New in 2026"]
  },
  {
    name: "Roast Pork Sandwich",
    description:
      "Seared garlic broccoli rabe, sharp provolone, au jus on sesame semolina hoagie roll",
    fare: "Meals",
    vendor: "Stadium Club Bar",
    tags: ["New in 2026"]
  },
  {
    name: "Rosie's BBQ",
    description:
      "House-smoked pulled pork sliders with coleslaw & crispy onions, kettle chips, three-cheese mac & cheese",
    fare: "Meals",
    vendor: "Chicago Bites Rotating Portable",
    vendorHint: "The Rotation — Sections 320 & 344",
    tags: ["New in 2026"]
  },
  {
    name: "Soba Noodle Stir Fry",
    description:
      "Chili crunch marinade, carrots, mushrooms, cabbage, sesame seeds",
    fare: "Meals",
    vendor: "Lucky's",
    vendorHint: "Section 154",
    tags: ["New in 2026"]
  },
  {
    name: "Street Wok",
    description: "Wok-fired chicken and vegetable lo mein in sweet & tangy sauce",
    fare: "Meals",
    vendor: "Chicago Bites Rotating Portable",
    vendorHint: "The Rotation — Sections 320 & 344",
    tags: ["New in 2026"]
  },
  {
    name: "The Southside Supreme",
    description:
      "Beggars home-plate pizza topped with sausage, Buona Italian beef, peppers, onions, giardiniera",
    fare: "Meals",
    vendor: "Skyline Bar",
    vendorHint: "Section 354; also Club Level in-seat service",
    tags: ["New in 2026"]
  },
  {
    name: "Tonkatsu Dog",
    description:
      "Vienna beef hot dog, panko, kewpie mayo, teriyaki sauce, bonito flakes",
    fare: "Meals",
    vendor: "Lucky's",
    vendorHint: "Section 154",
    tags: ["New in 2026"]
  },
  {
    name: "Turkey in the Slaw",
    description:
      "House-roasted turkey, applewood smoked bacon, sharp cheddar, Louie dressing, Mrs. Levy's coleslaw on challah bread",
    fare: "Meals",
    vendor: "DB Kaplan's Express",
    vendorHint: "Section 330, Stadium Club Bar",
    tags: ["New in 2026"]
  },
  {
    name: "Two Bagger Smash Burger",
    description:
      "1/2-lb beef patty, Vienna beef sausage, guacamole, grilled jalapeño, poblano-aioli slaw",
    fare: "Meals",
    vendor: "Gourmet Burgers / Burger Barn",
    vendorHint: "Sections 126, 534",
    tags: ["New in 2026"]
  },

  // ── Specialty Concessions ──────────────────────────────────────

  {
    name: "Cuban Hoagie",
    fare: "Meals",
    vendor: "Cuban Sandwich Portable",
    vendorHint: "Sections 148, 536"
  },
  {
    name: "Fuku OG Chicken Sandwich",
    fare: "Meals",
    vendor: "Sweet and Savory Stand",
    vendorHint: "Section 110"
  },
  {
    name: "Fuku OG Chicken Tenders",
    fare: "Meals",
    vendor: "Sweet and Savory Stand",
    vendorHint: "Section 110"
  },
  {
    name: "Pineapple Slaw Dog",
    fare: "Meals",
    vendor: "Specialty Hot Dogs",
    vendorHint: "Section 113"
  },
  {
    name: "Sal Chi Papa",
    fare: "Meals",
    vendor: "Polombia/Fusion",
    vendorHint: "Sections 152, 518"
  },
  {
    name: "Short Rib Emparogi",
    description: "Empanada-pierogi fusion with short rib",
    fare: "Meals",
    vendor: "Polombia/Fusion",
    vendorHint: "Sections 152, 518"
  },
  {
    name: "Sonoran Dog",
    fare: "Meals",
    vendor: "Specialty Hot Dogs",
    vendorHint: "Section 113"
  },
  {
    name: "Vegetarian Emparogi",
    description: "Empanada-pierogi fusion, vegetarian",
    fare: "Meals",
    vendor: "Polombia/Fusion",
    vendorHint: "Sections 152, 518",
    dietary: ["Vegetarian"]
  },
  {
    name: "Veggie Arepa Burger",
    fare: "Meals",
    vendor: "Polombia/Fusion",
    vendorHint: "Sections 152, 518",
    dietary: ["Vegetarian"]
  },
  {
    name: "La Calle Taqueria Street Tacos",
    description:
      "3 corn street tacos (2 chicken, 1 barbacoa), tortilla chips, elotes salad",
    fare: "Meals",
    vendor: "Chicago Bites Rotating Portable",
    vendorHint: "The Rotation — Sections 320 & 344"
  },

  // ── Hot Dogs ───────────────────────────────────────────────────

  {
    name: "Classic Vienna Hot Dog",
    fare: "Meals",
    vendorHint:
      "Throughout — 100/300/500 Levels, Skyline Bar, In-Seat Service"
  },
  {
    name: "Comiskey Dog",
    fare: "Meals",
    vendorHint: "Sections 109, 123, 155 (100), 524, 538, 544 (500)"
  },
  {
    name: "Corn Dog",
    fare: "Snacks",
    vendorHint: "Sections 113, 154, 531"
  },
  {
    name: "Impossible Dog",
    fare: "Meals",
    vendorHint: "Sections 102, 112, 130, 152, 160, 538",
    dietary: ["Vegan"]
  },
  {
    name: "GF Hot Dog",
    description: "Gluten-free hot dog",
    fare: "Meals",
    vendorHint: "Classic Stands — Sections 112, 130, 152, 538",
    dietary: ["Gluten Free"]
  },

  // ── Burgers ────────────────────────────────────────────────────

  {
    name: "Comiskey Burger",
    fare: "Meals",
    vendor: "Burger Barn",
    vendorHint: "Sections 126, 534"
  },
  {
    name: "Steakburger",
    fare: "Meals",
    vendor: "Skyline Bar",
    vendorHint: "Section 354"
  },
  {
    name: "Impossible Burger",
    fare: "Meals",
    vendorHint: "Grill Stands — Sections 122, 140, 160, 544; 300 Level 329, 346",
    dietary: ["Vegetarian"]
  },

  // ── Nachos ─────────────────────────────────────────────────────

  {
    name: "Helmet Nachos",
    description: "Loaded: beef, chicken, or plant-based chorizo",
    fare: "Meals",
    vendor: "Buenos Nachos",
    vendorHint:
      "Sections 123, 153, 160 (100), 329, 346, 354 (300), 529 (500)"
  },
  {
    name: "Nachos & Cheese",
    fare: "Snacks",
    vendorHint:
      "Sections 116, 145, 156, 164 (100), 329, 346 (300), 526, 534, 546, 550 (500)"
  },

  // ── Chicken ────────────────────────────────────────────────────

  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendorHint:
      "Sections 110, 122, 140, 160 (100), 329, 346, 354 (300), 544 (500)"
  },
  {
    name: "Vegan Chicken Tenders Basket",
    fare: "Meals",
    vendorHint: "Grill Stands — Sections 122, 544",
    dietary: ["Vegan"]
  },

  // ── Sausage / Brats ────────────────────────────────────────────

  {
    name: "Bratwurst",
    fare: "Meals",
    vendorHint:
      "Sections 102, 112, 115, 130, 139, 160 (100), 510, 528, 555 (500)"
  },
  {
    name: "Italian Sausage",
    fare: "Meals",
    vendorHint: "Sections 115, 139, 152 (100), 528 (500)"
  },
  {
    name: "Polish Sausage",
    fare: "Meals",
    vendorHint:
      "Sections 102, 112, 120, 130, 131, 150, 152, 160 (100), 510, 524, 531, 538, 555 (500)"
  },
  {
    name: "Footlong Polish Sausage",
    fare: "Meals",
    vendorHint: "300 Level — Sections 329 & 346"
  },

  // ── Sandwiches ─────────────────────────────────────────────────

  {
    name: "Italian Beef",
    fare: "Meals",
    vendorHint: "Sections 120, 149, 163 (100), 533 (500)"
  },
  {
    name: "Buona Italian Beef",
    fare: "Meals",
    vendor: "Buona",
    vendorHint: "300 Level — Sections 329 & 346"
  },
  {
    name: "Corned Beef Sandwich",
    fare: "Meals",
    vendorHint: "Section 109"
  },
  {
    name: "Turkey Club",
    fare: "Meals",
    vendorHint: "Section 109"
  },
  {
    name: "Veggie Sandwich",
    fare: "Meals",
    vendorHint: "Carvery — Section 109",
    dietary: ["Vegetarian"]
  },

  // ── Beggars Pizza ──────────────────────────────────────────────

  {
    name: "Beggars Cheese Pizza Slice",
    fare: "Meals",
    vendor: "Beggars Pizza",
    vendorHint: "Skyline Bar 354, Pizza Stands 124, 163, 522"
  },
  {
    name: "Beggars Pepperoni Pizza Slice",
    fare: "Meals",
    vendor: "Beggars Pizza",
    vendorHint: "Skyline Bar 354, Pizza Stands 124, 163, 522"
  },
  {
    name: "Beggars Home Plate Personal Pizza",
    description:
      "Italian beef, sausage, onion, peppers, giardiniera — home-plate shaped",
    fare: "Meals",
    vendor: "Beggars Pizza",
    vendorHint: "Skyline Bar 354; also In-Seat Service"
  },
  {
    name: "Beggars Gluten Free Cheese Pizza",
    fare: "Meals",
    vendor: "Beggars Pizza",
    vendorHint: "Skyline Bar 354, Pizza Stands 124, 163, 522",
    dietary: ["Gluten Free"]
  },

  // ── BBQ (Section 101) ─────────────────────────────────────────

  {
    name: "BBQ Sandwich",
    fare: "Meals",
    vendor: "Smokehouse",
    vendorHint: "Section 101"
  },
  {
    name: "BBQ Nachos",
    fare: "Snacks",
    vendor: "Smokehouse",
    vendorHint: "Section 101"
  },
  {
    name: "BBQ Mac & Cheese",
    fare: "Meals",
    vendor: "Smokehouse",
    vendorHint: "Section 101"
  },

  // ── Leinenkugel's Craft Lodge / Patio ──────────────────────────

  {
    name: "5-4-3=2 Bacon Cheddar Burger",
    fare: "Meals",
    vendor: "Leinenkugel's Craft Lodge / Patio",
    vendorHint: "Field Level via Section 107"
  },
  {
    name: "Chicken Parmesan Sandwich",
    fare: "Meals",
    vendor: "Leinenkugel's Craft Lodge / Patio",
    vendorHint: "Field Level via Section 107"
  },
  {
    name: "Breaded Fried Mushrooms",
    fare: "Snacks",
    vendor: "Leinenkugel's Craft Lodge / Patio",
    vendorHint: "Field Level via Section 107"
  },
  {
    name: "Italian Combo Sausage & Beef",
    fare: "Meals",
    vendor: "Leinenkugel's Craft Lodge / Patio",
    vendorHint: "Field Level via Section 107"
  },
  {
    name: "Mozzarella Sticks",
    fare: "Snacks",
    vendor: "Leinenkugel's Craft Lodge / Patio",
    vendorHint: "Field Level via Section 107"
  },
  {
    name: "Nacho Supreme",
    fare: "Snacks",
    vendor: "Leinenkugel's Craft Lodge / Patio",
    vendorHint: "Field Level via Section 107"
  },
  {
    name: "Battered Onion Rings",
    fare: "Snacks",
    vendor: "Leinenkugel's Craft Lodge / Patio",
    vendorHint: "Field Level via Section 107"
  },
  {
    name: "Southside Burger",
    fare: "Meals",
    vendor: "Leinenkugel's Craft Lodge / Patio",
    vendorHint: "Field Level via Section 107"
  },
  {
    name: "The Clean Up Pizza Burger",
    fare: "Meals",
    vendor: "Leinenkugel's Craft Lodge / Patio",
    vendorHint: "Field Level via Section 107"
  },
  {
    name: "Veeck as in Wreck",
    fare: "Meals",
    vendor: "Leinenkugel's Craft Lodge / Patio",
    vendorHint: "Field Level via Section 107"
  },
  {
    name: "Wild Pitch Burger",
    fare: "Meals",
    vendor: "Leinenkugel's Craft Lodge / Patio",
    vendorHint: "Field Level via Section 107"
  },

  // ── Fries ──────────────────────────────────────────────────────

  {
    name: "Combo Fries",
    fare: "Snacks",
    vendor: "Skyline Bar",
    vendorHint: "Section 354"
  },
  {
    name: "Loaded Fries",
    fare: "Snacks",
    vendorHint: "Sweet and Savory Stand 110, Section 524"
  },

  // ── Hispanic / Latin ───────────────────────────────────────────

  {
    name: "Churros",
    fare: "Desserts",
    vendorHint: "Sections 127, 135, 158, 535"
  },
  {
    name: "Elote",
    fare: "Snacks",
    vendorHint: "Sections 104, 127, 144, 526"
  },
  {
    name: "Tacos",
    fare: "Meals",
    vendorHint: "Tacos Portable — Sections 139, 157"
  },
  {
    name: "Torta",
    fare: "Meals",
    vendorHint: "Tacos Portable — Sections 139, 157"
  },
  {
    name: "Empanadas",
    fare: "Snacks",
    vendorHint: "Section 160"
  },
  {
    name: "Quesadilla",
    fare: "Meals",
    vendorHint: "Section 111"
  },

  // ── Other Food ─────────────────────────────────────────────────

  {
    name: "Pierogies",
    fare: "Snacks",
    vendorHint: "Hot Dog Portables — Sections 120, 131, 150"
  },
  {
    name: "Mac & Cheese",
    fare: "Meals",
    vendor: "Smokehouse",
    vendorHint: "Section 101"
  },
  {
    name: "Fried Pickles",
    fare: "Snacks",
    vendorHint: "Sweet and Savory Stand 110, Section 524"
  },

  // ── Desserts / Sweets ──────────────────────────────────────────

  {
    name: "Funnel Cake",
    fare: "Desserts",
    vendorHint: "Sections 113, 154, 531"
  },
  {
    name: "Rainbow Cone",
    fare: "Desserts",
    vendorHint: "Sections 114, 524"
  },
  {
    name: "Italian Ice",
    description: "Seasonal item",
    fare: "Desserts",
    vendorHint: "Sections 121, 145"
  },
  {
    name: "Mini Melts Ice Cream",
    fare: "Desserts",
    vendorHint: "Sections 102, 136, 156, 535"
  }
];

export async function parseRateFieldMenu(
  _sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const items: VenueMenuSourceItem[] = [];

  for (const raw of MENU_DATA) {
    const dietaryTags = raw.dietary ?? [];
    const extraTags = raw.tags ?? [];

    items.push({
      name: raw.name,
      description: raw.description,
      fare: raw.fare,
      category: "Food",
      vendorName: raw.vendor,
      vendorLocationHint: raw.vendorHint,
      dietaryTags,
      sourceUrl: SOURCE_URL
    });

    if (extraTags.length > 0) {
      const last = items[items.length - 1];
      last.dietaryTags = [
        ...dietaryTags,
        ...extraTags.filter((t): t is VenueMenuDietaryTag =>
          ["Gluten Free", "Lactose Free", "Vegan", "Vegetarian"].includes(t)
        )
      ];
    }
  }

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
