import { EntityStatus, type PrismaClient } from "@prisma/client";

import {
  classifyGenericFoodItem,
  type GenericFoodItemClassification
} from "@/lib/generic-food-item-classifier";

export type GenericFoodItemCleanupRow = {
  itemId: string;
  itemSlug: string;
  itemName: string;
  venueSlug: string;
  venueName: string;
  vendorName: string;
  currentStatus: EntityStatus;
  classification: GenericFoodItemClassification;
  action: "hide" | "skip-already-hidden" | "skip-not-generic";
  reviewCount: number;
};

export type GenericFoodItemCleanupResult = {
  rows: GenericFoodItemCleanupRow[];
  toHide: GenericFoodItemCleanupRow[];
  alreadyHidden: number;
  skippedNotGeneric: number;
};

export async function auditGenericFoodItems(
  prisma: PrismaClient
): Promise<GenericFoodItemCleanupResult> {
  const items = await prisma.foodItem.findMany({
    where: { status: { in: [EntityStatus.ACTIVE, EntityStatus.HIDDEN] } },
    orderBy: [{ venue: { slug: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      description: true,
      tags: true,
      vendor: { select: { name: true } },
      venue: { select: { slug: true, name: true } },
      _count: { select: { reviews: true } }
    }
  });

  const rows: GenericFoodItemCleanupRow[] = [];

  for (const item of items) {
    const classification = classifyGenericFoodItem({
      name: item.name,
      description: item.description,
      tags: item.tags,
      vendorName: item.vendor.name
    });

    let action: GenericFoodItemCleanupRow["action"] = "skip-not-generic";
    if (item.status === EntityStatus.HIDDEN) {
      action = "skip-already-hidden";
    } else if (classification.shouldHide) {
      action = "hide";
    }

    rows.push({
      itemId: item.id,
      itemSlug: item.slug,
      itemName: item.name,
      venueSlug: item.venue.slug,
      venueName: item.venue.name,
      vendorName: item.vendor.name,
      currentStatus: item.status,
      classification,
      action,
      reviewCount: item._count.reviews
    });
  }

  const toHide = rows.filter((r) => r.action === "hide");

  return {
    rows,
    toHide,
    alreadyHidden: rows.filter((r) => r.action === "skip-already-hidden").length,
    skippedNotGeneric: rows.filter((r) => r.action === "skip-not-generic").length
  };
}

export type ApplyGenericFoodItemCleanupStats = {
  hidden: number;
  skipped: number;
};

export async function applyGenericFoodItemCleanup(
  prisma: PrismaClient,
  apply: boolean
): Promise<ApplyGenericFoodItemCleanupStats> {
  const audit = await auditGenericFoodItems(prisma);
  const stats: ApplyGenericFoodItemCleanupStats = {
    hidden: 0,
    skipped: audit.skippedNotGeneric + audit.alreadyHidden
  };

  if (!apply) {
    return { hidden: audit.toHide.length, skipped: stats.skipped };
  }

  for (const row of audit.toHide) {
    await prisma.foodItem.update({
      where: { id: row.itemId },
      data: { status: EntityStatus.HIDDEN }
    });
    stats.hidden += 1;
  }

  return stats;
}
