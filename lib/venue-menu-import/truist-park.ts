/**
 * Truist Park (Atlanta Braves) menu parser.
 *
 * Source: https://www.mlb.com/braves/ballpark/concessions
 * Curated static dataset from the official Braves Food & Beverage Guide.
 * Re-extract each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "truist-park";
const VENUE_NAME = "Truist Park";
const SOURCE_URL = "https://www.mlb.com/braves/ballpark/concessions";

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
};

const MENU_DATA: RawItem[] = [
  // ── 2026 Signature Menu Items ──────────────────────────────────
  {
    name: "Low Country Crunch",
    description:
      "Six jumbo shrimp, crispy coconut breading, chili aioli, lemon wedge",
    fare: "Meals",
    vendor: "1871 Grill",
    vendorHint: "Section 113"
  },
  {
    name: "Peach Dingers",
    description:
      "Crispy egg rolls filled with cinnamon-spiced peach cobbler and caramel sauce",
    fare: "Desserts",
    vendor: "Coop's Championship Chicken",
    vendorHint: "Sections 138, 320"
  },
  {
    name: "A-Town Melt",
    description:
      "Spicy chicken melt with pepper jack fondue on muffaletta bread",
    fare: "Meals",
    vendor: "Braves Market",
    vendorHint: "Sections 313, 343"
  },
  {
    name: "Blooperito",
    description:
      "Deep-fried burrito with chipotle beef, cotija cheese, pico de gallo, house sauce",
    fare: "Meals",
    vendorHint: "Sections 215, 239"
  },
  {
    name: "The Bat Flip",
    description:
      "Toasted brioche with two pounds of beef patties, braised short rib, pork belly, melted cheese, onions, fried egg",
    fare: "Meals",
    vendor: "1871 Grill",
    vendorHint: "Section 113"
  },
  {
    name: "Field of Greens",
    description:
      "Grilled ciabatta, roasted veggies, red pepper aioli, collard-green gremolata, salt and vinegar chips",
    fare: "Meals",
    vendorHint: "Section 129",
    dietary: ["Vegetarian"]
  },
  {
    name: "The Baffle",
    description:
      "Slow-smoked brisket, truffle cheese sauce on a crispy golden pocket",
    fare: "Meals",
    vendor: "1871 Grill",
    vendorHint: "Near Section 113"
  },

  // ── 1871 Grille ────────────────────────────────────────────────
  {
    name: "The Walk-Off",
    fare: "Meals",
    vendor: "1871 Grill",
    vendorHint: "Section 113 only"
  },
  {
    name: "Gluten-Free Burger",
    description: "Served on GF bun",
    fare: "Meals",
    vendor: "1871 Grill",
    vendorHint: "Sections 113, 141, 215, 239, 332",
    dietary: ["Gluten Free"]
  },
  {
    name: "Chicken Tender Basket",
    fare: "Meals",
    vendor: "1871 Grill",
    vendorHint: "Sections 113, 141, 215, 239, 332; also Braves Market"
  },
  {
    name: "Burger Basket",
    fare: "Meals",
    vendor: "1871 Grill",
    vendorHint: "Sections 113, 141, 215, 239, 332; also Braves Market"
  },
  {
    name: "Footlong Hot Dog",
    fare: "Meals",
    vendor: "1871 Grill",
    vendorHint:
      "Sections 113, 141, 215, 239, 332; also Ballpark Classics"
  },
  {
    name: "Jumbo Hot Dog",
    fare: "Meals",
    vendor: "1871 Grill",
    vendorHint:
      "Sections 113, 141, 215, 239, 332; also Braves Grill & Go, Blue Moon Beer Garden"
  },
  {
    name: "Curly Fries",
    fare: "Snacks",
    vendor: "1871 Grill",
    vendorHint: "Sections 113, 141, 215, 239, 332"
  },

  // ── Ballpark Classics ──────────────────────────────────────────
  {
    name: "Classic Nacho",
    fare: "Snacks",
    vendor: "Ballpark Classics",
    vendorHint:
      "Sections 116, 135, 147, 242; also Braves Grill & Go, Braves Market"
  },
  {
    name: "Pretzel",
    fare: "Snacks",
    vendor: "Ballpark Classics",
    vendorHint: "Sections 116, 135, 147, 242"
  },
  {
    name: "Veggie Dog",
    fare: "Meals",
    vendor: "Ballpark Classics",
    vendorHint: "Sections 116, 135, 147, 242; also Smokey Q",
    dietary: ["Vegetarian"]
  },
  {
    name: "Chili Cheese Dog",
    fare: "Meals",
    vendor: "Ballpark Classics",
    vendorHint: "Sections 116, 135, 147, 242"
  },

  // ── Blue Moon Beer Garden (Section 310) ────────────────────────
  {
    name: "Cheesesteak",
    fare: "Meals",
    vendor: "Fred's Meat and Bread",
    vendorHint: "Section 310, Blue Moon Beer Garden"
  },
  {
    name: "Korean Cheesesteak",
    fare: "Meals",
    vendor: "Fred's Meat and Bread",
    vendorHint: "Section 310, Blue Moon Beer Garden"
  },
  {
    name: "Conecuh Sausage",
    fare: "Meals",
    vendor: "Conecuh Sausage",
    vendorHint: "Section 310, Blue Moon Beer Garden"
  },
  {
    name: "Double Play Bao Buns",
    fare: "Meals",
    vendor: "Beer Garden Bites",
    vendorHint: "Section 310, Blue Moon Beer Garden"
  },

  // ── Bona Fide Deluxe (Section 111) ─────────────────────────────
  {
    name: "Vegan Italian Sausage Sandwich",
    fare: "Meals",
    vendor: "Bona Fide Deluxe",
    vendorHint: "Section 111",
    dietary: ["Vegan"]
  },
  {
    name: "Smoked Turkey Melt Sandwich",
    fare: "Meals",
    vendor: "Bona Fide Deluxe",
    vendorHint: "Section 111"
  },
  {
    name: "Pastrami Melt Sandwich",
    fare: "Meals",
    vendor: "Bona Fide Deluxe",
    vendorHint: "Section 111"
  },

  // ── Braves Grab N' Go Market (Section 129) — distinctive only ─
  {
    name: "Can Cakes Japanese Cheesecake",
    fare: "Desserts",
    vendor: "Braves Grab N' Go Market",
    vendorHint: "Section 129"
  },
  {
    name: "Can Cakes Banana Pudding",
    fare: "Desserts",
    vendor: "Braves Grab N' Go Market",
    vendorHint: "Section 129"
  },
  {
    name: "Crackling Pimento Cheese",
    fare: "Snacks",
    vendor: "Dips Restaurant",
    vendorHint: "Section 129, Grab N' Go Market"
  },

  // ── Braves Grill & Go ─────────────────────────────────────────
  {
    name: "Bratwurst",
    fare: "Meals",
    vendor: "Braves Grill & Go",
    vendorHint: "Section 137"
  },
  {
    name: "Andouille Sausage",
    fare: "Meals",
    vendor: "Braves Grill & Go",
    vendorHint: "Sections 136, 137, 317, 337"
  },
  {
    name: "Cotton Candy",
    fare: "Snacks",
    vendorHint: "Sections 136, 137, 317, 337; also Braves Market, Dippin' Dots, Center Field"
  },

  // ── Braves Market (Section 313, 343) ───────────────────────────
  {
    name: "Pepperoni Personal Pizza",
    fare: "Meals",
    vendor: "Braves Market",
    vendorHint: "Sections 313, 343"
  },
  {
    name: "Cheese Personal Pizza",
    fare: "Meals",
    vendor: "Braves Market",
    vendorHint: "Sections 313, 343",
    dietary: ["Vegetarian"]
  },

  // ── The Carvery (Section 140) ──────────────────────────────────
  {
    name: "Big League Bite Rib Boomstick",
    description: "Rib boomstick with sides",
    fare: "Meals",
    vendor: "The Carvery",
    vendorHint: "Section 140"
  },
  {
    name: "Loaded Brisket Mac and Cheese",
    fare: "Meals",
    vendor: "The Carvery",
    vendorHint: "Section 140"
  },

  // ── Center Field Market (Section 149) ──────────────────────────
  {
    name: "Gluten Free Jumbo Hot Dog",
    fare: "Meals",
    vendor: "Center Field Market",
    vendorHint: "Section 149",
    dietary: ["Gluten Free"]
  },
  {
    name: "Veggie Bowl",
    fare: "Meals",
    vendor: "Center Field Market",
    vendorHint: "Section 149",
    dietary: ["Vegetarian"]
  },
  {
    name: "Chicken Salad Sandwich",
    fare: "Meals",
    vendor: "Center Field Market",
    vendorHint: "Section 149"
  },

  // ── Chick-fil-A ────────────────────────────────────────────────
  {
    name: "Chick-fil-A Original Chicken Sandwich",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: "Sections 105, 143, 231, 326, 341"
  },
  {
    name: "Chick-fil-A Spicy Chicken Sandwich",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: "Sections 105, 143, 231, 326, 341"
  },
  {
    name: "Chick-fil-A Nuggets",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: "Sections 105, 143, 231, 326, 341"
  },
  {
    name: "Chick-fil-A Waffle Fries",
    fare: "Snacks",
    vendor: "Chick-fil-A",
    vendorHint: "Sections 143, 326"
  },
  {
    name: "Chick-fil-A Milkshake",
    fare: "Desserts",
    vendor: "Chick-fil-A",
    vendorHint: "Sections 143, 326"
  },

  // ── Coop's Championship Chicken ────────────────────────────────
  {
    name: "Coop's Ice Cream Helmet",
    description: "Chocolate, Vanilla, and Cookies & Cream",
    fare: "Desserts",
    vendor: "Coop's Championship Chicken",
    vendorHint: "Sections 138, 320"
  },

  // ── Coors Light Chophouse (Section 158) ────────────────────────
  {
    name: "ATL Fish and Chips",
    fare: "Meals",
    vendor: "Coors Light Chophouse",
    vendorHint: "Section 158"
  },

  // ── Dippin' Dots ───────────────────────────────────────────────
  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendor: "Dippin' Dots",
    vendorHint: "Sections 106, 142, 220, 230, 314, 340"
  },
  {
    name: "Frozen Banana",
    fare: "Desserts",
    vendor: "Dippin' Dots",
    vendorHint: "Sections 106, 142, 220, 230, 314, 340"
  },
  {
    name: "Doc Popcorn",
    description: "Gourmet flavored popcorn",
    fare: "Snacks",
    vendor: "Dippin' Dots",
    vendorHint: "Section 106"
  },

  // ── Fox Brothers BBQ (Section 151) ─────────────────────────────
  {
    name: "Fox Brothers Pork Sandwich",
    fare: "Meals",
    vendor: "Fox Brothers BBQ",
    vendorHint: "Section 151"
  },
  {
    name: "Fox Brothers Chicken Sandwich",
    fare: "Meals",
    vendor: "Fox Brothers BBQ",
    vendorHint: "Section 151"
  },

  // ── Grindhouse Burger (Section 315, 335) ───────────────────────
  {
    name: "Grindhouse Double Cheeseburger",
    fare: "Meals",
    vendor: "Grindhouse Burger",
    vendorHint: "Sections 315, 335; also Outfield Market (152-155)"
  },

  // ── King of Pops (Section 347) ─────────────────────────────────
  {
    name: "King of Pops Pop",
    fare: "Desserts",
    vendor: "King of Pops",
    vendorHint: "Section 347"
  },
  {
    name: "King of Pops Float",
    fare: "Desserts",
    vendor: "King of Pops",
    vendorHint: "Section 347"
  },

  // ── Mayfield Ice Cream Stand ───────────────────────────────────
  {
    name: "Mayfield Ice Cream",
    description: "Chocolate, Vanilla, Cookies & Cream, Peanut Butter Cup — helmet or cup",
    fare: "Desserts",
    vendor: "Mayfield Ice Cream Stand",
    vendorHint:
      "Sections 138, 148, 149, 217, 243, 320, 322, 330"
  },

  // ── Ole Mole Nachos (Section 146) ──────────────────────────────
  {
    name: "Loaded Chicken Nacho",
    fare: "Meals",
    vendor: "Ole Mole Nachos",
    vendorHint: "Section 146"
  },
  {
    name: "Chicken Nacho Helmet",
    fare: "Meals",
    vendor: "Ole Mole Nachos",
    vendorHint: "Section 146"
  },
  {
    name: "Roasted Street Corn",
    fare: "Snacks",
    vendor: "Ole Mole Nachos",
    vendorHint: "Section 146; also The Taco Factory (Section 152)"
  },

  // ── Outfield Market (Sections 152–155) ─────────────────────────
  {
    name: "Mo'Bay Beignets",
    description: "Buttercream, cinnamon, or strawberry syrup",
    fare: "Desserts",
    vendor: "Sweet Spot",
    vendorHint: "Outfield Market (Sections 152-155)"
  },
  {
    name: "Red Dawg",
    fare: "Meals",
    vendor: "Pepper's Hot Dogs",
    vendorHint: "Outfield Market (Sections 152-155)"
  },
  {
    name: "ATL Dawg",
    fare: "Meals",
    vendor: "Pepper's Hot Dogs",
    vendorHint: "Outfield Market (Sections 152-155)"
  },
  {
    name: "Street Dog",
    fare: "Meals",
    vendor: "Pepper's Hot Dogs",
    vendorHint: "Outfield Market (Sections 152-155)"
  },
  {
    name: "Pulled Chicken Burrito",
    fare: "Meals",
    vendor: "Bell Street Burritos",
    vendorHint: "Outfield Market (Sections 152-155)"
  },
  {
    name: "Ground Beef Burrito",
    fare: "Meals",
    vendor: "Bell Street Burritos",
    vendorHint: "Outfield Market (Sections 152-155)"
  },
  {
    name: "Bean Burrito",
    fare: "Meals",
    vendor: "Bell Street Burritos",
    vendorHint: "Outfield Market (Sections 152-155)",
    dietary: ["Vegetarian"]
  },
  {
    name: "Chips & Queso",
    fare: "Snacks",
    vendor: "Bell Street Burritos",
    vendorHint: "Outfield Market; also The Taco Factory (Section 152)"
  },
  {
    name: "The Heavy Hitter Tomahawk Steak",
    fare: "Meals",
    vendor: "Vice",
    vendorHint: "Outfield Market (Sections 152-155)"
  },
  {
    name: "The Patagonia Steak Sandwich",
    fare: "Meals",
    vendor: "Vice",
    vendorHint: "Outfield Market (Sections 152-155)"
  },
  {
    name: "Tsunami Trio",
    description: "2 tacos and chips & queso",
    fare: "Meals",
    vendor: "Taqueria Tsunami",
    vendorHint: "Outfield Market (Sections 152-155)"
  },
  {
    name: "Coop's Chicken Wings",
    fare: "Meals",
    vendor: "Coop's Wings",
    vendorHint: "Outfield Market (Sections 152-155)"
  },
  {
    name: "Stealth Fries",
    fare: "Snacks",
    vendor: "Coop's Wings",
    vendorHint: "Outfield Market (Sections 152-155)"
  },

  // ── The Slice ──────────────────────────────────────────────────
  {
    name: "Specialty Pizza Slice",
    description:
      "Rotating: BBQ Chicken, Buffalo Chicken, Meat Lover's, Hawaiian",
    fare: "Meals",
    vendor: "The Slice",
    vendorHint: "Section 112"
  },
  {
    name: "Pizza Slice",
    fare: "Meals",
    vendor: "The Slice",
    vendorHint: "Sections 112, 150"
  },
  {
    name: "Meatball Sub",
    fare: "Meals",
    vendor: "The Slice",
    vendorHint: "Section 112"
  },
  {
    name: "Chicken Parm Sandwich",
    fare: "Meals",
    vendor: "The Slice",
    vendorHint: "Section 112"
  },
  {
    name: "Pizza Pretzel",
    fare: "Snacks",
    vendor: "The Slice",
    vendorHint: "Section 112"
  },
  {
    name: "Brauhaus Pretzel with Cheese Cup",
    fare: "Snacks",
    vendor: "The Slice",
    vendorHint: "Section 150"
  },

  // ── Smokey Q (Sections 116, 242, 329) ──────────────────────────
  {
    name: "Brisket Nacho Helmet",
    fare: "Meals",
    vendor: "Smokey Q",
    vendorHint: "Sections 116, 242, 329"
  },
  {
    name: "BBQ Sandwich",
    fare: "Meals",
    vendor: "Smokey Q",
    vendorHint: "Sections 116, 242, 329"
  },
  {
    name: "BBQ Nachos",
    fare: "Snacks",
    vendor: "Smokey Q",
    vendorHint: "Sections 116, 242, 329"
  },

  // ── Snowie ATL (Section 149) ───────────────────────────────────
  {
    name: "Snow Cones",
    fare: "Desserts",
    vendor: "Snowie ATL",
    vendorHint: "Section 149, Children's Healthcare of Atlanta Park"
  },

  // ── The Taco Factory (Section 152) ─────────────────────────────
  {
    name: "Taco Trio",
    fare: "Meals",
    vendor: "The Taco Factory",
    vendorHint: "Section 152"
  },
  {
    name: "Grand Slam Boomstick Nacho",
    fare: "Meals",
    vendor: "The Taco Factory",
    vendorHint: "Section 152"
  },
  {
    name: "Big Queso",
    fare: "Snacks",
    vendor: "The Taco Factory",
    vendorHint: "Section 152"
  },
  {
    name: "Taco Bowl",
    fare: "Meals",
    vendor: "The Taco Factory",
    vendorHint: "Section 152"
  },
  {
    name: "Nacho Bowl",
    fare: "Snacks",
    vendor: "The Taco Factory",
    vendorHint: "Section 152"
  }
];

export async function parseTruistParkMenu(
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
