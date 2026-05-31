import {
  iowaVendorItemDedupeKey,
  resolveIowaFoodCanonicalName
} from "./iowa-food-name-normalize";
import type { FairRawMenuItem } from "./types";

const FOOD_FINDER_URL =
  "https://www.iowastatefair.org/visit/product-food-finder";

/** Broad single-letter query returns the full vendor catalog in server HTML. */
const CATALOG_QUERY = "a";

const MERCH_RE =
  /^(ballcards|kids cards|sports cards|trading cards|merchandise|souvenir|apparel|t-?shirt)/i;

const NON_FOOD_VENDOR_RE =
  /(?:exteriors|marketing|insurance|credit union|\bbank\b|solar|hvac|real estate|mattress|furniture|jewelry|clothing|apparel|wireless|internet provider|aarp\b|machinery|outdoor power|storage service|adjustable beds|aetna|at&t|verizon|tmobile|t-mobile|aveda|aeron lifestyle)/i;

const FOOD_VENDOR_RE =
  /\b(?:concession|kitchen|grill|eatery|bbq|smokin|diner|taco|pizza|burger|corn dog|funnel|brew|bakery|donut|ice cream|dairy|cafe|restaurant|cantina|nachos?|curds?|brats?|pork tent|bar &|bar and|cookie|wings|steak|lobster|seafood|pretzel|chees|waffle|sundae|shake|ramen|sushi|pho|gyro|falafel|tamale|burrito|fry)\b/i;

const FOOD_ITEM_HINT_RE =
  /\b(?:brats?|corn dogs?|burgers?|tacos?|pizza|funnel|cheese curds?|bbq|smoked|fried|ice cream|shakes?|wings?|ribs?|steak|pork|chicken|waffles?|donuts?|cookies?|pretzels?|nachos?|burritos?|wraps?|sandwiches?|pickles?|lemonade|fries|sundaes?|cakes?|pies?|sausages?|on a stick|hot cheeto|tenderloin|gyros?|ramen|lobster|gizzards?|brisket|poutine|elote|falafel|tamales?)\b/i;

const NON_FOOD_PRODUCT_RE =
  /\b(?:concrete work|roofing|siding|soffit|window|door|insurance|information|membership|machinery|solar|hvac|gutter|paint|remodel|fence|deck|loan|banking|aarp|novelty refill|souvenir|ballcards|drawings?|blueprint|fragrance|scent products|house siding)\b/i;

const OPTION_LINE_RE =
  /^(basket|extra cheese|bacon \(\d|carrots & celery|cheese or gravy|chocolate chips\/blueberries|condiment|side of|add on|refill|soda-refill|tea-refill)/i;

const GENERIC_ITEM_RE =
  /^(?:\.?5 liter bottled water|bottled water|water|milk|coffee|soda|large soda|medium soda|small soda|combo (?:large|medium|small) soda|iced tea|sweet tea|tea,|tea-refills|gatorade|popcorn|nachos|french fries|hot dogs?|hamburger|cheeseburger|ice cream|pretzels?|cookie|candy bars?|chips|coleslaw|smoothie|lemonade|root beer|chocolate milk|brewed)/i;

function decodeHtml(text: string): string {
  return text
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function cleanItemName(raw: string): string {
  return decodeHtml(raw).replace(/^["\s]+|["\s]+$/g, "").trim();
}

function inferFare(name: string): FairRawMenuItem["fare"] {
  if (
    /shake|sundae|ice cream|cookie|donut|funnel|cake|pie|cinnamon roll|dessert|brownie|churro/i.test(
      name
    )
  ) {
    return "Desserts";
  }
  if (/corn dog|brat|burger|pizza|taco|sandwich|bowl|wrap|ramen|rib|steak|meal/i.test(name)) {
    return "Meals";
  }
  return "Snacks";
}

export type IowaFoodFinderParseResult = {
  sourceUrl: string;
  items: FairRawMenuItem[];
  skippedItems: { name: string; reason: string }[];
  vendorCount: number;
};

export async function fetchIowaFoodFinderCatalog(): Promise<IowaFoodFinderParseResult> {
  const sourceUrl = `${FOOD_FINDER_URL}?q=${CATALOG_QUERY}`;
  const res = await fetch(sourceUrl, {
    headers: {
      "User-Agent": "StadiumSlopFairImport/1.0 (+https://stadium-slop.local)"
    },
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error(
      `Iowa Product & Food Finder fetch failed (${res.status}): ${sourceUrl}`
    );
  }

  const html = await res.text();
  if (!html.includes("What they offer")) {
    throw new Error(
      "Iowa Product & Food Finder returned no vendor blocks — catalog may be offline until fair season."
    );
  }

  const items: FairRawMenuItem[] = [];
  const skippedItems: { name: string; reason: string }[] = [];
  const vendorBlocks: { vendor: string; location: string; items: string[] }[] = [];

  const blockRe =
    /<div class="mb-4 mt-4 col-12"><h4[^>]*>([^<]+)<\/h4>\s*<p><strong>Location: <\/strong>([^<]*)<\/p>[\s\S]*?<ul class="row list-unstyled">([\s\S]*?)<\/ul>/gi;

  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(html))) {
    const vendor = cleanItemName(match[1]);
    const location = decodeHtml(match[2]);
    const itemNames = [...match[3].matchAll(/<li class="col-12 col-lg-3 mb-3">([^<]*)<\/li>/gi)].map(
      (m) => cleanItemName(m[1])
    );
    vendorBlocks.push({ vendor, location, items: itemNames });
  }

  const seen = new Set<string>();

  for (const block of vendorBlocks) {
    if (!block.vendor) continue;

    if (NON_FOOD_VENDOR_RE.test(block.vendor)) {
      for (const rawName of block.items) {
        skippedItems.push({
          name: `${block.vendor}: ${cleanItemName(rawName)}`,
          reason: "Non-food vendor (product finder)"
        });
      }
      continue;
    }

    const vendorFoodItems: FairRawMenuItem[] = [];

    for (const rawName of block.items) {
      const name = cleanItemName(rawName);
      if (!name || name.length < 3) {
        skippedItems.push({ name: rawName || "(empty)", reason: "Too short to be a menu item" });
        continue;
      }

      if (MERCH_RE.test(name) || NON_FOOD_PRODUCT_RE.test(name)) {
        skippedItems.push({ name, reason: "Non-food product or merchandise" });
        continue;
      }

      if (OPTION_LINE_RE.test(name)) {
        skippedItems.push({ name, reason: "Footnote, add-on, or option line" });
        continue;
      }

      if (GENERIC_ITEM_RE.test(name)) {
        skippedItems.push({ name, reason: "Generic beverage or fair filler" });
        continue;
      }

      const canonicalName = resolveIowaFoodCanonicalName(name);
      const key = iowaVendorItemDedupeKey(block.vendor, canonicalName);
      if (seen.has(key)) {
        skippedItems.push({
          name: canonicalName,
          reason: "Duplicate within food finder batch (normalized name)"
        });
        continue;
      }
      seen.add(key);

      vendorFoodItems.push({
        name: canonicalName,
        vendor: block.vendor,
        location: block.location || undefined,
        fare: inferFare(canonicalName)
      });
    }

    if (vendorFoodItems.length === 0) {
      skippedItems.push({
        name: block.vendor,
        reason: "Vendor has no food items after product-finder filter"
      });
      continue;
    }

    const hasFoodVendorName = FOOD_VENDOR_RE.test(block.vendor);
    const hasFoodItem = vendorFoodItems.some((item) => FOOD_ITEM_HINT_RE.test(item.name));
    if (!hasFoodVendorName && !hasFoodItem) {
      for (const item of vendorFoodItems) {
        skippedItems.push({
          name: `${block.vendor}: ${item.name}`,
          reason: "Non-food vendor (no food-tagged items)"
        });
      }
      continue;
    }

    items.push(...vendorFoodItems);
  }

  return {
    sourceUrl,
    items,
    skippedItems,
    vendorCount: vendorBlocks.length
  };
}
