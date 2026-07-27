/**
 * Big 12 Phase 1 starter menus — verified athletics / local coverage only.
 * Descriptions rewritten in Stadium Slop voice (not copied wholesale).
 *
 * Menu pending (thin / unpublished item-level sources):
 * - lavell-edwards-stadium, jack-trice-stadium, boone-pickens-stadium,
 *   galaxy-stadium, rice-eccles-stadium, milan-puskar-stadium,
 *   tdecu-stadium (vendors confirmed 2025; dish SKUs were inferred — hidden)
 *
 * McLane: preserve Aug 2025 athletics stand list (likely current) and add
 * Fall 2026 Fan First / 254 Classics food SKUs. Do not shrink to the 10-item pack.
 */

import type { VenueMenuParseResult, VenueMenuParser } from "./types";
import {
  dedupeMenuItems,
  NCAA_FB,
  toSourceItem,
  type NcaaFootballRawItem
} from "./ncaa-football-menu-common";

function makeParser(
  venueSlug: string,
  venueName: string,
  defaultSourceUrl: string,
  raw: NcaaFootballRawItem[],
  seasonTag = "import-season:2025"
): VenueMenuParser {
  return async (sourceUrl?: string): Promise<VenueMenuParseResult> => {
    const url = sourceUrl ?? defaultSourceUrl;
    const withSeason = raw.map((r) => ({
      ...r,
      tags: [...new Set([...(r.tags ?? []), seasonTag])]
    }));
    const items = dedupeMenuItems(withSeason).map((r) => toSourceItem(r, url));
    return {
      venueSlug,
      venueName,
      sourceUrl: url,
      parsedAt: new Date().toISOString(),
      items,
      skippedDrinks: 0
    };
  };
}

/** McLane — Aug 2025 Baylor athletics stand list (likely current; Sodexo still F&B). */
const mclane2025: NcaaFootballRawItem[] = [
  { name: "Conecuh Sausage", fare: "Meals", vendor: "Bear Zone", tags: [...NCAA_FB, "signature", "likely-current"] },
  { name: "Conecuh Sausage Wrap", fare: "Meals", vendor: "Bear Zone", tags: [...NCAA_FB, "likely-current"] },
  {
    name: "Hot Dog",
    fare: "Meals",
    vendor: "Bear Zone",
    tags: [...NCAA_FB, "likely-current", "verified-current", "fan-first-2026"]
  },
  {
    name: "Nachos",
    fare: "Meals",
    vendor: "Bear Zone",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "likely-current", "verified-current", "fan-first-2026"]
  },
  { name: "Soft Pretzel", fare: "Snacks", vendor: "Bear Zone", dietary: ["Vegetarian"], tags: [...NCAA_FB, "likely-current"] },
  {
    name: "Brisket Nachos",
    description: "Brisket-loaded nachos from Sic 'Em Nachos",
    fare: "Meals",
    vendor: "Sic 'Em Nachos",
    vendorHint: "Sections 104 & 218",
    tags: [...NCAA_FB, "signature", "likely-current"]
  },
  {
    name: "Pardon My Philly Cheesesteak",
    fare: "Meals",
    vendor: "Pardon My Cheesesteak",
    vendorHint: "Sections 108 & 213",
    tags: [...NCAA_FB, "signature", "likely-current"]
  },
  {
    name: "Loaded Fries",
    fare: "Meals",
    vendor: "Pardon My Cheesesteak",
    vendorHint: "Section 213",
    tags: [...NCAA_FB, "likely-current"]
  },
  { name: "Corn Dog", fare: "Meals", vendor: "Hull Concessions", tags: [...NCAA_FB, "likely-current"] },
  {
    name: "Funnel Cake",
    fare: "Desserts",
    vendor: "Hull Concessions",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "likely-current"]
  },
  { name: "Chicken Basket", fare: "Meals", vendor: "Hull Concessions", tags: [...NCAA_FB, "likely-current"] },
  {
    name: "Waffle Fries",
    fare: "Snacks",
    vendor: "Hull Concessions",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "likely-current"]
  },
  {
    name: "Sonic Smash Burger",
    fare: "Meals",
    vendor: "Sonic Drive-In",
    vendorHint: "Section 118",
    tags: [...NCAA_FB, "likely-current"]
  },
  {
    name: "Sonic Footlong Chili Cheese Coney",
    fare: "Meals",
    vendor: "Sonic Drive-In",
    vendorHint: "Section 118",
    tags: [...NCAA_FB, "likely-current"]
  },
  {
    name: "Sonic Popcorn Chicken",
    fare: "Meals",
    vendor: "Sonic Drive-In",
    vendorHint: "Section 118",
    tags: [...NCAA_FB, "likely-current"]
  },
  {
    name: "Andy's Frozen Custard",
    fare: "Desserts",
    vendor: "Andy's Frozen Custard",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "local-vendor", "likely-current"]
  },
  {
    name: "Cheese Pizza",
    fare: "Meals",
    vendor: "Stadium Pie's",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "likely-current"]
  },
  { name: "Pepperoni Pizza", fare: "Meals", vendor: "Stadium Pie's", tags: [...NCAA_FB, "likely-current"] },
  {
    name: "Rudy's Chop Beef Sandwich",
    fare: "Meals",
    vendor: "Rudy's BBQ",
    vendorHint: "Sections 109B & 210",
    tags: [...NCAA_FB, "local-vendor", "signature", "likely-current"]
  },
  {
    name: "Rudy's Pulled Pork Sandwich",
    fare: "Meals",
    vendor: "Rudy's BBQ",
    vendorHint: "Sections 109B & 210",
    tags: [...NCAA_FB, "local-vendor", "likely-current"]
  },
  {
    name: "Rudy's Cheddar Jalapeño Sausage",
    fare: "Meals",
    vendor: "Rudy's BBQ",
    tags: [...NCAA_FB, "local-vendor", "likely-current"]
  },
  {
    name: "Bush's Chicken Sandwich",
    fare: "Meals",
    vendor: "Bush's Chicken",
    vendorHint: "Section 118",
    tags: [...NCAA_FB, "local-vendor", "likely-current"]
  },
  {
    name: "Bush's Buffalo Fries",
    fare: "Meals",
    vendor: "Bush's Chicken",
    vendorHint: "Section 118",
    tags: [...NCAA_FB, "likely-current"]
  },
  {
    name: "Bear Bites Chicken Sandwich",
    fare: "Meals",
    vendor: "Bear Bites",
    vendorHint: "Section 111",
    tags: [...NCAA_FB, "likely-current"]
  },
  {
    name: "Bear Bites Cheeseburger",
    fare: "Meals",
    vendor: "Bear Bites",
    vendorHint: "Section 111",
    tags: [...NCAA_FB, "likely-current"]
  },
  {
    name: "Ben's Salted Soft Pretzel",
    fare: "Snacks",
    vendor: "Ben's Pretzels",
    vendorHint: "Sections 115 & 213",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "local-vendor", "likely-current"]
  },
  {
    name: "Ben's Cinnamon Sugar Soft Pretzel",
    fare: "Snacks",
    vendor: "Ben's Pretzels",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "local-vendor", "likely-current"]
  }
];

/** McLane — Fall 2026 Fan First / 254 Classics + signatures (new SKUs only). */
const mclane2026FanFirst: NcaaFootballRawItem[] = [
  {
    name: "Popcorn",
    description: "254 Classics value popcorn for Fall 2026 home games",
    fare: "Snacks",
    vendor: "Sodexo",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "verified-current", "fan-first-2026"]
  },
  {
    name: "Bavarian Soft Pretzel",
    description: "254 Classics Bavarian pretzel",
    fare: "Snacks",
    vendor: "Sodexo",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "verified-current", "fan-first-2026"]
  },
  {
    name: "Bear Claw",
    description: "Oversized pastry with cinnamon and green-and-gold glaze",
    fare: "Desserts",
    vendor: "Sodexo",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "signature", "verified-current", "fan-first-2026"]
  },
  {
    name: "Sic 'Em Sliders",
    description: "Dr Pepper pulled pork or chicken with house chips",
    fare: "Meals",
    vendor: "Sodexo",
    tags: [...NCAA_FB, "signature", "verified-current", "fan-first-2026"]
  },
  {
    name: "Indy's & Belle's Touchdown Tacos",
    description: "Al pastor chicken with pineapple salsa, cilantro, onion, and Gold Rush queso",
    fare: "Meals",
    vendor: "Sodexo",
    tags: [...NCAA_FB, "signature", "verified-current", "fan-first-2026"]
  },
  {
    name: "Sic 'Em Smashburger",
    description: "Double smash with Gold Rush queso, jalapeños, crispy cheddar onions, and tamarind BBQ",
    fare: "Meals",
    vendor: "Sodexo",
    tags: [...NCAA_FB, "signature", "verified-current", "fan-first-2026"]
  },
  {
    name: "The Baylor Line Dog",
    description: "Nathan's all-beef dog with Texas chow chow, queso, and chicharrónes",
    fare: "Meals",
    vendor: "Sodexo",
    tags: [...NCAA_FB, "signature", "verified-current", "fan-first-2026"]
  },
  {
    name: "1845 Baylor Bear Family Pack",
    description: "Four hot dogs with sides built for families at Fan First pricing",
    fare: "Meals",
    vendor: "Sodexo",
    tags: [...NCAA_FB, "verified-current", "fan-first-2026"]
  }
];

/** David Booth — KU Athletics 2025 partners + KC Star sampling. */
const davidBooth: NcaaFootballRawItem[] = [
  { name: "Chick-fil-A Chicken Sandwich", fare: "Meals", vendor: "Chick-fil-A", tags: [...NCAA_FB] },
  { name: "Johnny's Tavern Chicken Tenders", description: "Tenders finished in Johnny's Wilson's sauce", fare: "Meals", vendor: "Johnny's Tavern", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "21-Inch Philly Cheesesteak", description: "Oversized Philly from the renovated Booth menu", fare: "Meals", vendor: "The Booth Concessions", tags: [...NCAA_FB, "signature"] },
  { name: "One-Pound Hawaiian Cheeseburger", description: "Pound burger on a King's Hawaiian bun", fare: "Meals", vendor: "The Booth Concessions", tags: [...NCAA_FB, "signature"] },
  { name: "Loaded Chicken Tinga Nachos", description: "Bucket nachos loaded with chicken tinga", fare: "Meals", vendor: "The Booth Concessions", tags: [...NCAA_FB, "signature"] },
  { name: "Bavarian Soft Pretzel", description: "Giant Bavarian pretzel with dipping sauces", fare: "Snacks", vendor: "The Booth Concessions", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Bigg's BBQ Sandwich", description: "Lawrence BBQ sandwich from Bigg's", fare: "Meals", vendor: "Bigg's BBQ", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Tiki Taco", description: "Taco from the Tiki Taco stand", fare: "Meals", vendor: "Tiki Taco", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Princeton Popcorn", fare: "Snacks", vendor: "Princeton Popcorn", dietary: ["Vegetarian"], tags: [...NCAA_FB, "local-vendor"] },
  { name: "Serendipity Ice Cream", fare: "Desserts", vendor: "Serendipity Ice Cream", dietary: ["Vegetarian"], tags: [...NCAA_FB] }
];

/** Folsom — CU Athletics Buffs United 2025. */
const folsom: NcaaFootballRawItem[] = [
  { name: "Blackjack Pizza", description: "Pizza from CU's official pizza sponsor", fare: "Meals", vendor: "Blackjack Pizza", vendorHint: "Gate 8 & NW plateau near Gate 19", tags: [...NCAA_FB, "signature"] },
  { name: "Frippers Gourmet Hot Dog", fare: "Meals", vendor: "Frippers", vendorHint: "Gate 11", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Chicken Tamale", fare: "Meals", vendor: "Colorado Cantina", vendorHint: "Gate 10", tags: [...NCAA_FB] },
  { name: "Veggie Tamale", fare: "Meals", vendor: "Colorado Cantina", vendorHint: "Gate 10", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Chicken Salad Sandwich", fare: "Meals", vendor: "Folsom Concessions", vendorHint: "SE corner of Field House", tags: [...NCAA_FB] },
  { name: "Dill Pickle Tots", fare: "Snacks", vendor: "Folsom Concessions", vendorHint: "Gate 7", dietary: ["Vegetarian"], tags: [...NCAA_FB, "signature"] },
  { name: "Buffalo Chicken Tots", fare: "Meals", vendor: "Folsom Concessions", vendorHint: "Gate 7", tags: [...NCAA_FB, "signature"] }
];

/** Nippert — UC Athletics 2025 gameday improvements + Sodexo. */
const nippert: NcaaFootballRawItem[] = [
  { name: "Skyline Chili Coney", description: "Cincinnati coney from expanded Skyline carts", fare: "Meals", vendor: "Skyline Chili", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Donato's Pizza Slice", fare: "Meals", vendor: "Donato's Pizza", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Bibibop Bowl", fare: "Meals", vendor: "Bibibop", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Milton's Donut", fare: "Desserts", vendor: "Milton's Donuts", dietary: ["Vegetarian"], tags: [...NCAA_FB, "local-vendor"] },
  { name: "CincyQ BBQ Plate", fare: "Meals", vendor: "CincyQ Smokehouse", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Philly Cheesesteak", fare: "Meals", vendor: "Nippert Concessions", tags: [...NCAA_FB] },
  { name: "513 Stand Hot Dog", description: "Value-menu hot dog from the 513 Stand", fare: "Meals", vendor: "513 Stand", tags: [...NCAA_FB] },
  { name: "Soft Pretzel", fare: "Snacks", vendor: "513 Stand", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Popcorn", fare: "Snacks", vendor: "513 Stand", dietary: ["Vegetarian"], tags: [...NCAA_FB] }
];

/** Mountain America — ASU / Phoenix New Times 2025 Aramark debut. */
const mountainAmerica: NcaaFootballRawItem[] = [
  { name: "Fork'em BBQ Pulled Pork Sandwich", description: "Pulled pork on a Hawaiian roll with chips and slaw", fare: "Meals", vendor: "Fork'em BBQ", vendorHint: "Coca-Cola Sun Deck / north endzone", tags: [...NCAA_FB, "signature"] },
  { name: "Hot Honey Chicken Tenders", description: "Tenders finished in hot honey with fries", fare: "Meals", vendor: "Sun Devil Burgers & Tenders", tags: [...NCAA_FB, "signature"] },
  { name: "Chick-fil-A Chicken Sandwich", fare: "Meals", vendor: "Chick-fil-A", vendorHint: "Coca-Cola Sun Deck", tags: [...NCAA_FB] },
  { name: "Someburros Burrito", description: "Local Someburros burrito from the Sun Deck stand", fare: "Meals", vendor: "Someburros", vendorHint: "Sun Deck & behind section 33", tags: [...NCAA_FB, "local-vendor"] }
];

/**
 * TDECU — archival inferred dish SKUs only (not imported).
 * UH Athletics 2025-08-22 confirms vendors (Ninfa's, Halal Guys, Pizza Hut,
 * Layne's), not dish-level menus. Rows are HIDDEN in DB; venue is menu-pending.
 */
export const TDECU_ARCHIVAL_INFERRED_ITEMS = [
  "Ninfa's Tacos",
  "Halal Guys Chicken Platter",
  "Layne's Chicken Fingers",
  "Trill Burger",
  "Pizza Hut Personal Pizza"
] as const;

/** Bill Snyder — K-State Athletics live football concessions stand menus. */
const billSnyder: NcaaFootballRawItem[] = [
  { name: "Southwest Wrap", fare: "Meals", vendor: "Stand 1", vendorHint: "Sections 35, 20, 28", tags: [...NCAA_FB] },
  { name: "Hot Dog", fare: "Meals", vendor: "Stand 1", vendorHint: "Section 35", tags: [...NCAA_FB] },
  { name: "Snack Cup Egg & Cheese", fare: "Snacks", vendor: "Stand 1", vendorHint: "Stands 1 & 10", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Popcorn", fare: "Snacks", vendor: "Bill Snyder Concessions", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Potato Tornado", fare: "Snacks", vendor: "Everyday's Saturday BBQ", vendorHint: "Stand 2, Section 3", tags: [...NCAA_FB, "signature"] },
  { name: "BBQ Sandwich", fare: "Meals", vendor: "Everyday's Saturday BBQ", vendorHint: "Stand 2, Section 3", tags: [...NCAA_FB, "local-vendor"] },
  { name: "BBQ Nachos", fare: "Meals", vendor: "Everyday's Saturday BBQ", vendorHint: "Stand 2, Section 3", tags: [...NCAA_FB, "local-vendor"] },
  { name: "BBQ Quesadillas", fare: "Meals", vendor: "Everyday's Saturday BBQ", vendorHint: "Stand 2, Section 3", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Beef Walking Taco", fare: "Meals", vendor: "Stand 3", vendorHint: "Section 4", tags: [...NCAA_FB] },
  { name: "Chicken Walking Taco", fare: "Meals", vendor: "Stand 3", vendorHint: "Section 4", tags: [...NCAA_FB] },
  { name: "Cheeseburger & Fries", fare: "Meals", vendor: "Stand 4", vendorHint: "Section 7", tags: [...NCAA_FB] },
  { name: "Grilled Chicken Skewers", fare: "Meals", vendor: "Stand 4", vendorHint: "Section 7", tags: [...NCAA_FB] },
  { name: "Cheeseburger", fare: "Meals", vendor: "Stand 7", tags: [...NCAA_FB] },
  { name: "Meatball Sub", fare: "Meals", vendor: "Stand 8", tags: [...NCAA_FB] },
  { name: "Soft Pretzel", fare: "Snacks", vendor: "Stand 8", vendorHint: "Section 22", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Chipotle Chicken and Raspberry Burrito", fare: "Meals", vendor: "EMAWCHOS", vendorHint: "Section 16", tags: [...NCAA_FB, "signature"] },
  { name: "Jumbo Nachos", fare: "Meals", vendor: "EMAWCHOS", vendorHint: "Section 16", tags: [...NCAA_FB] },
  { name: "Hot Honey Chicken and Waffle Sandwich", fare: "Meals", vendor: "Fair Favorites", vendorHint: "Section 15", tags: [...NCAA_FB, "signature"] },
  { name: "Loaded Funnel Cake", fare: "Desserts", vendor: "Fair Favorites", vendorHint: "Section 15", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Chicken and Parmesan Sandwich", fare: "Meals", vendor: "Gridiron Grill", vendorHint: "Section 14", tags: [...NCAA_FB] },
  { name: "French Fries", fare: "Snacks", vendor: "Gridiron Grill", vendorHint: "Section 14", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Philly Cheese Wrap", fare: "Meals", vendor: "Wabash Wraps", vendorHint: "Section 13", tags: [...NCAA_FB] }
];

/** Acrisure Bounce House — UCF Athletics Guide in ’25 named concourse dishes. */
const acrisure: NcaaFootballRawItem[] = [
  { name: "The Black & Gold Dog", description: "Stadium classic hot dog from O-Town Links", fare: "Meals", vendor: "O-Town Links", vendorHint: "Sections 102, 103, 121", tags: [...NCAA_FB, "signature"] },
  { name: "Intense Nacho Cubano Walking Taco", description: "Cubano-style walking taco from Cuban Kitchen", fare: "Meals", vendor: "Cuban Kitchen", tags: [...NCAA_FB, "signature"] },
  { name: "Havana Cold Noodle Bowl", fare: "Meals", vendor: "Cuban Kitchen", tags: [...NCAA_FB] },
  { name: "Loaded Knight Nachos", fare: "Meals", vendor: "Señor Knights", tags: [...NCAA_FB] },
  { name: "Tres Mojo Pork Tacos", fare: "Meals", vendor: "Señor Knights", tags: [...NCAA_FB, "signature"] },
  { name: "Tres Mojo Chicken Tacos", fare: "Meals", vendor: "Señor Knights", tags: [...NCAA_FB] },
  { name: "Tres Mojo Avocado Tacos", fare: "Meals", vendor: "Señor Knights", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Student Hot Dog", description: "Student-ID value hot dog at O-Town Links", fare: "Meals", vendor: "O-Town Links", tags: [...NCAA_FB] },
  { name: "Student Popcorn", description: "Student-ID value popcorn at O-Town Links", fare: "Snacks", vendor: "O-Town Links", dietary: ["Vegetarian"], tags: [...NCAA_FB] }
];

/** Casino Del Sol — UA Athletics Bear Down Deals staples. */
const casinoDelSol: NcaaFootballRawItem[] = [
  { name: "Hot Dog", description: "Bear Down Deals value hot dog across the bowl", fare: "Meals", vendor: "Bear Down Deals", tags: [...NCAA_FB] },
  { name: "Nachos", description: "Bear Down Deals value nachos", fare: "Meals", vendor: "Bear Down Deals", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Popcorn", description: "Bear Down Deals value popcorn", fare: "Snacks", vendor: "Bear Down Deals", dietary: ["Vegetarian"], tags: [...NCAA_FB] }
];

/** Amon G. Carter — TCU Athletics Half Acre Korean Corn Dog (thin otherwise). */
const amonCarter: NcaaFootballRawItem[] = [
  {
    name: "Half Acre Korean Corn Dog",
    description: "Hot dog and mozzarella in ube batter, fried in panko, finished with sweet-spicy honey",
    fare: "Meals",
    vendor: "Half Acre",
    vendorHint: "Section 109",
    tags: [...NCAA_FB, "signature"]
  }
];

const MCLANE_2025_SOURCE =
  "https://baylorbears.com/news/2025/8/28/fan-experience-2025-football-concessions-offerings-revealed";
const MCLANE_2026_SOURCE =
  "https://baylorbears.com/news/2026/2/18/athletic-news-baylor-athletics-fan-first-concessions-pricing-is-here";

export const parseMclaneStadiumMenu: VenueMenuParser = async (sourceUrl?) => {
  const url = sourceUrl ?? MCLANE_2026_SOURCE;
  const from2025 = mclane2025.map((r) => ({
    ...r,
    tags: [...new Set([...(r.tags ?? []), "import-season:2025"])]
  }));
  const from2026 = mclane2026FanFirst.map((r) => ({
    ...r,
    tags: [...new Set([...(r.tags ?? []), "import-season:2026"])]
  }));
  const items = dedupeMenuItems([...from2025, ...from2026]).map((r) => {
    const prefers2026 = (r.tags ?? []).includes("fan-first-2026");
    return toSourceItem(r, prefers2026 ? MCLANE_2026_SOURCE : MCLANE_2025_SOURCE);
  });
  return {
    venueSlug: "mclane-stadium",
    venueName: "McLane Stadium",
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: 0
  };
};

export const parseDavidBoothKansasMemorialStadiumMenu = makeParser(
  "david-booth-kansas-memorial-stadium",
  "David Booth Kansas Memorial Stadium",
  "https://kuathletics.com/news/2025/8/7/football-new-food-and-beverage-partners-for-david-booth-kansas-memorial-stadium-unveiled",
  davidBooth
);

export const parseFolsomFieldMenu = makeParser(
  "folsom-field",
  "Folsom Field",
  "https://cubuffs.com/news/2025/8/21/buffs-united",
  folsom
);

export const parseNippertStadiumMenu = makeParser(
  "nippert-stadium",
  "Nippert Stadium",
  "https://gobearcats.com/news/2025/08/7/bearcats-announce-2025-football-gameday-improvements",
  nippert
);

export const parseMountainAmericaStadiumMenu = makeParser(
  "mountain-america-stadium",
  "Mountain America Stadium",
  "https://thesundevils.com/facilities-venues/mountain-america-stadium",
  mountainAmerica
);

export const parseBillSnyderFamilyStadiumMenu = makeParser(
  "bill-snyder-family-stadium",
  "Bill Snyder Family Stadium",
  "https://www.kstatesports.com/sports/2025/8/6/football-concessions",
  billSnyder
);

export const parseAcrisureBounceHouseMenu = makeParser(
  "acrisure-bounce-house",
  "Acrisure Bounce House",
  "https://ucfknights.com/sports/football",
  acrisure
);

export const parseCasinoDelSolStadiumMenu = makeParser(
  "casino-del-sol-stadium",
  "Casino Del Sol Stadium",
  "https://arizonawildcats.com/sports/football",
  casinoDelSol
);

export const parseAmonGCarterStadiumMenu = makeParser(
  "amon-g-carter-stadium",
  "Amon G. Carter Stadium",
  "https://gofrogs.com/sports/football",
  amonCarter
);

export const BIG_12_FOOTBALL_MENU_VENUE_SLUGS = [
  "mclane-stadium",
  "david-booth-kansas-memorial-stadium",
  "folsom-field",
  "nippert-stadium",
  "mountain-america-stadium",
  "bill-snyder-family-stadium",
  "acrisure-bounce-house",
  "casino-del-sol-stadium",
  "amon-g-carter-stadium"
] as const;
