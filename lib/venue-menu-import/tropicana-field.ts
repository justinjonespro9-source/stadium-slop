/**
 * Tropicana Field (Tampa Bay Rays) menu parser.
 *
 * Source: https://www.mlb.com/rays/ballpark/concessions/guide
 * Curated static dataset from the official Rays Concessions Guide.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "tropicana-field";
const VENUE_NAME = "Tropicana Field";
const SOURCE_URL = "https://www.mlb.com/rays/ballpark/concessions/guide";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

const MENU_DATA: RawItem[] = [
  // ── Signature Items ────────────────────────────────────────────
  {
    name: "Chicken Parm Hero",
    fare: "Meals",
    vendor: "Fiamma",
    vendorHint: "1B Food Hall"
  },
  {
    name: "Cuban Sandwich",
    fare: "Meals",
    vendor: "Cubanos",
    vendorHint: "1B Food Hall, Budweiser Porch"
  },
  {
    name: "Cubano Dog",
    fare: "Meals",
    vendor: "Cubanos",
    vendorHint: "1B Food Hall, Budweiser Porch"
  },
  {
    name: "Gluten-Free Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "Gluten Free Fan Favorites",
    vendorHint: "Right Field (146)",
    dietary: ["Gluten Free"]
  },
  {
    name: "Flamin' Hot Corn Dog",
    fare: "Meals",
    vendor: "Haute Potato",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Footlong Pretzel Dog",
    fare: "Meals",
    vendor: "Twisted",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Loaded Nachos",
    fare: "Snacks",
    vendor: "Smoke N' Pour / Fan Favorites",
    vendorHint: "3B Food Hall, Center Field"
  },
  {
    name: "Pig + Potato",
    fare: "Meals",
    vendor: "Haute Potato",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Rays Up Roll",
    fare: "Meals",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Short Rib Grilled Cheese",
    fare: "Meals",
    vendor: "Melted",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Sweet Pretzel Bites",
    fare: "Snacks",
    vendor: "Twisted",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "The Pretz-Strami Reuben",
    fare: "Meals",
    vendor: "Twisted",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Smokin' Rays Burger",
    fare: "Meals",
    vendor: "Hall of Fame Bar & Grill",
    vendorHint: "Center Field"
  },

  // ── Savory Specialties ─────────────────────────────────────────
  {
    name: "Arepa",
    fare: "Meals",
    vendor: "Fan Favorites",
    vendorHint: "Center Field"
  },
  {
    name: "Banh Mi",
    fare: "Meals",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Bavarian Pretzel Sticks",
    fare: "Snacks",
    vendor: "Hall of Fame Bar & Grill",
    vendorHint: "Center Field"
  },
  {
    name: "BBQ Rib Rack Stack",
    fare: "Meals",
    vendor: "Hall of Fame Bar & Grill",
    vendorHint: "Center Field"
  },
  {
    name: "Brisket Sandwich",
    fare: "Meals",
    vendor: "Hall of Fame Bar & Grill",
    vendorHint: "Center Field"
  },
  {
    name: "Buffalo Chicken Tenders and Fries",
    fare: "Meals",
    vendor: "Bird & Batter",
    vendorHint: "1B & 3B Food Halls"
  },
  {
    name: "Buffalo Fried Chicken Sandwich",
    fare: "Meals",
    vendor: "Bird & Batter",
    vendorHint: "1B & 3B Food Halls"
  },
  {
    name: "Johnny Rockets Burger",
    description: "Single or double patty",
    fare: "Meals",
    vendor: "Johnny Rockets",
    vendorHint: "Right Field (146)"
  },
  {
    name: "Cali Dog",
    fare: "Meals",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Chicken Cutlet & Fries",
    fare: "Meals",
    vendor: "Fiamma",
    vendorHint: "1B Food Hall"
  },
  {
    name: "Chicken Cutlet & Peppers",
    fare: "Meals",
    vendor: "Fiamma",
    vendorHint: "1B Food Hall"
  },
  {
    name: "Chicken Empanadas",
    fare: "Meals",
    vendor: "Cubanos",
    vendorHint: "1B Food Hall, Budweiser Porch"
  },
  {
    name: "Chicken Salad",
    fare: "Meals",
    vendor: "Chicken Salad Chick",
    vendorHint: "3B Food Hall"
  },
  {
    name: "Chili Cheese Stinger Dog",
    fare: "Meals",
    vendor: "Grand Slam Grill",
    vendorHint: "Sections 211, 212"
  },
  {
    name: "Crab Fries",
    fare: "Snacks",
    vendor: "Crabby's Beachside Bites",
    vendorHint: "Center Field"
  },
  {
    name: "Crab Roll",
    fare: "Meals",
    vendor: "Crabby's Beachside Bites",
    vendorHint: "Center Field"
  },
  {
    name: "Crabby Pretzel",
    fare: "Snacks",
    vendor: "Crabby's Beachside Bites",
    vendorHint: "Center Field"
  },
  {
    name: "Edamame",
    fare: "Snacks",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch",
    dietary: ["Vegan"]
  },
  {
    name: "Egg Rolls",
    fare: "Snacks",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Garlic Fries",
    fare: "Snacks",
    vendor: "Fiamma",
    vendorHint: "1B Food Hall"
  },
  {
    name: "Gooey Grilled Cheese",
    fare: "Meals",
    vendor: "Melted",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Gourmet Popcorn",
    fare: "Snacks",
    vendor: "Fan Favorites",
    vendorHint: "Center Field"
  },
  {
    name: "Greek Fries",
    fare: "Snacks",
    vendor: "Little Greek",
    vendorHint: "3B Food Hall"
  },
  {
    name: "Gyro",
    description: "Classic, Chicken, or Falafel",
    fare: "Meals",
    vendor: "Little Greek",
    vendorHint: "3B Food Hall"
  },
  {
    name: "Hawaiian Dog",
    fare: "Meals",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Kimchi Dog",
    fare: "Meals",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Korean Chicken Sandwich",
    fare: "Meals",
    vendor: "Bird & Batter",
    vendorHint: "1B & 3B Food Halls"
  },
  {
    name: "Loaded Haute Potato",
    fare: "Meals",
    vendor: "Haute Potato",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Lobster Tacos",
    fare: "Meals",
    vendor: "Crabby's Beachside Bites",
    vendorHint: "Center Field"
  },
  {
    name: "Mac & Cheese",
    fare: "Meals",
    vendor: "Hall of Fame Bar & Grill",
    vendorHint: "Center Field"
  },
  {
    name: "Mac Salad",
    fare: "Snacks",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Meatball Hero",
    fare: "Meals",
    vendor: "Fiamma",
    vendorHint: "1B Food Hall"
  },
  {
    name: "Meatballs in Souvenir Helmet",
    fare: "Meals",
    vendor: "Fiamma",
    vendorHint: "1B Food Hall"
  },
  {
    name: "Melted Nachos",
    fare: "Snacks",
    vendor: "Melted",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "PC Nachos",
    fare: "Snacks",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Philly Cheesesteak Nachos",
    fare: "Snacks",
    vendor: "Sizzle",
    vendorHint: "1B Base"
  },
  {
    name: "Poke Bowl",
    fare: "Meals",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Pulled Pork Nachos",
    fare: "Snacks",
    vendor: "Fan Favorites",
    vendorHint: "Center Field"
  },
  {
    name: "Super Pulled Pork Nachos",
    fare: "Snacks",
    vendor: "Fan Favorites",
    vendorHint: "Center Field"
  },
  {
    name: "Seaweed Salad",
    fare: "Snacks",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch",
    dietary: ["Vegan"]
  },
  {
    name: "Shorty Grilled Cheese",
    fare: "Meals",
    vendor: "Melted",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Smash Burger",
    fare: "Meals",
    vendor: "Crabby's Beachside Bites",
    vendorHint:
      "Center Field; also Central Burger / Whoa Doggy's (1B & 3B Food Halls), Grand Slam Grill (211, 212)"
  },
  {
    name: "Spam Musubi",
    fare: "Meals",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Sushi Rolls",
    fare: "Meals",
    vendor: "Pacific Counter",
    vendorHint: "Budweiser Porch"
  },
  {
    name: "Tacos",
    description: "Beef or pork",
    fare: "Meals",
    vendor: "Links",
    vendorHint: "1B Base Food Hall"
  },

  // ── Ballpark Favorites (unique items) ──────────────────────────
  {
    name: "Chicken Tenders & Fries",
    fare: "Meals",
    vendor: "Bird & Batter",
    vendorHint:
      "1B & 3B Food Halls, Budweiser Porch, Right Field (144), Center Field, Sections 211, 212"
  },
  {
    name: "Corn Dog",
    fare: "Meals",
    vendor: "Central Burger / Whoa Doggy's",
    vendorHint: "1B & 3B Food Halls"
  },
  {
    name: "Footlong Hot Dog",
    fare: "Meals",
    vendor: "Central Burger / Whoa Doggy's",
    vendorHint:
      "1B & 3B Food Halls, Section 120, Center Field, Right Field"
  },
  {
    name: "Footlong Sausage",
    fare: "Meals",
    vendor: "Whoa Doggy's",
    vendorHint: "1B & 3B Food Halls, Section 116, 123, Center Field"
  },
  {
    name: "Gluten Free Nachos & Cheese",
    fare: "Snacks",
    vendor: "Gluten Free Fan Favorites",
    vendorHint: "Right Field (146)",
    dietary: ["Gluten Free"]
  },
  {
    name: "Nathan's Hot Dog",
    fare: "Meals",
    vendor: "Nathan's",
    vendorHint:
      "1B & 3B Food Halls, Sections 116, 120, 125, 126, Left Field (143), Right Field (146), 211, 212"
  },
  {
    name: "Impossible Burger",
    fare: "Meals",
    vendor: "Central Burger / Whoa Doggy's",
    vendorHint: "1B & 3B Food Halls",
    dietary: ["Vegetarian"]
  },
  {
    name: "Nachos & Cheese",
    fare: "Snacks",
    vendorHint:
      "1B & 3B Food Halls, Sections 125, 126, 211, 212, Center Field (150), Budweiser Porch"
  },
  {
    name: "Philly Cheesesteak",
    fare: "Meals",
    vendor: "Sizzle",
    vendorHint: "1B Food Hall"
  },
  {
    name: "Colony Grill Cheese Pizza",
    fare: "Meals",
    vendor: "Colony Grill",
    vendorHint: "1B & 3B Food Halls, Right Field (144)",
    dietary: ["Vegetarian"]
  },
  {
    name: "Colony Grill Pepperoni Pizza",
    fare: "Meals",
    vendor: "Colony Grill",
    vendorHint: "1B & 3B Food Halls, Right Field (144)"
  },
  {
    name: "Colony Grill Hot Oil Pizza",
    fare: "Meals",
    vendor: "Colony Grill",
    vendorHint: "1B & 3B Food Halls, Right Field (144)"
  },
  {
    name: "Sausage & Peppers",
    fare: "Meals",
    vendor: "Sizzle",
    vendorHint: "1B Food Hall; also Budweiser Grill (Section 126)"
  },
  {
    name: "Cotton Candy",
    fare: "Snacks",
    vendorHint: "Section 130, Budweiser Porch"
  },

  // ── Sweets & Snacks (unique items) ─────────────────────────────
  {
    name: "Cannoli",
    description: "Freshly made",
    fare: "Desserts",
    vendor: "Fiamma",
    vendorHint: "1B Base Food Hall"
  },
  {
    name: "Churros",
    fare: "Desserts",
    vendorHint: "Section 130"
  },
  {
    name: "Crumbl Cookies",
    fare: "Desserts",
    vendor: "Crumbl Cookies",
    vendorHint: "1B & 3B Food Halls"
  },
  {
    name: "Dippin Dots Ice Cream",
    fare: "Desserts",
    vendor: "Dippin Dots",
    vendorHint: "Sections 116, 123, Left Field (145), Right Field (146)"
  },
  {
    name: "Italian Ice",
    description: "Soft-serve",
    fare: "Desserts",
    vendor: "Carousel Icery",
    vendorHint: "Section 105",
    dietary: ["Vegan"]
  },
  {
    name: "Epic Milkshakes",
    fare: "Desserts",
    vendor: "Epic Milkshakes",
    vendorHint: "Section 107; also Johnny Rockets Right Field (146)"
  },
  {
    name: "Mr. Softee Soft Serve",
    fare: "Desserts",
    vendor: "Mr. Softee",
    vendorHint: "Right Field (146)"
  },
  {
    name: "Bavarian Glazed Nuts",
    description: "Almonds, cashews, and pecans",
    fare: "Snacks",
    vendor: "Bavarian Nut Cart",
    vendorHint: "Sections 121, 128"
  },

  // ── Dietary section unique items ───────────────────────────────
  {
    name: "Gluten Free Pretzel Bites with Cheddar Dipping Sauce",
    fare: "Snacks",
    vendor: "Gluten Free Fan Favorites",
    vendorHint: "Right Field (148)",
    dietary: ["Gluten Free"]
  }
];

export async function parseTropicanaFieldMenu(
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
