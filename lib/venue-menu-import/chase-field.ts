/**
 * Chase Field (Arizona Diamondbacks) menu parser.
 *
 * Curated from multiple official subpages under the Chase Field Dining Guide:
 *   - Concessions Guide (food tables, dietary options, Hispanic items)
 *   - Dining Locations (vendor descriptions)
 *   - New Items (2026 new additions with descriptions)
 *   - Desserts (vendor-specific dessert listings)
 *   - Value Items
 *   - Dietary Options (avoiding gluten, vegetarian, vegan)
 *
 * Source: https://www.mlb.com/dbacks/ballpark/dining-concessions
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "chase-field";
const VENUE_NAME = "Chase Field";
const SOURCE_URL =
  "https://www.mlb.com/dbacks/ballpark/dining-concessions";

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
  // ── Hot Dogs (Big Dawgs 105/324, A-Zona 207, etc.) ────────────

  {
    name: "D-backs Dog",
    fare: "Meals",
    vendorHint:
      "All DoubleHeaders; A-Zona Street Tacos 207; Bases Loaded! 109; BatFlip 118; Churro Dog HQ 129/324; D-backs BBQ Alley 114; Four Peaks 139; Gonzo's 142; Grand Canyon 214; Red Hot 312/322; Sandlot 332"
  },
  {
    name: "Sonoran Dog",
    description: "Bacon-wrapped hot dog with pinto beans, onions, tomatoes, jalapeño sauce, mustard, mayo",
    fare: "Meals",
    vendor: "A-Zona Street Tacos / Taste of Chase",
    vendorHint: "A-Zona 207; Taste of Chase 130"
  },
  {
    name: "Vs. Dog",
    description: "Footlong hot dog that changes with each opponent",
    fare: "Meals",
    vendor: "Big Dawgs",
    vendorHint: "Sections 105, 324",
    tags: ["new-in-2026"]
  },
  {
    name: "Char Dog",
    fare: "Meals",
    vendor: "Big Dawgs",
    vendorHint: "A-Zona 207; Big Dawgs 105/324; Taste of Chase 130"
  },
  {
    name: "Home Team Dog",
    fare: "Meals",
    vendor: "Big Dawgs",
    vendorHint: "Sections 105, 324"
  },
  {
    name: "Chili Cheese Dog",
    fare: "Meals",
    vendor: "Big Dawgs",
    vendorHint: "Sections 105, 324"
  },
  {
    name: "Hot Dog Flight",
    description: "Home Team Dog, Vs. Dog, and Char Dog on a bed of crispy fries",
    fare: "Meals",
    vendor: "Big Dawgs",
    vendorHint: "Sections 105, 324",
    tags: ["new-in-2026"]
  },
  {
    name: "Footlong Beer Cheese Dog",
    description: "Beer cheese, bacon, crispy onion on a footlong dog",
    fare: "Meals",
    vendor: "Grand Canyon Grill",
    vendorHint: "Section 214 (Diamond Level)",
    tags: ["new-in-2026"]
  },
  {
    name: "Avoiding Gluten Dog",
    fare: "Meals",
    vendorHint: "A-Zona 207; Big Dawgs 105/324; Four Peaks 139",
    dietary: ["Gluten Free"]
  },
  {
    name: "Value Dog",
    description: "$2.99 value hot dog",
    fare: "Meals",
    vendorHint: "All DoubleHeaders; Sandlot Snacks 332",
    tags: ["value-menu"]
  },

  // ── Burgers (Bat Flip 118, Grand Canyon 214, Red Hot 312/320) ─

  {
    name: "Bacon Classic Smash Burger",
    description: "Sliced American cheese, bacon, dill pickles, signature sauce",
    fare: "Meals",
    vendor: "Bat Flip Burgers",
    vendorHint: "Section 118",
    tags: ["new-in-2026"]
  },
  {
    name: "Beyond Burger",
    description: "Beyond beef, plant-based American cheese, vegan secret sauce, pickles",
    fare: "Meals",
    vendor: "Bat Flip Burgers",
    vendorHint: "Section 118",
    dietary: ["Vegan"],
    tags: ["new-in-2026"]
  },
  {
    name: "Cheeseburger",
    fare: "Meals",
    vendor: "Red Hot Grill",
    vendorHint: "Sections 312, 320",
    tags: ["new-in-2026"]
  },

  // ── BBQ (D-backs BBQ Alley 114) ────────────────────────────────

  {
    name: "Barbecue Brigade",
    description: "Shareable: brisket burnt ends, baby back ribs, pulled pork loaded potato, slaw, beer pickled onions, pickles, mac and cheese",
    fare: "Meals",
    vendor: "D-backs BBQ Alley",
    vendorHint: "Section 114",
    tags: ["new-in-2026"]
  },
  {
    name: "BBQ Sandwich",
    description: "Brisket or pulled pork sandwich",
    fare: "Meals",
    vendor: "D-backs BBQ Alley",
    vendorHint: "Section 114"
  },
  {
    name: "BBQ Loaded Baked Potato",
    description: "Burnt end brisket or pulled pork on loaded baked potato",
    fare: "Meals",
    vendor: "D-backs BBQ Alley",
    vendorHint: "Section 114",
    dietary: ["Gluten Free"]
  },
  {
    name: "BBQ Mac and Cheese",
    description: "Burnt end brisket or pulled pork on mac and cheese",
    fare: "Meals",
    vendor: "D-backs BBQ Alley",
    vendorHint: "Section 114",
    tags: ["new-in-2026"]
  },

  // ── Sandwiches ─────────────────────────────────────────────────

  {
    name: "BQ Philly Sandwich",
    description: "Chopped smoked brisket, toasted hoagie roll, rajas, habanero queso, Pico de Gallo",
    fare: "Meals",
    vendor: "Taste of Chase",
    vendorHint: "Section 130",
    tags: ["new-in-2026"]
  },
  {
    name: "Hot Pastrami Sandwich",
    description: "Pastrami, pickles, mustard, on a hoagie roll",
    fare: "Meals",
    vendor: "Jefferson Street Deli",
    vendorHint: "Section 120",
    tags: ["new-in-2026"]
  },
  {
    name: "Big Bella Sandwich",
    description: "Mortadella, mozzarella, pistachio cream, arugula, chopped pistachio, EVOO, sea salt",
    fare: "Meals",
    vendor: "Jefferson Street Deli",
    vendorHint: "Section 120",
    tags: ["new-in-2026"]
  },
  {
    name: "50/50 Stretch",
    description: "20-inch giant sub: half chicken parm and half pastrami",
    fare: "Meals",
    vendor: "Jefferson Street Deli",
    vendorHint: "Section 120",
    tags: ["new-in-2026"]
  },
  {
    name: "Chicken Parm Sandwich",
    fare: "Meals",
    vendor: "Jefferson Street Deli",
    vendorHint: "Section 120"
  },
  {
    name: "Chicken Parm Grilled Cheese",
    description: "Garlic parmesan sourdough, crispy chicken fillet, marinara, pesto, Provolone",
    fare: "Meals",
    vendor: "Grand Canyon Grill",
    vendorHint: "Section 214 (Diamond Level)",
    tags: ["new-in-2026"]
  },
  {
    name: "Crispy Chicken Sandwich",
    description: "American cheese, copycat sauce, pickles",
    fare: "Meals",
    vendor: "Gonzo's Grill / Red Hot Grill",
    vendorHint: "Gonzo's 142; Red Hot 312/320",
    tags: ["new-in-2026"]
  },
  {
    name: "Hot Honey Chicken Sliders",
    description: "Crispy tenders, hot honey sauce, pickles, pimento cheese, brioche bun, and fries",
    fare: "Meals",
    vendor: "Four Peaks",
    vendorHint: "Section 139",
    tags: ["new-in-2026"]
  },
  {
    name: "Beef Gyro",
    fare: "Meals",
    vendor: "Chef Tilder's Gyros",
    vendorHint: "Section 120"
  },

  // ── Sausage ────────────────────────────────────────────────────

  {
    name: "Sausage & Bratwurst",
    fare: "Meals",
    vendor: "Hungry Hill Sangwich",
    vendorHint: "Sections 112, 134, 315"
  },
  {
    name: "Chimichurri Steak Quesadilla",
    description: "Philly ribeye, cheese blend, fire roasted onions and peppers, chimichurri, creamy horseradish",
    fare: "Meals",
    vendor: "Four Peaks",
    vendorHint: "Section 139",
    tags: ["new-in-2026"]
  },
  {
    name: "Hatch Chile-Cheese Sausage",
    description: "Hatch chile-cilantro aioli, caramelized onions, salsa verde, split top bun",
    fare: "Meals",
    vendor: "Four Peaks",
    vendorHint: "Section 139",
    tags: ["new-in-2026"]
  },
  {
    name: "Red Hot Polish Sausage",
    description: "Spicy Polish sausage, deli mustard, charred onions and bell peppers, split top roll",
    fare: "Meals",
    vendor: "Red Hot Grill",
    vendorHint: "Sections 312, 320",
    tags: ["new-in-2026"]
  },
  {
    name: "Meatball Sub",
    fare: "Meals",
    vendor: "Hungry Hill Sangwich",
    vendorHint: "Sections 112, 134, 315"
  },
  {
    name: "Italian Beef",
    fare: "Meals",
    vendor: "Hungry Hill Sangwich",
    vendorHint: "Sections 112, 134, 315"
  },

  // ── Chicken ────────────────────────────────────────────────────

  {
    name: "Chicken Tenders",
    fare: "Meals",
    vendorHint:
      "A-Zona 207; Bat Flip 118; Four Peaks 139; Gonzo's 142; Grand Canyon 214; Red Hot 312/320; Sandlot 332; Taste of Chase 130"
  },
  {
    name: "Baked Chicken Wings",
    fare: "Meals",
    vendor: "Streets of New York",
    vendorHint: "Sections 113, 124, 305, 318",
    dietary: ["Gluten Free"]
  },
  {
    name: "Chicken Wrap",
    fare: "Meals",
    vendor: "Chick-fil-A / Gonzo's Grill",
    vendorHint: "Chick-fil-A 114/126/218/326; Gonzo's 142"
  },
  {
    name: "Chicken Nuggets",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: "Section 126"
  },

  // ── Corn Dogs ──────────────────────────────────────────────────

  {
    name: "Footlong Hand Dipped Corndog",
    description: "Naked, Chili Cheese, Street Corn, or BBQ Bacon Mac n Cheese toppings",
    fare: "Meals",
    vendor: "Footlong Corndogs",
    vendorHint: "Section 320",
    tags: ["new-in-2026"]
  },
  {
    name: "Street Corn Corndog",
    description: "Chipotle aioli, fire roasted corn, Cotija cheese, street corn seasoning, cilantro",
    fare: "Meals",
    vendor: "Footlong Corndogs",
    vendorHint: "Section 320",
    tags: ["new-in-2026"]
  },
  {
    name: "BBQ Bacon Mac n Cheese Corndog",
    description: "White cheddar mac, smoked bacon, barbecue sauce, green onion",
    fare: "Meals",
    vendor: "Footlong Corndogs",
    vendorHint: "Section 320",
    tags: ["new-in-2026"]
  },
  {
    name: "Mini Corndog Bites",
    fare: "Snacks",
    vendor: "Sandlot Snacks",
    vendorHint: "Section 332"
  },

  // ── Mexican / Hispanic ─────────────────────────────────────────

  {
    name: "Burrito Bowl",
    description: "Carne asada or chicken tinga; vegan Plant Powered option available",
    fare: "Meals",
    vendor: "A-Zona Street Tacos",
    vendorHint: "Section 207 (Diamond Level)",
    dietary: ["Gluten Free"]
  },
  {
    name: "Plant Powered Burrito Bowl",
    description: "Vegan burrito bowl",
    fare: "Meals",
    vendor: "A-Zona Street Tacos",
    vendorHint: "Section 207 (Diamond Level)",
    dietary: ["Vegan", "Gluten Free"]
  },
  {
    name: "Street Tacos",
    description: "New option: carne asada with flour tortillas, salsa verde, onions, cilantro, Cotija, fresh lime, fried jalapeño",
    fare: "Meals",
    vendor: "A-Zona Street Tacos / Taquería Los D-backs / Someburros",
    vendorHint: "A-Zona 207; Taquería 123; Someburros 115/314",
    tags: ["new-in-2026"]
  },
  {
    name: "Burritos",
    fare: "Meals",
    vendor: "Someburros",
    vendorHint: "Sections 115, 314"
  },
  {
    name: "Someburros Sonoran Nachos",
    fare: "Snacks",
    vendor: "Someburros",
    vendorHint: "Sections 115, 314"
  },
  {
    name: "Fundido Trio",
    fare: "Meals",
    vendor: "Someburros",
    vendorHint: "Sections 115, 314"
  },
  {
    name: "Tamales",
    fare: "Meals",
    vendor: "Rey Gloria's Tamales",
    vendorHint: "Section 137"
  },
  {
    name: "Street Corn",
    fare: "Snacks",
    vendor: "Rey Gloria's Tamales",
    vendorHint: "Section 137"
  },
  {
    name: "Tostilocos",
    description: "With Tostitos Salsa Verde Chips",
    fare: "Snacks",
    vendor: "Serpientes Cantina",
    vendorHint: "Section 110",
    tags: ["new-in-2026"]
  },
  {
    name: "Chicharrones with Guac",
    fare: "Snacks",
    vendor: "Serpientes Cantina",
    vendorHint: "Section 110",
    dietary: ["Gluten Free"]
  },
  {
    name: "Chips with Salsa or Guac",
    fare: "Snacks",
    vendor: "Serpientes Cantina",
    vendorHint: "Section 110",
    dietary: ["Vegan"]
  },

  // ── Nachos ─────────────────────────────────────────────────────

  {
    name: "Pork Belly Nachos",
    description: "Wonton chips, crispy pork belly, quick kimchee, gochujang cheese sauce, pickled red onions, scallions",
    fare: "Snacks",
    vendor: "Taste of Chase",
    vendorHint: "Section 130",
    tags: ["new-in-2026"]
  },
  {
    name: "Snake Bite Nacho Bucket",
    description: "Corn tortilla chips, Monterey Jack sauce, chorizo, pico de gallo, guacamole, venom sauce, jalapeños",
    fare: "Snacks",
    vendor: "Red Hot Grill",
    vendorHint: "Sections 312, 320",
    tags: ["new-in-2026"]
  },
  {
    name: "Souvenir Nacho Bucket",
    fare: "Snacks",
    vendorHint: "A-Zona 207; Bases Loaded! 109; Red Hot 312/320"
  },
  {
    name: "Souvenir Nacho Helmet",
    description: "New option: Carne Asada",
    fare: "Snacks",
    vendor: "A-Zona Street Tacos",
    vendorHint: "Section 207 (Diamond Level)",
    tags: ["new-in-2026"]
  },
  {
    name: "Ballpark Nachos",
    fare: "Snacks",
    vendorHint: "All DoubleHeaders; A-Zona 207",
    dietary: ["Gluten Free"]
  },

  // ── Pizza (Streets of New York 113/124/305/318) ────────────────

  {
    name: "Streets of New York Pizza",
    description: "Cheese, Pepperoni, or Snakebite",
    fare: "Meals",
    vendor: "Streets of New York",
    vendorHint: "Sections 113, 124, 305, 318"
  },
  {
    name: "Gluten Free Pizza",
    fare: "Meals",
    vendor: "Streets of New York",
    vendorHint: "Sections 113, 124, 305, 318",
    dietary: ["Gluten Free"]
  },
  {
    name: "Garlic Cheese Bread",
    fare: "Snacks",
    vendor: "Streets of New York",
    vendorHint: "Sections 113, 124, 305, 318",
    dietary: ["Vegetarian"]
  },

  // ── Fries / Sides ──────────────────────────────────────────────

  {
    name: "Hot Honey Fries",
    description: "Chicken tenders, Monterey Jack sauce, cheese blend, hot honey sauce, bacon, green onion on fries",
    fare: "Snacks",
    vendor: "Grand Canyon Grill / Four Peaks",
    vendorHint: "Grand Canyon 214; Four Peaks 139",
    tags: ["new-in-2026"]
  },
  {
    name: "Garlic Parmesan Fries",
    fare: "Snacks",
    vendorHint:
      "Bat Flip 118; Big Dawgs 105/324; Grand Canyon 214; Jefferson Street 120; Taste of Chase 130"
  },
  {
    name: "Arizona Diamondbacks Loaded Fries",
    fare: "Snacks",
    vendor: "Big Dawgs",
    vendorHint: "Section 105"
  },
  {
    name: "Waffle Fries",
    fare: "Snacks",
    vendor: "Chick-fil-A",
    vendorHint: "Section 126"
  },
  {
    name: "Mac n Cheese Bites",
    fare: "Snacks",
    vendor: "Sandlot Snacks",
    vendorHint: "Section 332"
  },
  {
    name: "Oh Snap! Pickles",
    fare: "Snacks",
    vendorHint: "Grand Canyon 214; Jefferson Street 120"
  },
  {
    name: "Soft Pretzels",
    fare: "Snacks",
    vendorHint: "A-Zona 207; All DoubleHeaders; Bases Loaded! 109; Four Peaks 139; Wetzel's 124/321"
  },
  {
    name: "Victory Knot",
    description: "Large Bavarian pretzel with beer cheese and spicy brown mustard",
    fare: "Snacks",
    vendor: "Four Peaks",
    vendorHint: "Section 139",
    dietary: ["Vegetarian"]
  },

  // ── Salads / Lighter Options ───────────────────────────────────

  {
    name: "Southwest Salad",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: "Sections 114, 126, 218, 326",
    dietary: ["Gluten Free"]
  },
  {
    name: "Antipasto Salad",
    fare: "Meals",
    vendor: "Streets of New York",
    vendorHint: "Sections 113, 124, 305, 318",
    dietary: ["Gluten Free"]
  },
  {
    name: "Farmers Market Vegetables with Hummus",
    description: "With pretzel twists",
    fare: "Snacks",
    vendor: "Grand Canyon Grill",
    vendorHint: "Section 214 (Diamond Level)",
    dietary: ["Vegan"]
  },
  {
    name: "Hummus and Pita",
    fare: "Snacks",
    vendor: "Chef Tilder's Gyros",
    vendorHint: "Section 120",
    dietary: ["Vegan"]
  },
  {
    name: "Latin Fruit Cup with Chamoy",
    fare: "Snacks",
    vendorHint: "Grand Canyon 214; Jefferson Street 120",
    dietary: ["Vegan", "Gluten Free"]
  },

  // ── Churro Dog HQ (129, 324) — Chase Field iconic ─────────────

  {
    name: "Churro Dog",
    description: "Warm cinnamon churro on a donut bun, topped with frozen yogurt, whipped cream, caramel and chocolate sauces",
    fare: "Desserts",
    vendor: "Churro Dog HQ",
    vendorHint: "Sections 129, 324"
  },
  {
    name: "Oreo Explosion Churro Dog",
    description: "Classic churro dog with Oreo toppings",
    fare: "Desserts",
    vendor: "Churro Dog HQ",
    vendorHint: "Sections 129, 324",
    tags: ["new-in-2026"]
  },
  {
    name: "PB & Brownie Pretzel Crunch Sundae",
    fare: "Desserts",
    vendor: "Churro Dog HQ",
    vendorHint: "Sections 129, 324"
  },
  {
    name: "Take Me Out to the Ballgame Milkshake",
    description: "Salted caramel shake with whipped cream, PB sandwich cookies, Kit Kat, Cracker Jack",
    fare: "Desserts",
    vendor: "Churro Dog HQ",
    vendorHint: "Sections 129, 324",
    tags: ["new-in-2026"]
  },
  {
    name: "Souvenir Sundae",
    fare: "Desserts",
    vendor: "Churro Dog HQ / Sandlot Snacks",
    vendorHint: "Churro Dog HQ 129/324; Sandlot 332"
  },
  {
    name: "Churros",
    fare: "Desserts",
    vendor: "Churro Dog HQ / Grandma's / Someburros",
    vendorHint: "Churro Dog HQ 129/324; Grandma's 308; Someburros 115/314",
    dietary: ["Vegetarian"]
  },

  // ── Cathy's Cookies (104, 308) — new partner ──────────────────

  {
    name: "Cathy's Chocolate Chip Cookies",
    description: "Fresh baked chocolate chip cookies in a bucket or sleeve",
    fare: "Desserts",
    vendor: "Cathy's Cookies",
    vendorHint: "Sections 104, 308",
    tags: ["new-in-2026"]
  },
  {
    name: "Chocolate Chip Cookie Ice Cream Sundae",
    fare: "Desserts",
    vendor: "Cathy's Cookies",
    vendorHint: "Sections 104, 308",
    tags: ["new-in-2026"]
  },

  // ── Other Desserts ─────────────────────────────────────────────

  {
    name: "Dole Whip",
    description: "Pineapple flavor",
    fare: "Desserts",
    vendor: "Big Dawgs",
    vendorHint: "Section 105",
    dietary: ["Vegan", "Gluten Free"]
  },
  {
    name: "Cold Stone Creamery Ice Cream",
    description: "Served in a cup or waffle bowl",
    fare: "Desserts",
    vendor: "Cold Stone Creamery",
    vendorHint: "Sections 112, 128, 137, 216, 310, 318"
  },
  {
    name: "Zoyo Frozen Yogurt",
    description: "Wide variety of frozen yogurt flavors",
    fare: "Desserts",
    vendor: "Zoyo Neighborhood Yogurt",
    vendorHint: "Sections 115, 322",
    dietary: ["Vegetarian"]
  },
  {
    name: "Walk-Off Chocolate Chunk Pizza Cookie",
    description: "Large chocolate chunk cookie cut into 6 pieces with powdered sugar",
    fare: "Desserts",
    vendor: "Streets of New York",
    vendorHint: "Sections 113, 124, 305, 318",
    dietary: ["Vegetarian"]
  },
  {
    name: "Giant Cookies",
    description: "Chocolate chip, oatmeal raisin, peanut butter, snickerdoodle",
    fare: "Desserts",
    vendor: "Grandma's Made Concessions",
    vendorHint: "Section 308",
    dietary: ["Vegetarian"]
  },
  {
    name: "Apple Cinnamon Chimis",
    fare: "Desserts",
    vendor: "Someburros",
    vendorHint: "Sections 115, 314"
  },
  {
    name: "Chocolate Fudge Brownies",
    fare: "Desserts",
    vendor: "Chick-fil-A",
    vendorHint: "Sections 114, 126, 218, 326"
  },
  {
    name: "Rice Krispie Treats",
    fare: "Desserts",
    vendor: "Grandma's Made Concessions",
    vendorHint: "Section 308",
    dietary: ["Vegetarian"]
  },
  {
    name: "Cinnamon Roasted Almonds",
    fare: "Desserts",
    vendor: "Cactus Corn",
    vendorHint: "Sections 118, 138, 317",
    dietary: ["Gluten Free"]
  },
  {
    name: "Cinnamon Pretzels",
    description: "Bitz or regular",
    fare: "Desserts",
    vendor: "Wetzel's Pretzels",
    vendorHint: "Sections 124, 321"
  },
  {
    name: "Gelato",
    fare: "Desserts",
    vendorHint: "Gelato Cart, Section 207 (Diamond Level)"
  }
];

export async function parseChaseFieldMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl || SOURCE_URL;

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
      sourceUrl: url
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
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
