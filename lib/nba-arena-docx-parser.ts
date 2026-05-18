/**
 * Parse narrative NBA arena vendor DOCX into flat league-import CSV rows.
 * Does not touch the database — output only.
 *
 * TODO: arena awards / fan-vote badges
 * TODO: full WNBA tenant rows per shared arena
 * TODO: NHL shared-arena overlays without duplicating menus
 * TODO: neutral-site and event overlays (All-Star, Finals, etc.)
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

export type NbaDocxParseRow = LeagueImportRow & {
  reviewFlags: string[];
};

export type NbaDocxParseResult = {
  rows: NbaDocxParseRow[];
  venues: string[];
  reviewRows: NbaDocxParseRow[];
  ambiguousVenues: string[];
  ambiguousItems: string[];
};

const LEAGUE = "NBA";
const DEFAULT_SEASON = "2026";

type NbaVenueConfig = {
  name: string;
  team: string;
  city: string;
  state: string;
  intro: RegExp;
};

/** Primary NBA tenant + city/state for each arena in the source doc. */
const NBA_VENUES: NbaVenueConfig[] = [
  {
    name: "State Farm Arena",
    team: "Atlanta Hawks",
    city: "Atlanta",
    state: "GA",
    intro: /Welcome to the hardwood|State Farm Arena has completely transformed/i
  },
  {
    name: "TD Garden",
    team: "Boston Celtics",
    city: "Boston",
    state: "MA",
    intro: /^TD Garden has taken/i
  },
  {
    name: "Barclays Center",
    team: "Brooklyn Nets",
    city: "Brooklyn",
    state: "NY",
    intro: /^Barclays Center has completely overhauled/i
  },
  {
    name: "Spectrum Center",
    team: "Charlotte Hornets",
    city: "Charlotte",
    state: "NC",
    intro: /^The Spectrum Center has unveiled/i
  },
  {
    name: "United Center",
    team: "Chicago Bulls",
    city: "Chicago",
    state: "IL",
    intro: /Madhouse on Madison|United Center has reached/i
  },
  {
    name: "Rocket Arena",
    team: "Cleveland Cavaliers",
    city: "Cleveland",
    state: "OH",
    intro: /^Welcome to Cleveland!|For the 2026 season \(with the Cavs/i
  },
  {
    name: "American Airlines Center",
    team: "Dallas Mavericks",
    city: "Dallas",
    state: "TX",
    intro: /^Welcome to Dallas! The American Airlines Center/i
  },
  {
    name: "Ball Arena",
    team: "Denver Nuggets",
    city: "Denver",
    state: "CO",
    intro: /^Welcome to the Mile High City|Ball Arena has imported/i
  },
  {
    name: "Little Caesars Arena",
    team: "Detroit Pistons",
    city: "Detroit",
    state: "MI",
    intro: /^Welcome to the Motor City! Little Caesars Arena/i
  },
  {
    name: "Chase Center",
    team: "Golden State Warriors",
    city: "San Francisco",
    state: "CA",
    intro: /^Welcome to the Bay Area! Chase Center/i
  },
  {
    name: "Toyota Center",
    team: "Houston Rockets",
    city: "Houston",
    state: "TX",
    intro: /^Welcome to H-Town! If you are heading to the Toyota Center/i
  },
  {
    name: "Gainbridge Fieldhouse",
    team: "Indiana Pacers",
    city: "Indianapolis",
    state: "IN",
    intro: /^Welcome to Indianapolis! Gainbridge Fieldhouse/i
  },
  {
    name: "Intuit Dome",
    team: "LA Clippers",
    city: "Inglewood",
    state: "CA",
    intro: /bleeding edge of sports entertainment|Steve Ballmer|The Intuit Dome features zero traditional/i
  },
  {
    name: "Crypto.com Arena",
    team: "Los Angeles Lakers",
    city: "Los Angeles",
    state: "CA",
    intro: /^Welcome to Downtown LA! Crypto\.com Arena/i
  },
  {
    name: "FedExForum",
    team: "Memphis Grizzlies",
    city: "Memphis",
    state: "TN",
    intro: /^Welcome to Grind City! FedExForum/i
  },
  {
    name: "Kaseya Center",
    team: "Miami Heat",
    city: "Miami",
    state: "FL",
    intro: /^Welcome to South Florida! The Kaseya Center/i
  },
  {
    name: "Fiserv Forum",
    team: "Milwaukee Bucks",
    city: "Milwaukee",
    state: "WI",
    intro: /^Welcome to the Cream City! Fiserv Forum/i
  },
  {
    name: "Target Center",
    team: "Minnesota Timberwolves",
    city: "Minneapolis",
    state: "MN",
    intro: /^Welcome to the Twin Cities! Target Center/i
  },
  {
    name: "Smoothie King Center",
    team: "New Orleans Pelicans",
    city: "New Orleans",
    state: "LA",
    intro: /^Welcome to "The Blender"! The Smoothie King Center/i
  },
  {
    name: "Madison Square Garden",
    team: "New York Knicks",
    city: "New York",
    state: "NY",
    intro: /^Welcome to the World.s Most Famous Arena! Madison Square Garden/i
  },
  {
    name: "Paycom Center",
    team: "Oklahoma City Thunder",
    city: "Oklahoma City",
    state: "OK",
    intro: /^Welcome to Loud City! The Paycom Center/i
  },
  {
    name: "Wells Fargo Center",
    team: "Philadelphia 76ers",
    city: "Philadelphia",
    state: "PA",
    intro: /^Welcome to South Philly!|Xfinity Mobile Arena/i
  },
  {
    name: "Kia Center",
    team: "Orlando Magic",
    city: "Orlando",
    state: "FL",
    intro: /^Welcome to the O-Town|Kia Center \(the newly minted moniker/i
  },
  {
    name: "Footprint Center",
    team: "Phoenix Suns",
    city: "Phoenix",
    state: "AZ",
    intro: /^Welcome to the Valley of the Sun! Footprint Center/i
  },
  {
    name: "Moda Center",
    team: "Portland Trail Blazers",
    city: "Portland",
    state: "OR",
    intro: /^Welcome to Rip City!|The Moda Center has taken its famously local-centric/i
  },
  {
    name: "Golden 1 Center",
    team: "Sacramento Kings",
    city: "Sacramento",
    state: "CA",
    intro: /^Welcome to the Farm-to-Fork Capital|Sourcing food at Golden 1 Center/i
  },
  {
    name: "Frost Bank Center",
    team: "San Antonio Spurs",
    city: "San Antonio",
    state: "TX",
    intro: /^Welcome to the 210! The Frost Bank Center/i
  },
  {
    name: "Scotiabank Arena",
    team: "Toronto Raptors",
    city: "Toronto",
    state: "ON",
    intro: /^Welcome to the 6ix!|Scotiabank Arena is in the absolute prime/i
  },
  {
    name: "Delta Center",
    team: "Utah Jazz",
    city: "Salt Lake City",
    state: "UT",
    intro: /^Welcome to Salt Lake City! The Delta Center/i
  },
  {
    name: "Capital One Arena",
    team: "Washington Wizards",
    city: "Washington",
    state: "DC",
    intro: /^Welcome to the District! Capital One Arena/i
  }
];

const SKIP_PREFIXES = [
  "Would you",
  "Which ",
  "Where ",
  "Where are we",
  "Pro-Tip",
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
  "Boston Garden Society",
  "Beyond the budget",
  "You cannot talk about Footprint",
  "In April 2026, team owner",
  "Following the massive",
  "The biggest operational change",
  "The Jack Daniel",
  "Wisconsin Originals:",
  "Local Craft Taps:",
  "Primepoint Social:",
  "100% Cashless",
  "The Chuckmark Program:",
  "The Chase Cardholder",
  "No Refills &",
  "Michelob Ultra Mountain House:",
  "The Breckenridge Brewery Mountain",
  "Pop-Up:",
  "Symon's \"Bad A Shakes\"",
  "Patty Palace:",
  "The Octopus Bowl:",
  "The #1 Popcorn",
  "Northwest Atrium Mezzanine:"
];

function categoryFromHeader(line: string): string | null {
  const lower = line.toLowerCase();
  if (
    /^new for|^new:|^new &|showstopper|headline|garvin era|all-star season|brooklyn taste|neighborhood walk|valley.*showstopper|grit & grind|impossible grille|arena-exclusive|legacy.*showstopper|river & rose/i.test(
      lower
    ) &&
    line.length < 130 &&
    !ITEM_LINE_RE.test(line)
  ) {
    return "Headline Item";
  }
  if (
    /local legend|local favorite|neighborhood concept|cultural icon|a-town|dmv legends|deep texas|philly-first|buzz city|philly-first|chicago.s plate|remixed staple|local-centric/i.test(
      lower
    ) &&
    line.length < 100 &&
    !ITEM_LINE_RE.test(line)
  ) {
    return "Local Partner";
  }
  if (
    (/^bars\b|drinks|social|premium lounge|mocktail|concourse social|craft pour|playoff|daiquiris|skyline view|cantina|sportsbook/i.test(
      lower
    ) &&
      /bar|drink|lounge|social|club|cocktail|beer|spirits/i.test(lower)) ||
    /^jetblue runway/i.test(lower)
  ) {
    return "Drinks/Social";
  }
  if (
    /^value|dietary|frictionless|tech|logistics|allergen|innovation|game-changer|fan-friendly|plant-based|vegan|gluten/i.test(
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
    /^(signature|premium|courtside|everyday|concourse revolution|deep texas|dmv legends|chicago)/i.test(
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
  if (/reimagination project|renovation|master plan|transformation project/i.test(line) && !ITEM_LINE_RE.test(line)) {
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
  return NBA_VENUES.some((v) => v.intro.test(paragraph));
}

function matchVenue(paragraph: string): NbaVenueConfig | null {
  for (const venue of NBA_VENUES) {
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

function buildRow(
  venue: NbaVenueConfig,
  season: string,
  category: string | null,
  itemName: string,
  vendor: string,
  section: string,
  standName: string,
  description: string,
  reviewFlags: string[]
): NbaDocxParseRow {
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
    description: conciseDescription(description),
    price: undefined,
    category: category ?? "",
    source_url: "",
    season,
    reviewFlags
  };
}

export function parseNbaArenaDocxParagraphs(paragraphs: string[]): NbaDocxParseResult {
  const anchors: { index: number; venue: NbaVenueConfig; intro: string }[] = [];
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

  const rows: NbaDocxParseRow[] = [];
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
                category,
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
        const rowCategory =
          category ??
          (resolvedSection ? "Local Partner" : null);
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
        rows.push(
          buildRow(
            venue,
            seasonForBlock(intro, category) || blockSeason,
            category ?? (vendorCtx.section ? "Local Partner" : null),
            subName,
            vendorCtx.vendor,
            vendorCtx.section,
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

export function parseNbaArenaDocx(docxPath: string): NbaDocxParseResult {
  return parseNbaArenaDocxParagraphs(extractDocxParagraphs(docxPath));
}
