/**
 * Parse SS_MLS_NWSL_VENUE_ITEMS.docx into flat league-import rows.
 * Output only — use `lib/apply-mls-nwsl-import.ts` for database upserts.
 */

import type { LeagueImportRow } from "./league-import-shape";
import {
  looksLikeMlsNwslVenueName,
  MLS_NWSL_VENUE_SLUG_ALIASES,
  normalizeMlsNwslVenueName,
  resolveMlsNwslVenueSlug,
  venueMetaForSlug,
  type MlsNwslVenueMeta
} from "./mls-nwsl-venue-registry";
import { extractDocxParagraphs } from "./nfl-stadium-docx-parser";

export type MlsNwslDocxParseRow = LeagueImportRow & {
  venue_slug: string;
  reviewFlags: string[];
  foodTags: string[];
  teams: Array<{ name: string; league: string }>;
};

export type MlsNwslVenueBlock = {
  teams: Array<{ name: string; league: string }>;
  venueNames: string[];
  venueSlugs: string[];
  teamOnly: boolean;
  reviewNotes?: string;
  inferVenueFromIntro?: boolean;
};

export type MlsNwslDocxParseResult = {
  rows: MlsNwslDocxParseRow[];
  venueBlocks: MlsNwslVenueBlock[];
  reviewRows: MlsNwslDocxParseRow[];
  skippedLines: string[];
};

const DEFAULT_SEASON = "2026";
const MAX_DESCRIPTION = 220;

const ITEM_LINE_RE = /^(.+?)\s*\(([^)]+)\)\s*:\s*(.+)$/;
const PRICED_ITEM_RE = /^(.+?)\s*\(\$[\d.]+\s*-\s*([^)]+)\)\s*:\s*(.+)$/;
const SUB_ITEM_RE = /^([^:]{3,100}):\s*(.+)$/;

const SKIP_PREFIXES = [
  "Welcome to",
  "Marching into",
  "Stepping into",
  "We are heading",
  "Here is your",
  "For the 2026",
  "In a massive",
  "The 2026",
  "Instead, they",
  "Given the",
  "To battle",
  "If you are",
  "Additionally,",
  "Important 2026",
  "When Lionel",
  "First off,",
  "To go along",
  "The culinary",
  "The stadium",
  "Major stands",
  "The Red Bulls",
  "The current",
  "The goal for",
  "You cannot",
  "Reflecting the",
  "Pro-Tip",
  "Managed by",
  "Because no one",
  "Miami takes",
  "Heading to the",
  "What DHSP",
  "True to Los",
  "You cannot talk",
  "⚡",
  "👑",
  "🍨",
  "🥟",
  "🌭",
  "🇦🇷",
  "🍔",
  "🍹",
  "🌮",
  "🇰🇷",
  "🌿",
  "🍻"
];

const NARRATIVE_NAME_RE =
  /^(?:when|if|because|heading|what|true to|you cannot|the stadium|miami takes|managed by|for a sweet|if you manage)/i;

const FOOD_KEYWORD_RE =
  /(?:bbq|brisket|burger|taco|hot\s*dog|pizza|chicken|arepa|gelato|pupusas?|ramen|mac\s*&?\s*cheese|churro|nachos|sandwich|wings?|sausage|vegan|vegetarian|beer|wine|cocktail|margarita|soda|empanada|poutine|poke|sushi|omakase|asado|burrito|fries|donut|coffee|whisky|whiskey|brew|ipa|seltzer)/i;

const VENDOR_SUFFIX_RE =
  /(?:bar|grill|lounge|stand|cantina|kitchen|market|brew|tavern|pub|club|haus|pit|eats|taco|pizza|burger|gelato|churros?|smokehouse|taqueria|cantina|coop|co-op|hall|zone|outpost|station|winery|bodega)/i;

const PRICE_MENU_RE = /^\$\d+(?:\.\d{2})?:\s/;
const VENDOR_SECTION_RE = /^(.+?)\s*-\s*((?:Section|Sections|Near|Concourse|Stand|Club).+)$/i;
const SECTION_ONLY_RE = /^(?:Section|Sections|Stand|Concourse)\s+/i;

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function isMlsNwslAnchor(line: string): boolean {
  return /\((MLS|NWSL)\)/i.test(line) && line.includes(":");
}

function normalizeTeamName(raw: string): string {
  const name = raw.trim().replace(/\s+/g, " ");
  const fixes: Record<string, string> = {
    "Atlanta FC": "Atlanta United FC",
    "Boston Legacy FL": "Boston Legacy FC",
    "D.C United": "D.C. United",
    "Los Ángeles FC": "LAFC",
    "Los Angeles FC": "LAFC",
    "CF Montreal": "CF Montréal",
    "St, Louis City SC": "St. Louis City SC",
    "NJ/NY Gotham FC": "NJ/NY Gotham FC",
    "Chicago Stars FC": "Chicago Stars FC"
  };
  return fixes[name] ?? name;
}

export function parseMlsNwslAnchorLine(line: string): MlsNwslVenueBlock | null {
  const colon = line.indexOf(":");
  if (colon < 0) return null;

  const teamsPart = line.slice(0, colon).trim();
  let venuesPart = line.slice(colon + 1).trim();

  const teamOnly =
    /already imported/i.test(venuesPart) ||
    /just need to add/i.test(venuesPart) ||
    /both are already built/i.test(venuesPart);

  const reviewNotes = teamOnly ? venuesPart : undefined;

  venuesPart = venuesPart
    .replace(/\s*\(.*already imported.*\)\s*/gi, "")
    .replace(/\s*\(.*just need.*\)\s*/gi, "")
    .replace(/\s*\(.*both are already.*\)\s*/gi, "")
    .replace(/\.\.\s*both are already built.*$/i, "")
    .replace(/\.\./g, " ")
    .trim();

  const teams: Array<{ name: string; league: string }> = [];
  for (const chunk of teamsPart.split(/\s*&\s*/)) {
    const m = /(.+?)\s*\((MLS|NWSL)\)\s*$/i.exec(chunk.trim());
    if (m) {
      teams.push({
        name: normalizeTeamName(m[1]!),
        league: m[2]!.toUpperCase()
      });
    }
  }

  const venueNames: string[] = [];
  const venueParts = venuesPart
    .replace(/\s*\([^)]*(?:already imported|already in the system|just need|same as)[^)]*\)\s*/gi, "")
    .split(/\s*&\s*/);

  for (const part of venueParts) {
    const trimmed = part
      .replace(/\.\./g, ".")
      .split(/\.\s*(?:both|just|already)|\bboth are already\b/i)[0]!
      .trim();
    const cleaned = normalizeMlsNwslVenueName(trimmed);
    if (cleaned && !/^both are/i.test(cleaned) && looksLikeMlsNwslVenueName(cleaned)) {
      venueNames.push(cleaned);
    }
  }

  const inferVenueFromIntro = venueNames.length === 0 && !teamOnly;

  const venueSlugs = venueNames.map((name) =>
    canonicalVenueSlug(resolveMlsNwslVenueSlug(name))
  );

  if (teams.length === 0) {
    return null;
  }

  return {
    teams,
    venueNames,
    venueSlugs,
    teamOnly,
    reviewNotes,
    inferVenueFromIntro
  };
}

function inferVenueNameFromIntroParagraphs(paragraphs: string[], start: number): string | null {
  const window = paragraphs.slice(start + 1, start + 6);
  for (const line of window) {
    const into = /(?:into|at|for)\s+([A-Z0-9][^.!?\n]{2,55}?(?:Stadium|Stade|Field|Park|Arena|Place|Centre|Center|Bowl|Garden|Grounds|CITYPARK|Saputo))/i.exec(
      line
    );
    const report = /scouting report for\s+([A-Z][^.!?\n]{2,50}?(?:Stadium|Stade|Field|Park|Arena|Place|CITYPARK|Saputo))/i.exec(
      line
    );
    if (report?.[1]) {
      const candidate = normalizeMlsNwslVenueName(report[1].trim());
      if (looksLikeMlsNwslVenueName(candidate)) {
        return candidate;
      }
    }
    if (into?.[1]) {
      const candidate = normalizeMlsNwslVenueName(into[1].trim());
      if (looksLikeMlsNwslVenueName(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

function canonicalVenueSlug(slug: string): string {
  return MLS_NWSL_VENUE_SLUG_ALIASES[slug] ?? slug;
}

function splitVenueTargets(block: MlsNwslVenueBlock): Array<{
  venueName: string;
  venueSlug: string;
  team: { name: string; league: string };
  meta: MlsNwslVenueMeta;
}> {
  const targets: Array<{
    venueName: string;
    venueSlug: string;
    team: { name: string; league: string };
    meta: MlsNwslVenueMeta;
  }> = [];

  if (block.venueSlugs.length === 0) {
    return targets;
  }

  if (block.venueSlugs.length === 1) {
    const slug = canonicalVenueSlug(block.venueSlugs[0]!);
    const name = block.venueNames[0] ?? venueMetaForSlug(slug, slug).name;
    const meta = venueMetaForSlug(slug, name);
    for (const team of block.teams) {
      targets.push({ venueName: meta.name, venueSlug: slug, team, meta });
    }
    return targets;
  }

  // NYCFC: same team, multiple venues
  for (let i = 0; i < block.venueSlugs.length; i++) {
    const slug = canonicalVenueSlug(block.venueSlugs[i]!);
    const name = block.venueNames[i] ?? venueMetaForSlug(slug, slug).name;
    const meta = venueMetaForSlug(slug, name);
    for (const team of block.teams) {
      targets.push({ venueName: meta.name, venueSlug: slug, team, meta });
    }
  }

  return targets;
}

function shouldSkipLine(line: string): boolean {
  if (PRICE_MENU_RE.test(line)) return true;
  if (SKIP_PREFIXES.some((p) => line.startsWith(p))) return true;
  if (/^Pro-Tip/i.test(line)) return true;
  if (/^🌭|^🥟|^🍨|^👑|^⚡/.test(line)) return true;
  if (line.length < 4) return true;
  if (/^MLS Stadiums$/i.test(line)) return true;
  return false;
}

function lineSubject(line: string): string {
  const colon = line.indexOf(":");
  return (colon > 0 ? line.slice(0, colon) : line).trim();
}

function categoryFromHeader(line: string): string | null {
  const lower = lineSubject(line).toLowerCase();
  if (/headliner|showstopper|cowboy hat|community first|burgundy bites|\$4\.99|\$5\b/.test(lower)) {
    return "Headline Item";
  }
  if (/local|michelin|icon|chef|james beard|h-town|district staple/.test(lower)) {
    return "Local Partner";
  }
  if (
    /bar|lounge|club|sip|pour|cantina|margarita|brewery|social/.test(lower) &&
    lineSubject(line).length < 90
  ) {
    return "Drinks/Social";
  }
  if (/vegan|plant|value|budget|dietary|gluten|clean eating/.test(lower)) {
    return "Dietary/Value";
  }
  return null;
}

function isCategoryHeader(line: string): boolean {
  if (ITEM_LINE_RE.test(line) || PRICED_ITEM_RE.test(line)) return false;
  const sub = SUB_ITEM_RE.exec(line);
  if (sub && looksLikeImportItemName(sub[1]!.trim(), sub[2]!.trim())) return false;
  const subject = lineSubject(line);
  return (
    Boolean(categoryFromHeader(line)) ||
    (subject.length < 72 && !/section|stand|concourse/i.test(subject) && !line.includes(":"))
  );
}

function conciseDescription(raw: string): string {
  const one = raw.replace(/\s+/g, " ").trim();
  if (one.length <= MAX_DESCRIPTION) return one;
  const cut = one.slice(0, MAX_DESCRIPTION - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function parseLocation(locationRaw: string): {
  vendorHint: string;
  section: string;
  standName: string;
} {
  const location = locationRaw.trim();
  const vendorSection = VENDOR_SECTION_RE.exec(location);
  if (vendorSection) {
    return {
      vendorHint: vendorSection[1]!.trim(),
      section: vendorSection[2]!.trim(),
      standName: ""
    };
  }
  if (SECTION_ONLY_RE.test(location)) {
    return { vendorHint: "", section: location, standName: "" };
  }
  if (/^(multiple sections|various|concourse|club level|upper level)/i.test(location)) {
    return { vendorHint: "", section: location, standName: "" };
  }
  return { vendorHint: "", section: location || "Concourse", standName: "" };
}

function looksLikeVendorName(name: string): boolean {
  return VENDOR_SUFFIX_RE.test(name) || FOOD_KEYWORD_RE.test(name);
}

function looksLikeImportItemName(name: string, description = ""): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 90) return false;
  if (NARRATIVE_NAME_RE.test(trimmed)) return false;
  if (/^(?:the|a)\s+(?:stadium|culinary|absolute|official|go-to|massive)\b/i.test(trimmed)) {
    return false;
  }
  if (description.length >= 35 && FOOD_KEYWORD_RE.test(description)) {
    if (/^(?:it|they|this|these)\s/i.test(trimmed)) return false;
    if (/^(?:the|a)\s+(?:stadium|culinary|absolute|official|go-to|massive)\b/i.test(trimmed)) {
      return false;
    }
    return true;
  }
  if (looksLikeVendorName(trimmed)) return true;
  if (FOOD_KEYWORD_RE.test(trimmed)) return true;
  if (/&/.test(trimmed) && trimmed.length < 70) return true;
  if (/^(?:the\s+)?[A-Z][^.]{2,55}$/.test(trimmed) && FOOD_KEYWORD_RE.test(trimmed)) {
    return true;
  }
  if (
    /^(?:the\s+)?(?:poutine|montreal|match day|jersey|meatball|pesto|cowboy hat|float on|pupusas|avocado|seoul|mac cheezy|melissa)/i.test(
      trimmed
    )
  ) {
    return true;
  }
  return /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4}(?:\s+(?:&|and)\s+[A-Z])/.test(trimmed);
}

function isSectionCategoryHeader(name: string, description: string): boolean {
  const lower = `${name} ${description}`.toLowerCase();
  if (
    /^(?:the\s+)?(?:headliners?|local|elevated|premium|tech|drinks?|sip|pour|north jersey|global|asian|la health|tailgate|soCal|argentinian|burgundy|value|dietary)/i.test(
      name
    ) &&
    description.length < 120 &&
    !FOOD_KEYWORD_RE.test(name)
  ) {
    return true;
  }
  if (/&\s*latin\s*flavors?$/i.test(name) || /stadium\s*staples/i.test(lower)) {
    return true;
  }
  return false;
}

function extractSectionFromDescription(description: string): string {
  const patterns = [
    /\b(?:in|at|located in|found at)\s+(?:the\s+)?(Fan Zone|Mercado Food Hall|Section[s]?\s+[\d&]+(?:\s*&\s*[\d]+)?|Stand\s+\d+|Club Level|North Concourse|South Concourse|East Concourse|West Concourse|Plaza)\b/i,
    /\b(Section[s]?\s+[\d]+(?:\s*&\s*[\d]+)?)\b/i,
    /\b(Stand\s+\d+)\b/i
  ];
  for (const re of patterns) {
    const m = re.exec(description);
    if (m?.[1]) return m[1].trim();
  }
  return "";
}

export function inferMlsNwslFoodTags(itemName: string, description: string): string[] {
  const text = `${itemName} ${description}`.toLowerCase();
  const tags: string[] = [];
  const add = (tag: string) => {
    if (!tags.includes(tag)) tags.push(tag);
  };

  if (/\b(?:bbq|brisket|smokehouse|asado|pulled pork)\b/.test(text)) add("BBQ");
  if (/\b(?:taco|taqueria|burrito|arepa|pupusas?|empanada)\b/.test(text)) add("tacos");
  if (/\b(?:burger|smashburger)\b/.test(text)) add("burgers");
  if (/\b(?:hot\s*dog|ripper|frank|sausage)\b/.test(text)) add("hot dogs");
  if (/\b(?:chicken|fried chicken|tenders)\b/.test(text)) add("chicken");
  if (/\b(?:pizza|pizzeria)\b/.test(text)) add("pizza");
  if (/\b(?:gelato|churro|dessert|donut|cookie|ice cream|dole whip|sweet)\b/.test(text)) {
    add("dessert");
  }
  if (/\b(?:beer|ipa|lager|brewery|craft beer|tavern)\b/.test(text)) add("beer");
  if (/\b(?:vegan|plant-based|plant based)\b/.test(text)) add("vegan");
  if (/\b(?:vegetarian|veggie)\b/.test(text) && !tags.includes("vegan")) add("vegetarian");
  if (/\b(?:local|legendary|institution|miami staple|garden state|utah institution)\b/.test(text)) {
    add("local favorite");
  }
  if (/\b(?:\$4\.99|\$5\b|value menu|budget|lineup)\b/.test(text)) add("value menu");
  if (/\b(?:omakase|vip|premium club|james beard|michelin|ultra-luxe|club level)\b/.test(text)) {
    add("premium");
  }
  if (/\b(?:zippin|grab-and-go|checkout-free|express)\b/.test(text)) add("grab-and-go");

  return tags;
}

function buildFoodTags(
  itemName: string,
  description: string,
  category: string | null
): string[] {
  const tags = inferMlsNwslFoodTags(itemName, description);
  const cat = (category ?? "").toLowerCase();
  if (cat.includes("local") && !tags.includes("local favorite")) tags.push("local favorite");
  if (cat.includes("drink") && !tags.includes("beer")) tags.push("beer");
  if (cat.includes("value") && !tags.includes("value menu")) tags.push("value menu");
  if (cat.includes("headline") && !tags.includes("premium")) tags.push("premium");
  return tags;
}

function buildRow(
  target: {
    venueName: string;
    venueSlug: string;
    team: { name: string; league: string };
    meta: MlsNwslVenueMeta;
  },
  category: string | null,
  itemName: string,
  vendor: string,
  section: string,
  standName: string,
  description: string,
  reviewFlags: string[]
): MlsNwslDocxParseRow {
  const desc = conciseDescription(description);
  return {
    league: target.team.league,
    team: target.team.name,
    venue: target.venueName,
    venue_slug: canonicalVenueSlug(target.venueSlug),
    city: target.meta.city,
    state: target.meta.state,
    vendor: vendor || itemName,
    stand_name: standName,
    section,
    item_name: itemName,
    description: desc,
    category: category ?? "",
    season: DEFAULT_SEASON,
    reviewFlags,
    foodTags: buildFoodTags(itemName, desc, category),
    teams: [{ name: target.team.name, league: target.team.league }]
  };
}

function pushItemRow(
  rows: MlsNwslDocxParseRow[],
  targets: ReturnType<typeof splitVenueTargets>,
  category: string | null,
  itemName: string,
  vendor: string,
  section: string,
  standName: string,
  description: string,
  flags: string[],
  vendorCtx: VendorContext | null
): VendorContext {
  let resolvedSection = section || vendorCtx?.section || "Concourse";
  if (!section) {
    const fromDesc = extractSectionFromDescription(description);
    if (fromDesc) resolvedSection = fromDesc;
  }

  let resolvedVendor = vendor || itemName;
  if (!vendor && looksLikeVendorName(itemName)) {
    resolvedVendor = itemName;
  }

  const ctx: VendorContext = {
    vendor: resolvedVendor,
    section: resolvedSection,
    standName: standName || vendorCtx?.standName || ""
  };

  for (const target of targets) {
    rows.push(
      buildRow(
        target,
        category,
        itemName,
        resolvedVendor,
        resolvedSection,
        ctx.standName,
        description,
        flags
      )
    );
  }

  return ctx;
}

type VendorContext = { vendor: string; section: string; standName: string };

export function parseMlsNwslDocxParagraphs(paragraphs: string[]): MlsNwslDocxParseResult {
  const anchors: { index: number; block: MlsNwslVenueBlock }[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const line = paragraphs[i]!;
    if (isMlsNwslAnchor(line)) {
      const block = parseMlsNwslAnchorLine(line);
      if (block) {
        anchors.push({ index: i, block });
      }
    }
  }

  const rows: MlsNwslDocxParseRow[] = [];
  const skippedLines: string[] = [];

  for (let a = 0; a < anchors.length; a++) {
    let { block } = anchors[a]!;
    const anchorIndex = anchors[a]!.index;

    if (block.inferVenueFromIntro || block.venueSlugs.length === 0) {
      const inferred = inferVenueNameFromIntroParagraphs(paragraphs, anchorIndex);
      if (inferred) {
        block = {
          ...block,
          venueNames: [inferred],
          venueSlugs: [resolveMlsNwslVenueSlug(inferred)],
          inferVenueFromIntro: false
        };
      }
    }

    const end = anchors[a + 1]?.index ?? paragraphs.length;
    const targets = splitVenueTargets(block);

    if (targets.length === 0) {
      skippedLines.push(`No venue resolved: ${paragraphs[anchors[a]!.index]}`);
      continue;
    }

    if (block.teamOnly) {
      continue;
    }

    let category: string | null = null;
    let vendorCtx: VendorContext | null = null;

    for (let i = anchors[a]!.index + 1; i < end; i++) {
      const line = paragraphs[i]!;
      if (shouldSkipLine(line)) continue;

      const headerCategory = categoryFromHeader(line);
      if (headerCategory || isCategoryHeader(line)) {
        category = headerCategory ?? category;
        vendorCtx = null;
        continue;
      }

      const priced = PRICED_ITEM_RE.exec(line);
      const standard = priced ? null : ITEM_LINE_RE.exec(line);
      const itemMatch = priced ?? standard;

      if (itemMatch) {
        const itemName = itemMatch[1]!.trim();
        const locationRaw = priced ? priced[2]! : itemMatch[2]!;
        const description = itemMatch[3]!.trim();
        const { vendorHint, section, standName } = parseLocation(locationRaw);
        const flags: string[] = [];
        if (!section && !vendorHint) flags.push("missing-section");

        let vendor = vendorHint;
        if (!vendor && looksLikeVendorName(itemName)) vendor = itemName;

        vendorCtx = pushItemRow(
          rows,
          targets,
          category,
          itemName,
          vendor,
          section,
          standName,
          description,
          flags,
          vendorCtx
        );
        continue;
      }

      const subMatch = SUB_ITEM_RE.exec(line);
      if (subMatch) {
        const itemName = subMatch[1]!.trim();
        const description = subMatch[2]!.trim();

        if (!looksLikeImportItemName(itemName, description)) {
          skippedLines.push(line.slice(0, 120));
          continue;
        }
        if (isSectionCategoryHeader(itemName, description)) {
          const headerCategory = categoryFromHeader(line);
          if (headerCategory) category = headerCategory;
          continue;
        }

        const flags = vendorCtx ? ["sub-line"] : ["narrative-line"];
        if (!vendorCtx) flags.push("missing-section");

        const vendor =
          vendorCtx?.vendor ??
          (looksLikeVendorName(itemName) ? itemName : itemName.split(/\s*&\s*/)[0]!.trim());

        vendorCtx = pushItemRow(
          rows,
          targets,
          category,
          itemName,
          vendor,
          vendorCtx?.section ?? "",
          vendorCtx?.standName ?? "",
          description,
          flags,
          vendorCtx
        );
      }
    }
  }

  const reviewRows = rows.filter((r) => r.reviewFlags.length > 0);

  return {
    rows,
    venueBlocks: anchors.map((a) => a.block),
    reviewRows,
    skippedLines
  };
}

export function parseMlsNwslDocx(docxPath: string): MlsNwslDocxParseResult {
  const paragraphs = extractDocxParagraphs(docxPath);
  return parseMlsNwslDocxParagraphs(paragraphs);
}

export function rowsToCsv(rows: LeagueImportRow[]): string {
  const headers = [
    "league",
    "team",
    "venue",
    "city",
    "state",
    "vendor",
    "stand_name",
    "section",
    "item_name",
    "description",
    "category",
    "season",
    "venue_slug"
  ];
  const escape = (v: string) => {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    const extended = row as LeagueImportRow & { venue_slug?: string };
    lines.push(
      headers
        .map((h) => {
          const val =
            h === "venue_slug"
              ? (extended.venue_slug ?? "")
              : String((row as Record<string, unknown>)[h] ?? "");
          return escape(val);
        })
        .join(",")
    );
  }
  return lines.join("\n");
}
