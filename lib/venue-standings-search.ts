import type { FoodItem, Vendor } from "@/lib/sample-data";

const TOKEN_ALIASES: Record<string, readonly string[]> = {
  curds: ["curd", "cheese curd", "cheese curds"],
  curd: ["curds", "cheese curd", "cheese curds"],
  cookies: ["cookie"],
  cookie: ["cookies"],
  donuts: ["donut", "doughnut", "doughnuts", "mini donut", "mini donuts"],
  donut: ["donuts", "doughnut", "doughnuts", "mini donut", "mini donuts"],
  doughnut: ["donut", "donuts", "doughnuts"],
  doughnuts: ["donut", "donuts", "doughnut"],
  fries: ["fry", "french fries", "french fry"],
  fry: ["fries", "french fries", "french fry"]
};

/** Haystack for substring search within a venue standings row. */
export function venueItemSearchHaystack(item: FoodItem, vendor?: Vendor): string {
  const sectionBits = item.sections?.length ? item.sections.join(" ") : "";
  const parts = [
    item.name,
    item.slug.replace(/-/g, " "),
    item.category,
    item.itemType,
    ...item.tags,
    item.location,
    item.description ?? "",
    sectionBits,
    vendor?.name ?? "",
    vendor?.slug?.replace(/-/g, " ") ?? "",
    vendor?.section ?? "",
    vendor?.location ?? ""
  ];
  return parts.join(" ").toLowerCase();
}

function expandSearchHaystack(haystack: string): string {
  let extra = "";
  if (/\bcurds?\b/.test(haystack) || haystack.includes("cheese curd")) {
    extra += " cheese curds curds curd";
  }
  if (/\b(donuts?|doughnuts?)\b/.test(haystack)) {
    extra += " donut donuts doughnut doughnuts mini donut mini donuts";
  }
  if (/\bfries?\b/.test(haystack) || haystack.includes("french fries")) {
    extra += " fries fry french fries french fry";
  }
  if (/\bcookies?\b/.test(haystack)) {
    extra += " cookie cookies";
  }
  if (haystack.includes("pickle pie")) {
    extra += " pickle pizza pickle pie";
  }
  if (haystack.includes("pickle pizza")) {
    extra += " pickle pie pickle pizza";
  }
  return `${haystack}${extra}`;
}

function tokenMatchesHaystack(haystack: string, token: string): boolean {
  if (!token) return true;
  if (haystack.includes(token)) return true;
  const aliases = TOKEN_ALIASES[token];
  if (!aliases) return false;
  return aliases.some((alias) => haystack.includes(alias));
}

export function itemMatchesVenueSearch(
  item: FoodItem,
  vendor: Vendor | undefined,
  rawQuery: string
): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const haystack = expandSearchHaystack(venueItemSearchHaystack(item, vendor));
  if (haystack.includes(q)) {
    return true;
  }
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((token) => tokenMatchesHaystack(haystack, token));
}
