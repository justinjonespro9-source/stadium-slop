/**
 * Yankee Stadium (New York Yankees) menu parser.
 *
 * Source: https://www.mlb.com/yankees/ballpark/food
 * Curated static dataset from the 2026 Yankee Stadium Dining Guide.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "yankee-stadium";
const VENUE_NAME = "Yankee Stadium";
const SOURCE_URL = "https://www.mlb.com/yankees/ballpark/food";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

const MENU_DATA: RawItem[] = [
  // ── 99 Burger (Section 107) ────────────────────────────────────
  {
    name: "99 Burger",
    description:
      "Two 4 oz American Wagyu beef patties, American cheese, caramelized onions, secret sauce, brioche bun, dill pickles",
    fare: "Meals",
    vendor: "99 Burger",
    vendorHint: "Section 107"
  },

  // ── MVP Burger (Section 227 Portable) ──────────────────────────
  {
    name: "MVP Burger",
    description:
      "Two 4 oz American Wagyu beef patties, American cheese, caramelized onions, onion rings, tomato bacon jam, secret sauce, brioche bun",
    fare: "Meals",
    vendor: "MVP Burger",
    vendorHint: "Section 227 Portable"
  },

  // ── Benihana (Section 127) ─────────────────────────────────────
  {
    name: "Spicy Tuna Sushi Burrito",
    fare: "Meals",
    vendor: "Benihana",
    vendorHint: "Section 127"
  },
  {
    name: "Spicy Salmon Sushi Burrito",
    fare: "Meals",
    vendor: "Benihana",
    vendorHint: "Section 127"
  },
  {
    name: "Hibachi Bowl",
    fare: "Meals",
    vendor: "Benihana",
    vendorHint: "Section 127"
  },
  {
    name: "Yakisoba Bowl",
    fare: "Meals",
    vendor: "Benihana",
    vendorHint: "Section 127"
  },
  {
    name: "Poke Bowl",
    fare: "Meals",
    vendor: "Benihana",
    vendorHint: "Section 127"
  },
  {
    name: "Maki Rolls",
    fare: "Meals",
    vendor: "Benihana",
    vendorHint: "Section 127"
  },
  {
    name: "Avocado Maki Roll",
    fare: "Meals",
    vendor: "Benihana",
    vendorHint: "Section 127",
    dietary: ["Vegan"]
  },
  {
    name: "Edamame",
    fare: "Snacks",
    vendor: "Benihana",
    vendorHint: "Section 127",
    dietary: ["Vegan"]
  },

  // ── Blue Bunny (Section 125, 318) ──────────────────────────────
  {
    name: "Blue Bunny Hand-Dipped Ice Cream",
    description:
      "Vanilla, chocolate, chocolate chip cookie dough, cookies and cream, mint chocolate chip, lemon sorbet, rainbow sherbet",
    fare: "Desserts",
    vendor: "Blue Bunny",
    vendorHint: "Sections 125, 318",
    dietary: ["Gluten Free"]
  },

  // ── Bobby's Burger (Section 132) ───────────────────────────────
  {
    name: "Bacon Crunchburger",
    fare: "Meals",
    vendor: "Bobby's Burger Palace",
    vendorHint: "Section 132"
  },
  {
    name: "Crunchburger",
    fare: "Meals",
    vendor: "Bobby's Burger Palace",
    vendorHint: "Section 132"
  },
  {
    name: "Bobby's Blue + Bacon Burger",
    fare: "Meals",
    vendor: "Bobby's Burger Palace",
    vendorHint: "Section 132"
  },
  {
    name: "Palace Classic Burger",
    fare: "Meals",
    vendor: "Bobby's Burger Palace",
    vendorHint: "Section 132"
  },
  {
    name: "Bobby's Veggie Burger",
    fare: "Meals",
    vendor: "Bobby's Burger Palace",
    vendorHint: "Section 132",
    dietary: ["Vegetarian"]
  },
  {
    name: "Bobby's Sweet Potato Fries",
    fare: "Snacks",
    vendor: "Bobby's Burger Palace",
    vendorHint: "Section 132"
  },
  {
    name: "Bobby's Vanilla Bean Milkshake",
    fare: "Desserts",
    vendor: "Bobby's Burger Palace",
    vendorHint: "Section 132"
  },
  {
    name: "Bobby's Dark Chocolate Milkshake",
    fare: "Desserts",
    vendor: "Bobby's Burger Palace",
    vendorHint: "Section 132"
  },

  // ── Brooklyn Dumpling Shop (108, 213, 321, Bleachers) ──────────
  {
    name: "Bacon Cheeseburger Dumplings",
    fare: "Meals",
    vendor: "Brooklyn Dumpling Shop",
    vendorHint: "Sections 108, 213, 321, Bleachers"
  },
  {
    name: "Mac & Cheese Dumplings",
    fare: "Meals",
    vendor: "Brooklyn Dumpling Shop",
    vendorHint: "Sections 108, 213, 321, Bleachers",
    dietary: ["Vegetarian"]
  },
  {
    name: "Chicken Parm Dumplings",
    fare: "Meals",
    vendor: "Brooklyn Dumpling Shop",
    vendorHint: "Sections 108, 213, 321, Bleachers"
  },
  {
    name: "Apple Pie Dumplings",
    fare: "Desserts",
    vendor: "Brooklyn Dumpling Shop",
    vendorHint: "Sections 108, 213, 321, Bleachers",
    dietary: ["Vegetarian"]
  },

  // ── Chickie & Pete's (Section 115) ─────────────────────────────
  {
    name: "Chickie & Pete's Crabfries",
    fare: "Snacks",
    vendor: "Chickie & Pete's",
    vendorHint: "Section 115"
  },
  {
    name: "Chicken Tenders with Crabfries",
    fare: "Meals",
    vendor: "Chickie & Pete's",
    vendorHint: "Section 115"
  },

  // ── Christian Petroni's Parm to Table (Section 105) ────────────
  {
    name: "Antipasto Salad",
    fare: "Meals",
    vendor: "Christian Petroni's Parm to Table",
    vendorHint: "Section 105"
  },
  {
    name: "Mozzarella en Carrozza",
    fare: "Meals",
    vendor: "Christian Petroni's Parm to Table",
    vendorHint: "Section 105",
    dietary: ["Vegetarian"]
  },
  {
    name: "8-hour Marinara Pasta",
    fare: "Meals",
    vendor: "Christian Petroni's Parm to Table",
    vendorHint: "Section 105",
    dietary: ["Vegetarian"]
  },
  {
    name: "Rigatoni a la Vodka",
    fare: "Meals",
    vendor: "Christian Petroni's Parm to Table",
    vendorHint: "Section 105"
  },
  {
    name: "Arrabbiata Pasta",
    fare: "Meals",
    vendor: "Christian Petroni's Parm to Table",
    vendorHint: "Section 105"
  },
  {
    name: "Petroni Affogato",
    fare: "Desserts",
    vendor: "Christian Petroni's Parm to Table",
    vendorHint: "Section 105",
    dietary: ["Gluten Free"]
  },
  {
    name: "Petroni Tiramisu",
    fare: "Desserts",
    vendor: "Christian Petroni's Parm to Table",
    vendorHint: "Section 105"
  },

  // ── Colony Grill (Section 125, 310) ────────────────────────────
  {
    name: "Colony Grill Cheese Pizza",
    fare: "Meals",
    vendor: "Colony Grill",
    vendorHint: "Sections 125, 310",
    dietary: ["Vegetarian"]
  },
  {
    name: "Colony Grill Pepperoni Pizza",
    fare: "Meals",
    vendor: "Colony Grill",
    vendorHint: "Sections 125, 310"
  },
  {
    name: "Hot Oil Pizza",
    fare: "Meals",
    vendor: "Colony Grill",
    vendorHint: "Sections 125, 310"
  },

  // ── Fuku (Section 107, 205, 331) ──────────────────────────────
  {
    name: "Fuku OG Spicy Chicken Sando",
    fare: "Meals",
    vendor: "Fuku",
    vendorHint: "Sections 107, 205, 331"
  },
  {
    name: "Fuku Sweet & Spicy Chicken Sando",
    fare: "Meals",
    vendor: "Fuku",
    vendorHint: "Sections 107, 205, 331"
  },
  {
    name: "Sando Cubano",
    fare: "Meals",
    vendor: "Fuku",
    vendorHint: "Sections 107, 205, 331"
  },
  {
    name: "Fuku Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "Fuku",
    vendorHint: "Sections 107, 205, 331"
  },
  {
    name: "Fuku Sweet & Spicy Tenders with Fries",
    fare: "Meals",
    vendor: "Fuku",
    vendorHint: "Sections 107, 205, 331"
  },
  {
    name: "Fuku Lucky Fries",
    fare: "Snacks",
    vendor: "Fuku",
    vendorHint: "Sections 107, 205, 331"
  },
  {
    name: "Fuku Fries",
    fare: "Snacks",
    vendor: "Fuku",
    vendorHint: "Sections 107, 205, 331"
  },

  // ── Garlic Fries (Section 107, 205) ────────────────────────────
  {
    name: "Garlic Fries",
    fare: "Snacks",
    vendorHint: "Sections 107, 205"
  },

  // ── Gluten Free Grill (Great Hall) — unique item ───────────────
  {
    name: "Plant Based Burger",
    description: "Beyond Meat patty on gluten-free bun",
    fare: "Meals",
    vendor: "Gluten Free Grill",
    vendorHint: "Great Hall",
    dietary: ["Gluten Free", "Vegan"]
  },

  // ── Grand Slam Shakes (Section 125, 324) ──────────────────────
  {
    name: "Black & White Cookie Milkshake",
    fare: "Desserts",
    vendor: "Grand Slam Shakes",
    vendorHint: "Sections 125, 324"
  },
  {
    name: "Baby Ruth Milkshake",
    fare: "Desserts",
    vendor: "Grand Slam Shakes",
    vendorHint: "Sections 125, 324"
  },
  {
    name: "Butterfinger Milkshake",
    fare: "Desserts",
    vendor: "Grand Slam Shakes",
    vendorHint: "Sections 125, 324"
  },
  {
    name: "Pinstripe Milkshake",
    fare: "Desserts",
    vendor: "Grand Slam Shakes",
    vendorHint: "Sections 125, 324"
  },

  // ── Highlanders / Standard concessions ─────────────────────────
  {
    name: "Premio Hot Italian Sausage",
    fare: "Meals",
    vendor: "Highlanders",
    vendorHint:
      "Sections 232, 305, 312, 318, 324; also Gluten Free Grill (Great Hall)",
    dietary: ["Gluten Free"]
  },
  {
    name: "Premio Sweet Italian Sausage",
    fare: "Meals",
    vendor: "Highlanders",
    vendorHint:
      "Sections 232, 305, 312, 318, 324; also Gluten Free Grill (Great Hall)",
    dietary: ["Gluten Free"]
  },
  {
    name: "Sabrett Regular Hot Dog",
    fare: "Meals",
    vendor: "Highlanders",
    vendorHint:
      "Sections 232, 305, 312, 318, 324; also Triple Play Grill (213, 321, 324, Bleachers)"
  },
  {
    name: "Sabrett Extra Long Hot Dog",
    fare: "Meals",
    vendor: "Highlanders",
    vendorHint:
      "Sections 232, 305, 312, 318, 324; also Triple Play Grill (213, 321, 324, Bleachers)"
  },
  {
    name: "NY Pretzel Twist",
    fare: "Snacks",
    vendorHint: "Multiple locations throughout the Stadium",
    dietary: ["Vegan"]
  },
  {
    name: "Souvenir Ice Cream Helmet",
    fare: "Desserts",
    vendor: "Highlanders",
    vendorHint: "Sections 232, 305, 312, 318, 324"
  },

  // ── King's Hawaiian (Section 115, 334) ─────────────────────────
  {
    name: "King's Hawaiian 99 Burger",
    fare: "Meals",
    vendor: "King's Hawaiian",
    vendorHint: "Sections 115, 334"
  },
  {
    name: "King's Hawaiian Chicken Parm Sando",
    fare: "Meals",
    vendor: "King's Hawaiian",
    vendorHint: "Sections 115, 334"
  },
  {
    name: "King's Hawaiian Angry Lobster Roll",
    fare: "Meals",
    vendor: "King's Hawaiian",
    vendorHint: "Sections 115, 334"
  },

  // ── Kosher (Section 110, 214, 228, 322) ────────────────────────
  {
    name: "Kosher Pulled Brisket Sandwich",
    fare: "Meals",
    vendor: "Kosher",
    vendorHint: "Sections 110, 214, 228, 322"
  },
  {
    name: "Kosher Hot Pastrami Sandwich",
    fare: "Meals",
    vendor: "Kosher",
    vendorHint: "Sections 110, 214, 228, 322"
  },
  {
    name: "Kosher Sausage",
    fare: "Meals",
    vendor: "Kosher",
    vendorHint: "Sections 110, 214, 228, 322"
  },
  {
    name: "Potato Knish",
    fare: "Snacks",
    vendor: "Kosher",
    vendorHint: "Sections 110, 214, 228, 322"
  },

  // ── Lobel's (Section 132, 223, 321) ────────────────────────────
  {
    name: "Lobel's USDA Prime Steak Sandwich",
    fare: "Meals",
    vendor: "Lobel's",
    vendorHint: "Sections 132, 223, 321"
  },
  {
    name: "Lobel's USDA Prime Burger",
    fare: "Meals",
    vendor: "Lobel's",
    vendorHint: "Sections 132, 223, 321"
  },
  {
    name: "Lobel's Prime Pastrami Sandwich",
    fare: "Meals",
    vendor: "Lobel's",
    vendorHint: "Sections 132, 223, 321"
  },
  {
    name: "Lobel's Steak Topped Fries",
    fare: "Snacks",
    vendor: "Lobel's",
    vendorHint: "Section 132 only"
  },
  {
    name: "BBQ Filet Tip Loaded Tots",
    fare: "Snacks",
    vendor: "Lobel's",
    vendorHint: "Section 132 only"
  },
  {
    name: "Lobel's Pastrami Fries",
    fare: "Snacks",
    vendor: "Lobel's",
    vendorHint: "Section 132 only"
  },

  // ── Mac Truck (Section 223, 331) ───────────────────────────────
  {
    name: "Mac Truck Classic Mac & Cheese",
    fare: "Meals",
    vendor: "Mac Truck",
    vendorHint: "Sections 223, 331"
  },
  {
    name: "Mac Truck Spicy Chicken and Ranch Mac & Cheese",
    fare: "Meals",
    vendor: "Mac Truck",
    vendorHint: "Sections 223, 331"
  },
  {
    name: "Mac Truck Pulled Pork Mac & Cheese",
    fare: "Meals",
    vendor: "Mac Truck",
    vendorHint: "Sections 223, 331"
  },

  // ── Magnolia Bakery (Multiple sections) ────────────────────────
  {
    name: "Magnolia Bakery Brownies and Blondies",
    fare: "Desserts",
    vendor: "Magnolia Bakery",
    vendorHint:
      "Sections 110, 121, 125, 202, 211, 217, 223, 318, 320, 324"
  },

  // ── Mighty Quinn's (Section 134) ───────────────────────────────
  {
    name: "Mighty Quinn's Rice Bowl",
    fare: "Meals",
    vendor: "Mighty Quinn's",
    vendorHint: "Section 134"
  },
  {
    name: "Mighty Quinn's Chopped Brisket Sandwich",
    fare: "Meals",
    vendor: "Mighty Quinn's",
    vendorHint: "Section 134"
  },
  {
    name: "Mighty Quinn's Crispy BBQ Chicken Sandwich",
    fare: "Meals",
    vendor: "Mighty Quinn's",
    vendorHint: "Section 134"
  },
  {
    name: "Mighty Quinn's Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Mighty Quinn's",
    vendorHint: "Section 134"
  },
  {
    name: "Mighty Quinn's Spicy Chicken Wings",
    fare: "Meals",
    vendor: "Mighty Quinn's",
    vendorHint: "Section 134"
  },

  // ── Mister Softee (Throughout) ─────────────────────────────────
  {
    name: "Mister Softee Ice Cream",
    description: "Cup, waffle cone, or souvenir helmet",
    fare: "Desserts",
    vendor: "Mister Softee",
    vendorHint: "Throughout the Stadium",
    dietary: ["Gluten Free"]
  },

  // ── Nathan's Famous (127, 224, 312, Throughout) ────────────────
  {
    name: "Nathan's Original Beef Frankfurter",
    fare: "Meals",
    vendor: "Nathan's Famous",
    vendorHint:
      "Sections 127, 224, 312, Throughout; also Gluten Free Grill (Great Hall)",
    dietary: ["Gluten Free"]
  },
  {
    name: "Nathan's Extra Long Beef Hot Dog",
    fare: "Meals",
    vendor: "Nathan's Famous",
    vendorHint: "Sections 127, 224, 312, Throughout"
  },
  {
    name: "Nathan's Chicken Tenders",
    fare: "Meals",
    vendor: "Nathan's Famous",
    vendorHint: "Sections 127, 224, 312, Throughout"
  },
  {
    name: "Nathan's Original Crinkle Cut Fries",
    fare: "Snacks",
    vendor: "Nathan's Famous",
    vendorHint: "Sections 127, 224, 312, Throughout"
  },

  // ── Nuchas Empanadas (Section 107, 232) ────────────────────────
  {
    name: "Chipotle Chicken Empanada",
    fare: "Meals",
    vendor: "Nuchas Empanadas",
    vendorHint: "Sections 107, 232"
  },
  {
    name: "Pinto Bean Empanada",
    fare: "Meals",
    vendor: "Nuchas Empanadas",
    vendorHint: "Sections 107, 232",
    dietary: ["Vegan"]
  },
  {
    name: "Italian Sausage Empanada",
    fare: "Meals",
    vendor: "Nuchas Empanadas",
    vendorHint: "Sections 107, 232"
  },

  // ── Stadium Exclusives ─────────────────────────────────────────
  {
    name: "Apple Pie Nachos",
    fare: "Desserts",
    vendorHint: "Sections 110, 125, 217, 318; also Mister Softee carts",
    dietary: ["Gluten Free", "Vegetarian"]
  },
  {
    name: "Legends' Chopped Cheese",
    fare: "Meals",
    vendor: "Legends",
    vendorHint: "Toyota Terrace, FreshDirect Terrace"
  },
  {
    name: "Legends' Chopped Cheese with BBQ Sauce & Bacon",
    fare: "Meals",
    vendor: "Legends",
    vendorHint: "Toyota Terrace, FreshDirect Terrace"
  },
  {
    name: "FreshDirect Pineapple Cup",
    fare: "Snacks",
    vendorHint: "Toyota Terrace, FreshDirect Terrace"
  },
  {
    name: "Corn Esquite Cup",
    description: "Melissa's Produce",
    fare: "Snacks",
    vendorHint: "Toyota Terrace, FreshDirect Terrace"
  },
  {
    name: "Bacon-on-a-Stick",
    fare: "Snacks",
    vendorHint: "Section 121 Portable",
    dietary: ["Gluten Free"]
  },
  {
    name: "Mini Dessert Chicken Bucket",
    fare: "Desserts",
    vendorHint: "Sections 125, 205, 318"
  },
  {
    name: "Stadium Street Tacos",
    fare: "Meals",
    vendorHint: "Section 314",
    dietary: ["Gluten Free"]
  },
  {
    name: "Cheesesteaks",
    fare: "Meals",
    vendorHint: "Section 223"
  },
  {
    name: "Stadium Nachos",
    fare: "Snacks",
    vendorHint: "Sections 234, 307, Bleachers, Great Hall",
    dietary: ["Gluten Free"]
  },

  // ── Streetbird by Marcus Samuelsson (Section 112) ──────────────
  {
    name: "M's Kickin' Tenders & Fries",
    fare: "Meals",
    vendor: "Streetbird by Marcus Samuelsson",
    vendorHint: "Section 112"
  },
  {
    name: "M's Spicy Chicken Sandwich",
    fare: "Meals",
    vendor: "Streetbird by Marcus Samuelsson",
    vendorHint: "Section 112"
  },
  {
    name: "M's Chicken Tenders and Fries",
    fare: "Meals",
    vendor: "Streetbird by Marcus Samuelsson",
    vendorHint: "Section 112"
  },
  {
    name: "Sticky Que Chicken Sandwich",
    fare: "Meals",
    vendor: "Streetbird by Marcus Samuelsson",
    vendorHint: "Section 112"
  },
  {
    name: "Bird Dog 2.0",
    fare: "Meals",
    vendor: "Streetbird by Marcus Samuelsson",
    vendorHint: "Section 112"
  },
  {
    name: "Streetbird Fries",
    fare: "Snacks",
    vendor: "Streetbird by Marcus Samuelsson",
    vendorHint: "Section 112"
  },

  // ── Sweet P Bakery (Section 121, 211) ──────────────────────────
  {
    name: "Sweet P Bakery Colossal Cookies",
    description: "Chocolate Chip and M&M",
    fare: "Desserts",
    vendor: "Sweet P Bakery",
    vendorHint: "Grab & Go at Sections 121, 211"
  },

  // ── The Halal Guys (Bleachers 201, Section 321) ────────────────
  {
    name: "Halal Guys Platter",
    description: "Chicken, beef, gyro, or falafel",
    fare: "Meals",
    vendor: "The Halal Guys",
    vendorHint: "Portable carts in Bleachers 201, Section 321"
  },
  {
    name: "Halal Guys Sandwich",
    description: "Chicken, beef, gyro, or falafel",
    fare: "Meals",
    vendor: "The Halal Guys",
    vendorHint: "Portable carts in Bleachers 201, Section 321"
  },

  // ── Treat House (Multiple sections) ────────────────────────────
  {
    name: "Treat House Crispy Rice Treats",
    description: "Assorted artisanal crispy rice treats",
    fare: "Desserts",
    vendor: "Treat House",
    vendorHint:
      "Sections 110, 121, 125, 202, 211, 217, 223, 318, 320, 324"
  },

  // ── Tiramisu Helmet (from Vegetarian section) ──────────────────
  {
    name: "Tiramisu Helmet",
    fare: "Desserts",
    vendorHint: "Multiple locations",
    dietary: ["Vegetarian"]
  }
];

export async function parseYankeeStadiumMenu(
  _sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const items: VenueMenuSourceItem[] = MENU_DATA.map((raw) => ({
    name: raw.name,
    description: raw.description,
    fare: raw.fare,
    category: "Food" as const,
    vendorName: raw.vendor,
    vendorLocationHint: raw.vendorHint,
    dietaryTags: raw.dietary ?? [],
    sourceUrl: SOURCE_URL
  }));

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: SOURCE_URL,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
}
