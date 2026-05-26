/**
 * Angel Stadium (Los Angeles Angels) menu parser.
 *
 * Programmatically parses the official "Let's Eat" PDF menu.
 * Fetches the PDF, extracts text via pdf-parse, and identifies food items from:
 *   - Bullet-point menu items (pages 1–2)
 *   - DESTINATIONS vendor blocks (pages 3–4)
 *   - Dietary / snack / treat sections (pages 2–3)
 *
 * Source: https://mktg.mlbstatic.com/angels/downloads/y2026/lets_eat_menu_2026.pdf
 * Re-run each season to pick up menu changes.
 */

import { PDFParse } from "pdf-parse";
import type {
  VenueMenuDietaryTag,
  VenueMenuFare,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

const VENUE_SLUG = "angel-stadium";
const VENUE_NAME = "Angel Stadium";
const SOURCE_URL =
  "https://mktg.mlbstatic.com/angels/downloads/y2026/lets_eat_menu_2026.pdf";

/* ── Exclusion / classification helpers ─────────────────────────── */

const DRINK_RE =
  /\b(beers?|wines?|cocktails?|margaritas?|micheladas?|slush(?:y|ies)|lemonade|coffee|hot chocolate|milk|energy drinks?|sodas?|water|tequila|icee|smoothies?|angry orchard)\b/i;

const GENERIC_NAMES = new Set([
  "regular",
  "specialty",
  "domestic beer",
  "craft beer",
  "frozen cocktails",
  "chips",
  "candy",
  "peanuts",
  "popcorn",
  "cotton candy",
  "cracker jack",
  "cracker jacks",
  "kettle corn",
  "ballpark fare",
  "grab & go selections",
  "grab & go",
  "sit down restaurant",
  "center field sports bar",
  "right field club level",
  "variety of craft beer",
  "variety of beers",
  "features a variety of beers",
  "pac-man themed food & beverage",
  "right field club level",
  "variety of pretzels",
  "selection of roasted meats",
  "variety of craft beer",
  "features a variety of beers",
  "dessert waffles"
]);

const SKIP_DESTINATIONS = new Set([
  "beatbox",
  "blue moon",
  "coors light chill zone",
  "draft pick",
  "modelo patio",
  "modelo oro",
  "topo chico",
  "surfside",
  "pacífico mercado",
  "pacifico mercado",
  "corner market",
  "el tiempo margarita bar",
  "estrella bar",
  "karbach bar",
  "love street bar",
  "micheladas cart",
  "modelo bar",
  "st. arnold's bar",
  "walk-thru brews",
  "wine cellar",
  "maui wowi"
]);

function isDrink(text: string): boolean {
  return DRINK_RE.test(text);
}

function isGeneric(name: string): boolean {
  return GENERIC_NAMES.has(name.toLowerCase().trim());
}

function isSkipDest(vendor: string): boolean {
  return SKIP_DESTINATIONS.has(vendor.toLowerCase().trim());
}

function inferFare(name: string): VenueMenuFare {
  const l = name.toLowerCase();
  if (
    /cookie|ice cream|sundae|waffle|dippin|churro|soft.serve|açaí|acai|fruit cup|paleta|brownie/.test(
      l
    )
  )
    return "Desserts";
  if (/fries|pretzel|pickle|elote|nacho|chips|guac|taquito/.test(l))
    return "Snacks";
  return "Meals";
}

function inferDietaryTags(name: string): VenueMenuDietaryTag[] {
  const tags: VenueMenuDietaryTag[] = [];
  const l = name.toLowerCase();
  if (l.includes("gluten free") || l.includes("gluten-free"))
    tags.push("Gluten Free");
  if (l.includes("vegan") || l.includes("beyond")) tags.push("Vegan");
  if (
    l.includes("veggie") ||
    l.includes("vegetable") ||
    l.includes("cauliflower mac")
  )
    tags.push("Vegetarian");
  return tags;
}

/* ── Context-dependent bullet renames ───────────────────────────── */

const BULLET_RENAMES: Record<string, string> = {
  "helmet size": "Helmet Nachos",
  "nacho mama size": "Nacho Mama Nachos",
  "regular & nashville hot chicken tenders": "Nashville Hot Chicken Tenders",
  "rotisserie": "Rotisserie Chicken",
  "mac & cheese and mash": "Mac & Cheese Bowl",
  "açaí": "Açaí Bowl",
  "açaí bowls": "Açaí Bowl",
  "hot dog (gluten free bun with 100% beef dog)": "Gluten Free Hot Dog",
  "la caguama sandwich": "La Caguama Chicken Sandwich"
};

/* ── Text-processing utilities ──────────────────────────────────── */

/**
 * Join lines that were wrapped mid-phrase by the PDF renderer.
 * A line is considered a continuation when:
 *   - The previous line ended with a comma or ampersand, OR
 *   - The current line starts lowercase (mid-word wrap), OR
 *   - The previous line had a "—" description and didn't end with terminal punctuation,
 *     and the current line has no section numbers (not a new location line).
 */
function joinWrappedLines(raw: string[]): string[] {
  const out: string[] = [];
  for (const line of raw) {
    const t = line.trim();
    if (!t) continue;
    if (out.length === 0) {
      out.push(t);
      continue;
    }
    const prev = out[out.length - 1];
    const isContinuation =
      /[,&]$/.test(prev) ||
      /^[a-z&]/.test(t) ||
      (prev.includes("—") &&
        !/[.!?]$/.test(prev) &&
        !/\d{2,}/.test(t) &&
        !t.includes("\t") &&
        t.length < 17);
    if (isContinuation) {
      out[out.length - 1] = prev + " " + t;
    } else {
      out.push(t);
    }
  }
  return out;
}

/* ── Extracted-item shape (internal) ────────────────────────────── */

interface ExtractedItem {
  name: string;
  description?: string;
  vendor?: string;
  vendorHint?: string;
  fare: VenueMenuFare;
  dietary: VenueMenuDietaryTag[];
}

/* ── Pass 1: Bullet items ───────────────────────────────────────── */

function extractBulletItems(text: string): ExtractedItem[] {
  const items: ExtractedItem[] = [];
  const lines = text.split("\n");
  let bulletLines: string[] = [];

  function flush() {
    if (bulletLines.length === 0) return;
    const raw = bulletLines.join(" ").replace(/\s+/g, " ").trim();
    bulletLines = [];

    const name = BULLET_RENAMES[raw.toLowerCase()] ?? raw;
    if (isDrink(name) || isGeneric(name) || /^regular$/i.test(name)) return;
    if (/^surfside$/i.test(name)) return;

    items.push({
      name,
      fare: inferFare(name),
      dietary: inferDietaryTags(name)
    });
  }

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("•")) {
      flush();
      bulletLines = [t.replace(/^•\s*/, "")];
    } else if (
      bulletLines.length > 0 &&
      t &&
      !t.startsWith("•") &&
      !/\bSection/i.test(t) &&
      (t.match(/\d{2,}/g) || []).length < 2 &&
      !t.includes("throughout Angel Stadium") &&
      !t.includes("—") &&
      !/^[A-Z].*—/.test(t) &&
      bulletLines.join(" ").length + t.length < 90
    ) {
      bulletLines.push(t);
    } else {
      flush();
    }
  }
  flush();
  return items;
}

/* ── Pass 2: DESTINATIONS vendor blocks ─────────────────────────── */

/**
 * The PDF's DESTINATIONS section uses a two-column layout. pdf-parse
 * inserts tab (\t) characters between columns. Depending on the page,
 * the vendor name may appear before OR after the tab relative to the
 * location—description text. Some entries span multiple lines with the
 * vendor on its own line after orphaned location—description lines.
 */
function extractDestinations(text: string): ExtractedItem[] {
  const items: ExtractedItem[] = [];
  const parts = text.split("DESTINATIONS");
  if (parts.length < 2) return items;
  const destText = parts.slice(1).join("\n");

  const rawLines = destText.split("\n");
  const joined = joinWrappedLines(rawLines);

  const orphanedDescs: { hint: string; desc: string }[] = [];

  for (const line of joined) {
    if (!line.trim()) continue;

    const segments = line.split("\t").map((s) => s.trim()).filter(Boolean);

    let vendor = "";
    const descs: { hint: string; desc: string }[] = [];

    for (const seg of segments) {
      if (seg.includes("—")) {
        const dashIdx = seg.indexOf("—");
        let beforeDash = seg.slice(0, dashIdx).trim();
        const desc = seg.slice(dashIdx + 1).trim();

        const locMatch = beforeDash.match(
          /(.*?)\s+(Section|Sections|Portable)\b/i
        );
        if (locMatch && locMatch[1].trim()) {
          if (!vendor) vendor = locMatch[1].trim();
          beforeDash = beforeDash.slice(locMatch[1].length).trim();
        }
        if (desc) descs.push({ hint: beforeDash, desc });
      } else if (!/\d{2,}/.test(seg) && seg.length > 1) {
        if (!vendor) vendor = seg;
      }
    }

    if (vendor && descs.length > 0) {
      for (const d of descs)
        emitDestItems(vendor, d.hint, d.desc, items);
    } else if (descs.length > 0 && !vendor) {
      orphanedDescs.push(...descs);
    } else if (vendor && descs.length === 0 && orphanedDescs.length > 0) {
      for (const d of orphanedDescs)
        emitDestItems(vendor, d.hint, d.desc, items);
      orphanedDescs.length = 0;
    }
  }

  return items;
}

function emitDestItems(
  vendor: string,
  hint: string,
  description: string,
  items: ExtractedItem[]
): void {
  if (isSkipDest(vendor) || isDrink(vendor)) return;
  if (isGeneric(description) || isDrink(description)) return;
  if (/grab.?&.?go|sports bar/i.test(description)) return;

  const subItems = description
    .split(/,\s*/)
    .map((s) => s.replace(/^&\s*/, "").trim())
    .filter(Boolean);

  for (const sub of subItems) {
    if (isGeneric(sub) || isDrink(sub) || sub.length > 55) continue;
    items.push({
      name: sub,
      vendor,
      vendorHint: hint || undefined,
      fare: inferFare(sub),
      dietary: inferDietaryTags(sub)
    });
  }
}

/* ── Pass 3: Standalone named items (snacks, treats, dietary) ───── */

function extractNamedItems(text: string): ExtractedItem[] {
  const patterns: {
    re: RegExp;
    name: string;
    vendor?: string;
    vendorHint?: string;
    fare?: VenueMenuFare;
    dietary?: VenueMenuDietaryTag[];
  }[] = [
    { re: /Dippin[''\u2019]?\s*Dots/i, name: "Dippin' Dots", fare: "Desserts" },
    {
      re: /Cathy[''\u2019]?s\s*Cookies/i,
      name: "Cathy's Cookies",
      vendor: "Cathy's Cookies",
      fare: "Desserts"
    },
    {
      re: /Thrifty\s*Ice\s*Cream/i,
      name: "Thrifty Ice Cream",
      vendor: "Thrifty Ice Cream",
      fare: "Desserts"
    },
    {
      re: /Melissa[''\u2019]?s\s*Street\s*Fruit\s*Cup/i,
      name: "Melissa's Street Fruit Cup",
      vendor: "La Rotisserie",
      vendorHint: "Section 114",
      fare: "Desserts"
    },
    {
      re: /Pineapple\s*Soft[-\s]*Serve/i,
      name: "Pineapple Soft-Serve",
      vendor: "Pac-Man Chomp Stop",
      vendorHint: "Section 238",
      fare: "Desserts"
    },
    {
      re: /Melissa[''\u2019]?s\s*Whole\s*Pickle/i,
      name: "Melissa's Whole Pickle",
      vendor: "Strike Zone Chicken",
      fare: "Snacks"
    },
    {
      re: /Churros\s*\n/i,
      name: "Churros",
      vendor: "La Cocina",
      vendorHint: "Section 255",
      fare: "Desserts"
    },
    {
      re: /Chips\s*&\s*Guacamole/i,
      name: "Chips & Guacamole",
      vendor: "La Cocina / Chronic Tacos",
      vendorHint: "Section 255",
      fare: "Snacks",
      dietary: ["Vegetarian"]
    },
    {
      re: /Sausages\/Bratwurst/i,
      name: "Sausages & Bratwurst",
      vendor: "Classic Hits / Hoffy",
      fare: "Meals"
    },
    {
      re: /Gluten.Free\s*Pizza/i,
      name: "Gluten Free Pizza",
      vendor: "Oggi's Pizza",
      fare: "Meals",
      dietary: ["Gluten Free"]
    },
    {
      re: /Hot\s*Dog\s*\(Gluten\s*Free/i,
      name: "Gluten Free Hot Dog",
      fare: "Meals",
      dietary: ["Gluten Free"]
    },
    {
      re: /Veggie\s*Dogs/i,
      name: "Veggie Dogs",
      vendor: "Classic Hits",
      fare: "Meals",
      dietary: ["Vegetarian"]
    },
    {
      re: /Potato\s*Taquitos/i,
      name: "Potato Taquitos",
      vendor: "La Cocina",
      vendorHint: "Section 255",
      fare: "Snacks",
      dietary: ["Vegetarian"]
    },
    {
      re: /Buffalo\s*Cauliflower\s*Mac\s*Bowl/i,
      name: "Buffalo Cauliflower Mac Bowl",
      vendor: "Crafty Mac & Mash",
      fare: "Meals",
      dietary: ["Vegetarian"]
    },
    {
      re: /Grilled\s*Vegetable\s*Mac\s*Bowl/i,
      name: "Grilled Vegetable Mac Bowl",
      vendor: "Crafty Mac & Mash",
      fare: "Meals",
      dietary: ["Vegetarian"]
    },
    {
      re: /Baked\s*Potato/i,
      name: "Baked Potato",
      vendor: "Crafty Mac & Mash / La Rotisserie",
      fare: "Meals",
      dietary: ["Vegetarian"]
    },
    {
      re: /Walk[-\s]*Off\s*Waffles/i,
      name: "Walk-Off Waffles",
      vendor: "Walk-Off Waffles",
      vendorHint: "Sections 232, 412, 1st Base Food Court",
      fare: "Desserts"
    },
    {
      re: /Wetzel[''\u2019]?s\s*Pretzels/i,
      name: "Wetzel's Pretzels",
      vendor: "Wetzel's Pretzels",
      vendorHint: "Section 127",
      fare: "Snacks"
    }
  ];

  const items: ExtractedItem[] = [];
  for (const p of patterns) {
    if (p.re.test(text)) {
      items.push({
        name: p.name,
        vendor: p.vendor,
        vendorHint: p.vendorHint,
        fare: p.fare ?? "Meals",
        dietary: p.dietary ?? inferDietaryTags(p.name)
      });
    }
  }

  const quesMatch = text.match(
    /Quesadillas\s*(?:—|–|-)\s*Cheese,?\s*\n?\s*Chicken,?\s*(?:or\s+)?Birria/i
  );
  if (quesMatch) {
    for (const variant of [
      "Cheese Quesadilla",
      "Chicken Quesadilla",
      "Birria Quesadilla"
    ]) {
      items.push({
        name: variant,
        vendor: "La Cocina / Chronic Tacos",
        vendorHint: "Section 255",
        fare: "Meals",
        dietary: []
      });
    }
  }

  return items;
}

/* ── Main parser ────────────────────────────────────────────────── */

export async function parseAngelStadiumMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  const url = sourceUrl || SOURCE_URL;

  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch Angel Stadium PDF: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());

  const pdfParser = new PDFParse({ data: buffer });
  const result = await pdfParser.getText({ pageJoiner: "" });
  const text = result.text
    .replace(/\u001c/g, "í")
    .replace(/\u001d/g, "'");

  const seen = new Map<string, VenueMenuSourceItem>();
  let skippedDrinks = 0;

  function addItem(item: ExtractedItem): void {
    const key = item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (seen.has(key)) {
      const existing = seen.get(key)!;
      if (item.vendor && !existing.vendorName)
        existing.vendorName = item.vendor;
      if (item.vendorHint && !existing.vendorLocationHint)
        existing.vendorLocationHint = item.vendorHint;
      for (const tag of item.dietary) {
        if (!existing.dietaryTags.includes(tag))
          existing.dietaryTags.push(tag);
      }
      return;
    }

    seen.set(key, {
      name: item.name,
      description: item.description,
      fare: item.fare,
      category: "Food",
      vendorName: item.vendor,
      vendorLocationHint: item.vendorHint,
      dietaryTags: [...item.dietary],
      sourceUrl: url
    });
  }

  for (const item of extractBulletItems(text)) {
    if (isDrink(item.name)) {
      skippedDrinks++;
      continue;
    }
    addItem(item);
  }

  for (const item of extractDestinations(text)) {
    if (isDrink(item.name)) {
      skippedDrinks++;
      continue;
    }
    addItem(item);
  }

  for (const item of extractNamedItems(text)) {
    addItem(item);
  }

  return {
    venueSlug: VENUE_SLUG,
    venueName: VENUE_NAME,
    sourceUrl: url,
    parsedAt: new Date().toISOString(),
    items: Array.from(seen.values()),
    skippedDrinks
  };
}
