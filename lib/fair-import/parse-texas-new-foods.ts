import type { FairRawMenuItem } from "./types";

const NEW_FOODS_URL =
  "https://bigtex.com/new-foods-announced-for-2025-state-fair-of-texas/";

const SECTION_HEADER_RE =
  /new state fair|new 2025|vendors, concepts|food stands|telephone|social|parking/i;

const VENDOR_ONLY_RE =
  /^(chocolate strawberry cup|levi's|levis|stiffler's rodeo lounge|cheap eats|little lone stars|rousso's fat bacon)$/i;

function decodeHtml(text: string): string {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8230;/g, "...")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMarkers(name: string): string {
  return name.replace(/\*+$/, "").trim();
}

function extractOwnerVendor(line: string): string {
  const cleaned = decodeHtml(line);
  const ofMatch = cleaned.match(/\bof\s+(.+)$/i);
  if (ofMatch) {
    return ofMatch[1].replace(/\s+at\s+.+$/i, "").trim();
  }
  return cleaned.replace(/\s+LLC\.?$/i, " LLC").trim();
}

function extractLocation(line: string): string | undefined {
  const cleaned = decodeHtml(line);
  const loc = cleaned.replace(/^located at\s+/i, "").replace(/^located in\s+/i, "").trim();
  return loc || undefined;
}

function shortDescription(raw: string, itemName: string): string | undefined {
  const text = decodeHtml(raw);
  if (!text || text.length < 40) return undefined;
  const first = text.split(/(?<=[.!?])\s+/)[0]?.trim();
  if (!first || first.length < 30) return undefined;
  if (first.length > 160) {
    return `${first.slice(0, 157).trim()}...`;
  }
  return first.replace(new RegExp(`^${itemName}\\b`, "i"), "").trim() || first;
}

function inferFare(name: string): FairRawMenuItem["fare"] {
  if (/margarita|lemonada|cooler|float|sipper|tea|coffee/i.test(name)) {
    return undefined;
  }
  if (/cake|cookie|churro|cheesecake|doughnut|dots|pie|dessert|chocolate/i.test(name)) {
    return "Desserts";
  }
  if (/taco|ramen|slider|burger|wrap|calzone|lobster|carbonara|crunchwrap|vegan/i.test(name)) {
    return "Meals";
  }
  return "Snacks";
}

function isSpecialtyDrink(name: string): boolean {
  return /margarita|lemonada|cooler|float|pickleback|sprite|aguasol|wild black cherry/i.test(
    name
  );
}

export type TexasNewFoodsParseResult = {
  sourceUrl: string;
  items: FairRawMenuItem[];
  skippedItems: { name: string; reason: string }[];
};

export async function fetchTexasNewFoodsCatalog(): Promise<TexasNewFoodsParseResult> {
  const res = await fetch(NEW_FOODS_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; StadiumSlopFairImport/1.0; +https://stadium-slop.local)"
    },
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error(`Texas new foods fetch failed (${res.status})`);
  }

  const html = await res.text();
  if (/cloudflare|blocked/i.test(html) && html.length < 20_000) {
    throw new Error(
      "BigTex.com blocked automated fetch (Cloudflare) — cannot build Texas core catalog."
    );
  }

  const start = html.indexOf("post-content");
  const chunk = start >= 0 ? html.slice(start) : html;
  const blocks = chunk.split(/<p><b><span[^>]*data-contrast[^>]*>/i).slice(1);

  const items: FairRawMenuItem[] = [];
  const skippedItems: { name: string; reason: string }[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    const nameMatch = block.match(/^([^<]+)<\/span><\/b>/i);
    if (!nameMatch) continue;

    const name = stripMarkers(decodeHtml(nameMatch[1]));
    if (!name || name.length < 4 || SECTION_HEADER_RE.test(name)) continue;

    if (VENDOR_ONLY_RE.test(name)) {
      skippedItems.push({ name, reason: "Vendor/stand listing without distinct food item" });
      continue;
    }

    const ownerMatch = block.match(
      /<p><i><span[^>]*data-contrast[^>]*>([^<]+)<\/span><\/i>/i
    );
    const locationMatch = block.match(
      /<p><i><span[^>]*data-contrast[^>]*>Located[^<]*<\/span><\/i>/i
    )
      ? block.match(/<p><i><span[^>]*data-contrast[^>]*>(Located[^<]*)<\/span><\/i>/i)
      : null;

    const vendor = ownerMatch ? extractOwnerVendor(ownerMatch[1]) : "State Fair of Texas vendor";
    const location = locationMatch ? extractLocation(locationMatch[1]) : undefined;

    const descMatch = block.match(
      /<p><span[^>]*data-contrast[^>]*>([^<]{40,})<\/span>/i
    );
    const description = descMatch
      ? shortDescription(descMatch[1], name)
      : undefined;

    const normKey = `${vendor.toLowerCase()}::${name.toLowerCase()}`;
    if (seen.has(normKey)) {
      skippedItems.push({ name, reason: "Duplicate within new-foods article" });
      continue;
    }
    seen.add(normKey);

    const specialtyDrink = isSpecialtyDrink(name);
    items.push({
      name,
      vendor,
      location,
      description,
      fare: inferFare(name),
      ...(specialtyDrink
        ? {
            allowBeverage: true,
            beverageCategory: /margarita|pickleback|sprite|aguasol/i.test(name)
              ? ("Alcoholic Drink" as const)
              : ("Non-Alcoholic Drink" as const)
          }
        : {})
    });
  }

  return { sourceUrl: NEW_FOODS_URL, items, skippedItems };
}
