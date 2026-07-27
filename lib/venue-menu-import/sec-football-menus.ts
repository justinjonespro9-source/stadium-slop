/**
 * SEC Phase 1 starter menus — verified athletics / local coverage only.
 * Descriptions rewritten in Stadium Slop voice (not copied wholesale).
 *
 * Existing deep menus (do not overwrite via this pack):
 * - bryant-denny-stadium, sanford-stadium, tiger-stadium,
 *   neyland-stadium, darrell-k-royal-texas-memorial-stadium, kyle-field
 *
 * Menu pending (thin / unpublished item lists):
 * - donald-w-reynolds-razorback-stadium (latest full stand map is 2022)
 * - ben-hill-griffin-stadium (2021 athletics map; no 2024–26 item list)
 * - davis-wade-stadium (concessionaire concept names only)
 * - williams-brice-stadium (ops updates; no published food SKUs)
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

/** Jordan-Hare — auburntigers.com/concessions stand map + 2025 gameday notes. */
const jordanHare: NcaaFootballRawItem[] = [
  {
    name: "Chick-fil-A Chicken Sandwich",
    description: "Classic CFA chicken sandwich from the many Jordan-Hare counters",
    fare: "Meals",
    vendor: "Chick-fil-A",
    vendorHint: "Sections 6, 10, 24, 59, 104",
    tags: [...NCAA_FB]
  },
  {
    name: "Chicken Salad Chick Chicken Salad",
    description: "Chicken salad scoop from the Chicken Salad Stand",
    fare: "Meals",
    vendor: "Chicken Salad Chick",
    vendorHint: "Sections 2 & 20",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Ben's Soft Pretzel",
    description: "Soft pretzel from Ben's Pretzels carts around the bowl",
    fare: "Snacks",
    vendor: "Ben's Pretzels",
    vendorHint: "Sections 1, 10, 18",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB, "local-vendor"]
  }
];

/** Kroger Field — UK Athletics / Herald-Leader 2026 Compass core fare. */
const krogerField: NcaaFootballRawItem[] = [
  {
    name: "Hot Dog",
    description: "Classic stadium dog at the 2026 fan-friendly price point",
    fare: "Meals",
    vendor: "Kroger Field Concessions",
    tags: [...NCAA_FB]
  },
  {
    name: "Soft Pretzel",
    description: "Warm soft pretzel across the main stands",
    fare: "Snacks",
    vendor: "Kroger Field Concessions",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  },
  {
    name: "Nachos",
    description: "Cheese nachos from the core concessions lineup",
    fare: "Meals",
    vendor: "Kroger Field Concessions",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  },
  {
    name: "Popcorn",
    description: "Fresh popcorn at select Kroger Field stands",
    fare: "Snacks",
    vendor: "Kroger Field Concessions",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  },
  {
    name: "Chicken Basket",
    description: "Chicken basket from the 2026 core menu",
    fare: "Meals",
    vendor: "Kroger Field Concessions",
    tags: [...NCAA_FB]
  }
];

/** Vaught-Hemingway — Ole Miss Athletics 2024–25 gameday enhancements. */
const vaughtHemingway: NcaaFootballRawItem[] = [
  {
    name: "Grove Burger",
    description: "Stadium burger added for student-section gameday traffic",
    fare: "Meals",
    vendor: "Vaught Concessions",
    vendorHint: "Section N8",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Duke's Pulled Chicken Nachos",
    description: "Pulled chicken nachos with queso blanco and Duke's Comeback Sauce",
    fare: "Meals",
    vendor: "Duke's",
    vendorHint: "Section S7",
    tags: [...NCAA_FB, "signature", "local-vendor"]
  },
  {
    name: "Chick-fil-A Chicken Sandwich",
    description: "CFA chicken sandwich from expanded Vaught locations",
    fare: "Meals",
    vendor: "Chick-fil-A",
    tags: [...NCAA_FB]
  },
  {
    name: "Soft Pretzel",
    description: "Pretzel from the Coors Banquet Deck snack lineup",
    fare: "Snacks",
    vendor: "Coors Banquet Deck",
    vendorHint: "Section G",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  }
];

/** Faurot Field — Mizzou Athletics 2025 fan-experience release. */
const faurotField: NcaaFootballRawItem[] = [
  {
    name: "Fan-Friendly Hot Dog",
    description: "Hot dog from the $2.99 fan-friendly stands",
    fare: "Meals",
    vendor: "Memorial Stadium Concessions",
    vendorHint: "Sections 103–104, 108–109, 120–121, 124–125, Tiger Deck",
    tags: [...NCAA_FB]
  },
  {
    name: "Popcorn",
    description: "Fresh popcorn at fan-friendly pricing locations",
    fare: "Snacks",
    vendor: "Memorial Stadium Concessions",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  },
  {
    name: "BBQ Bacon Wrapped Conecuh Sausage Dog",
    description: "Bacon-wrapped Conecuh sausage dog finished with BBQ",
    fare: "Meals",
    vendor: "Memorial Stadium Concessions",
    vendorHint: "Section 121",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Boulevard Beer Brat",
    description: "Brat finished with Boulevard beer accents",
    fare: "Meals",
    vendor: "Boulevard",
    vendorHint: "Sections 106 & 123",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Boulevard Beer Cheeseburger",
    description: "Cheeseburger from the Boulevard stand",
    fare: "Meals",
    vendor: "Boulevard",
    vendorHint: "Section 123",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Boulevard Beer Cheese Fries",
    description: "Fries smothered in Boulevard beer cheese",
    fare: "Meals",
    vendor: "Boulevard",
    vendorHint: "Section 123",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Una Vida Loaded Nachos",
    description: "Loaded nachos from the Una Vida stand",
    fare: "Meals",
    vendor: "Una Vida",
    vendorHint: "Section 118",
    tags: [...NCAA_FB, "signature"]
  }
];

/** Oklahoma Memorial — soonersports.com 2025 fan-experience enhancements. */
const oklahomaMemorial: NcaaFootballRawItem[] = [
  {
    name: "Freddy's Steakburger",
    description: "Steakburger from new partner Freddy's Frozen Custard & Steakburgers",
    fare: "Meals",
    vendor: "Freddy's",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Freddy's Chicken Tenders",
    description: "Chicken tenders from the Freddy's stand",
    fare: "Meals",
    vendor: "Freddy's",
    tags: [...NCAA_FB]
  },
  {
    name: "Freddy's Cheese Fries",
    description: "Cheese fries from Freddy's",
    fare: "Meals",
    vendor: "Freddy's",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  },
  {
    name: "Freddy's Chili Cheese Fries",
    description: "Chili cheese fries from Freddy's",
    fare: "Meals",
    vendor: "Freddy's",
    tags: [...NCAA_FB]
  },
  {
    name: "Freddy's Frozen Custard",
    description: "Frozen custard dessert from Freddy's",
    fare: "Desserts",
    vendor: "Freddy's",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  },
  {
    name: "Conecuh Sausage",
    description: "Official smoked sausage of OU Athletics at Levy stands",
    fare: "Meals",
    vendor: "Conecuh",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Hot Honey Funnel Cake Fries",
    description: "Funnel cake fries finished with hot honey",
    fare: "Desserts",
    vendor: "Levy",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Boomer Burger Basket",
    description: "Burger basket from the 2025 Levy highlight menu",
    fare: "Meals",
    vendor: "Levy",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Loaded Tater Tots",
    description: "Loaded tots from the 2025 concessions upgrades",
    fare: "Meals",
    vendor: "Levy",
    tags: [...NCAA_FB]
  }
];

/** FirstBank Stadium — vucommodores.com/concessions 2025. */
const firstbank: NcaaFootballRawItem[] = [
  {
    name: "Daddy's Dogs Hot Dog",
    description: "Local Daddy's Dogs from the east stands",
    fare: "Meals",
    vendor: "Daddy's Dogs",
    vendorHint: "East stands",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Five Points Pizza Slice",
    description: "Cheese or pepperoni slice while supplies last",
    fare: "Meals",
    vendor: "Five Points Pizza",
    vendorHint: "Sections H & D · north and south lobbies",
    tags: [...NCAA_FB, "local-vendor", "signature"]
  },
  {
    name: "Birria Tacos",
    description: "Birria tacos added for the 2025 FirstBank menu",
    fare: "Meals",
    vendor: "OVG Concessions",
    tags: [...NCAA_FB, "signature"]
  },
  {
    name: "Hot Chicken Tenders",
    description: "Nashville-style hot chicken tenders",
    fare: "Meals",
    vendor: "OVG Concessions",
    tags: [...NCAA_FB, "local-vendor"]
  },
  {
    name: "Chicken Tenders",
    description: "Standard chicken tenders from the expanded stands",
    fare: "Meals",
    vendor: "OVG Concessions",
    tags: [...NCAA_FB]
  },
  {
    name: "Stadium Burger",
    description: "Burger on a potato roll from the 2025 OVG menu",
    fare: "Meals",
    vendor: "OVG Concessions",
    tags: [...NCAA_FB]
  },
  {
    name: "Loaded Beef Nachos",
    description: "Nachos with queso and slow-cooked beef",
    fare: "Meals",
    vendor: "OVG Concessions",
    tags: [...NCAA_FB]
  },
  {
    name: "French Fries",
    description: "Fries from the expanded FirstBank stands",
    fare: "Snacks",
    vendor: "OVG Concessions",
    dietary: ["Vegetarian"],
    tags: [...NCAA_FB]
  }
];

export const parseJordanHareStadiumMenu = makeParser(
  "jordan-hare-stadium",
  "Jordan-Hare Stadium",
  "https://auburntigers.com/concessions",
  jordanHare
);

export const parseKrogerFieldMenu = makeParser(
  "kroger-field",
  "Kroger Field",
  "https://ukathletics.com/news/2026/06/05/uk-fans-will-see-game-day-upgrades-through-enterprise-services-partnership/",
  krogerField,
  "import-season:2026"
);

export const parseVaughtHemingwayStadiumMenu = makeParser(
  "vaught-hemingway-stadium",
  "Vaught-Hemingway Stadium",
  "https://olemisssports.com/news/2024/8/22/ole-miss-football-2024-gameday-enhancements-and-adjustments",
  vaughtHemingway
);

export const parseFaurotFieldAtMemorialStadiumMenu = makeParser(
  "faurot-field-at-memorial-stadium",
  "Faurot Field at Memorial Stadium",
  "https://mutigers.com/news/2025/8/19/football-mizzou-athletics-details-fan-experience-highlights-for-2025",
  faurotField
);

export const parseGaylordFamilyOklahomaMemorialStadiumMenu = makeParser(
  "gaylord-family-oklahoma-memorial-stadium",
  "Gaylord Family – Oklahoma Memorial Stadium",
  "https://soonersports.com/news/2025/8/26/ou-announces-football-fan-experience-enhancements",
  oklahomaMemorial
);

export const parseFirstbankStadiumMenu = makeParser(
  "firstbank-stadium",
  "FirstBank Stadium",
  "https://vucommodores.com/concessions",
  firstbank
);

export const SEC_FOOTBALL_MENU_VENUE_SLUGS = [
  "jordan-hare-stadium",
  "kroger-field",
  "vaught-hemingway-stadium",
  "faurot-field-at-memorial-stadium",
  "gaylord-family-oklahoma-memorial-stadium",
  "firstbank-stadium"
] as const;
