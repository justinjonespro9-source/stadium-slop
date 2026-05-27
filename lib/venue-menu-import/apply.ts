import { Prisma, type ItemType, type ItemCategory, type PrismaClient } from "@prisma/client";
import {
  normalizeMenuItemName,
  slugifyMenuItemName,
  fuzzyMenuNameMatch,
  buildFoodItemTags,
  inferItemType
} from "./normalize";
import type {
  VenueMenuImportRow,
  VenueMenuImportSummary,
  VenueMenuParseResult,
  VenueMenuSourceItem
} from "./types";

function mapItemType(source: VenueMenuSourceItem): ItemType {
  const t = inferItemType(source.category, source.fare);
  if (t === "Alcoholic Drink") return "ALCOHOLIC_DRINK";
  if (t === "Non-Alcoholic Drink") return "NON_ALCOHOLIC_DRINK";
  return "FOOD";
}

function mapItemCategory(source: VenueMenuSourceItem): ItemCategory {
  if (source.fare === "Desserts") return "SWEET";
  if (source.fare === "Snacks") return "SNACK";
  if (source.category === "Alcoholic Drink") return "ALCOHOLIC_BEVERAGE";
  if (source.category === "Non-Alcoholic Drink") return "BEVERAGE";
  return "SAVORY";
}

function vendorSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugFilterInsensitive(slug: string) {
  return { equals: slug, mode: "insensitive" as const };
}

/** Import CLI slugs that map to an existing venue row slug in the DB. */
const VENUE_MENU_IMPORT_SLUG_ALIASES: Record<string, string> = {
  /** FC Dallas at Toyota Stadium (Frisco TX) — not Colorado Rapids. */
  "toyota-stadium-frisco": "toyota-stadium",
  /** Inter&Co Stadium — CLI slug without hyphen matches DB `inter-co-stadium`. */
  "interco-stadium": "inter-co-stadium",
  /** AT&T Stadium — common alternate slugs (NFL import auto-slug is at-t-stadium). */
  "at&t-stadium": "att-stadium",
  "at-t-stadium": "att-stadium",
  "cowboys-stadium": "att-stadium",
  /** GEHA Field — importer CLI slug; NFL import created `geha-field-at-arrowhead-stadium`. */
  "arrowhead-stadium": "geha-field-at-arrowhead-stadium",
  "arrowhead": "geha-field-at-arrowhead-stadium",
  /** SoFi Stadium / Hollywood Park dining guide aliases. */
  "so-fi-stadium": "sofi-stadium",
  "hollywood-park": "sofi-stadium",
  "hollywood-park-stadium": "sofi-stadium"
};

function resolveVenueMenuImportSlug(venueSlug: string): string {
  return VENUE_MENU_IMPORT_SLUG_ALIASES[venueSlug.toLowerCase()] ?? venueSlug;
}

export async function applyVenueMenuImport(
  db: PrismaClient,
  parseResult: VenueMenuParseResult,
  options: { dryRun: boolean }
): Promise<VenueMenuImportSummary> {
  const { venueSlug, venueName, sourceUrl, items } = parseResult;
  const { dryRun } = options;
  const dbVenueSlug = resolveVenueMenuImportSlug(venueSlug);

  const venue = await db.venue.findFirst({
    where: { slug: slugFilterInsensitive(dbVenueSlug), status: "ACTIVE" },
    select: { id: true, name: true }
  });

  if (!venue) {
    throw new Error(
      `Venue "${venueSlug}"${dbVenueSlug !== venueSlug ? ` (resolved to "${dbVenueSlug}")` : ""} not found or inactive`
    );
  }

  const existingItems = await db.foodItem.findMany({
    where: { venueId: venue.id },
    select: { id: true, slug: true, name: true, vendorId: true, status: true }
  });

  const existingVendors = await db.vendor.findMany({
    where: { venueId: venue.id },
    select: { id: true, slug: true, name: true }
  });

  const activeItems = existingItems.filter((item) => item.status === "ACTIVE");
  const existingByNormName = new Map(
    activeItems.map((item) => [normalizeMenuItemName(item.name), item])
  );
  const existingBySlug = new Map(
    activeItems.map((item) => [item.slug.toLowerCase(), item])
  );
  const vendorBySlug = new Map(
    existingVendors.map((v) => [v.slug.toLowerCase(), v])
  );

  const rows: VenueMenuImportRow[] = [];
  let added = 0;
  let matched = 0;
  let skipped = 0;
  let duplicates = 0;

  const seenNormNames = new Set<string>();

  for (const sourceItem of items) {
    const normName = normalizeMenuItemName(sourceItem.name);
    const slug = slugifyMenuItemName(sourceItem.name);

    if (seenNormNames.has(normName)) {
      rows.push({
        action: "duplicate",
        name: sourceItem.name,
        normalizedName: normName,
        reason: "Duplicate within import batch",
        vendorName: sourceItem.vendorName
      });
      duplicates++;
      continue;
    }
    seenNormNames.add(normName);

    const existingByName = existingByNormName.get(normName);
    if (existingByName) {
      rows.push({
        action: "matched",
        name: sourceItem.name,
        normalizedName: normName,
        existingSlug: existingByName.slug,
        vendorName: sourceItem.vendorName
      });
      matched++;
      continue;
    }

    const existingSlugMatch = existingBySlug.get(slug);
    if (existingSlugMatch) {
      rows.push({
        action: "matched",
        name: sourceItem.name,
        normalizedName: normName,
        existingSlug: existingSlugMatch.slug,
        reason: "Slug collision with existing item",
        vendorName: sourceItem.vendorName
      });
      matched++;
      continue;
    }

    const fuzzyMatch = activeItems.find((item) =>
      fuzzyMenuNameMatch(item.name, sourceItem.name)
    );
    if (fuzzyMatch) {
      rows.push({
        action: "duplicate",
        name: sourceItem.name,
        normalizedName: normName,
        existingSlug: fuzzyMatch.slug,
        reason: `Fuzzy match: "${fuzzyMatch.name}"`,
        vendorName: sourceItem.vendorName
      });
      duplicates++;
      continue;
    }

    let vendorId: string | null = null;
    if (sourceItem.vendorName) {
      const vSlug = vendorSlugFromName(sourceItem.vendorName);
      const existing = vendorBySlug.get(vSlug);
      if (existing) {
        vendorId = existing.id;
      } else if (!dryRun) {
        const created = await db.vendor.create({
          data: {
            slug: vSlug,
            name: sourceItem.vendorName,
            venueId: venue.id,
            section: sourceItem.vendorLocationHint ?? "",
            location: sourceItem.vendorLocationHint ?? ""
          }
        });
        vendorId = created.id;
        vendorBySlug.set(vSlug, { id: created.id, slug: vSlug, name: sourceItem.vendorName });
      }
    }

    if (!vendorId && !dryRun) {
      const generalSlug = "general-concessions";
      let general = vendorBySlug.get(generalSlug);
      if (!general) {
        const created = await db.vendor.create({
          data: {
            slug: generalSlug,
            name: "General Concessions",
            venueId: venue.id,
            section: "",
            location: ""
          }
        });
        general = { id: created.id, slug: generalSlug, name: "General Concessions" };
        vendorBySlug.set(generalSlug, general);
      }
      vendorId = general.id;
    }

    if (!dryRun && vendorId) {
      const tags = buildFoodItemTags(sourceItem.fare, sourceItem.dietaryTags);
      await db.foodItem.create({
        data: {
          slug,
          name: sourceItem.name,
          venueId: venue.id,
          vendorId,
          itemType: mapItemType(sourceItem),
          category: mapItemCategory(sourceItem),
          location: sourceItem.vendorLocationHint ?? "",
          description: sourceItem.description ?? "",
          basePrice: sourceItem.price
            ? new Prisma.Decimal(sourceItem.price)
            : null,
          tags,
          isNewThisSeason: true,
          seasonIntroduced: String(new Date().getFullYear())
        }
      });

      existingBySlug.set(slug, {
        id: "new",
        slug,
        name: sourceItem.name,
        vendorId,
        status: "ACTIVE"
      });
      existingByNormName.set(normName, {
        id: "new",
        slug,
        name: sourceItem.name,
        vendorId,
        status: "ACTIVE"
      });
    }

    rows.push({
      action: "added",
      name: sourceItem.name,
      normalizedName: normName,
      vendorName: sourceItem.vendorName
    });
    added++;
  }

  return {
    venueSlug,
    venueName: venue.name ?? venueName,
    dryRun,
    rows,
    added,
    matched,
    skipped,
    duplicates,
    sourceUrl
  };
}
