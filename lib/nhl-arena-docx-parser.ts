/**
 * Parse narrative NHL arena vendor DOCX into flat league-import CSV rows.
 * Does not touch the database — output only.
 *
 * Shared NBA/NHL buildings merge extra tenants via `lib/venue-teams.ts` on import.
 *
 * TODO: NHL awards / fan-vote badges
 * TODO: shared NBA/NHL arena menu overlays without duplicating rows
 * TODO: PWHL tenant rows where arenas host women's hockey
 * TODO: neutral-site and outdoor game menus
 * TODO: temporary playoff / event concession overlays
 */

import type { LeagueImportRow } from "./league-import-shape";
import {
  ITEM_LINE_RE,
  PRICE_MENU_RE,
  SUB_ITEM_RE,
  conciseDescription,
  extractDocxParagraphs,
  looksLikeVendorName,
  parseLocation
} from "./league-docx-common";

export type NhlDocxParseRow = LeagueImportRow & {
  reviewFlags: string[];
};

export type NhlDocxParseResult = {
  rows: NhlDocxParseRow[];
  venues: string[];
  reviewRows: NhlDocxParseRow[];
  ambiguousVenues: string[];
  ambiguousItems: string[];
};

const LEAGUE = "NHL";
const DEFAULT_SEASON = "2026";

type NhlVenueConfig = {
  name: string;
  team: string;
  city: string;
  state: string;
  intro: RegExp;
};

/** Primary NHL tenant + city/state for each arena block in SS_NHL_VENUES_ITEMS.docx. */
const NHL_VENUES: NhlVenueConfig[] = [
  {
    name: "Honda Center",
    team: "Anaheim Ducks",
    city: "Anaheim",
    state: "CA",
    intro: /^Welcome to Orange County! Skating into the NHL/i
  },
  {
    name: "KeyBank Center",
    team: "Buffalo Sabres",
    city: "Buffalo",
    state: "NY",
    intro: /^Welcome to Western New York! The energy at KeyBank Center/i
  },
  {
    name: "Scotiabank Saddledome",
    team: "Calgary Flames",
    city: "Calgary",
    state: "AB",
    intro: /^Welcome to the C-of-Red! Walking into the Scotiabank Saddledome/i
  },
  {
    name: "Lenovo Center",
    team: "Carolina Hurricanes",
    city: "Raleigh",
    state: "NC",
    intro: /^Welcome to Raleigh! If you are heading out to catch the Hurricanes/i
  },
  {
    name: "Nationwide Arena",
    team: "Columbus Blue Jackets",
    city: "Columbus",
    state: "OH",
    intro: /^Welcome to the Arch City! When you march into Nationwide Arena/i
  },
  {
    name: "Rogers Place",
    team: "Edmonton Oilers",
    city: "Edmonton",
    state: "AB",
    intro: /^Welcome to Oil Country! When you march into Rogers Place/i
  },
  {
    name: "Amerant Bank Arena",
    team: "Florida Panthers",
    city: "Sunrise",
    state: "FL",
    intro: /^Welcome to Sunrise, Florida! The energy at the Amerant Bank Arena/i
  },
  {
    name: "Grand Casino Arena",
    team: "Minnesota Wild",
    city: "Saint Paul",
    state: "MN",
    intro: /^You are completely locked into the newest era of Minnesota hockey/i
  },
  {
    name: "Bell Centre",
    team: "Montreal Canadiens",
    city: "Montreal",
    state: "QC",
    intro: /^Stepping into the Bell Centre \(Centre Bell\)/i
  },
  {
    name: "Bridgestone Arena",
    team: "Nashville Predators",
    city: "Nashville",
    state: "TN",
    intro: /^Bridgestone Arena is a legendary party on ice/i
  },
  {
    name: "Prudential Center",
    team: "New Jersey Devils",
    city: "Newark",
    state: "NJ",
    intro: /^The Prudential Center is absolutely buzzing for the 2026 season/i
  },
  {
    name: "UBS Arena",
    team: "New York Islanders",
    city: "Elmont",
    state: "NY",
    intro: /^Welcome to Elmont! UBS Arena at Belmont Park/i
  },
  {
    name: "Canadian Tire Centre",
    team: "Ottawa Senators",
    city: "Ottawa",
    state: "ON",
    intro: /^Welcome to the Capital! While the dream of a brand-new downtown arena/i
  },
  {
    name: "PPG Paints Arena",
    team: "Pittsburgh Penguins",
    city: "Pittsburgh",
    state: "PA",
    intro: /^Welcome to the Steel City! If you're marching into PPG Paints Arena/i
  },
  {
    name: "SAP Center",
    team: "San Jose Sharks",
    city: "San Jose",
    state: "CA",
    intro: /^Welcome to the Shark Tank! If you're swimming into the SAP Center/i
  },
  {
    name: "Climate Pledge Arena",
    team: "Seattle Kraken",
    city: "Seattle",
    state: "WA",
    intro: /^Stepping into Climate Pledge Arena is a completely unique experience/i
  },
  {
    name: "Enterprise Center",
    team: "St. Louis Blues",
    city: "St. Louis",
    state: "MO",
    intro: /^Marching into the Enterprise Center to join the Note faithful/i
  },
  {
    name: "Benchmark International Arena",
    team: "Tampa Bay Lightning",
    city: "Tampa",
    state: "FL",
    intro: /^If you are marching down Thunder Alley to catch the Tampa Bay Lightning/i
  },
  {
    name: "Rogers Arena",
    team: "Vancouver Canucks",
    city: "Vancouver",
    state: "BC",
    intro: /^Stepping into Rogers Arena for the 2026 season means entering a venue/i
  },
  {
    name: "T-Mobile Arena",
    team: "Vegas Golden Knights",
    city: "Las Vegas",
    state: "NV",
    intro: /^Marching into T-Mobile Arena to join the Golden Knights faithful/i
  },
  {
    name: "Canada Life Centre",
    team: "Winnipeg Jets",
    city: "Winnipeg",
    state: "MB",
    intro: /^Marching into the Canada Life Centre to join the Winnipeg Jets faithful/i
  }
];

const SKIP_PREFIXES = [
  "Would you",
  "Which ",
  "Where ",
  "Where are we",
  "Where should we",
  "Where to next",
  "We've covered",
  "Pro-Tip",
  "Pro-Tip:",
  "The Game-Changer:",
  "The Impact:",
  "The Tech Blueprint",
  "The Tech:",
  "Frictionless",
  "Outside Food",
  "Strict Bag",
  "Dietary Tagging:",
  "Fan-Friendly Pricing:",
  "Bottomless Souvenir",
  "The arena operates",
  "The Gallagher Terrace",
  "The Modelo Bridge",
  "Event Level Clubs:",
  "Courtside Luxury",
  "Premium Footprints",
  "The Concourse Revolutions",
  "Entrance Closures:",
  "The Biergarten Intermission:",
  "The 5-Goal Rule:",
  "Daily Rituals:",
  "The Private Heritage Club",
  "La Mise au jeu:",
  "The Dr Pepper Takeover:",
  "The Great 2026 Beverage Makeover",
  "The Hub:",
  "The Experience:",
  "All-Inclusive Perks:",
  "The Headline:",
  "The Design:",
  "The Magic:",
  "You cannot talk about",
  "In April 2026",
  "Following the massive",
  "The biggest operational change",
  "The biggest arena layout shift",
  "100% Cashless",
  "Smashville Self-Serve Kiosks:",
  "The Club Level Advantage:",
  "R&D Brewing Takeover:",
  "To honor this new era",
  "To match this major corporate transition",
  "To combat the narrow layout",
  "Welcome to Champa Bay!",
  "Welcome to Smashville!",
  "Welcome to \"The Rock\"!",
  "Welcome to Vancouver!",
  "Bienvenue à Montréal!",
  "The Pinnacle of Luxury:",
  "The Grand Casino Extensions",
  "Because the arena now anchors",
  "NC BBQ Company (Sections",
  "Bridgestone Arena heavily anchors",
  "The CTC fiercely protects",
  "True to its geography",
  "Adult Sips & Music City Pours",
  "Local Pours & The Marketplace",
  "NC Legends & Cult Classics",
  "North Carolina Legends",
  "Ottawa Legends & Local Mainstays",
  "Pub Vibes & Upper Deck Hangouts",
  "Outdoor Sips:",
  "Tech & Gameday Logistics",
  "Tech & Concourse Strategy",
  "Tech, Speed & The Sports Lounge",
  "Player Highlights & Concourse Showstoppers",
  "The Showstoppers: Live Carveries",
  "The \"Wild Greens\" & North Woods Staples",
  "Concourse Heavy Hitters & Local Icons",
  "Concourse Showstoppers & Local Icons",
  "The 2026 Concourse Showstoppers",
  "New for the 2026 Playoff Run:",
  "The Concourse Showstoppers & New Staples"
];

function categoryFromHeader(line: string): string | null {
  const lower = line.toLowerCase();
  if (
    /^new for|^new:|showstopper|headline|heavy hitter|playoff run|concourse showstopper|mic drop|player highlights|gameday dirty|scraped raclette/i.test(
      lower
    ) &&
    line.length < 130 &&
    !ITEM_LINE_RE.test(line)
  ) {
    return "Headline Item";
  }
  if (
    /local legend|local icon|local mainstay|neighborhood concept|north woods staple|staples|cultural icon|remixed staple|local-centric|everyday concourse/i.test(
      lower
    ) &&
    line.length < 100 &&
    !ITEM_LINE_RE.test(line)
  ) {
    return "Local Partner";
  }
  if (
    (/^bars\b|drinks|social|premium lounge|mocktail|craft pour|adult sips|music city pours|local pours|beverage makeover|sky deck|distillery cocktail|moonshine|sports lounge|pub vibes/i.test(
      lower
    ) &&
      /bar|drink|lounge|social|club|cocktail|beer|spirits|pour|sip/i.test(lower)) ||
    /^jetblue runway/i.test(lower)
  ) {
    return "Drinks/Social";
  }
  if (
    /^value|dietary|frictionless|tech|logistics|allergen|innovation|game-changer|fan-friendly|plant-based|vegan|gluten|cashless|gameday logistics/i.test(
      lower
    ) &&
    line.length < 120 &&
    !ITEM_LINE_RE.test(line)
  ) {
    return "Dietary/Value";
  }
  return null;
}

function isCategoryHeader(line: string): boolean {
  if (ITEM_LINE_RE.test(line)) {
    return false;
  }
  if (categoryFromHeader(line)) {
    return true;
  }
  if (
    /^(signature|premium|everyday|concourse revolution|local legends|bars,|value,|tech)/i.test(
      line
    ) &&
    line.length < 100 &&
    !line.includes("(")
  ) {
    return true;
  }
  return false;
}

function shouldSkipLine(line: string): boolean {
  if (PRICE_MENU_RE.test(line)) {
    return true;
  }
  if (SKIP_PREFIXES.some((p) => line.startsWith(p))) {
    return true;
  }
  if (/^(Would you|Which |Where )/.test(line)) {
    return true;
  }
  if (/^Pro-Tip/i.test(line)) {
    return true;
  }
  if (/^The \$[\d.]+\s/.test(line)) {
    return true;
  }
  if (
    /reimagination project|renovation|master plan|transformation project|naming rights|naming-rights/i.test(
      line
    ) &&
    !ITEM_LINE_RE.test(line)
  ) {
    return true;
  }
  if (
    /outside food policy|bag policy|entrance closure|corporate transition|exterior signage/i.test(
      line
    ) &&
    !ITEM_LINE_RE.test(line)
  ) {
    return true;
  }
  return false;
}

function isVenueAnchor(paragraph: string): boolean {
  if (paragraph.length < 55) {
    return false;
  }
  if (SKIP_PREFIXES.some((p) => paragraph.startsWith(p))) {
    return false;
  }
  return NHL_VENUES.some((v) => v.intro.test(paragraph));
}

function matchVenue(paragraph: string): NhlVenueConfig | null {
  for (const venue of NHL_VENUES) {
    if (venue.intro.test(paragraph)) {
      return venue;
    }
  }
  return null;
}

function seasonForBlock(intro: string, category: string | null): string {
  if (/2026/.test(intro) || category === "Headline Item") {
    return DEFAULT_SEASON;
  }
  return "";
}

type VendorContext = {
  vendor: string;
  section: string;
  standName: string;
};

function resolveSection(section: string, vendor: string, standName: string): string {
  const trimmed = section.trim();
  if (trimmed) {
    return trimmed;
  }
  if (/club|lounge|tap room|sky deck|terrace|trattoria|marketplace/i.test(vendor)) {
    return vendor;
  }
  if (standName.trim()) {
    return standName.trim();
  }
  return "";
}

function defaultCategory(category: string | null, section: string): string | null {
  if (category) {
    return category;
  }
  return section.trim() ? "Local Partner" : null;
}

function stripProTipLanguage(description: string): string {
  return description
    .replace(/\s*\(Pro-tip:[^)]*\)/gi, "")
    .replace(/\s*Pro-tip:\s*[^.!?…]+[.!?…]?/gi, "")
    .trim();
}

function buildRow(
  venue: NhlVenueConfig,
  season: string,
  category: string | null,
  itemName: string,
  vendor: string,
  section: string,
  standName: string,
  description: string,
  reviewFlags: string[]
): NhlDocxParseRow {
  return {
    league: LEAGUE,
    team: venue.team,
    venue: venue.name,
    city: venue.city,
    state: venue.state,
    vendor: vendor || itemName,
    stand_name: standName,
    section,
    item_name: itemName,
    description: conciseDescription(stripProTipLanguage(description)),
    price: undefined,
    category: category ?? "",
    source_url: "",
    season,
    reviewFlags
  };
}

export function parseNhlArenaDocxParagraphs(paragraphs: string[]): NhlDocxParseResult {
  const anchors: { index: number; venue: NhlVenueConfig; intro: string }[] = [];
  const seenVenue = new Set<string>();

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i]!;
    if (!isVenueAnchor(p)) {
      continue;
    }
    const venue = matchVenue(p);
    if (!venue || seenVenue.has(venue.name)) {
      continue;
    }
    seenVenue.add(venue.name);
    anchors.push({ index: i, venue, intro: p });
  }

  const rows: NhlDocxParseRow[] = [];
  const ambiguousVenues = new Set<string>();
  const ambiguousItems: string[] = [];

  for (let a = 0; a < anchors.length; a++) {
    const { venue, intro } = anchors[a]!;
    const end = anchors[a + 1]?.index ?? paragraphs.length;
    if (!venue.team) {
      ambiguousVenues.add(venue.name);
    }

    let category: string | null = null;
    let vendorCtx: VendorContext | null = null;
    const blockSeason = /2026/.test(intro) ? DEFAULT_SEASON : "";

    for (let i = anchors[a]!.index + 1; i < end; i++) {
      const line = paragraphs[i]!;
      if (shouldSkipLine(line)) {
        continue;
      }

      const headerCategory = categoryFromHeader(line);
      if (headerCategory || isCategoryHeader(line)) {
        category = headerCategory ?? category;
        vendorCtx = null;
        continue;
      }

      const itemMatch = ITEM_LINE_RE.exec(line);
      if (itemMatch) {
        const itemName = itemMatch[1]!.trim();
        const { vendorHint, section, standName } = parseLocation(itemMatch[2]!);
        const description = itemMatch[3]!.trim();
        const flags: string[] = [];

        let vendor = vendorHint;
        if (!vendorHint) {
          vendorCtx = null;
        }
        if (!vendor && looksLikeVendorName(itemName)) {
          vendor = itemName;
        }
        if (!vendor) {
          vendor = itemName;
        }

        const resolvedSection: string = section || vendorCtx?.section || "";
        if (!resolvedSection) {
          flags.push("missing-section");
        }

        if (looksLikeVendorName(itemName) && !vendorHint) {
          vendorCtx = { vendor: itemName, section: resolvedSection, standName };
          if (description.length > 30) {
            rows.push(
              buildRow(
                venue,
                seasonForBlock(intro, category) || blockSeason,
                defaultCategory(category, resolvedSection),
                itemName,
                vendor,
                resolvedSection,
                standName,
                description,
                flags
              )
            );
          }
          continue;
        }

        vendorCtx = { vendor, section: resolvedSection, standName };
        const rowCategory = defaultCategory(category, resolvedSection);
        rows.push(
          buildRow(
            venue,
            seasonForBlock(intro, category) || blockSeason,
            rowCategory,
            itemName,
            vendor,
            resolvedSection,
            standName,
            description,
            flags
          )
        );
        continue;
      }

      const subMatch = SUB_ITEM_RE.exec(line);
      if (subMatch && vendorCtx) {
        const subName = subMatch[1]!.trim();
        if (isCategoryHeader(subName) || shouldSkipLine(subName)) {
          continue;
        }
        if (looksLikeVendorName(subName) && subMatch[2]!.length > 40) {
          vendorCtx = {
            vendor: subName,
            section: vendorCtx.section,
            standName: vendorCtx.standName
          };
          continue;
        }
        const subSection = resolveSection(
          vendorCtx.section,
          vendorCtx.vendor,
          vendorCtx.standName
        );
        rows.push(
          buildRow(
            venue,
            seasonForBlock(intro, category) || blockSeason,
            defaultCategory(category, subSection),
            subName,
            vendorCtx.vendor,
            subSection,
            vendorCtx.standName,
            subMatch[2]!.trim(),
            []
          )
        );
        continue;
      }

      if (SUB_ITEM_RE.test(line) && !vendorCtx) {
        const subName = SUB_ITEM_RE.exec(line)?.[1]?.trim() ?? "";
        if (looksLikeVendorName(subName) && !isCategoryHeader(line)) {
          vendorCtx = { vendor: subName, section: "", standName: "" };
          continue;
        }
        ambiguousItems.push(`${venue.name}: ${line.slice(0, 80)}`);
      }
    }
  }

  const venues = [...new Set(rows.map((r) => r.venue))];
  const reviewRows = rows.filter((r) => r.reviewFlags.length > 0);

  return {
    rows,
    venues,
    reviewRows,
    ambiguousVenues: [...ambiguousVenues],
    ambiguousItems: ambiguousItems.slice(0, 40)
  };
}

export function parseNhlArenaDocx(docxPath: string): NhlDocxParseResult {
  return parseNhlArenaDocxParagraphs(extractDocxParagraphs(docxPath));
}
