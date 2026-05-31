import type { FairRawMenuItem } from "./types";

const KICKOFF_VENDORS_URL = "https://www.mnstatefair.org/kickoff-to-summer/vendors/";

const SKIP_SECTION_HEADERS = new Set([
  "Beverages",
  "Beer",
  "Beer & Wine",
  "Frozen Beverages",
  "Entertainment",
  "Non-Espresso Beverages",
  "Coffee & Expresso Beverages",
  "Flavors & Extras",
  "Dipping Options",
  "Bottled Sauces",
  "Bottled Cocktail Mixes",
  "Sides",
  "Wine"
]);

const SUBSECTION_HEADERS = new Set([
  "Burgers",
  "Sandwiches",
  "Meal Cqombos",
  "Meal Combos",
  "Pizza",
  "Bowls",
  "Shakes",
  "Soda Pop (Orange Dream, Brown Cow, Lemon-Lime Rickey)",
  "Wood-Fired Pizza",
  "Wood-Fired Sausages",
  "Native American Tacos",
  "Taco Salads (fresh spring mix, choice of meat, cheddar cheese, garden salsa, tortilla chips, lime, side of sour cream & Cholula)"
]);

const GENERIC_ITEM_RE =
  /^(beverages|bottled water|water|milk|coffee|soda|popcorn|kettle corn|nachos|bavarian pretzels|french fries|fries|chips|pretzels|ice cream|bagels with cream cheese|muffins|fresh fruit|yogurt parfaits|chicken salad croissants|bottled apple syrup|halal beef & chicken)$/i;

const GENERIC_BEVERAGE_LINE_RE =
  /^(pepsi|coke|coca-cola|diet coke|sprite|dr pepper|mountain dew|starry|lemonade|iced tea|root beer|beer|wine|1919 root beer|jarrito sodas|fountain soda|bottled coca-cola|purified tap water|canned soda|caribou coffee|monster energy|red bull|gatorade|icee|powerade)/i;

const FLAVOR_LIST_RE =
  /^(vanilla|chocolate|strawberry|raspberry|caramel|hot fudge|original|strawberry|blue raspberry|mandarin|fruit punch)/i;

export type KickoffParseResult = {
  sourceUrl: string;
  items: FairRawMenuItem[];
  skippedItems: { name: string; reason: string }[];
  ambiguousItems: { name: string; reason: string }[];
  vendorCount: number;
};

function decodeHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "\n");
}

function extractFoodVendorSection(html: string): string {
  const start = html.indexOf('id="food-vendors"');
  const end = html.indexOf('id="merchandise-vendors"');
  if (start < 0 || end < 0) {
    throw new Error("Could not locate food-vendors section on kickoff vendors page");
  }
  return decodeHtml(html.slice(start, end));
}

function cleanVendorName(line: string): string {
  return line
    .replace(/^NEW!\s*-\s*/i, "")
    .replace(/\s*\(cash[^)]*\)\s*$/i, "")
    .replace(/\s*\(two locations\s*\)\s*$/i, "")
    .trim();
}

function isVendorPaymentLine(line: string): boolean {
  return /^\(cash/i.test(line);
}

function isVendorHeaderLine(line: string, nextLine?: string): boolean {
  if (!line || line === "NEW! -") return false;
  if (SKIP_SECTION_HEADERS.has(line) || SUBSECTION_HEADERS.has(line)) return false;
  if (GENERIC_BEVERAGE_LINE_RE.test(line)) return false;
  if (/^GF\s*=|^V\s*=|^VE\s*=|^Note:/i.test(line)) return false;
  if (/\(cash/i.test(line)) return true;
  if (nextLine && isVendorPaymentLine(nextLine)) return true;
  return false;
}

function isDietaryAnnotation(line: string): boolean {
  return /^(GF|V|VE|Kosher|Halal)(?:\s*[,/&]|$)/i.test(line) || /^GF\s*[-–]/i.test(line);
}

function inferFare(name: string): FairRawMenuItem["fare"] {
  const lower = name.toLowerCase();
  if (
    /\b(cookie|donut|doughnut|pie|ice cream|sundae|malt|churro|funnel|cake|brownie|sorbet|shave ice|minneapple)\b/.test(
      lower
    )
  ) {
    return "Desserts";
  }
  if (/\b(corn dog|hot dog|burger|sandwich|taco|ribs|poutine|bowl|pizza|chop|ramen|gyro)\b/.test(lower)) {
    return "Meals";
  }
  return "Snacks";
}

function parseLinesToItems(lines: string[]): KickoffParseResult {
  const items: FairRawMenuItem[] = [];
  const skippedItems: { name: string; reason: string }[] = [];
  const ambiguousItems: { name: string; reason: string }[] = [];
  const vendors = new Set<string>();

  let vendor: string | null = null;
  let inSkipSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const next = lines[i + 1]?.trim();

    if (!line || line === "Food Vendors") continue;
    if (/^GF\s*=|^V\s*=|^VE\s*=|^Note:/i.test(line)) continue;
    if (line === "NEW! -") continue;

    if (isVendorHeaderLine(line, next)) {
      if (isVendorPaymentLine(line)) continue;
      vendor = cleanVendorName(line);
      if (vendor) vendors.add(vendor);
      inSkipSection = false;
      if (next && isVendorPaymentLine(next)) i++;
      continue;
    }

    if (!vendor) continue;

    if (SKIP_SECTION_HEADERS.has(line)) {
      inSkipSection = true;
      continue;
    }

    if (SUBSECTION_HEADERS.has(line)) {
      inSkipSection = false;
      continue;
    }

    if (inSkipSection) continue;
    if (isDietaryAnnotation(line)) continue;
    if (isVendorPaymentLine(line)) continue;
    if (GENERIC_BEVERAGE_LINE_RE.test(line)) {
      skippedItems.push({ name: line, reason: "Generic beverage listing" });
      continue;
    }
    if (GENERIC_ITEM_RE.test(line)) {
      skippedItems.push({ name: line, reason: "Generic fair staple (not specialty item)" });
      continue;
    }
    if (FLAVOR_LIST_RE.test(line) && line.length < 40) {
      skippedItems.push({ name: line, reason: "Flavor option, not a menu item" });
      continue;
    }
    if (/^\*/.test(line) || /^Note:/i.test(line)) {
      ambiguousItems.push({ name: line, reason: "Footnote — not imported as item" });
      continue;
    }
    if (/^GF\s*(\*|without)|^can be served on/i.test(line)) {
      skippedItems.push({ name: line, reason: "Dietary or serving note — not a menu item" });
      continue;
    }
    if (line.length < 3) continue;

    const baseName = line
      .replace(/\s*\([^)]*\)\s*$/g, "")
      .replace(/,+\s*$/, "")
      .replace(/^[;,]\s+/, "")
      .trim();
    if (!baseName || baseName.length < 3) continue;

    const names =
      baseName.includes(";") && baseName.split(";").length <= 4
        ? baseName
            .split(";")
            .map((part) => part.trim())
            .filter((part) => part.length >= 3)
        : [baseName];

    for (const name of names) {
      if (/^[;,]/.test(name)) continue;
      items.push({
        name,
        vendor,
        fare: inferFare(name),
        description: `Listed on official Minnesota State Fair kickoff vendor menu.`
      });
    }
  }

  return {
    sourceUrl: KICKOFF_VENDORS_URL,
    items,
    skippedItems,
    ambiguousItems,
    vendorCount: vendors.size
  };
}

export async function fetchKickoffVendorCatalog(): Promise<KickoffParseResult> {
  const response = await fetch(KICKOFF_VENDORS_URL, {
    headers: { "User-Agent": "StadiumSlopFairImport/1.0" }
  });
  if (!response.ok) {
    throw new Error(`Kickoff vendors fetch failed: ${response.status}`);
  }
  const html = await response.text();
  const text = extractFoodVendorSection(html);
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return parseLinesToItems(lines);
}
