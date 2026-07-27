/**
 * Big Ten Phase 1 starter menus — verified athletics / local coverage only.
 * Descriptions rewritten in Stadium Slop voice (not copied wholesale).
 *
 * Omitted (uncertain currency / not football-confirmed):
 * - Kinnick Stadium Journey SKUs; Carver Cone (arena-primary)
 * - Purdue Stadium Journey / end-zone truck list
 * - Rutgers 2019 Gourmet Dining themed stands (not re-verified 2024–26)
 * - Ryan Field: no published 2026 concessions yet (venue seeded; menu pending)
 * - Alcohol brand lists imported as food items
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

/** Camp Randall — Levy / UW 2025 coverage (deep). */
const campRandall: NcaaFootballRawItem[] = [
  { name: "Klement's Bratwurst", description: "Natural-casing Wisconsin brat sold across Camp Randall", fare: "Meals", vendor: "Klement's", tags: [...NCAA_FB, "signature", "local-vendor"] },
  { name: "Badger Dog", description: "Beef dog loaded with fried onions, hot relish, and beer cheese", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB, "signature"] },
  { name: "Badger Bacon Bar", description: "Nueske's bacon finished in milk chocolate", fare: "Desserts", vendor: "Levy", tags: [...NCAA_FB, "signature"] },
  { name: "Bulgogi Bowl", description: "Rice bowl with pickled onion and boom boom sauce", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Cochinita Pibil Tacos", description: "Slow pork tacos from the east-side taco stand", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Cochinita Pibil Nachos", description: "Pork nachos with Cotija, pickled onion, and jalapeño cheese", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Carne Asada Tacos", description: "Asada tacos with Chihuahua cheese and birria dip", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Street Corn Elote", description: "Lime crema and Cotija street corn", fare: "Snacks", vendor: "Levy", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Nonna's Meatball Plate", description: "Meatball over mashed potatoes with marinara and crostini", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Chili Mac and Cheese", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Honey Buffalo Wings", description: "Wings with blue cheese and celery", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Hot Ham and Cheese Panini", description: "Panini served with tomato bisque", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Supreme Nachos", description: "Beef nachos with pico and sour cream", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Bacon-Wrapped Hot Dog", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Mac-N-Cheese Burger", description: "Burger finished with mac-and-cheese", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB, "signature"] },
  { name: "Brisket Grilled Cheese", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Cheese Pizza Slice", fare: "Meals", vendor: "Levy", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Stadium Mac and Cheese", fare: "Meals", vendor: "Levy", dietary: ["Vegetarian"], vendorHint: "Sections E & DD", tags: [...NCAA_FB] },
  { name: "Chicken Wings", fare: "Meals", vendor: "Levy", vendorHint: "SEZ / outside R & HH", tags: [...NCAA_FB] },
  { name: "Soft Pretzel", fare: "Snacks", vendor: "Levy", dietary: ["Vegetarian"], tags: [...NCAA_FB] }
];

/** Huntington Bank Stadium — Gopher Hospitality 2024–25 (deep). */
const huntingtonBank: NcaaFootballRawItem[] = [
  { name: "Pizza Mac N Cheese", description: "Pepperoni mac with hot-honey Italian sausage", fare: "Meals", vendor: "Cheese & Thank You", vendorHint: "Section 109", tags: [...NCAA_FB, "signature"] },
  { name: "Short Rib Roll", fare: "Meals", vendor: "Sizzle", vendorHint: "Section 135", tags: [...NCAA_FB, "signature"] },
  { name: "Bee's Knees Sandwich", description: "Hot-honey Italian sausage with beer cheese", fare: "Meals", vendor: "Goldy's Grill", vendorHint: "Section 131", tags: [...NCAA_FB] },
  { name: "Jalapeño Popper Brisket Grilled Cheese", fare: "Meals", vendor: "Sizzle", vendorHint: "Section 135", tags: [...NCAA_FB] },
  { name: "Pastrami Dog", description: "Dog topped with pastrami and crispy kraut", fare: "Meals", vendor: "Links", vendorHint: "Sections 109 & 140", tags: [...NCAA_FB] },
  { name: "MN Hot Pastrami", fare: "Meals", vendor: "Links", vendorHint: "Portable near 140", tags: [...NCAA_FB, "local-vendor"] },
  { name: "The Gopher Tail", description: "Waffled chocolate croissant sundae", fare: "Desserts", vendor: "Scoop'd", vendorHint: "Section 117", tags: [...NCAA_FB, "signature"] },
  { name: "Cheeseburger Poutine", description: "Tots, curds, and meatballs from Uffda", fare: "Meals", vendor: "Uffda", vendorHint: "Section 143", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Pork Cubano", fare: "Meals", vendor: "Sizzle", vendorHint: "Section 135", tags: [...NCAA_FB] },
  { name: "T-Rex Cookie", description: "Goldy-branded oversized cookie", fare: "Desserts", vendor: "Concessions", tags: [...NCAA_FB, "signature"] },
  { name: "Walking Sundae", description: "Sundae built in a cookie bag", fare: "Desserts", vendor: "Scoop'd", vendorHint: "Section 117", tags: [...NCAA_FB] },
  { name: "Chicken Waffle Taco", fare: "Meals", vendor: "Goldy's Grill", vendorHint: "Section 131", tags: [...NCAA_FB] },
  { name: "Ski-U-Mah Bowl", fare: "Meals", vendor: "Uffda", vendorHint: "Section 143", tags: [...NCAA_FB, "signature"] },
  { name: "Swedish Bowl", description: "Meatballs with lingonberry", fare: "Meals", vendor: "Uffda", vendorHint: "Section 143", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Chicken Bacon Boom Sandwich", fare: "Meals", vendor: "Goldy's Grill", tags: [...NCAA_FB] },
  { name: "Buffalo Street Tacos", fare: "Meals", vendor: "Eat, Drink, Taco", vendorHint: "Section 140", tags: [...NCAA_FB] },
  { name: "Minnesota BBQ Dog", fare: "Meals", vendor: "Links", tags: [...NCAA_FB] },
  { name: "Short Rib Grilled Cheese", fare: "Meals", vendor: "Sizzle", tags: [...NCAA_FB] },
  { name: "Brisket Pho-rito", fare: "Meals", vendor: "Lotus", vendorHint: "Section 143", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Grilled Pork Bánh Mì", fare: "Meals", vendor: "Lotus", vendorHint: "Section 143", tags: [...NCAA_FB] },
  { name: "Apple Fries", description: "Cinnamon-sugar apple fries with caramel", fare: "Desserts", vendor: "Brat Dog", vendorHint: "West Plaza", tags: [...NCAA_FB] },
  { name: "Hall of Favs Cheeseburger", fare: "Meals", vendor: "Hall of Favs", vendorHint: "Sections 110 & 139", tags: [...NCAA_FB] }
];

/** Illinois Memorial Stadium — 2025 athletics / News-Gazette. */
const illinoisMemorial: NcaaFootballRawItem[] = [
  { name: "Eisenberg Hot Dog", fare: "Meals", vendor: "Champaign Classics", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Olde Time Brat", fare: "Meals", vendor: "Champaign Classics", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Papa John's Pizza Slice", fare: "Meals", vendor: "Papa John's", tags: [...NCAA_FB] },
  { name: "Jersey Mike's Sub", fare: "Meals", vendor: "Jersey Mike's", tags: [...NCAA_FB] },
  { name: "Hickory River BBQ Brisket", fare: "Meals", vendor: "Hickory River BBQ", vendorHint: "Section 107", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Illini Cheesesteak", fare: "Meals", vendor: "Illini Cheesesteak", vendorHint: "Section 105", tags: [...NCAA_FB, "signature"] },
  { name: "Philly Fries", fare: "Meals", vendor: "Illini Cheesesteak", vendorHint: "Section 105", tags: [...NCAA_FB] },
  { name: "Corndog", fare: "Meals", vendor: "Corndog Depot", vendorHint: "Section 129", tags: [...NCAA_FB] },
  { name: "Loaded Mac and Cheese", fare: "Meals", vendor: "Brien's Bistro", tags: [...NCAA_FB] },
  { name: "Sooie Brothers Pulled Pork", fare: "Meals", vendor: "Sooie Brothers BBQ", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Watson's Chicken Tender Basket", fare: "Meals", vendor: "Watson's", vendorHint: "Section 130", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Orange and Blue Nectar Slushie", fare: "Snacks", vendor: "Watson's", dietary: ["Vegetarian"], tags: [...NCAA_FB, "signature"] },
  { name: "Smith Burger Smash Burger", fare: "Meals", vendor: "Smith Burger Co.", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Jarling's Custard", fare: "Desserts", vendor: "Jarling's Custard", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Gourmet Popcorn", fare: "Snacks", vendor: "CBPB Popcorn", dietary: ["Vegetarian"], tags: [...NCAA_FB] }
];

/** Indiana Memorial Stadium — IU Athletics / Levy 2024. */
const indianaMemorial: NcaaFootballRawItem[] = [
  { name: "Footlong Hoosier Dog", description: "Footlong with pulled pork, sweet corn relish, and corn nuts", fare: "Meals", vendor: "Indiana Sausage Haus", tags: [...NCAA_FB, "signature", "local-vendor"] },
  { name: "Caraway and Kölsch Bratwurst", description: "Smoking Goose × Daredevil brat", fare: "Meals", vendor: "Indiana Sausage Haus", tags: [...NCAA_FB, "local-vendor"] },
  { name: "B-Town BBQ Chip Stack", fare: "Meals", vendor: "Victory Flag BBQ", vendorHint: "Near section 29", tags: [...NCAA_FB, "local-vendor"] },
  { name: "BBQ Pulled Pork Sandwich", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "BuffaLouie's Buffalo Wings", fare: "Meals", vendor: "BuffaLouie's", vendorHint: "Section 17", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Indiana Pork Tenderloin Sandwich", fare: "Meals", vendor: "BuffaLouie's", tags: [...NCAA_FB, "signature", "local-vendor"] },
  { name: "Italian Beef Sandwich", fare: "Meals", vendor: "BuffaLouie's", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Yogi's Smashburger", fare: "Meals", vendor: "Yogi's", vendorHint: "Near section 25", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Cream and Crimson Pizza", fare: "Meals", vendor: "Aver's", vendorHint: "Section 24", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Social Cantina Street Tacos", fare: "Meals", vendor: "Social Cantina", vendorHint: "Section 3", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Chocolate Moose Ice Cream", fare: "Desserts", vendor: "Chocolate Moose", vendorHint: "Section 16", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Loaded Nachos", fare: "Meals", vendor: "Social Cantina", tags: [...NCAA_FB] }
];

/**
 * Kinnick — only athletics-confirmed staples.
 * Stadium Journey burgers/tots and Carver Cone omitted (currency / arena-primary).
 */
const kinnick: NcaaFootballRawItem[] = [
  { name: "Kinnick Hot Dog", fare: "Meals", vendor: "Aramark", tags: [...NCAA_FB] },
  { name: "Soft Pretzel", fare: "Snacks", vendor: "Aramark", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Stadium Nachos", fare: "Meals", vendor: "Aramark", tags: [...NCAA_FB] },
  { name: "Popcorn", fare: "Snacks", vendor: "Aramark", dietary: ["Vegetarian"], tags: [...NCAA_FB] }
];

/** SECU Stadium — official 2025 concessions page. */
const secu: NcaaFootballRawItem[] = [
  { name: "Chessie Crab Pretzel", description: "Crab-stuffed pretzel — Maryland signature", fare: "Meals", vendor: "SECU Concessions", vendorHint: "Section 20", tags: [...NCAA_FB, "signature", "local-vendor"] },
  { name: "Little Chessie Pretzel", fare: "Snacks", vendor: "SECU Concessions", vendorHint: "Sections 16 & 205", tags: [...NCAA_FB, "signature"] },
  { name: "Crab Cake Sandwich", fare: "Meals", vendor: "SECU Concessions", vendorHint: "Section 16", tags: [...NCAA_FB, "signature", "local-vendor"] },
  { name: "Crab Nachos", fare: "Meals", vendor: "SECU Concessions", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Brisket Platter", description: "Brisket with mac, coleslaw, and cornbread", fare: "Meals", vendor: "SECU Concessions", tags: [...NCAA_FB] },
  { name: "Chicken and Maple Waffle Fries", fare: "Meals", vendor: "SECU Concessions", vendorHint: "Section 16", tags: [...NCAA_FB] },
  { name: "Cheesesteak", fare: "Meals", vendor: "SECU Concessions", tags: [...NCAA_FB] },
  { name: "Logan's Italian Sausage", fare: "Meals", vendor: "Logan's", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Hoffman's Hot Dog", fare: "Meals", vendor: "Hoffman's", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Ledo Pizza Slice", fare: "Meals", vendor: "Ledo Pizza", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Maryland Dairy Ice Cream", fare: "Desserts", vendor: "Maryland Dairy", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Chick-fil-A Sandwich", fare: "Meals", vendor: "Chick-fil-A", vendorHint: "Section 17", tags: [...NCAA_FB] },
  { name: "Funnel Cake", fare: "Desserts", vendor: "SECU Concessions", vendorHint: "Section 12", tags: [...NCAA_FB] },
  { name: "ICEE", fare: "Snacks", vendor: "SECU Concessions", dietary: ["Vegetarian"], tags: [...NCAA_FB] }
];

/** Spartan Stadium — official 2025 concessions. */
const spartan: NcaaFootballRawItem[] = [
  { name: "Detroit-Style Coney Dog", fare: "Meals", vendor: "Gruff's Grill", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Polish Sausage", fare: "Meals", vendor: "Gruff's Grill", tags: [...NCAA_FB] },
  { name: "Gruff's Spicy Cheddar Sausage", fare: "Meals", vendor: "Gruff's Grill", tags: [...NCAA_FB, "signature"] },
  { name: "Walking Taco", fare: "Meals", vendor: "Nazho Zone", tags: [...NCAA_FB] },
  { name: "BBQ Pulled Pork Sandwich", fare: "Meals", vendor: "On The Banks BBQ", tags: [...NCAA_FB] },
  { name: "Brisket Sandwich", fare: "Meals", vendor: "On The Banks BBQ", tags: [...NCAA_FB] },
  { name: "Buffalo Chicken Sandwich", fare: "Meals", vendor: "On The Banks BBQ", tags: [...NCAA_FB] },
  { name: "Little Caesars Pepperoni Pizza", fare: "Meals", vendor: "Little Caesars", tags: [...NCAA_FB] },
  { name: "517 Taco Co. Street Tacos", fare: "Meals", vendor: "517 Taco Co.", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Jersey Mike's Sub", fare: "Meals", vendor: "Jersey Mike's", vendorHint: "Gate K", tags: [...NCAA_FB] },
  { name: "Specialty Soft Pretzel", fare: "Snacks", vendor: "Ben's Pretzels", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Melting Moments Ice Cream Sandwich", fare: "Desserts", vendor: "Melting Moments", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Cinnamon Roasted Almonds", fare: "Snacks", vendor: "Fun Foods", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Bratwurst", fare: "Meals", vendor: "Spartans Snacks", tags: [...NCAA_FB] }
];

/** Nebraska Memorial Stadium — GBR Classics / 2025 coverage. */
const nebraskaMemorial: NcaaFootballRawItem[] = [
  { name: "Runza", description: "Nebraska stuffed sandwich at GBR Classics", fare: "Meals", vendor: "GBR Classics", tags: [...NCAA_FB, "signature", "local-vendor"] },
  { name: "Valentino's Pizza Slice", fare: "Meals", vendor: "GBR Classics", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Wimmer's Fairbury Red Hot Dog", fare: "Meals", vendor: "GBR Classics", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Footlong Fairbury Red Dog", description: "Footlong with Nebraska corn dip", fare: "Meals", vendor: "GBR Classics", tags: [...NCAA_FB, "signature"] },
  { name: "Bratwurst", fare: "Meals", vendor: "GBR Classics", tags: [...NCAA_FB] },
  { name: "Hot Beef Sundae", description: "Braised beef, corn, and mashed potato in a bread cone", fare: "Meals", vendor: "Club Concessions", tags: [...NCAA_FB, "signature"] },
  { name: "Red Burger", description: "Omaha Steaks patty on a red bun", fare: "Meals", vendor: "Herbie's Burger Co.", tags: [...NCAA_FB, "signature"] },
  { name: "Tunnel Walk Tacos", fare: "Meals", vendor: "Tunnel Walk Tacos", tags: [...NCAA_FB] },
  { name: "Chick N Coop Tender Basket", fare: "Meals", vendor: "Chick N Coop", vendorHint: "Section 17", tags: [...NCAA_FB] },
  { name: "Cornhusker Crunch Nachos", fare: "Meals", vendor: "Concessions", tags: [...NCAA_FB] },
  { name: "1923 Cheesesteak", fare: "Meals", vendor: "Concessions", vendorHint: "Section 28", tags: [...NCAA_FB] },
  { name: "Corn on the Cob", fare: "Snacks", vendor: "Cob & Co.", dietary: ["Vegetarian"], tags: [...NCAA_FB, "local-vendor"] },
  { name: "Dippin' Dots", fare: "Desserts", vendor: "Dippin' Dots", tags: [...NCAA_FB] }
];

/** Martin Stadium only — temporary NU home; do not copy to Ryan Field. */
const northwesternMartin: NcaaFootballRawItem[] = [
  { name: "NU Stacked Smashburger", fare: "Meals", vendor: "South Pavilion", tags: [...NCAA_FB, "signature"] },
  { name: "Wildcat Melt", fare: "Meals", vendor: "South Pavilion", tags: [...NCAA_FB, "signature"] },
  { name: "Funnel Cake", fare: "Desserts", vendor: "Wildcat Sweets", tags: [...NCAA_FB] },
  { name: "Candy Cup", fare: "Desserts", vendor: "Wildcat Sweets", tags: [...NCAA_FB] }
];

/** Autzen — OregonLive / Register-Guard 2024–25. */
const autzen: NcaaFootballRawItem[] = [
  { name: "Mo's Clam Chowder", fare: "Meals", vendor: "Mighty Oregon", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Prince Puckler's Ice Cream", fare: "Desserts", vendor: "Mighty Oregon", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Prince Puckler's Ice Cream Sandwich", fare: "Desserts", vendor: "Mighty Oregon", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Marionberry Turnover", fare: "Desserts", vendor: "Mighty Oregon", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Nacho Dog", description: "Dog with chips, pico, and lime-cilantro crema", fare: "Meals", vendor: "Nacho Nacho", tags: [...NCAA_FB] },
  { name: "Brisket Mac and Cheese", fare: "Meals", vendor: "Bellotti's Grab & Go", tags: [...NCAA_FB] },
  { name: "Oregon Smoked Brisket Basket", fare: "Meals", vendor: "Autzen Smoker", vendorHint: "Section 35", tags: [...NCAA_FB, "signature"] },
  { name: "Eugene Vegan Hot Dog", fare: "Meals", vendor: "All-American", dietary: ["Vegan"], tags: [...NCAA_FB] },
  { name: "Chicken Bonz Wings", fare: "Meals", vendor: "Moshofsky Center", tags: [...NCAA_FB] },
  { name: "Calzone", fare: "Meals", vendor: "Club Room", tags: [...NCAA_FB] },
  { name: "Ducks Deal Hot Dog", fare: "Meals", vendor: "Ducks Deal", tags: [...NCAA_FB] },
  { name: "Soft Pretzel", fare: "Snacks", vendor: "Ducks Deal", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Souvenir Popcorn", fare: "Snacks", vendor: "All-American", dietary: ["Vegetarian"], tags: [...NCAA_FB] }
];

/** Rose Bowl — UCLA 2024 enhancements / Visit Pasadena. */
const roseBowl: NcaaFootballRawItem[] = [
  { name: "UCLA Bruin Dog", description: "Birria dog with chile de árbol aioli and pickled onion", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB, "signature"] },
  { name: "1922 Half Pound Dog", description: "Half-pound dog with cheesesteak toppings and three-pepper sauce", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB, "signature"] },
  { name: "UCLA Bruin Bowl", description: "Waffle fries, hatch mac, and carne asada", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB, "signature"] },
  { name: "Bacon-Wrapped Hot Dog", fare: "Meals", vendor: "Levy", vendorHint: "Tunnel 8", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Cheesesteak", fare: "Meals", vendor: "Levy", vendorHint: "Tunnel 2", tags: [...NCAA_FB] },
  { name: "Chili Cheese Fries", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Churros", fare: "Desserts", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Italian Ice", fare: "Desserts", vendor: "Levy", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Lumpia", fare: "Meals", vendor: "Levy", vendorHint: "Court of Champions", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Loaded Nachos", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Vegan Burrito Bowl", fare: "Meals", vendor: "Levy", dietary: ["Vegan"], tags: [...NCAA_FB] },
  { name: "Teriyaki Chicken", fare: "Meals", vendor: "Levy", tags: [...NCAA_FB] },
  { name: "Agua Fresca", fare: "Snacks", vendor: "Levy", dietary: ["Vegetarian"], tags: [...NCAA_FB] }
];

/** LA Coliseum — 2025 A–Z Food Guide. */
const coliseum: NcaaFootballRawItem[] = [
  { name: "Coliseum Dog", fare: "Meals", vendor: "CLASSIC", tags: [...NCAA_FB, "signature"] },
  { name: "LA Street Dog", fare: "Meals", vendor: "OLE", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Hot Honey Chicken Sandwich", fare: "Meals", vendor: "Chickalicious", vendorHint: "Tunnel 17", tags: [...NCAA_FB] },
  { name: "Nashville Chicken Sandwich", fare: "Meals", vendor: "Chickalicious", tags: [...NCAA_FB] },
  { name: "Chicken and Waffles", fare: "Meals", vendor: "Chickalicious", tags: [...NCAA_FB] },
  { name: "Mushroom Torta", fare: "Meals", vendor: "OLE", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Loaded Macaroni and Cheese", fare: "Meals", vendor: "Concessions", tags: [...NCAA_FB] },
  { name: "Brisket Sandwich", fare: "Meals", vendor: "SMOKED", tags: [...NCAA_FB] },
  { name: "Pulled Pork Sandwich", fare: "Meals", vendor: "SMOKED", tags: [...NCAA_FB] },
  { name: "Heritage Burger", fare: "Meals", vendor: "GRILLED", tags: [...NCAA_FB] },
  { name: "Coliseum Tacos", description: "Chicken tinga or pork al pastor", fare: "Meals", vendor: "OLE", tags: [...NCAA_FB] },
  { name: "Esquites Salad", fare: "Snacks", vendor: "Food Court", dietary: ["Vegetarian"], tags: [...NCAA_FB, "local-vendor"] },
  { name: "Korean Fried Chicken", fare: "Meals", vendor: "Cooking Pod", vendorHint: "Tunnel 27", tags: [...NCAA_FB] },
  { name: "Garlic Fries", fare: "Snacks", vendor: "GRILLED", tags: [...NCAA_FB] },
  { name: "4th and 9 Jumbo Pretzel", fare: "Snacks", vendor: "Food Court", dietary: ["Vegetarian"], tags: [...NCAA_FB] }
];

/** Husky Stadium — GoHuskies 2024–25. */
const husky: NcaaFootballRawItem[] = [
  { name: "Foot-Long Hot Dog", fare: "Meals", vendor: "Husky Stadium Concessions", vendorHint: "Section 110", tags: [...NCAA_FB] },
  { name: "Street Tacos", fare: "Meals", vendor: "Husky Stadium Concessions", vendorHint: "Sections 119 & 328", tags: [...NCAA_FB] },
  { name: "Monster Nachos with Pulled Pork", fare: "Meals", vendor: "Husky Stadium Concessions", tags: [...NCAA_FB] },
  { name: "Loaded Mac and Cheese", fare: "Meals", vendor: "Husky Stadium Concessions", tags: [...NCAA_FB] },
  { name: "Ivar's Clam Chowder", fare: "Meals", vendor: "Ivar's", vendorHint: "Sections 108 & 308", tags: [...NCAA_FB, "local-vendor", "signature"] },
  { name: "Ivar's BBQ Pulled Pork Sandwich", fare: "Meals", vendor: "Ivar's", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Kidd Valley Burger", fare: "Meals", vendor: "Kidd Valley", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Flying Taco", fare: "Meals", vendor: "Flying Taco", vendorHint: "Section 104", tags: [...NCAA_FB] },
  { name: "Chowder House Cup", fare: "Meals", vendor: "Chowder House", tags: [...NCAA_FB, "local-vendor"] },
  { name: "Soft Pretzel", fare: "Snacks", vendor: "Husky Express", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Popcorn", fare: "Snacks", vendor: "Husky Stadium Concessions", dietary: ["Vegetarian"], tags: [...NCAA_FB] },
  { name: "Chicken Tenders", fare: "Meals", vendor: "Husky Stadium Concessions", tags: [...NCAA_FB] }
];

export const parseCampRandallStadiumMenu = makeParser(
  "camp-randall-stadium",
  "Camp Randall Stadium",
  "https://uwbadgers.com/sports/2025/4/21/wisconsin-football-gameday",
  campRandall
);

export const parseHuntingtonBankStadiumMenu = makeParser(
  "huntington-bank-stadium",
  "Huntington Bank Stadium",
  "https://gophersports.com/news/2025/8/26/football-new-foods-game-themes-and-more-entry-points-await-minnesota-fans-in-advance-of-2025-season",
  huntingtonBank
);

export const parseMemorialStadiumIllinoisMenu = makeParser(
  "memorial-stadium-illinois",
  "Memorial Stadium",
  "https://fightingillini.com/news/2025/8/14/football-illinois-announces-concessions-enhancements-for-memorial-stadium-gamedays",
  illinoisMemorial
);

export const parseMemorialStadiumIndianaMenu = makeParser(
  "memorial-stadium-indiana",
  "Merchants Bank Field at Memorial Stadium",
  "https://iuhoosiers.com/sports/2024/8/23/iu-athletics-concessions-levy",
  indianaMemorial
);

export const parseKinnickStadiumMenu = makeParser(
  "kinnick-stadium",
  "Kinnick Stadium",
  "https://hawkeyesports.com/crossover-at-kinnick-gameday",
  kinnick
);

export const parseSecuStadiumMenu = makeParser(
  "secu-stadium",
  "SECU Stadium",
  "https://umterps.com/sports/2025/9/18/secu-stadium-concessions",
  secu
);

export const parseSpartanStadiumMenu = makeParser(
  "spartan-stadium",
  "Spartan Stadium",
  "https://msuspartans.com/sports/2025/10/29/spartan-stadium-football-concessions",
  spartan
);

export const parseMemorialStadiumNebraskaMenu = makeParser(
  "memorial-stadium-nebraska",
  "Memorial Stadium",
  "https://huskers.com/menu-gbr-classics",
  nebraskaMemorial
);

export const parseNorthwesternMedicineFieldMenu = makeParser(
  "northwestern-medicine-field-at-martin-stadium",
  "Northwestern Medicine Field at Martin Stadium",
  "https://nusports.com/news/2025/8/5/football-northwestern-medicine-field-at-martin-stadium-announces-2025-stadium-enhancements",
  northwesternMartin
);

export const parseAutzenStadiumMenu = makeParser(
  "autzen-stadium",
  "Autzen Stadium",
  "https://www.oregonlive.com/ducks/2024/08/oregon-ducks-unveil-new-concession-items-at-autzen-stadium-for-2024-season.html",
  autzen
);

export const parseRoseBowlMenu = makeParser(
  "rose-bowl",
  "Rose Bowl",
  "https://uclabruins.com/news/2024/9/10/ucla-athletics-announces-2024-football-gameday-enhancements",
  roseBowl
);

export const parseLosAngelesMemorialColiseumMenu = makeParser(
  "los-angeles-memorial-coliseum",
  "Los Angeles Memorial Coliseum",
  "https://usctrojans.com/news/2025/8/27/features-new-videoboard-expanded-concessions-offerings-highlight-enhanced-game-day-experience-at-the-coliseum-for-2025-usc-football-season",
  coliseum
);

export const parseHuskyStadiumMenu = makeParser(
  "husky-stadium",
  "Husky Stadium",
  "https://gohuskies.com/news/2025/8/28/whats-new-at-husky-stadium-in-2025",
  husky
);

/** @deprecated Prefer school-disambiguated export names. */
export const parseMemorialStadiumChampaignMenu = parseMemorialStadiumIllinoisMenu;
/** @deprecated Prefer school-disambiguated export names. */
export const parseIndianaMemorialStadiumMenu = parseMemorialStadiumIndianaMenu;
/** @deprecated Prefer school-disambiguated export names. */
export const parseMemorialStadiumLincolnMenu = parseMemorialStadiumNebraskaMenu;
