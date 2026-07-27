/**
 * ACC Phase 1 starter menus — verified athletics / local coverage only.
 * Descriptions rewritten in Stadium Slop voice (not copied wholesale).
 *
 * Menu pending (thin / unpublished item-level college sources):
 * - california-memorial-stadium
 * - wallace-wade-stadium
 * - acrisure-stadium (shared NFL; no college-verified dish SKUs)
 * - allegacy-federal-credit-union-stadium
 *
 * Hard Rock imports only Miami-confirmed college items; existing NFL menu rows stay untouched.
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

const alumni_stadium: NcaaFootballRawItem[] = [
  { name: "Hot Dog", description: "Classic stadium dog from the BC Dining concessions lineup", fare: "Meals", vendor: "BC Dining", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Soft Pretzel", description: "Stadium soft pretzel", fare: "Snacks", vendor: "BC Dining", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Popcorn", description: "Stadium popcorn", fare: "Snacks", vendor: "BC Dining", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Ice Cream", description: "Stadium ice cream", fare: "Desserts", vendor: "BC Dining", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Lobster Roll", description: "New England lobster roll", fare: "Meals", vendor: "BC Dining / New England Classics", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "BBQ", description: "BBQ offerings (brisket/pulled pork style stands)", fare: "Meals", vendor: "BC Dining BBQ", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Meatball Obsession", description: "Meatballs (cup-style Meatball Obsession concept)", fare: "Meals", vendor: "Meatball Obsession", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

const memorial_stadium_clemson: NcaaFootballRawItem[] = [
  { name: "Brisket Sandwich", description: "Brisket sandwich from Nuk Hopkins X Smitty's BBQ truck", fare: "Meals", vendor: "Nuk Hopkins X Smitty's BBQ", vendorHint: "Gate 9 inside stadium", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Pulled Pork Sandwich", description: "Pulled pork sandwich", fare: "Meals", vendor: "Nuk Hopkins X Smitty's BBQ", vendorHint: "Gate 9", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Pulled Chicken Sandwich", description: "Pulled chicken sandwich", fare: "Meals", vendor: "Nuk Hopkins X Smitty's BBQ", vendorHint: "Gate 9", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Wings", description: "BBQ / soul-food wings", fare: "Meals", vendor: "Nuk Hopkins X Smitty's BBQ", vendorHint: "Gate 9", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Soul Rolls", description: "Soul rolls (featured menu item)", fare: "Snacks", vendor: "Nuk Hopkins X Smitty's BBQ", vendorHint: "Gate 9", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Bang Bang Fries", description: "Bang Bang Fries", fare: "Snacks", vendor: "Nuk Hopkins X Smitty's BBQ", vendorHint: "Gate 9", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

const doak_campbell_stadium: NcaaFootballRawItem[] = [
  { name: "Stadium Nachos", description: "Stadium nachos at Unconquered Snacks", fare: "Meals", vendor: "Unconquered Snacks", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Jumbo Pretzel", description: "Jumbo soft pretzel", fare: "Snacks", vendor: "Unconquered Snacks / Pretzel stands", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Popcorn", description: "Stadium popcorn", fare: "Snacks", vendor: "Unconquered Snacks / SunStop / Burger stands", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Loaded Tots", description: "Loaded tots", fare: "Snacks", vendor: "Fried Food", vendorHint: "Main 128 / Upper 136", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Chili Cheese Tots", description: "Chili (no meat) cheese tots", fare: "Snacks", vendor: "Fried Food", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Fried Pickle Spears", description: "Fried pickle spears", fare: "Snacks", vendor: "Fried Food", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Apple Pie Bites", description: "Apple pie bites", fare: "Desserts", vendor: "Fried Food", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Dippin' Dots", description: "Dippin' Dots novelty ice cream", fare: "Desserts", vendor: "Dippin' Dots", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Pasta Salad", description: "Pasta salad", fare: "Snacks", vendor: "Chicken Salad Chick", vendorHint: "Main 116 & 124", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Broccoli Salad", description: "Broccoli salad", fare: "Snacks", vendor: "Chicken Salad Chick", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Crudité Cup", description: "Crudité cup", fare: "Snacks", vendor: "SunStop Fresh Eats", vendorHint: "Main 134 / Upper 137", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Mac N Cheese", description: "Mac and cheese", fare: "Snacks", vendor: "BBQ stand", vendorHint: "Main/Upper 118", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Kowalski Sausage", description: "Kowalski sausage", fare: "Meals", vendor: "Kowalski Sausage", vendorHint: "Upper 131", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

const bobby_dodd_stadium_at_hyundai_field: NcaaFootballRawItem[] = [
  { name: "The Stadium Chick", description: "Scoop or sandwich of chicken salad with broccoli salad or chips and buttercream cookie", fare: "Meals", vendor: "Chicken Salad Chick", vendorHint: "West Festival Sec 110", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Classic Carol Chicken Salad", description: "All-white shredded chicken salad", fare: "Meals", vendor: "Chicken Salad Chick", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Fancy Nancy Chicken Salad", description: "Chicken salad with Fuji apples, grapes, pecans", fare: "Meals", vendor: "Chicken Salad Chick", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Buffalo Barclay Chicken Salad", description: "Buffalo-style chicken salad", fare: "Meals", vendor: "Chicken Salad Chick", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Sassy Scotty Chicken Salad", description: "Ranch, bacon, cheddar chicken salad", fare: "Meals", vendor: "Chicken Salad Chick", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Cajun Pot Roast Nachos", description: "Cajun pot roast nachos", fare: "Meals", vendor: "Cajun Nachos / SOCA area", vendorHint: "West Festival Sec 108", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Blackened Chicken Nachos", description: "Blackened chicken nachos", fare: "Meals", vendor: "Cajun Nachos", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Crawfish Etouffee Nachos", description: "Crawfish etouffee nachos", fare: "Meals", vendor: "Cajun Nachos", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Vegetarian Red Beans and Rice Nachos", description: "Vegetarian red beans and rice nachos", fare: "Meals", vendor: "Cajun Nachos", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Burrito with Chips and Salsa", description: "Burrito with chips and salsa", fare: "Meals", vendor: "Cajun Nachos", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Bread Pudding a la Mode", description: "Bread pudding a la mode", fare: "Desserts", vendor: "Cajun Nachos", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Cajun Boiled Peanuts", description: "Cajun boiled peanuts", fare: "Snacks", vendor: "Cajun Nachos", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Philly Water Ice", description: "Italian water ice (watermelon, mango, strawberry lemonade, blueberry, cherry)", fare: "Desserts", vendor: "Philly Water Ice", vendorHint: "All concourses", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Chick-fil-A Chicken Sandwich", description: "Chain chicken sandwich", fare: "Meals", vendor: "Chick-fil-A", vendorHint: "Secs 104, 113, 123", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

const ln_federal_credit_union_stadium: NcaaFootballRawItem[] = [
  { name: "Barry's Cheesesteak", description: "Philly-style cheesesteak", fare: "Meals", vendor: "Barry's Cheesesteak", vendorHint: "Sec 303", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Floyd & Central BBQ Loaded Nachos", description: "Loaded nachos from Floyd & Central BBQ", fare: "Meals", vendor: "Floyd & Central BBQ", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Game Day Grind Burger", description: "Game Day Grind burger", fare: "Meals", vendor: "Game Day Grind Burger", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Bird Dogs", description: "Bird Dogs specialty item", fare: "Meals", vendor: "Bird Dogs", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Stick N Dip Corn Dogs", description: "Corn dogs", fare: "Meals", vendor: "Stick N Dip Corn Dogs", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Fistful of Tacos", description: "Tacos", fare: "Meals", vendor: "Fistful of Tacos", vendorHint: "Secs 112 & 125", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Touchdown Turkey Legs", description: "Turkey legs", fare: "Meals", vendor: "Touchdown Turkey Legs", vendorHint: "Sec 113", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Ben's Soft Pretzel", description: "Ben's pretzels", fare: "Snacks", vendor: "Ben's Pretzels", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Papa Murphy's Pizza", description: "Pizza from Papa Murphy's stands", fare: "Meals", vendor: "Papa Murphy's", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Scragglepop Kettle Corn", description: "Kettle corn", fare: "Snacks", vendor: "Scragglepop", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Over the Pop", description: "Specialty popcorn", fare: "Snacks", vendor: "Over the Pop", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Ehrler's Ice Cream", description: "Ehrler's ice cream", fare: "Desserts", vendor: "Ehrler's", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Jimmy John's Sandwich", description: "Jimmy John's sandwiches", fare: "Meals", vendor: "Jimmy John's", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Hot Dog", description: "Hot dog (Gridiron Grill / Fanfare Classics staples)", fare: "Meals", vendor: "Gridiron Grill / Fanfare Classics", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Nachos", description: "Nachos", fare: "Meals", vendor: "Gridiron Grill / Fanfare Classics", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Chicken Tenders", description: "Chicken tenders", fare: "Meals", vendor: "Gridiron Grill", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Bratwurst", description: "Brats", fare: "Meals", vendor: "Gridiron Grill", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "French Fries", description: "Fries", fare: "Snacks", vendor: "Gridiron Grill", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Soft Pretzel", description: "Soft pretzel", fare: "Snacks", vendor: "Gridiron Grill / Fanfare Classics", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

const hard_rock_stadium: NcaaFootballRawItem[] = [
  { name: "Cuban Sandwich", description: "Cuban sandwich from the Hard Rock concourse — confirmed at a Hurricanes home game", fare: "Meals", vendor: "Hard Rock concessions / Cuban concept", tags: [...NCAA_FB, "verified-current", "import-season:2025", "tenant:miami-hurricanes", "college-confirmed"] },
  { name: "Fries", description: "Fries paired with Cuban sandwich grab-and-go", fare: "Snacks", vendor: "Hard Rock concessions", tags: [...NCAA_FB, "verified-current", "import-season:2025", "tenant:miami-hurricanes", "college-confirmed"] },
  { name: "Chicken Shawarma", description: "Chicken shawarma wrap built to order", fare: "Meals", vendor: "Hard Rock concessions / Middle Eastern", tags: [...NCAA_FB, "verified-current", "import-season:2025", "tenant:miami-hurricanes", "college-confirmed"] },
  { name: "Lobster Roll", description: "Lobster roll (available; pricey)", fare: "Meals", vendor: "Hard Rock concessions", tags: [...NCAA_FB, "verified-current", "import-season:2025", "tenant:miami-hurricanes", "college-confirmed"] },
  { name: "Mac and Cheese", description: "Side mac and cheese", fare: "Snacks", vendor: "Hard Rock concessions", tags: [...NCAA_FB, "verified-current", "import-season:2025", "tenant:miami-hurricanes", "college-confirmed"] },
];

const kenan_memorial_stadium: NcaaFootballRawItem[] = [
  { name: "Bojangles Chicken Supremes", description: "Bojangles Chicken Supremes & fries", fare: "Meals", vendor: "Bojangles", vendorHint: "West EndZone 116, Gate 2, Gate 6", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Salvio's Burger (Ramses Style)", description: "Salvio's burger Ramses style (GF option noted)", fare: "Meals", vendor: "Salvio's", vendorHint: "West Endzone", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Domino's Pizza", description: "Domino's pizza", fare: "Meals", vendor: "Domino's", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Chick-fil-A Chicken Sandwich", description: "Chick-fil-A sandwich", fare: "Meals", vendor: "Chick-fil-A", vendorHint: "Portable Sec 109", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Hot Dog", description: "Carolina Classics hot dog", fare: "Meals", vendor: "Carolina Classics", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Soft Pretzel", description: "Carolina Classics pretzel", fare: "Snacks", vendor: "Carolina Classics", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Popcorn", description: "Carolina Classics popcorn", fare: "Snacks", vendor: "Carolina Classics", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Smoked & Pulled Pork Sandwich", description: "Best Blue BBQ smoked & pulled pork sandwich", fare: "Meals", vendor: "Best Blue BBQ", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Pulled Pork Nachos", description: "Pulled pork nachos", fare: "Meals", vendor: "Best Blue BBQ", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Cole Slaw", description: "Cole slaw", fare: "Snacks", vendor: "Best Blue BBQ", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Street Nachos", description: "Modelo Cantina street nachos", fare: "Meals", vendor: "Modelo Cantina", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Pork Carnitas Nachos", description: "Pork carnitas nachos", fare: "Meals", vendor: "Modelo Cantina", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Tinga Chicken Nachos", description: "Tinga chicken nachos", fare: "Meals", vendor: "Modelo Cantina", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Footlong Carolina Dog", description: "Footlong Carolina Dog", fare: "Meals", vendor: "Top Dogs", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Footlong Halftime Dog", description: "Footlong Halftime Dog", fare: "Meals", vendor: "Top Dogs", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Carolina Crunch", description: "Stadium Scoops Carolina Crunch", fare: "Desserts", vendor: "Stadium Scoops", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Merritt's BLT", description: "Famous Merritt's Grill BLT", fare: "Meals", vendor: "Merritt's Grill", vendorHint: "Gate 2 Kenan Pines", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Merritt's Banana Pudding", description: "Banana pudding", fare: "Desserts", vendor: "Merritt's Grill", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Gleezy Double Smoke Brisket Hot Dog", description: "Gleezy double smoked brisket hot dog", fare: "Meals", vendor: "Kenan concessions", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Philly Steak Nachos", description: "Philly steak nachos", fare: "Meals", vendor: "Kenan concessions", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Donut Ice Cream Sandwich", description: "Donut ice cream sandwich", fare: "Desserts", vendor: "Kenan concessions", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Serendipity Ice Cream", description: "Serendipity ice cream (10+ locations)", fare: "Desserts", vendor: "Serendipity Ice Cream", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

const carter_finley_stadium: NcaaFootballRawItem[] = [
  { name: "Peruvian Rotisserie Chicken", description: "Peruvian rotisserie chicken and Latin dishes", fare: "Meals", vendor: "Alpaca", vendorHint: "Concourse adjacent to Raleighwood", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Chicken Tenders", description: "Chicken tenders", fare: "Meals", vendor: "Wolf & Hen", vendorHint: "Raleighwood", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Fries", description: "Fries", fare: "Snacks", vendor: "Wolf & Hen", vendorHint: "Raleighwood", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Chick-fil-A Chicken Sandwich", description: "Chick-fil-A return to concourse", fare: "Meals", vendor: "Chick-fil-A", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

const gerald_j_ford_stadium: NcaaFootballRawItem[] = [
  { name: "Antone's Famous Po' Boy", description: "Antone's Famous Po' Boy sandwiches in walk-through market", fare: "Meals", vendor: "Antone's Famous Po' Boys", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Gourmet Kettle Corn", description: "SMU-themed gourmet kettle corn", fare: "Snacks", vendor: "Concourse", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Cotton Candy", description: "Cotton candy throughout concourse", fare: "Desserts", vendor: "Concourse", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Palmers Fried Chicken", description: "Fried chicken (East Plaza pavilion)", fare: "Meals", vendor: "Palmers Fried Chicken", vendorHint: "East Plaza", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

const stanford_stadium: NcaaFootballRawItem[] = [
  { name: "Chick-fil-A Chicken Sandwich", description: "Chick-fil-A at Sec. 235", fare: "Meals", vendor: "Chick-fil-A", vendorHint: "Sec 235", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Wetzel's Soft Pretzel", description: "Wetzel's Pretzels returning favorite", fare: "Snacks", vendor: "Wetzel's Pretzels", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Rita's Italian Ice", description: "Rita's Italian Ice returning favorite", fare: "Desserts", vendor: "Rita's Italian Ice", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

const jma_wireless_dome: NcaaFootballRawItem[] = [
  { name: "Chicken Tenders with Fries", description: "Chicken tenders with fries", fare: "Meals", vendor: "Cuse Chicken", vendorHint: "Secs 106, 121", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Fried Chicken Sandwich with Fries", description: "Breaded chicken filet with chipotle ranch, with fries", fare: "Meals", vendor: "Cuse Chicken", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Cheese Fries", description: "Cheese fries", fare: "Snacks", vendor: "Cuse Chicken / Loudhouse Grille", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Cheeseburger with Fries", description: "Beef patty on brioche with American cheese, LTO, fries", fare: "Meals", vendor: "Loudhouse Grille", vendorHint: "Secs 110, 125", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Barbecue Beef Brisket Sandwich", description: "Smoky BBQ brisket on brioche with jalapeños", fare: "Meals", vendor: "Loudhouse Grille", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Hofmann Hot Dog", description: "Hofmann hot dog", fare: "Meals", vendor: "Loudhouse / Tomato Wheel / Otto's / 50 Yard Line", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Grilled Chicken Sandwich", description: "Grilled chicken on brioche with LTO, honey mustard", fare: "Meals", vendor: "Otto's Fast Break", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Bavarian Pretzel", description: "Bavarian pretzel", fare: "Snacks", vendor: "Otto's / Tomato Wheel / 50 Yard Line", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "J&J SuperPretzel", description: "J&J SuperPretzel return", fare: "Snacks", vendor: "Dome concessions", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Cheese Pizza Slice", description: "Cheese pizza slice", fare: "Meals", vendor: "Tomato Wheel and Dome Dog / 50 Yard Line", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Pepperoni Pizza Slice", description: "Pepperoni pizza slice", fare: "Meals", vendor: "Tomato Wheel and Dome Dog / 50 Yard Line", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Sausage Sub with Peppers and Onions", description: "Sausage sub", fare: "Meals", vendor: "Tomato Wheel and Dome Dog / 50 Yard Line", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Nacho Grande", description: "Tostitos with cheese and salsa (jalapeños optional)", fare: "Meals", vendor: "Tomato Wheel / Nacho Stop / 50 Yard Line", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Popcorn", description: "Popcorn (boxed or fresh-popped)", fare: "Snacks", vendor: "Multiple stands", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Family Four Meal Deal", description: "Four hot dogs, four sodas/waters, two popcorn boxes", fare: "Meals", vendor: "Tomato Wheel and Dome Dog / upper 50-yard stands", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

const scott_stadium: NcaaFootballRawItem[] = [
  { name: "Hot Dog", description: "Hot dog", fare: "Meals", vendor: "UVA Classics / Hoos Homestand", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Nachos", description: "Nachos", fare: "Meals", vendor: "UVA Classics / Hoos Homestand", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Soft Pretzel", description: "Soft pretzel", fare: "Snacks", vendor: "UVA Classics / Hoos Homestand / BBQ Alley", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Popcorn", description: "Popcorn", fare: "Snacks", vendor: "UVA Classics / Hoos Homestand / BBQ Alley / Papa Johns", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "BBQ Sandwich", description: "BBQ sandwich", fare: "Meals", vendor: "BBQ Alley", vendorHint: "Secs 311, 321, 514", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Andouille Sausage", description: "Andouille sausage", fare: "Meals", vendor: "BBQ Alley", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Brisket Sandwich", description: "Brisket sandwich", fare: "Meals", vendor: "BBQ Alley", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Cheese Pizza", description: "Cheese pizza", fare: "Meals", vendor: "Papa Johns", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Pepperoni Pizza", description: "Pepperoni pizza", fare: "Meals", vendor: "Papa Johns", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Hamburger", description: "Hamburger", fare: "Meals", vendor: "Hamburger House", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Cheeseburger", description: "Cheeseburger", fare: "Meals", vendor: "Hamburger House", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Veggie Burger", description: "Veggie burger", fare: "Meals", vendor: "Hamburger House", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Chicken Finger Basket", description: "Chicken finger basket", fare: "Meals", vendor: "Hamburger House", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Fries", description: "Fries", fare: "Snacks", vendor: "Hamburger House", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Smoked Chicken Tacos", description: "Smoked chicken tacos", fare: "Meals", vendor: "Eat Drink Taco", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Beef Barbacoa Tacos", description: "Beef barbacoa tacos", fare: "Meals", vendor: "Eat Drink Taco", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Smoked Chicken Nacho", description: "Smoked chicken nacho", fare: "Meals", vendor: "Eat Drink Nacho", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Beef Barbacoa Nacho", description: "Beef barbacoa nacho", fare: "Meals", vendor: "Eat Drink Nacho", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Chick-fil-A Chicken Sandwich", description: "Chick-fil-A food truck on East side", fare: "Meals", vendor: "Chick-fil-A", vendorHint: "East side food truck", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

const lane_stadium: NcaaFootballRawItem[] = [
  { name: "Hot Dog", description: "Fan-friendly hot dog (every stand)", fare: "Meals", vendor: "Fan-Friendly / Aramark", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Nachos", description: "Fan-friendly nachos", fare: "Meals", vendor: "Fan-Friendly stands", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Popcorn", description: "Fan-friendly popcorn", fare: "Snacks", vendor: "Fan-Friendly stands", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "Lane Legs", description: "Signature turkey legs (Lane Legs)", fare: "Meals", vendor: "Lane Legs", vendorHint: "SE corner; portables Sec 130 & 110", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
  { name: "BBQ Pork with Chips", description: "BBQ pork with chips", fare: "Meals", vendor: "South concourse stands", tags: [...NCAA_FB, "verified-current", "import-season:2025"] },
];

export const parseAlumniStadiumMenu = makeParser(
  "alumni-stadium",
  "Alumni Stadium",
  "https://www.bc.edu/content/bc-web/offices/aux-services/sites/dining/locations/Concessions.html",
  alumni_stadium
);

export const parseMemorialStadiumClemsonMenu = makeParser(
  "memorial-stadium-clemson",
  "Memorial Stadium",
  "https://www.theclemsoninsider.com/2025/08/28/hopkins-opens-bbq-food-truck-at-death-valley/",
  memorial_stadium_clemson
);

export const parseDoakCampbellStadiumMenu = makeParser(
  "doak-campbell-stadium",
  "Doak Campbell Stadium",
  "https://seminoles.com/sports/2023/6/27/football-concessions",
  doak_campbell_stadium
);

export const parseBobbyDoddStadiumAtHyundaiFieldMenu = makeParser(
  "bobby-dodd-stadium-at-hyundai-field",
  "Bobby Dodd Stadium at Hyundai Field",
  "https://ramblinwreck.com/whats-new-at-bobby-dodd-stadium-at-hyundai-field-2024/",
  bobby_dodd_stadium_at_hyundai_field
);

export const parseLnFederalCreditUnionStadiumMenu = makeParser(
  "ln-federal-credit-union-stadium",
  "L&N Federal Credit Union Stadium",
  "https://s3.us-east-2.amazonaws.com/sidearm.nextgen.sites/gocards.com/documents/2025/8/19/FBC2025_Concessions_Directory.pdf",
  ln_federal_credit_union_stadium
);

export const parseHardRockStadiumAccMenu = makeParser(
  "hard-rock-stadium",
  "Hard Rock Stadium",
  "https://themiamihurricane.com/2025/11/19/hard-rock-stadium-food-whats-worth-it-and-whats-not/",
  hard_rock_stadium
);

export const parseKenanMemorialStadiumMenu = makeParser(
  "kenan-memorial-stadium",
  "Kenan Memorial Stadium",
  "https://goheels.com/news/2024/9/4/football-kenan-stadium-know-before-you-go-2024",
  kenan_memorial_stadium
);

export const parseCarterFinleyStadiumMenu = makeParser(
  "carter-finley-stadium",
  "Carter-Finley Stadium",
  "https://gopack.com/news/2025/8/21/football-new-set-of-enhancements-coming-ahead-of-2025-football-season",
  carter_finley_stadium
);

export const parseGeraldJFordStadiumMenu = makeParser(
  "gerald-j-ford-stadium",
  "Gerald J. Ford Stadium",
  "https://smumustangs.com/news/2024/8/2/football-new-league-new-gameday.aspx",
  gerald_j_ford_stadium
);

export const parseStanfordStadiumMenu = makeParser(
  "stanford-stadium",
  "Stanford Stadium",
  "https://gostanford.com/news/2025/09/10/things-to-know-stanford-stadium-2025",
  stanford_stadium
);

export const parseJmaWirelessDomeMenu = makeParser(
  "jma-wireless-dome",
  "JMA Wireless Dome",
  "https://campusdining.syr.edu/retail-dining/dome-concessions/",
  jma_wireless_dome
);

export const parseScottStadiumMenu = makeParser(
  "scott-stadium",
  "Scott Stadium",
  "https://virginiasports.com/football-gameday",
  scott_stadium
);

export const parseLaneStadiumMenu = makeParser(
  "lane-stadium",
  "Lane Stadium",
  "https://hokiesports.com/news/2024/08/16/fan-experience-elements-released-for-2024-virginia-tech-football-season",
  lane_stadium
);

export const ACC_FOOTBALL_MENU_VENUE_SLUGS = [
  "alumni-stadium",
  "memorial-stadium-clemson",
  "doak-campbell-stadium",
  "bobby-dodd-stadium-at-hyundai-field",
  "ln-federal-credit-union-stadium",
  "hard-rock-stadium",
  "kenan-memorial-stadium",
  "carter-finley-stadium",
  "gerald-j-ford-stadium",
  "stanford-stadium",
  "jma-wireless-dome",
  "scott-stadium",
  "lane-stadium"
] as const;
