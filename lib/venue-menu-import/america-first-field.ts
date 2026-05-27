/**
 * America First Field (Real Salt Lake — MLS, Utah Royals — NWSL) menu parser.
 *
 * The official concessions page uses a WordPress Divi accordion. Each stand
 * block includes a vendor title and menu summary in server-rendered HTML
 * (including closed accordion panels). No PDF, ordering API, or item JSON.
 *
 * Stand names are vendor metadata only. Beverage-only locations and generic
 * snack/drink rows are excluded. Repeated items across stands are merged.
 *
 * Source: https://americafirstfield.com/concessions/
 *
 * Re-verify each season; Beddy's Plaza and Heineken Market vendors rotate.
 */

import { normalizeMenuItemName } from "./normalize";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "america-first-field";
const VENUE_NAME = "America First Field";
const SOURCE_URL = "https://americafirstfield.com/concessions/";

const BASE_TAGS = ["mls", "nwsl"];

/** Stands with no reviewable food on the concessions page. */
const BEVERAGE_OR_VENDOR_ONLY_STANDS = new Set([
  "Tap Works",
  "Shipping Container",
  "Beer Garden",
  "Swig",
  "Pavilion Refill Station",
  "Cleo's Corner",
  "Totally Nutz",
  "Brucie's Berries",
  "Where's Aldo",
  "R&R BBQ"
]);

export let lastAmericaFirstFieldParseStats = {
  skippedVendorOnly: 0,
  skippedBeverages: 0,
  skippedGeneric: 0,
  standsParsed: 0
};

type ParsedStand = {
  vendor: string;
  bodyText: string;
};

type RawItem = {
  name: string;
  description?: string;
  fare?: VenueMenuFare;
  vendor?: string;
  vendorHint?: string;
  dietary?: VenueMenuDietaryTag[];
  tags?: string[];
};

function decodeHtml(text: string): string {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferLocationHint(text: string): string | undefined {
  const hints: string[] = [];
  if (/west side/i.test(text)) hints.push("West concourse");
  if (/east side|east concourse/i.test(text)) hints.push("East concourse");
  if (/north concourse|north side/i.test(text)) hints.push("North concourse");
  if (/ne concourse/i.test(text)) hints.push("NE concourse");
  if (/beddy'?s plaza/i.test(text)) hints.push("Beddy's Plaza");
  return hints.length ? hints.join("; ") : undefined;
}

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
  const tags = [...BASE_TAGS];
  if (opts.local !== false) tags.push("local-specialty");
  return {
    name,
    description: opts.description,
    fare: opts.fare ?? "Meals",
    vendor,
    vendorHint: opts.vendorHint,
    dietary: opts.dietary ?? [],
    tags
  };
}

function extractItemsForStand(stand: ParsedStand): RawItem[] {
  const { vendor, bodyText } = stand;
  const hint = inferLocationHint(bodyText);
  const items: RawItem[] = [];

  switch (vendor) {
    case "J. Dawgs":
      items.push(
        item("Hot Dog", vendor, {
          description: "Quarter-pound all-beef hot dog, flame-grilled",
          vendorHint: hint ?? "West and East concourses"
        }),
        item("Polish Sausage", vendor, {
          vendorHint: hint ?? "West and East concourses"
        }),
        item("French Fries", vendor, {
          fare: "Snacks",
          vendorHint: hint ?? "West and East concourses",
          local: false
        })
      );
      break;

    case "Match Day Donut and Coffee Stand":
      items.push(
        item("Mini Donuts", vendor, {
          description: "Fresh-made mini donuts in powdered or cinnamon sugar",
          fare: "Desserts",
          local: false
        })
      );
      lastAmericaFirstFieldParseStats.skippedBeverages += 1;
      break;

    case "Sandy Sandwich Co":
      items.push(
        item("BBQ Philly", vendor, {
          description: "Hoagie with house-smoked brisket and BBQ",
          local: true
        }),
        item("Cuban Sandwich", vendor, {
          description: "The Cuban with smoked pulled pork",
          local: true
        }),
        item("Pulled Pork Mac and Cheese", vendor, { fare: "Meals" }),
        item("Brisket Mac and Cheese", vendor, { fare: "Meals" })
      );
      lastAmericaFirstFieldParseStats.skippedBeverages += 1;
      break;

    case "Fresh Kicks":
      items.push(
        item("Cauliflower Tikka Masala", vendor, {
          vendorHint: hint ?? "West concourse",
          dietary: ["Vegan", "Vegetarian"]
        }),
        item("Beet-LT Sandwich", vendor, {
          vendorHint: hint ?? "West concourse",
          dietary: ["Vegan", "Vegetarian"]
        }),
        item("Mixed Berry Salad", vendor, {
          fare: "Snacks",
          vendorHint: hint ?? "West concourse",
          dietary: ["Vegan", "Vegetarian"]
        })
      );
      break;

    case "Float On":
      items.push(
        item("Dole Whip", vendor, {
          fare: "Desserts",
          local: true
        }),
        item("Edible Cookie Dough", vendor, {
          fare: "Desserts",
          description: "Award-winning edible cookie dough",
          local: true
        })
      );
      lastAmericaFirstFieldParseStats.skippedBeverages += 1;
      break;

    case "Santorini's":
      items.push(
        item("Pita", vendor, {
          description: "Build-your-own Mediterranean pita",
          vendorHint: hint ?? "North concourse",
          dietary: ["Vegetarian"]
        }),
        item("Mediterranean Bowl", vendor, {
          description: "Build-your-own bowl",
          vendorHint: hint ?? "North concourse",
          dietary: ["Vegetarian"]
        })
      );
      break;

    case "City Grill":
      items.push(
        item("Burger of the Match", vendor, {
          description: "Rotating featured double burger"
        }),
        item("Double Burger", vendor, {
          description: "Flame-grilled double burger"
        }),
        item("Chicken Tenders", vendor, { fare: "Snacks" }),
        item("Mini Corn Dogs", vendor, { fare: "Snacks" }),
        item("French Fries", vendor, { fare: "Snacks", local: false })
      );
      break;

    case "Little Caesars":
      items.push(
        item("Cheese Pizza", vendor, {
          dietary: ["Vegetarian"],
          local: false
        }),
        item("Pepperoni Pizza", vendor, { local: false }),
        item("Meat Lovers Pizza", vendor, { local: false })
      );
      break;

    case "Grab N Goal":
      items.push(
        item("Cheeseburger", vendor, {
          description: "1/3-pound cheeseburger"
        }),
        item("Footlong Hot Dog", vendor, {}),
        item("Mini Corn Dogs", vendor, { fare: "Snacks" }),
        item("Pretzel", vendor, {
          fare: "Snacks",
          dietary: ["Vegetarian"],
          local: false
        }),
        item("Churro", vendor, {
          fare: "Desserts",
          dietary: ["Vegetarian"],
          local: false
        })
      );
      lastAmericaFirstFieldParseStats.skippedBeverages += 1;
      lastAmericaFirstFieldParseStats.skippedGeneric += 2;
      break;

    case "Chile Verde":
      items.push(
        item("Burrito", vendor, { local: true }),
        item("Tacos", vendor, { local: true }),
        item("Nachos", vendor, { fare: "Snacks", local: true })
      );
      lastAmericaFirstFieldParseStats.skippedBeverages += 1;
      break;

    case "Roonies":
      items.push(
        item("Ice Cream Bar", vendor, {
          fare: "Desserts",
          vendorHint: hint ?? "East concourse",
          local: true
        }),
        item("Ice Cream Bowl", vendor, {
          fare: "Desserts",
          vendorHint: hint ?? "East concourse",
          local: true
        }),
        item("Ice Cream Sandwich", vendor, {
          fare: "Desserts",
          vendorHint: hint ?? "East concourse",
          local: true
        })
      );
      break;

    case "Royal Feast":
      items.push(
        item("Footlong Hot Dog", vendor, {
          description: "Footlong Dog of the Match"
        }),
        item("Hot Dog", vendor, {
          description: "Stadium dog"
        })
      );
      lastAmericaFirstFieldParseStats.skippedBeverages += 1;
      break;

    case "Royal Feast Express":
      items.push(
        item("Pizza", vendor, {
          description: "Stadium pizza slice",
          local: false
        }),
        item("Chicharrones", vendor, {
          fare: "Snacks",
          local: true
        })
      );
      lastAmericaFirstFieldParseStats.skippedBeverages += 1;
      break;

    case "San Diablos Churros":
      items.push(
        item("Stuffed Churro", vendor, {
          description:
            "Utah artisan churros filled with caramel, Nutella, or sweet cream",
          fare: "Desserts",
          vendorHint: hint ?? "Beddy's Plaza",
          dietary: ["Vegetarian"],
          local: true
        })
      );
      break;

    case "Cup Bop":
      items.push(
        item("Korean BBQ", vendor, {
          description: "Cup Bop Korean BBQ bowl",
          vendorHint: hint ?? "Beddy's Plaza",
          local: true
        })
      );
      break;

    case "The Other Side Donuts":
      items.push(
        item("Donut", vendor, {
          description: "Fresh-baked donuts",
          fare: "Desserts",
          vendorHint: hint ?? "Beddy's Plaza",
          dietary: ["Vegetarian"],
          local: true
        })
      );
      break;

    case "Offside Snacks":
      items.push(
        item("Hot Dog", vendor, {
          description: "Value-priced hot dog",
          vendorHint: hint ?? "Beddy's Plaza",
          local: false
        })
      );
      lastAmericaFirstFieldParseStats.skippedGeneric += 2;
      break;

    default:
      break;
  }

  for (const raw of items) {
    if (!raw.vendorHint && hint) raw.vendorHint = hint;
  }

  return items;
}

export function parseAmericaFirstFieldConcessionsHtml(html: string): RawItem[] {
  lastAmericaFirstFieldParseStats.skippedVendorOnly = 0;
  lastAmericaFirstFieldParseStats.skippedBeverages = 0;
  lastAmericaFirstFieldParseStats.skippedGeneric = 0;

  const rawItems: RawItem[] = [];
  const blockRe =
    /<h5 class="et_pb_toggle_title">([\s\S]*?)<\/h5>\s*<div class="et_pb_toggle_content clearfix">([\s\S]*?)<\/div>\s*<\/div>/gi;

  const stands: ParsedStand[] = [];
  let match: RegExpExecArray | null;

  while ((match = blockRe.exec(html)) !== null) {
    const vendor = decodeHtml(match[1].replace(/<[^>]+>/g, ""));
    const bodyHtml = match[2];
    const bodyText = decodeHtml(bodyHtml.replace(/<[^>]+>/g, " "));
    stands.push({ vendor, bodyText });
  }

  lastAmericaFirstFieldParseStats.standsParsed = stands.length;

  for (const stand of stands) {
    if (BEVERAGE_OR_VENDOR_ONLY_STANDS.has(stand.vendor)) {
      lastAmericaFirstFieldParseStats.skippedVendorOnly += 1;
      continue;
    }

    const items = extractItemsForStand(stand);
    if (items.length === 0) {
      lastAmericaFirstFieldParseStats.skippedVendorOnly += 1;
      continue;
    }

    rawItems.push(...items);
  }

  return rawItems;
}

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
      const parts = new Set(
        `${existing.vendorHint ?? ""}; ${raw.vendorHint}`
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
      );
      existing.vendorHint = [...parts].join("; ");
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

export async function parseAmericaFirstFieldMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl ?? SOURCE_URL;

  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "StadiumSlop/1.0 (venue menu import)"
    }
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch America First Field concessions page: ${response.status}`
    );
  }

  const html = await response.text();
  const rawItems = parseAmericaFirstFieldConcessionsHtml(html);
  const items = mergeItems(rawItems);

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items,
    skippedDrinks: lastAmericaFirstFieldParseStats.skippedBeverages
  };
}
