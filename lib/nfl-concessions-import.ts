/**
 * Idempotent venue concessions import from a curated JSON payload.
 *
 * NFL payloads stay league "NFL". NBA, NHL, and shared "NBA-NHL" payloads use
 * the same matcher. Venue-scoped: never creates, updates, or deletes other
 * venues, games, or schema. Matches existing inactive rows by slug or
 * normalized name instead of duplicating. Recommended hides run only when a
 * payload sets applyRecommendedHides, and only for rows with zero public reviews.
 */

import {
  AvailabilityStatus,
  EntityStatus,
  ItemCategory,
  ItemType,
  Prisma,
  type PrismaClient
} from "@prisma/client";

import { classifyGenericFoodItem } from "./generic-food-item-classifier";
import {
  foodItemSlugFromImport,
  slugifyImportKey,
  vendorSlugFromImport
} from "./import-slugs";
import { normalizeMenuItemName } from "./venue-menu-import/normalize";
import { isGenericNonReviewableItem } from "./venue-menu-quality-audit";

const ITEM_TYPES = new Set<string>(Object.values(ItemType));
const ITEM_CATEGORIES = new Set<string>(Object.values(ItemCategory));
const ENTITY_STATUSES = new Set<string>(["ACTIVE", "HIDDEN", "ARCHIVED", "SUSPENDED"]);

const PLACEHOLDER_VENDOR_RE =
  /^(concessions|food|stadium concessions|general concessions|menu|various)$/i;

const IMPORT_LEAGUES = new Set(["NFL", "NBA", "NHL", "NBA-NHL"]);

/** Nissan (`105`, `146-P`), Lambeau (`105-M`, `P111`, `JTV`), Highmark markets (`Kaisertown`, `Bud Light Marketplace`). */
const SECTION_RE =
  /^(P?\d{2,4}(-[A-Z0-9]{1,4})?|JTV|[A-Za-z][A-Za-z0-9'&.+-]*(?:[ -][A-Za-z0-9'&.+-]+)*)$/;

const VAGUE_SECTION_RE =
  /^(various|multiple( sections?)?|n\/a|all locations|main concourse)$/i;

export type NflConcessionsConfidence = "HIGH" | "MEDIUM" | "LOW";

export type NflConcessionsVendorInput = {
  name: string;
  section: string;
  location: string;
  status: "ACTIVE";
  sourceUrl: string;
  confidence: NflConcessionsConfidence;
  existingVendorSlug?: string;
};

export type NflConcessionsItemInput = {
  name: string;
  vendorName: string;
  description: string;
  itemType: ItemType;
  category: ItemCategory;
  sections: string[];
  location: string;
  basePrice: number | null;
  status: "ACTIVE";
  sourceUrl: string;
  confidence: NflConcessionsConfidence;
  notes?: string;
  allowItemNameEqualsVendor?: boolean;
  existingItemSlug?: string;
  existingVendorSlug?: string;
  labeledNewFor2026?: boolean;
};

export type NflConcessionsExcluded = {
  kind: string;
  name: string;
  reason: string;
};

export type NflConcessionsReviewRow = {
  classification: "STALE_REVIEW" | "POSSIBLE_DUPLICATE";
  existingName: string;
  existingItemSlug?: string;
  existingVendorSlug?: string;
  recommendation: "hide" | "retain" | "manual_review";
  evidence: string;
  sourceUrl: string;
};

export type NflConcessionsPayload = {
  venueSlug: string;
  venueName: string;
  season: number;
  league: string;
  source: {
    url: string;
    title: string;
    type: string;
    retrievedAt?: string;
  };
  notes?: string;
  vendors: NflConcessionsVendorInput[];
  items: NflConcessionsItemInput[];
  excluded?: NflConcessionsExcluded[];
  staleReview?: NflConcessionsReviewRow[];
  possibleDuplicates?: NflConcessionsReviewRow[];
  /** When true, apply hides staleReview rows whose recommendation is "hide". */
  applyRecommendedHides?: boolean;
};

export type NflConcessionsRowAction =
  | "create"
  | "reactivate"
  | "update"
  | "matched"
  | "skip";

export type NflConcessionsPlanRow = {
  kind: "vendor" | "item";
  action: NflConcessionsRowAction;
  name: string;
  vendorName?: string;
  slug: string;
  reason?: string;
};

export type NflConcessionsPlan = {
  venueId: string;
  venueSlug: string;
  venueName: string;
  before: {
    activeVendors: number;
    inactiveVendors: number;
    activeItems: number;
    inactiveItems: number;
  };
  after: {
    activeVendors: number;
    inactiveVendors: number;
    activeItems: number;
    inactiveItems: number;
  };
  vendors: {
    create: number;
    reactivate: number;
    update: number;
    matched: number;
  };
  items: {
    create: number;
    reactivate: number;
    update: number;
    matched: number;
    skip: number;
    possibleDuplicate: number;
    staleReview: number;
  };
  rows: NflConcessionsPlanRow[];
  excluded: NflConcessionsExcluded[];
  staleReview: NflConcessionsReviewRow[];
  possibleDuplicates: NflConcessionsReviewRow[];
  recommendedHides: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${field}`);
  }
  return value.trim();
}

function normalizeComparableName(value: string): string {
  return normalizeMenuItemName(value);
}

function leagueTags(league: string): string[] {
  if (league === "NBA-NHL") return ["NBA", "NHL"];
  return [league];
}

function defaultItemTags(payload: NflConcessionsPayload, item: NflConcessionsItemInput): string[] {
  const tags = [
    ...leagueTags(payload.league),
    "Import",
    `import-season:${payload.season}`,
    `import-source:${payload.source.url}`,
    `import-confidence:${item.confidence}`
  ];
  if (item.labeledNewFor2026) {
    tags.push("labeled-new-2026");
  }
  return [...new Set(tags)];
}

function mergeTags(existing: string[], incoming: string[]): string[] {
  return [...new Set([...existing, ...incoming])];
}

function vendorNeedsUpdate(
  existing: { name: string; section: string; location: string; status: EntityStatus },
  incoming: NflConcessionsVendorInput
): boolean {
  return (
    existing.name !== incoming.name ||
    existing.section !== incoming.section ||
    existing.location !== incoming.location ||
    existing.status !== EntityStatus.ACTIVE
  );
}

function itemNeedsUpdate(
  existing: {
    name: string;
    location: string;
    sections: string[];
    description: string;
    status: EntityStatus;
    itemType: ItemType;
    category: ItemCategory;
    vendorName?: string;
  },
  incoming: NflConcessionsItemInput
): boolean {
  const sectionsEqual =
    existing.sections.length === incoming.sections.length &&
    existing.sections.every((section, i) => section === incoming.sections[i]);
  return (
    existing.name !== incoming.name ||
    existing.location !== incoming.location ||
    existing.description !== incoming.description ||
    existing.itemType !== incoming.itemType ||
    existing.category !== incoming.category ||
    existing.status !== EntityStatus.ACTIVE ||
    (existing.vendorName != null && existing.vendorName !== incoming.vendorName) ||
    !sectionsEqual
  );
}

function parseReviewRow(raw: unknown, index: number, field: string): NflConcessionsReviewRow {
  if (!isRecord(raw)) {
    throw new Error(`${field}[${index}] must be an object`);
  }
  const classification = asString(raw.classification, `${field}[${index}].classification`);
  if (classification !== "STALE_REVIEW" && classification !== "POSSIBLE_DUPLICATE") {
    throw new Error(`${field}[${index}].classification is invalid`);
  }
  const recommendation = asString(raw.recommendation, `${field}[${index}].recommendation`);
  if (
    recommendation !== "hide" &&
    recommendation !== "retain" &&
    recommendation !== "manual_review"
  ) {
    throw new Error(`${field}[${index}].recommendation is invalid`);
  }
  return {
    classification,
    existingName: asString(raw.existingName, `${field}[${index}].existingName`),
    existingItemSlug:
      typeof raw.existingItemSlug === "string" ? raw.existingItemSlug.trim() : undefined,
    existingVendorSlug:
      typeof raw.existingVendorSlug === "string" ? raw.existingVendorSlug.trim() : undefined,
    recommendation,
    evidence: asString(raw.evidence, `${field}[${index}].evidence`),
    sourceUrl: asString(raw.sourceUrl, `${field}[${index}].sourceUrl`)
  };
}

export function parseNflConcessionsPayload(raw: unknown): NflConcessionsPayload {
  if (!isRecord(raw)) {
    throw new Error("Payload must be a JSON object");
  }
  const sourceRaw = raw.source;
  if (!isRecord(sourceRaw)) {
    throw new Error("Payload source is required");
  }
  const vendorsRaw = raw.vendors;
  const itemsRaw = raw.items;
  if (!Array.isArray(vendorsRaw) || !Array.isArray(itemsRaw)) {
    throw new Error("Payload vendors and items must be arrays");
  }

  const payload: NflConcessionsPayload = {
    venueSlug: asString(raw.venueSlug, "venueSlug"),
    venueName: asString(raw.venueName, "venueName"),
    season: typeof raw.season === "number" ? raw.season : Number(raw.season),
    league: asString(raw.league, "league"),
    source: {
      url: asString(sourceRaw.url, "source.url"),
      title: asString(sourceRaw.title, "source.title"),
      type: asString(sourceRaw.type, "source.type"),
      retrievedAt:
        typeof sourceRaw.retrievedAt === "string" ? sourceRaw.retrievedAt : undefined
    },
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    vendors: vendorsRaw.map((vendor, index) => parseVendor(vendor, index)),
    items: itemsRaw.map((item, index) => parseItem(item, index)),
    excluded: Array.isArray(raw.excluded)
      ? raw.excluded.map((row) => {
          if (!isRecord(row)) {
            throw new Error("excluded entries must be objects");
          }
          return {
            kind: asString(row.kind, "excluded.kind"),
            name: asString(row.name, "excluded.name"),
            reason: asString(row.reason, "excluded.reason")
          };
        })
      : [],
    staleReview: Array.isArray(raw.staleReview)
      ? raw.staleReview.map((row, index) => parseReviewRow(row, index, "staleReview"))
      : [],
    possibleDuplicates: Array.isArray(raw.possibleDuplicates)
      ? raw.possibleDuplicates.map((row, index) => parseReviewRow(row, index, "possibleDuplicates"))
      : [],
    applyRecommendedHides: raw.applyRecommendedHides === true
  };

  if (!Number.isInteger(payload.season) || payload.season < 2020) {
    throw new Error("season must be an integer year");
  }
  return payload;
}

function parseVendor(raw: unknown, index: number): NflConcessionsVendorInput {
  if (!isRecord(raw)) {
    throw new Error(`vendors[${index}] must be an object`);
  }
  const status = asString(raw.status, `vendors[${index}].status`);
  if (status !== "ACTIVE") {
    throw new Error(`vendors[${index}].status must be ACTIVE`);
  }
  const confidence = asString(raw.confidence, `vendors[${index}].confidence`);
  if (confidence !== "HIGH" && confidence !== "MEDIUM" && confidence !== "LOW") {
    throw new Error(`vendors[${index}].confidence is invalid`);
  }
  return {
    name: asString(raw.name, `vendors[${index}].name`),
    section: asString(raw.section, `vendors[${index}].section`),
    location: asString(raw.location, `vendors[${index}].location`),
    status: "ACTIVE",
    sourceUrl: asString(raw.sourceUrl, `vendors[${index}].sourceUrl`),
    confidence,
    existingVendorSlug:
      typeof raw.existingVendorSlug === "string" && raw.existingVendorSlug.trim()
        ? raw.existingVendorSlug.trim()
        : undefined
  };
}

function parseItem(raw: unknown, index: number): NflConcessionsItemInput {
  if (!isRecord(raw)) {
    throw new Error(`items[${index}] must be an object`);
  }
  const itemType = asString(raw.itemType, `items[${index}].itemType`);
  const category = asString(raw.category, `items[${index}].category`);
  if (!ITEM_TYPES.has(itemType)) {
    throw new Error(`items[${index}].itemType is invalid`);
  }
  if (!ITEM_CATEGORIES.has(category)) {
    throw new Error(`items[${index}].category is invalid`);
  }
  if (!Array.isArray(raw.sections) || raw.sections.some((s) => typeof s !== "string")) {
    throw new Error(`items[${index}].sections must be a string array`);
  }
  const status = asString(raw.status, `items[${index}].status`);
  if (!ENTITY_STATUSES.has(status) || status !== "ACTIVE") {
    throw new Error(`items[${index}].status must be ACTIVE`);
  }
  const confidence = asString(raw.confidence, `items[${index}].confidence`);
  if (confidence !== "HIGH" && confidence !== "MEDIUM" && confidence !== "LOW") {
    throw new Error(`items[${index}].confidence is invalid`);
  }
  const basePrice = raw.basePrice;
  if (basePrice != null && (typeof basePrice !== "number" || !Number.isFinite(basePrice) || basePrice < 0)) {
    throw new Error(`items[${index}].basePrice must be a non-negative number or null`);
  }
  return {
    name: asString(raw.name, `items[${index}].name`),
    vendorName: asString(raw.vendorName, `items[${index}].vendorName`),
    description: asString(raw.description, `items[${index}].description`),
    itemType: itemType as ItemType,
    category: category as ItemCategory,
    sections: (raw.sections as string[]).map((s) => s.trim()).filter(Boolean),
    location: asString(raw.location, `items[${index}].location`),
    basePrice: typeof basePrice === "number" ? basePrice : null,
    status: "ACTIVE",
    sourceUrl: asString(raw.sourceUrl, `items[${index}].sourceUrl`),
    confidence,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    allowItemNameEqualsVendor: raw.allowItemNameEqualsVendor === true,
    existingItemSlug:
      typeof raw.existingItemSlug === "string" && raw.existingItemSlug.trim()
        ? raw.existingItemSlug.trim()
        : undefined,
    existingVendorSlug:
      typeof raw.existingVendorSlug === "string" && raw.existingVendorSlug.trim()
        ? raw.existingVendorSlug.trim()
        : undefined,
    labeledNewFor2026: raw.labeledNewFor2026 === true
  };
}

export function qualityErrorsForPayload(payload: NflConcessionsPayload): string[] {
  const errors: string[] = [];
  const vendorNames = new Set<string>();
  const vendorByNorm = new Map<string, string>();

  if (!IMPORT_LEAGUES.has(payload.league)) {
    errors.push("league must be NFL, NBA, NHL, or NBA-NHL");
  }

  for (const vendor of payload.vendors) {
    if (PLACEHOLDER_VENDOR_RE.test(vendor.name)) {
      errors.push(`Placeholder vendor name: ${vendor.name}`);
    }
    if (vendor.confidence !== "HIGH") {
      errors.push(`Vendor ${vendor.name} is not HIGH confidence`);
    }
    const norm = normalizeComparableName(vendor.name);
    if (vendorByNorm.has(norm)) {
      errors.push(`Duplicate vendor name: ${vendor.name}`);
    }
    vendorByNorm.set(norm, vendor.name);
    vendorNames.add(vendor.name);
    if (vendorSlugFromImport(vendor.name) === "unknown") {
      errors.push(`Vendor slug failed: ${vendor.name}`);
    }
  }

  const seenItemKeys = new Set<string>();
  for (const item of payload.items) {
    if (item.confidence !== "HIGH") {
      errors.push(`Item ${item.name} is not HIGH confidence`);
    }
    if (!vendorNames.has(item.vendorName)) {
      errors.push(`Item "${item.name}" has unknown vendor "${item.vendorName}"`);
    }
    const namesMatch =
      normalizeComparableName(item.name) === normalizeComparableName(item.vendorName);
    if (namesMatch && !item.allowItemNameEqualsVendor) {
      errors.push(`Item name equals vendor name without allow flag: ${item.name}`);
    }
    const itemKey = `${normalizeComparableName(item.vendorName)}::${normalizeComparableName(item.name)}`;
    if (seenItemKeys.has(itemKey)) {
      errors.push(`Duplicate item under vendor ${item.vendorName}: ${item.name}`);
    }
    seenItemKeys.add(itemKey);
    if (item.sections.length === 0) {
      errors.push(`Item ${item.name} is missing sections`);
    }
    for (const section of item.sections) {
      if (VAGUE_SECTION_RE.test(section) || !SECTION_RE.test(section)) {
        errors.push(`Implausible section "${section}" on ${item.name}`);
      }
    }
    if (item.basePrice != null && (item.basePrice <= 0 || item.basePrice > 200)) {
      errors.push(`Price out of range on ${item.name}`);
    }
    if (/^(food|concessions|menu|various|n\/a)$/i.test(item.name)) {
      errors.push(`Placeholder item name: ${item.name}`);
    }
    if (
      /^(coke|coke zero|diet coke|sprite|mr pibb|bottled water|fountain soda|non-alcoholic beverages|titanspay)$/i.test(
        item.name
      )
    ) {
      errors.push(`Generic filler item: ${item.name}`);
    }
    const generic = classifyGenericFoodItem({
      name: item.name,
      description: item.description,
      vendorName: item.vendorName
    });
    if (generic.shouldHide && !item.allowItemNameEqualsVendor) {
      errors.push(`Generic item would be hidden (${generic.reason}): ${item.name}`);
    }
    if (
      isGenericNonReviewableItem(item.name, item.vendorName) &&
      !item.allowItemNameEqualsVendor
    ) {
      errors.push(`Non-reviewable generic item: ${item.name} / ${item.vendorName}`);
    }
  }

  return errors;
}

type HideDb = PrismaClient | Prisma.TransactionClient;

async function recommendedHideIds(db: HideDb, venueId: string, payload: NflConcessionsPayload): Promise<string[]> {
  if (!payload.applyRecommendedHides) return [];
  const rows = (payload.staleReview ?? []).filter((row) => row.recommendation === "hide");
  const ids: string[] = [];
  for (const row of rows) {
    if (!row.existingItemSlug) {
      throw new Error(`Hide recommendation for "${row.existingName}" is missing existingItemSlug`);
    }
    const item = await db.foodItem.findFirst({
      where: { venueId, slug: row.existingItemSlug },
      select: {
        id: true,
        name: true,
        status: true,
        reviews: {
          where: { status: EntityStatus.ACTIVE, isTestReview: false },
          select: { id: true }
        }
      }
    });
    if (!item) {
      throw new Error(`Hide target not found at this venue: ${row.existingItemSlug}`);
    }
    if (item.name !== row.existingName) {
      throw new Error(
        `Hide target ${row.existingItemSlug} is named "${item.name}", not "${row.existingName}"`
      );
    }
    if (item.reviews.length > 0) {
      throw new Error(`Refusing to hide ${row.existingItemSlug}: public reviews exist`);
    }
    if (item.status === EntityStatus.HIDDEN) continue;
    if (item.status !== EntityStatus.ACTIVE) {
      throw new Error(`Refusing to hide ${row.existingItemSlug}: status is ${item.status}`);
    }
    ids.push(item.id);
  }
  return ids;
}

function countByStatus<T extends { status: EntityStatus }>(
  rows: T[]
): { active: number; inactive: number } {
  let active = 0;
  let inactive = 0;
  for (const row of rows) {
    if (row.status === EntityStatus.ACTIVE) active += 1;
    else inactive += 1;
  }
  return { active, inactive };
}

export async function planNflConcessionsImport(
  db: PrismaClient,
  payload: NflConcessionsPayload,
  venueSlug: string
): Promise<NflConcessionsPlan> {
  if (venueSlug !== payload.venueSlug) {
    throw new Error(
      `--venue ${venueSlug} does not match payload venueSlug ${payload.venueSlug}`
    );
  }

  const qualityErrors = qualityErrorsForPayload(payload);
  if (qualityErrors.length > 0) {
    throw new Error(`Quality checks failed:\n- ${qualityErrors.join("\n- ")}`);
  }

  const venue = await db.venue.findFirst({
    where: { slug: venueSlug, status: EntityStatus.ACTIVE },
    select: { id: true, slug: true, name: true }
  });
  if (!venue) {
    throw new Error(`Venue "${venueSlug}" not found or inactive`);
  }

  const [existingVendors, existingItems] = await Promise.all([
    db.vendor.findMany({
      where: { venueId: venue.id },
      select: { id: true, slug: true, name: true, section: true, location: true, status: true }
    }),
    db.foodItem.findMany({
      where: { venueId: venue.id },
      select: {
        id: true,
        slug: true,
        name: true,
        vendorId: true,
        location: true,
        sections: true,
        description: true,
        status: true,
        itemType: true,
        category: true,
        tags: true,
        vendor: { select: { id: true, slug: true, name: true } }
      }
    })
  ]);

  const vendorBySlug = new Map(existingVendors.map((v) => [v.slug, v]));
  const vendorByNorm = new Map(
    existingVendors.map((v) => [normalizeComparableName(v.name), v])
  );
  const itemBySlug = new Map(existingItems.map((item) => [item.slug, item]));
  const plannedVendorByName = new Map<string, { slug: string }>();

  const rows: NflConcessionsPlanRow[] = [];
  const vendorCounts = { create: 0, reactivate: 0, update: 0, matched: 0 };
  const itemCounts = {
    create: 0,
    reactivate: 0,
    update: 0,
    matched: 0,
    skip: (payload.excluded ?? []).length,
    possibleDuplicate: (payload.possibleDuplicates ?? []).length,
    staleReview: (payload.staleReview ?? []).length
  };

  const resolvedVendorStatus = new Map<string, EntityStatus>();
  for (const vendor of existingVendors) {
    resolvedVendorStatus.set(vendor.slug, vendor.status);
  }

  for (const vendor of payload.vendors) {
    const slug = vendorSlugFromImport(vendor.name);
    const existing =
      (vendor.existingVendorSlug ? vendorBySlug.get(vendor.existingVendorSlug) : undefined) ??
      vendorBySlug.get(slug) ??
      vendorByNorm.get(normalizeComparableName(vendor.name));
    if (!existing) {
      vendorCounts.create += 1;
      resolvedVendorStatus.set(slug, EntityStatus.ACTIVE);
      plannedVendorByName.set(normalizeComparableName(vendor.name), { slug });
      rows.push({ kind: "vendor", action: "create", name: vendor.name, slug });
      continue;
    }
    plannedVendorByName.set(normalizeComparableName(vendor.name), { slug: existing.slug });
    if (existing.status !== EntityStatus.ACTIVE) {
      vendorCounts.reactivate += 1;
      resolvedVendorStatus.set(existing.slug, EntityStatus.ACTIVE);
      rows.push({
        kind: "vendor",
        action: "reactivate",
        name: vendor.name,
        slug: existing.slug,
        reason: `was ${existing.status}`
      });
      continue;
    }
    if (vendorNeedsUpdate(existing, vendor)) {
      vendorCounts.update += 1;
      rows.push({
        kind: "vendor",
        action: "update",
        name: vendor.name,
        slug: existing.slug,
        reason: "section/location/name"
      });
    } else {
      vendorCounts.matched += 1;
      rows.push({ kind: "vendor", action: "matched", name: vendor.name, slug: existing.slug });
    }
  }

  for (const item of payload.items) {
    const plannedVendor = plannedVendorByName.get(normalizeComparableName(item.vendorName));
    const vendorSlug =
      plannedVendor?.slug ??
      (item.existingVendorSlug
        ? vendorBySlug.get(item.existingVendorSlug)?.slug
        : undefined) ??
      vendorSlugFromImport(item.vendorName);
    const computedSlug = foodItemSlugFromImport(item.name, vendorSlug);
    const existingVendor =
      (item.existingVendorSlug ? vendorBySlug.get(item.existingVendorSlug) : undefined) ??
      vendorBySlug.get(vendorSlug) ??
      vendorByNorm.get(normalizeComparableName(item.vendorName));
    const existing =
      (item.existingItemSlug ? itemBySlug.get(item.existingItemSlug) : undefined) ??
      itemBySlug.get(computedSlug) ??
      existingItems.find(
        (row) =>
          row.vendorId === existingVendor?.id &&
          normalizeComparableName(row.name) === normalizeComparableName(item.name)
      );

    if (!existing) {
      itemCounts.create += 1;
      rows.push({
        kind: "item",
        action: "create",
        name: item.name,
        vendorName: item.vendorName,
        slug: computedSlug
      });
      continue;
    }
    if (existing.status !== EntityStatus.ACTIVE) {
      itemCounts.reactivate += 1;
      rows.push({
        kind: "item",
        action: "reactivate",
        name: item.name,
        vendorName: item.vendorName,
        slug: existing.slug,
        reason: `was ${existing.status}`
      });
      continue;
    }
    if (
      itemNeedsUpdate(
        { ...existing, vendorName: existing.vendor.name },
        item
      )
    ) {
      itemCounts.update += 1;
      rows.push({
        kind: "item",
        action: "update",
        name: item.name,
        vendorName: item.vendorName,
        slug: existing.slug
      });
    } else {
      itemCounts.matched += 1;
      rows.push({
        kind: "item",
        action: "matched",
        name: item.name,
        vendorName: item.vendorName,
        slug: existing.slug
      });
    }
  }

  const beforeVendors = countByStatus(existingVendors);
  const beforeItems = countByStatus(existingItems);
  const hideIds = await recommendedHideIds(db, venue.id, payload);

  const afterActiveVendors =
    beforeVendors.active + vendorCounts.create + vendorCounts.reactivate;
  const afterInactiveVendors = Math.max(0, beforeVendors.inactive - vendorCounts.reactivate);
  const afterActiveItems =
    beforeItems.active + itemCounts.create + itemCounts.reactivate - hideIds.length;
  const afterInactiveItems =
    Math.max(0, beforeItems.inactive - itemCounts.reactivate) + hideIds.length;

  return {
    venueId: venue.id,
    venueSlug: venue.slug,
    venueName: venue.name,
    before: {
      activeVendors: beforeVendors.active,
      inactiveVendors: beforeVendors.inactive,
      activeItems: beforeItems.active,
      inactiveItems: beforeItems.inactive
    },
    after: {
      activeVendors: afterActiveVendors,
      inactiveVendors: afterInactiveVendors,
      activeItems: afterActiveItems,
      inactiveItems: afterInactiveItems
    },
    vendors: vendorCounts,
    items: itemCounts,
    rows,
    excluded: payload.excluded ?? [],
    staleReview: payload.staleReview ?? [],
    possibleDuplicates: payload.possibleDuplicates ?? [],
    recommendedHides: hideIds.length
  };
}

export async function applyNflConcessionsImport(
  db: PrismaClient,
  payload: NflConcessionsPayload,
  venueSlug: string
): Promise<NflConcessionsPlan> {
  const plan = await planNflConcessionsImport(db, payload, venueSlug);

  await db.$transaction(
    async (tx) => {
    const venue = await tx.venue.findFirstOrThrow({
      where: { id: plan.venueId },
      select: { id: true, slug: true }
    });
    if (venue.slug !== venueSlug) {
      throw new Error("Venue slug mismatch inside transaction");
    }

    const otherVendorCountBefore = await tx.vendor.count({
      where: { venueId: { not: venue.id } }
    });
    const otherItemCountBefore = await tx.foodItem.count({
      where: { venueId: { not: venue.id } }
    });

    const vendorIdByKey = new Map<string, string>();
    const vendorSlugById = new Map<string, string>();
    const existingVendors = await tx.vendor.findMany({
      where: { venueId: venue.id },
      select: { id: true, slug: true, name: true }
    });
    for (const vendor of existingVendors) {
      vendorIdByKey.set(vendor.slug, vendor.id);
      vendorIdByKey.set(normalizeComparableName(vendor.name), vendor.id);
      vendorSlugById.set(vendor.id, vendor.slug);
    }

    for (const vendor of payload.vendors) {
      const computedSlug = vendorSlugFromImport(vendor.name);
      const existingId =
        (vendor.existingVendorSlug ? vendorIdByKey.get(vendor.existingVendorSlug) : undefined) ??
        vendorIdByKey.get(computedSlug) ??
        vendorIdByKey.get(normalizeComparableName(vendor.name));
      if (existingId) {
        const existingSlug = vendorSlugById.get(existingId) ?? computedSlug;
        await tx.vendor.update({
          where: { id: existingId },
          data: {
            name: vendor.name,
            section: vendor.section,
            location: vendor.location,
            status: EntityStatus.ACTIVE
          }
        });
        vendorIdByKey.set(existingSlug, existingId);
        vendorIdByKey.set(computedSlug, existingId);
        vendorIdByKey.set(normalizeComparableName(vendor.name), existingId);
        vendorSlugById.set(existingId, existingSlug);
      } else {
        const created = await tx.vendor.create({
          data: {
            venueId: venue.id,
            slug: computedSlug,
            name: vendor.name,
            section: vendor.section,
            location: vendor.location,
            status: EntityStatus.ACTIVE
          }
        });
        vendorIdByKey.set(computedSlug, created.id);
        vendorIdByKey.set(normalizeComparableName(vendor.name), created.id);
        vendorSlugById.set(created.id, computedSlug);
      }
    }

    for (const item of payload.items) {
      const vendorId =
        (item.existingVendorSlug ? vendorIdByKey.get(item.existingVendorSlug) : undefined) ??
        vendorIdByKey.get(vendorSlugFromImport(item.vendorName)) ??
        vendorIdByKey.get(normalizeComparableName(item.vendorName));
      if (!vendorId) {
        throw new Error(`Missing vendor id for ${item.vendorName}`);
      }
      const vendorSlug = vendorSlugById.get(vendorId) ?? vendorSlugFromImport(item.vendorName);
      const computedSlug = foodItemSlugFromImport(item.name, vendorSlug);
      const existing = await tx.foodItem.findFirst({
        where: {
          venueId: venue.id,
          OR: [
            ...(item.existingItemSlug ? [{ slug: item.existingItemSlug }] : []),
            { slug: computedSlug },
            {
              vendorId,
              name: { equals: item.name, mode: "insensitive" }
            }
          ]
        },
        select: { id: true, tags: true, basePrice: true, slug: true }
      });

      const tags = mergeTags(existing?.tags ?? [], defaultItemTags(payload, item));
      const alcoholic = item.itemType === ItemType.ALCOHOLIC_DRINK;
      const data = {
        slug: existing?.slug ?? computedSlug,
        name: item.name,
        venueId: venue.id,
        vendorId,
        itemType: item.itemType,
        category: item.category,
        alcoholic,
        ageRestricted: alcoholic,
        location: item.location,
        sections: item.sections,
        description: item.description,
        basePrice:
          item.basePrice != null
            ? new Prisma.Decimal(item.basePrice)
            : existing?.basePrice ?? null,
        tags,
        isNewThisSeason: item.labeledNewFor2026 === true,
        lastConfirmed: payload.source.retrievedAt ?? "2026 official directory",
        availabilityStatus: AvailabilityStatus.VENUE_VERIFIED,
        status: EntityStatus.ACTIVE
      };

      if (existing) {
        await tx.foodItem.update({
          where: { id: existing.id },
          data
        });
      } else {
        await tx.foodItem.create({ data });
      }
    }

    const hideIds = await recommendedHideIds(tx, venue.id, payload);
    for (const id of hideIds) {
      const current = await tx.foodItem.findFirstOrThrow({
        where: { id, venueId: venue.id },
        select: { tags: true }
      });
      await tx.foodItem.update({
        where: { id },
        data: {
          status: EntityStatus.HIDDEN,
          tags: [...new Set([...current.tags, "hidden-stale-2026"])]
        }
      });
    }

    const otherVendorCountAfter = await tx.vendor.count({
      where: { venueId: { not: venue.id } }
    });
    const otherItemCountAfter = await tx.foodItem.count({
      where: { venueId: { not: venue.id } }
    });
    if (
      otherVendorCountBefore !== otherVendorCountAfter ||
      otherItemCountBefore !== otherItemCountAfter
    ) {
      throw new Error("Import attempted to change another venue; aborting");
    }
  },
    { maxWait: 15_000, timeout: 120_000 }
  );

  return plan;
}

export function defaultNflConcessionsFile(venueSlug: string): string {
  return `data/nfl/2026-concessions/${slugifyImportKey(venueSlug)}.json`;
}
