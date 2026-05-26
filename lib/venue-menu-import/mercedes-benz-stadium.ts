/**
 * Mercedes-Benz Stadium (Atlanta United / Atlanta Falcons) menu parser.
 *
 * Curated from the official All Vendors page. The source is a large
 * JS-rendered vendor + item listing. Items through the letter "C" were
 * extractable; items D-Z were truncated. Concept-level vendor entries
 * cover notable Atlanta food brands whose full menus weren't captured.
 * Re-fetch the source page to expand coverage in future updates.
 *
 * Source: https://www.mercedesbenzstadium.com/all-vendors
 * Re-verify each season to pick up menu changes.
 */

import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "mercedes-benz-stadium";
const VENUE_NAME = "Mercedes-Benz Stadium";
const SOURCE_URL = "https://www.mercedesbenzstadium.com/all-vendors";

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
  // ── ATL Stadium Signatures ──────────────────────────────────────

  {
    name: "ATL BBQ Burger",
    description:
      "Beef patty, white American cheese, braised onions, BBQ pimento cheese sauce, brioche bun",
    fare: "Meals",
    vendor: "ATL Grill",
    vendorHint: "Sec. 133, 210, 234, 347",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "ATL-Mac",
    description: "Chopped brisket, diced jalapeños, BBQ sauce, scallions",
    fare: "Meals",
    vendor: "ATL Grill",
    vendorHint: "Sec. 133, 210, 234, 347",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "ATL Nachos",
    description: "Chorizo con queso, pico de gallo, green onions",
    fare: "Snacks",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "\"A\"talian Sandwich",
    description:
      "Genoa salami, ham, capicola, provolone, mixed greens, tomatoes, muffuletta dressing, focaccia bread",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "\"A\" Wings and Fries",
    description: "10-piece wings with choice of seasoning and fries",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── BBQ ─────────────────────────────────────────────────────────

  {
    name: "4 Rivers' BBQ Nachos",
    description:
      "Choice of pulled chicken or pork, all purpose rub, smoked, 4 Rivers signature sauce, nacho chips",
    fare: "Meals",
    vendor: "4 Rivers Smokehouse",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "4 Rivers' Pulled Pork Sandwich",
    description: "12-hour smoked bone-in pork shoulder, hand-pulled",
    fare: "Meals",
    vendor: "4 Rivers Smokehouse",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "BBQ Pork Burnt Ends Mac",
    description: "Smoked pork burnt ends, BBQ sauce, scallions",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "BBQ Pork Rinds",
    description: "BBQ seasoning with pimento cheese dip",
    fare: "Snacks",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Burnt End Nachos",
    description:
      "Burnt ends of brisket, tortilla chips, white cheese sauce, BBQ sauce, jalapeños",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Carved Brisket Sandwich",
    description: "Slow cooked carved brisket, BBQ sauce, pickles, coleslaw",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Big Tex Sandwich",
    description: "Beef brisket, white onion, mustard, pickle",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Burgers ─────────────────────────────────────────────────────

  {
    name: "Chicken Burger",
    description:
      "Tequila chicken burger, jicama slaw, roasted poblano cream, pepper jack cheese, knot roll",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Cheeseburger Mac",
    description: "Ground beef, pico de gallo, Freddie sauce",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Black Bean Veggie Burger",
    description: "Served with vegan mayo",
    fare: "Meals",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Cheesesteaks ────────────────────────────────────────────────

  {
    name: "Beef Cheesesteak",
    description: "Chopped seasoned ribeye with white American and provolone cheese",
    fare: "Meals",
    vendor: "Big Dave's Cheesesteaks",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "Big Dave's Seasoned Fries",
    description: "Tossed in Big Dave's signature all-purpose seasoning",
    fare: "Snacks",
    vendor: "Big Dave's Cheesesteaks",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "Cheesesteak Eggrolls",
    fare: "Snacks",
    vendor: "Big Dave's Cheesesteaks",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },

  // ── Chicken ─────────────────────────────────────────────────────

  {
    name: "Bang Bang Shrimp",
    description:
      "Crispy shrimp tossed in creamy spicy sauce, sesame onions, shredded iceberg",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Blackened Chicken Wrap",
    description:
      "Grilled Cajun chicken, smoky bacon, cheddar/jack, fire roasted corn salsa, lettuce, BBQ aioli, crispy onions, jalapeño cheddar tortilla",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Buffalo Chicken Mac",
    description: "Mac and cheese, buffalo chicken, blue cheese crumbles, scallions",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Cajun Crispy Chicken Sandwich",
    description:
      "Cajun hand-breaded chicken, pickles, honey mustard, brioche bun, served with French fries",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Chicken Hibachi Bowl",
    description:
      "Marinated hibachi chicken breast, vegetables, fried rice, yum yum sauce",
    fare: "Meals",
    vendor: "SO:KO:ME",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Chicken Salad Sliders",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Hot Dogs / Sausages ─────────────────────────────────────────

  {
    name: "Backyard Dog",
    description: "Chili mac, crushed Fritos, shredded cheddar cheese, cilantro",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Beyond Sausage Sandwich",
    description: "Beyond brat, onions and peppers, served on a hoagie roll",
    fare: "Meals",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Carved Sausage",
    description:
      "Andouille and kielbasa, served with pickled okra, sautéed onions, peppers",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Fries / Sides ──────────────────────────────────────────────

  {
    name: "Bacon Cheddar Fries",
    description: "Bacon bits, cheddar cheese sauce, shaved green onions",
    fare: "Snacks",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Buffalo Fries",
    description:
      "Buffalo seasoning, chunky blue cheese dressing, celery, green onions",
    fare: "Snacks",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Carne Asada Fries",
    description: "Chipotle steak, pico de gallo, queso cheese crumbles",
    fare: "Snacks",
    vendor: "Fresh Mex",
    vendorHint: "Sec. 105, 125, 305, 340",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Baked Potato",
    description: "Cheddar cheese, bacon, scallions, sour cream",
    fare: "Snacks",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Bavarian Pretzel",
    fare: "Snacks",
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Grilled Cheese ──────────────────────────────────────────────

  {
    name: "Basil Pesto Melt Grilled Cheese",
    description:
      "Pesto, roasted marinated tomatoes, vegan provolone cheese, and arugula",
    fare: "Meals",
    dietary: ["Vegetarian"],
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Beyond Vegan Grilled Cheese",
    description: "Beyond meat, vegan American cheese, served on Texas toast",
    fare: "Meals",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Brisket Grilled Cheese",
    description: "Braised beef, BBQ aioli, and gruyere cheese on Texas toast",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Mac & Cheese ────────────────────────────────────────────────

  {
    name: "Avoiding Gluten Mac & Cheese",
    fare: "Meals",
    vendor: "The Mac Shac",
    vendorHint: "Sec. 122, 238, 320",
    dietary: ["Gluten Free"],
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Braised Beef Mac",
    fare: "Meals",
    vendor: "The Mac Shac",
    vendorHint: "Sec. 122, 238, 320",
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Mexican / Tacos ─────────────────────────────────────────────

  {
    name: "Baja Shrimp Dos Tacos",
    description: "Baja shrimp, mango slaw, cilantro lime aioli",
    fare: "Meals",
    vendor: "Fresh Mex",
    vendorHint: "Sec. 105, 125, 305, 340",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Beef Barria Dos Tacos",
    description:
      "Barbacoa beef, shaved cabbage, sour cream, fresh crumbled queso, cilantro, flour tortillas",
    fare: "Meals",
    vendor: "Fresh Mex",
    vendorHint: "Sec. 105, 125, 305, 340",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Carne Asada Tacos",
    fare: "Meals",
    vendor: "Fresh Mex",
    vendorHint: "Sec. 105, 125, 305, 340",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Buffalo Chicken Quesadilla",
    description:
      "Grilled chicken, cheddar mozzarella, ranch, buffalo sauce, green onions",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Pizza ───────────────────────────────────────────────────────

  {
    name: "Cheese Personal Pizza",
    description: "Italian tomato sauce, shredded mozzarella cheese",
    fare: "Meals",
    vendor: "Capital Crust Pizza",
    vendorHint: "Sec. 115, 131, 214, 230, 338",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Cheese Pizzette",
    description:
      "Italian tomato sauce, shredded mozzarella, parmesan, fresh oregano",
    fare: "Meals",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Cheese Stromboli Pinwheel",
    description: "Served with marinara sauce",
    fare: "Snacks",
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Salads / Wraps ──────────────────────────────────────────────

  {
    name: "Caesar Salad",
    description: "Mixed greens, shaved parmesan, croutons, Caesar dressing",
    fare: "Meals",
    dietary: ["Vegetarian"],
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Buffalo Cauliflower Wrap",
    description:
      "Buffalo cauliflower, shredded kale, shredded carrots, diced tomatoes, vegan ranch",
    fare: "Meals",
    dietary: ["Vegan", "Vegetarian"],
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Snacks ──────────────────────────────────────────────────────

  {
    name: "Charcuterie Sampler",
    description:
      "Lebanon bologna, black pepper sorghum, summer sausage, drunken tomatoes, cornichons, mustard, toast points",
    fare: "Snacks",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Bacon-Buffalo Baked Beans",
    fare: "Snacks",
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Desserts ────────────────────────────────────────────────────

  {
    name: "Assorted Gourmet Cookies",
    fare: "Desserts",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Assorted Italian Ices",
    fare: "Desserts",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Baklava Dessert",
    fare: "Desserts",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Berry Blast Funnel Cake Fries",
    fare: "Desserts",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Cheesecake and Brownie Stacker",
    fare: "Desserts",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Bruster's Ice Cream",
    description: "Cups, waffle bowls, and waffle cones",
    fare: "Desserts",
    vendor: "Bruster's",
    vendorHint: "Sec. 104, 124, 221, 246, 303, 322, 334",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Dippin' Dots",
    fare: "Desserts",
    vendor: "Dippin' Dots",
    vendorHint: "Sec. 113, 126, 216, 226",
    tags: ["mls", "nfl", "world-cup-host"]
  },

  // ── Concept-Level Vendor Imports (iconic Atlanta food brands) ───

  {
    name: "Chick-fil-A",
    description: "The iconic Atlanta-born chicken chain (closed on Sundays)",
    fare: "Meals",
    vendor: "Chick-fil-A",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "H&F Burger / Hop's Chicken",
    description:
      "From Holeman & Finch — burgers and fried chicken from one of Atlanta's top restaurants",
    fare: "Meals",
    vendor: "H&F Burger / Hop's Chicken",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "J.R. Crickets",
    description: "Legendary Atlanta wing spot",
    fare: "Meals",
    vendor: "J.R. Crickets",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "Williamson Bros BBQ",
    description: "Iconic Atlanta BBQ",
    fare: "Meals",
    vendor: "Williamson Bros BBQ",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "Papi's Cuban Grill",
    description: "Cuban sandwiches and platters",
    fare: "Meals",
    vendor: "Papi's Cuban Grill",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "Irie Mon Caribbean Café",
    description: "Caribbean cuisine",
    fare: "Meals",
    vendor: "Irie Mon Caribbean Café",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "SO:KO:ME Hibachi",
    description: "Hibachi bowls and Japanese-inspired dishes",
    fare: "Meals",
    vendor: "SO:KO:ME",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Farm Burger",
    description: "Grass-fed burgers from an Atlanta farm-to-table chain",
    fare: "Meals",
    vendor: "Farm Burger",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "Moe's Southwest Grill",
    description: "Atlanta-founded Southwest-style chain",
    fare: "Meals",
    vendor: "Moe's Southwest Grill",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "WNB Factory",
    description: "Wings and burgers",
    fare: "Meals",
    vendor: "WNB Factory",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Molly B's",
    description: "Southern comfort food",
    fare: "Meals",
    vendor: "Molly B's",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "El Santo Gallo",
    description: "Latin-inspired cuisine",
    fare: "Meals",
    vendor: "El Santo Gallo",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Taffer's Tavern",
    description: "Restaurant by Jon Taffer featuring elevated bar food",
    fare: "Meals",
    vendor: "Taffer's Tavern",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "West Nest by Westside Works",
    description: "Community-driven vendor from Atlanta's Westside",
    fare: "Meals",
    vendor: "West Nest by Westside Works",
    tags: ["mls", "nfl", "world-cup-host", "local-vendor"]
  },
  {
    name: "Roti",
    description: "Customizable Indian-inspired bowls and wraps",
    fare: "Meals",
    vendor: "Roti",
    tags: ["mls", "nfl", "world-cup-host"]
  },
  {
    name: "Frios Gourmet Pops",
    description: "Gourmet frozen fruit pops",
    fare: "Desserts",
    vendor: "Frios Gourmet Pops",
    tags: ["mls", "nfl", "world-cup-host"]
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

export async function parseMercedesBenzStadiumMenu(
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
