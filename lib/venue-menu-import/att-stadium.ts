/**
 * AT&T Stadium (Dallas Cowboys — NFL) menu parser.
 *
 * The official concessions page embeds a Flipsnack flipbook
 * (`ConcessionsOptions_Online_Final`) — stand-level menus are image/PDF
 * only in static HTML. No item JSON, ordering API, or extractable accordion text.
 *
 * Menu rows are curated from the flipbook-linked source URL, 2026 NFL venue
 * import headline/partner notes, and Legends Hospitality press coverage
 * (2024–2025 seasons). Re-fetch the Flipsnack embed hash when the page updates.
 *
 * Vendor/stand names are vendorName / vendorLocationHint only — never FoodItem rows.
 *
 * Sources:
 *   https://attstadium.com/concessions-menu/
 *   data/league-import/nfl-venues-import.cleaned.csv (Dallas Cowboys rows)
 *   https://www.star-telegram.com/sports/nfl/dallas-cowboys/article312039931.html
 *
 * DB slug: `att-stadium`. CLI aliases: `at&t-stadium`, `cowboys-stadium`.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "att-stadium";
const VENUE_NAME = "AT&T Stadium";
const SOURCE_URL = "https://attstadium.com/concessions-menu/";

const FLIPSNACK_HASH = "RkNBNTY2QjlFOEMrdGppb3MwbHBtYQ==";

export let lastAttStadiumParseStats = {
  sourceFlipsnackEmbed: false,
  flipsnackHash: null as string | null,
  skippedVendorOnly: 0,
  skippedBeverages: 0,
  skippedGeneric: 0
};

/** Documented vendor-only / non-food rows (not imported as FoodItem names). */
export const CURATION_SKIPPED_VENDOR_ONLY = [
  "The Tequila Bar (cocktails / Cowboyrita)",
  "The Suite Refresh (suite renovation copy)",
  "Cowboys Kid Meals (combo bundle with soda)",
  "Snack stands with no named items on public sources"
] as const;

export const CURATION_SKIPPED_BEVERAGES = [
  "Beer / wine / cocktails / Cowboyrita / Rowdy Cup",
  "Pepsi / soda / water / coffee",
  "Merch: Dallas Cowboys Yeti"
] as const;

export const CURATION_SKIPPED_GENERIC = [
  "Generic hand-scooped ice cream cones",
  "Assorted snacks without a named dish",
  "Modifier / sauce-only rows"
] as const;

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function item(
  name: string,
  vendor: string,
  opts: {
    description?: string;
    fare?: VenueMenuFare;
    vendorHint?: string;
    dietary?: VenueMenuDietaryTag[];
    local?: boolean;
  } = {}
): RawItem {
  const tags = ["nfl", "world-cup-host"];
  if (opts.local !== false) tags.push("local-specialty");
  return {
    name,
    vendor,
    description: opts.description,
    fare: opts.fare ?? "Meals",
    vendorHint: opts.vendorHint,
    dietary: opts.dietary ?? [],
    tags
  };
}

const MENU_DATA: RawItem[] = [
  // ── Signature / headline (NFL import + 2025 press) ─────────────────

  item("The Rowdy Dog", "The Rowdy Dog", {
    description:
      "Sonoran-style Nathan's footlong wrapped in bacon with candied jalapeños, pico, and spicy crema",
    vendorHint: "Sections 220 and 441"
  }),
  item("The Texas Burrito", "Vaqueros Tex-Mex", {
    description:
      "17-inch tortilla with steak or chicken, fries, guacamole, pico, and spicy crema",
    vendorHint: "Sections 214, 411, 204, 229, 416, and 446"
  }),
  item("The Elote Burger", "Vaqueros Tex-Mex", {
    description: "Angus patty with Flamin' Hot elote, pepperjack, lettuce, and tomato",
    vendorHint: "Sections 132, 325, 204, 229, 416, and 446"
  }),
  item("Frito Pie Burger", "Vaqueros Tex-Mex", {
    description: "Angus patty with Texas chili, cheddar, and Chili Cheese Fritos",
    vendorHint: "Sections 132 and 325"
  }),
  item("Smoked Salmon BLT", "Main Clubs", {
    description:
      "Honey-smoked salmon, bacon, arugula, heirloom tomato, avocado, chipotle aioli",
    vendorHint: "Main Clubs"
  }),
  item("Dessert Nachos", "Sweet Stop", {
    description:
      "Star-shaped cinnamon-sugar pastries with strawberry and cream cheese dipping sauces",
    fare: "Desserts",
    vendorHint: "Multiple sections",
    local: false
  }),

  // ── Vaqueros Tex-Mex ─────────────────────────────────────────────

  item("Salsa Chicken Tacos", "Vaqueros Tex-Mex", {
    vendorHint: "Sections 204 and 409"
  }),
  item("Torta", "Vaqueros Tex-Mex", {
    description: "Bolillo bun with salsa, protein, queso fresco, and vegetables",
    vendorHint: "Sections 204, 229, 416, and 446"
  }),
  item("Flamin' Hot Fritos Tacos", "Vaqueros Tex-Mex", {
    vendorHint: "Sections 204, 229, 416, and 446"
  }),

  // ── Bent Buckle BBQ ──────────────────────────────────────────────

  item("Sausage Supreme", "Bent Buckle BBQ", {
    description:
      "Jalapeño cheese sausage, mac and cheese, sliced brisket, and BBQ sauce on a hoagie",
    vendorHint: "Sections 101, 125, and 310"
  }),
  item("Hickory-Smoked Ribs", "Bent Buckle BBQ", {
    vendorHint: "Sections 101, 125, and 310"
  }),
  item("BBQ Bacon Burger", "Bent Buckle BBQ", {
    description:
      "Angus patty with bacon, fried pickle fries, pepper jack, and Bent Buckle BBQ sauce",
    vendorHint: "Sections 101, 125, and 310"
  }),
  item("Fritos Brisket Mac and Cheese Balls", "Bent Buckle BBQ", {
    description:
      "Smoked brisket and Cowboys mac in BBQ Fritos breading on mac with sour cream and green onions",
    vendorHint: "CRISP sections 218 and 243; Bent Buckle"
  }),

  // ── CRISP ────────────────────────────────────────────────────────

  item("Ruffles Buffalo Chicken Sandwich", "CRISP", {
    vendorHint: "Sections 218, 243, 409, and 439"
  }),
  item("Mango Habanero Chicken Sandwich", "CRISP", {
    description: "Fried chicken with pineapple slaw and mango-habanero sauce"
  }),

  // ── Tailgate Grill / cheesesteak ─────────────────────────────────

  item("Jumbo Cowboys Cheesesteak", "Tailgate Grill", {
    description: "Sliced sirloin, onions, and jalapeño jack on a hoagie",
    vendorHint: "Main concourse"
  }),

  // ── Hall of Fame Concessions ─────────────────────────────────────

  item("Cowboys Cheesesteak Hand Pie", "Hall of Fame Concessions", {
    description: "Sirloin, onions, cheesesteak seasoning, and hot white queso in flaky pastry"
  }),
  item("Gluten-Free Cowboys Cheesesteak Hand Pie", "Hall of Fame Concessions", {
    description: "Cowboys cheesesteak hand pie in gluten-free pastry",
    dietary: ["Gluten Free"]
  }),
  item("Quinoa Salad", "Hall of Fame Concessions", {
    description: "Vegetables, chickpeas, olives, feta, and vinaigrette",
    fare: "Snacks",
    dietary: ["Vegetarian"]
  }),
  item("The Honor Club", "Hall of Fame Concessions", {
    description: "Hall of Fame specialty sandwich"
  }),
  item("Wagyu Truffle Burger", "Hall of Fame Concessions"),
  item("Tequila Lime Chicken Sandwich", "Hall of Fame Concessions"),
  item("Honey Bourbon Steak Sandwich", "Hall of Fame Concessions"),
  item("Oops All Berries Waffle", "Hall of Fame Concessions", { fare: "Desserts", local: false }),
  item("The Churro Waffle", "Hall of Fame Concessions", { fare: "Desserts", local: false }),
  item("Buffalo Chicken and Bacon Flatbread", "Hall of Fame Concessions", {
    vendorHint: "Hall of Fame snack stands",
    fare: "Snacks"
  }),
  item("Quattro Formaggio Flatbread", "Hall of Fame Concessions", {
    vendorHint: "Hall of Fame snack stands",
    fare: "Snacks",
    dietary: ["Vegetarian"]
  }),
  item("Sausage and Red Pepper Flatbread", "Hall of Fame Concessions", {
    vendorHint: "Hall of Fame snack stands",
    fare: "Snacks"
  }),

  // ── Main Clubs ───────────────────────────────────────────────────

  item("Slow-Roasted Steak Sandwich", "Main Clubs"),
  item("Lobster Mac and Cheese", "Main Clubs"),
  item("Ultimate Nachos", "Main Clubs", { fare: "Snacks" }),
  item("Flamin' Hot Cheetos Elote", "Main Clubs", { fare: "Snacks" }),
  item("Muffuletta", "Main Clubs", {
    description: "Focaccia with olive salad, cured meats, and provolone"
  }),
  item("Cowboys Cheesesteak", "Main Clubs"),
  item("Loaded Cheesesteak Fries", "Main Clubs", { fare: "Snacks" }),
  item("Honey Chipotle Chicken Sandwich", "Main Clubs"),
  item("The BBQ Dog", "Main Clubs", {
    description: "Nathan's all-beef hot dog with BBQ toppings"
  }),
  item("The BLT Dog", "Main Clubs"),
  item("The Lineman Burrito", "Main Clubs"),

  // ── Silver Club Grill ────────────────────────────────────────────

  item("Fried Mozzarella Burger", "Silver Club Grill", {
    description: "Angus burger with fried mozzarella sticks and marinara"
  }),
  item("Buffalo Chicken Empanadas", "Silver Club Grill", { fare: "Snacks" }),

  // ── Papa John's ──────────────────────────────────────────────────

  item("The Pizza Burger", "Papa John's", {
    vendorHint: "Sections 201 and 226"
  }),

  // ── Plant-Based / Vegetarian carts ───────────────────────────────

  item("Vegan Ultimate Nachos", "Plant-Based Carts", {
    vendorHint: "Sections 110 and 414",
    dietary: ["Vegan", "Vegetarian"]
  }),
  item("Buffalo Chik'n Nachos", "Plant-Based Carts", {
    vendorHint: "Sections 110 and 414",
    dietary: ["Vegan", "Vegetarian"]
  }),
  item("Thai Veggie Wrap", "Plant-Based Carts", {
    description: "Spicy peanut sauce",
    vendorHint: "Sections 110 and 414",
    dietary: ["Vegan", "Vegetarian"]
  }),
  item("Plant-Based Burger", "Plant-Based Carts", {
    vendorHint: "Sections 110 and 414",
    dietary: ["Vegan", "Vegetarian"]
  }),
  item("Touchdown Tots", "Plant-Based Carts", {
    description: "Tots with plant-based chicken, guacamole, and pico",
    fare: "Snacks",
    dietary: ["Vegan", "Vegetarian"]
  }),
  item("Vegan Hot Dog", "Plant-Based Carts", {
    vendorHint: "Sections 411 and 441",
    dietary: ["Vegan", "Vegetarian"]
  }),
  item("Vegan Pulled Pork Sandwich", "Plant-Based Carts", {
    vendorHint: "Sections 411 and 441",
    dietary: ["Vegan", "Vegetarian"]
  }),
  item("Vegan Nachos", "Plant-Based Carts", {
    vendorHint: "Sections 411 and 441",
    dietary: ["Vegan", "Vegetarian"]
  }),
  item("Meat-Free Cowboys Cheesesteak", "Plant-Based Carts", {
    vendorHint: "Sections 411 and 441",
    dietary: ["Vegan", "Vegetarian"]
  }),

  // ── Grab N Go / Miller LiteHouse ─────────────────────────────────

  item("Strawberry Kiwi Yogurt Parfait", "Grab N Go", {
    fare: "Desserts",
    vendorHint: "Miller LiteHouse; sections 420 and 450",
    dietary: ["Vegetarian"],
    local: false
  }),
  item("Cranberry Pecan Chicken Salad Sandwich", "Grab N Go", {
    vendorHint: "Miller LiteHouse; sections 420 and 450"
  }),
  item("Steak Fajita Wrap", "Grab N Go", {
    vendorHint: "Miller LiteHouse; sections 420 and 450"
  }),
  item("Buffalo Chicken Salad", "Grab N Go", {
    vendorHint: "Miller LiteHouse; sections 420 and 450"
  }),
  item("Market Berry Chicken Salad", "Grab N Go", {
    vendorHint: "Miller LiteHouse; sections 420 and 450"
  }),

  // ── Desserts / ice cream ─────────────────────────────────────────

  item("Cowboys Party Mix Sundae", "Blue Bell Ice Cream", {
    description: "Official Texas ice cream with Cowboys Party Mix topping",
    fare: "Desserts",
    vendorHint: "Multiple sections",
    local: true
  }),
  item("Fritos Sundae", "Blue Bell Ice Cream", {
    fare: "Desserts",
    vendorHint: "Pepsi Fan Deck; ice cream carts sections 219 and 245",
    local: false
  }),

  // ── Club sports bar (named appetizers) ───────────────────────────

  item("Pretzel Poppers", "AT&T Stadium Sports Bar", {
    fare: "Snacks",
    vendorHint: "Season ticket member areas",
    local: false
  }),
  item("Spicy Chicharrones", "AT&T Stadium Sports Bar", {
    fare: "Snacks",
    vendorHint: "Season ticket member areas",
    local: false
  })
];

function mergeItems(rawItems: RawItem[]): VenueMenuSourceItem[] {
  const map = new Map<string, RawItem>();

  for (const raw of rawItems) {
    const key = normalizeMenuItemName(raw.name);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...raw });
      continue;
    }

    if (!existing.description && raw.description) {
      existing.description = raw.description;
    } else if (
      raw.description &&
      existing.description &&
      raw.description !== existing.description &&
      !existing.description.includes(raw.description)
    ) {
      existing.description = `${existing.description}; ${raw.description}`;
    }

    if (raw.vendor && existing.vendor && existing.vendor !== raw.vendor) {
      existing.vendor = `${existing.vendor} / ${raw.vendor}`;
    } else if (raw.vendor && !existing.vendor) {
      existing.vendor = raw.vendor;
    }

    if (raw.vendorHint) {
      const hints = new Set(
        `${existing.vendorHint ?? ""}; ${raw.vendorHint}`
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
      );
      existing.vendorHint = [...hints].join("; ");
    }

    if (raw.dietary?.length) {
      existing.dietary = [...new Set([...(existing.dietary ?? []), ...raw.dietary])];
    }
  }

  return [...map.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((raw) => ({
      name: raw.name,
      description: raw.description,
      fare: raw.fare,
      category: "Food" as const,
      vendorName: raw.vendor,
      vendorLocationHint: raw.vendorHint,
      dietaryTags: raw.dietary ?? [],
      sourceUrl: SOURCE_URL
    }));
}

export function auditAttStadiumConcessionsHtml(html: string): {
  flipsnackEmbed: boolean;
  hash: string | null;
} {
  const flipsnackEmbed = /player\.flipsnack\.com/i.test(html);
  const hashMatch = html.match(/flipsnack\.com\/\?hash=([^"&]+)/i);
  return {
    flipsnackEmbed,
    hash: hashMatch ? decodeURIComponent(hashMatch[1]) : null
  };
}

export async function parseAttStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  lastAttStadiumParseStats = {
    sourceFlipsnackEmbed: false,
    flipsnackHash: null,
    skippedVendorOnly: CURATION_SKIPPED_VENDOR_ONLY.length,
    skippedBeverages: CURATION_SKIPPED_BEVERAGES.length,
    skippedGeneric: CURATION_SKIPPED_GENERIC.length
  };

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html",
        "User-Agent": "StadiumSlop/1.0 (venue menu import)"
      }
    });
    if (response.ok) {
      const html = await response.text();
      const audit = auditAttStadiumConcessionsHtml(html);
      lastAttStadiumParseStats.sourceFlipsnackEmbed = audit.flipsnackEmbed;
      lastAttStadiumParseStats.flipsnackHash = audit.hash;
      if (audit.hash && audit.hash !== FLIPSNACK_HASH) {
        console.warn(
          `[att-stadium] Flipsnack hash changed (${audit.hash}); re-verify curated menu against new flipbook`
        );
      }
    } else {
      console.warn(
        `[att-stadium] concessions page returned ${response.status}; using curated menu`
      );
    }
  } catch {
    console.warn("[att-stadium] could not reach concessions page; using curated menu");
  }

  const items = mergeItems(MENU_DATA);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastAttStadiumParseStats.skippedBeverages
  };
}
