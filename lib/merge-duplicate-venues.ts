import type { PrismaClient } from "@prisma/client";

import {
  KNOWN_DUPLICATE_GROUPS,
  mergeUniqueStrings
} from "@/lib/venue-cleanup";
import { resolveVenueTeams } from "@/lib/venue-teams";

export type MergePair = {
  label: string;
  aliasSlug: string;
  canonicalSlug: string;
};

export const DEFAULT_MERGE_PAIRS: MergePair[] = KNOWN_DUPLICATE_GROUPS.flatMap(
  (group) =>
    group.aliasSlugs.map((aliasSlug) => ({
      label: group.label,
      aliasSlug,
      canonicalSlug: group.canonicalSlug
    }))
);

export type VenueChildCounts = {
  vendors: number;
  items: number;
  photos: number;
  reviews: number;
  priceReports: number;
  suggestedItems: number;
  games: number;
  homeUsers: number;
};

export type ModelMoveCounts = {
  vendorsMoved: number;
  vendorsMerged: number;
  itemsMoved: number;
  itemsMerged: number;
  photosMoved: number;
  reviewsMoved: number;
  priceReportsMoved: number;
  suggestedItemsMoved: number;
  gamesMoved: number;
  homeUsersMoved: number;
};

export type MergeConflict = {
  kind: "vendor" | "item";
  slug: string;
  message: string;
};

export type MergePairResult = {
  pair: MergePair;
  aliasId: string;
  canonicalId: string;
  before: { alias: VenueChildCounts; canonical: VenueChildCounts };
  moved: ModelMoveCounts;
  conflicts: MergeConflict[];
  aliasDeleted: boolean;
  aliasRemaining: VenueChildCounts | null;
  error?: string;
};

export function formatChildCounts(counts: VenueChildCounts): string {
  const parts = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k}=${n}`);
  return parts.length > 0 ? parts.join(", ") : "empty";
}

function emptyMoves(): ModelMoveCounts {
  return {
    vendorsMoved: 0,
    vendorsMerged: 0,
    itemsMoved: 0,
    itemsMerged: 0,
    photosMoved: 0,
    reviewsMoved: 0,
    priceReportsMoved: 0,
    suggestedItemsMoved: 0,
    gamesMoved: 0,
    homeUsersMoved: 0
  };
}

async function countVenueChildren(
  prisma: PrismaClient,
  venueId: string
): Promise<VenueChildCounts> {
  const counts = await prisma.venue.findUnique({
    where: { id: venueId },
    select: {
      _count: {
        select: {
          vendors: true,
          items: true,
          photos: true,
          reviews: true,
          priceReports: true,
          suggestedItems: true,
          games: true,
          homeUsers: true
        }
      }
    }
  });
  return (
    counts?._count ?? {
      vendors: 0,
      items: 0,
      photos: 0,
      reviews: 0,
      priceReports: 0,
      suggestedItems: 0,
      games: 0,
      homeUsers: 0
    }
  );
}

function isVenueEmpty(counts: VenueChildCounts): boolean {
  return Object.values(counts).every((n) => n === 0);
}

export async function mergeVenuePair(
  prisma: PrismaClient,
  pair: MergePair,
  apply: boolean
): Promise<MergePairResult> {
  const moved = emptyMoves();
  const conflicts: MergeConflict[] = [];

  const alias = await prisma.venue.findUnique({
    where: { slug: pair.aliasSlug }
  });
  const canonical = await prisma.venue.findUnique({
    where: { slug: pair.canonicalSlug }
  });

  if (!alias || !canonical) {
    return {
      pair,
      aliasId: alias?.id ?? "",
      canonicalId: canonical?.id ?? "",
      before: {
        alias: alias ? await countVenueChildren(prisma, alias.id) : emptyMoves(),
        canonical: canonical
          ? await countVenueChildren(prisma, canonical.id)
          : emptyMoves()
      },
      moved,
      conflicts,
      aliasDeleted: false,
      aliasRemaining: null,
      error: !alias
        ? `Alias venue not found: ${pair.aliasSlug}`
        : `Canonical venue not found: ${pair.canonicalSlug}`
    };
  }

  if (alias.id === canonical.id) {
    return {
      pair,
      aliasId: alias.id,
      canonicalId: canonical.id,
      before: {
        alias: await countVenueChildren(prisma, alias.id),
        canonical: await countVenueChildren(prisma, canonical.id)
      },
      moved,
      conflicts,
      aliasDeleted: false,
      aliasRemaining: await countVenueChildren(prisma, alias.id),
      error: "Alias and canonical are the same row"
    };
  }

  const before = {
    alias: await countVenueChildren(prisma, alias.id),
    canonical: await countVenueChildren(prisma, canonical.id)
  };

  const [aliasVendors, canonicalVendors, aliasItems] = await Promise.all([
    prisma.vendor.findMany({
      where: { venueId: alias.id },
      select: { id: true, slug: true }
    }),
    prisma.vendor.findMany({
      where: { venueId: canonical.id },
      select: { id: true, slug: true }
    }),
    prisma.foodItem.findMany({
      where: { venueId: alias.id },
      select: { id: true, slug: true, vendorId: true }
    })
  ]);

  const canonicalVendorBySlug = new Map(
    canonicalVendors.map((v) => [v.slug, v.id])
  );
  const canonicalItemBySlug = new Map(
    (
      await prisma.foodItem.findMany({
        where: { venueId: canonical.id },
        select: { id: true, slug: true }
      })
    ).map((i) => [i.slug, i.id])
  );

  const vendorIdMap = new Map<string, string>();
  const vendorsToMove: string[] = [];

  for (const vendor of aliasVendors) {
    const existing = canonicalVendorBySlug.get(vendor.slug);
    if (existing) {
      vendorIdMap.set(vendor.id, existing);
      moved.vendorsMerged += 1;
      conflicts.push({
        kind: "vendor",
        slug: vendor.slug,
        message: `Vendor slug already on canonical — items will use canonical vendor ${existing}`
      });
    } else {
      vendorsToMove.push(vendor.id);
    }
  }

  const itemIdMap = new Map<string, string>();
  const itemsToMove: Array<{ id: string; vendorId: string; slug: string }> = [];

  for (const item of aliasItems) {
    const targetVendorId = vendorIdMap.get(item.vendorId) ?? item.vendorId;
    const existingItemId = canonicalItemBySlug.get(item.slug);

    if (existingItemId) {
      itemIdMap.set(item.id, existingItemId);
      moved.itemsMerged += 1;
      conflicts.push({
        kind: "item",
        slug: item.slug,
        message: `Item slug already on canonical — reviews/photos will re-point to canonical item ${existingItemId}`
      });
    } else {
      itemsToMove.push({ id: item.id, vendorId: targetVendorId, slug: item.slug });
    }
  }

  const execute = async (tx: PrismaClient) => {
    if (vendorsToMove.length > 0) {
      const result = await tx.vendor.updateMany({
        where: { id: { in: vendorsToMove } },
        data: { venueId: canonical.id }
      });
      moved.vendorsMoved += result.count;
    }

    for (const item of itemsToMove) {
      await tx.foodItem.update({
        where: { id: item.id },
        data: { venueId: canonical.id, vendorId: item.vendorId }
      });
      moved.itemsMoved += 1;
    }

    for (const [aliasItemId, canonicalItemId] of itemIdMap) {
      const reviewResult = await tx.review.updateMany({
        where: { foodItemId: aliasItemId },
        data: { foodItemId: canonicalItemId, venueId: canonical.id }
      });
      moved.reviewsMoved += reviewResult.count;

      const photoResult = await tx.foodPhoto.updateMany({
        where: { foodItemId: aliasItemId },
        data: { foodItemId: canonicalItemId, venueId: canonical.id }
      });
      moved.photosMoved += photoResult.count;

      const priceResult = await tx.priceReport.updateMany({
        where: { foodItemId: aliasItemId },
        data: { foodItemId: canonicalItemId, venueId: canonical.id }
      });
      moved.priceReportsMoved += priceResult.count;

      await tx.foodItem.delete({ where: { id: aliasItemId } });
    }

    const reviewVenueResult = await tx.review.updateMany({
      where: { venueId: alias.id },
      data: { venueId: canonical.id }
    });
    moved.reviewsMoved += reviewVenueResult.count;

    const photoVenueResult = await tx.foodPhoto.updateMany({
      where: { venueId: alias.id },
      data: { venueId: canonical.id }
    });
    moved.photosMoved += photoVenueResult.count;

    const priceVenueResult = await tx.priceReport.updateMany({
      where: { venueId: alias.id },
      data: { venueId: canonical.id }
    });
    moved.priceReportsMoved += priceVenueResult.count;

    const suggestedResult = await tx.suggestedItem.updateMany({
      where: { venueId: alias.id },
      data: { venueId: canonical.id }
    });
    moved.suggestedItemsMoved += suggestedResult.count;

    for (const item of itemsToMove) {
      const mappedVendor = vendorIdMap.get(item.vendorId);
      if (mappedVendor) {
        await tx.suggestedItem.updateMany({
          where: { vendorId: item.vendorId, venueId: canonical.id },
          data: { vendorId: mappedVendor }
        });
      }
    }

    const gameResult = await tx.game.updateMany({
      where: { venueId: alias.id },
      data: { venueId: canonical.id }
    });
    moved.gamesMoved += gameResult.count;

    const userResult = await tx.user.updateMany({
      where: { homeVenueId: alias.id },
      data: { homeVenueId: canonical.id }
    });
    moved.homeUsersMoved += userResult.count;

    for (const [aliasVendorId] of vendorIdMap) {
      const [itemCount, suggestedCount] = await Promise.all([
        tx.foodItem.count({ where: { vendorId: aliasVendorId } }),
        tx.suggestedItem.count({ where: { vendorId: aliasVendorId } })
      ]);
      if (itemCount === 0 && suggestedCount === 0) {
        await tx.vendor.delete({ where: { id: aliasVendorId } });
      }
    }

    const mergedLeagues = mergeUniqueStrings(canonical.leagues, alias.leagues);
    const mergedTeams = resolveVenueTeams(
      canonical.slug,
      mergeUniqueStrings(canonical.teams, alias.teams)
    );
    const mergedSports = mergeUniqueStrings(canonical.sports, alias.sports);

    await tx.venue.update({
      where: { id: canonical.id },
      data: {
        leagues: mergedLeagues,
        teams: mergedTeams,
        sports: mergedSports,
        primarySport: canonical.primarySport ?? alias.primarySport ?? undefined,
        recurringEvents: mergeUniqueStrings(
          canonical.recurringEvents,
          alias.recurringEvents
        ),
        ...(canonical.latitude === 0 && alias.latitude !== 0
          ? { latitude: alias.latitude }
          : {}),
        ...(canonical.longitude === 0 && alias.longitude !== 0
          ? { longitude: alias.longitude }
          : {})
      }
    });

    const remaining = await countVenueChildren(tx, alias.id);
    if (isVenueEmpty(remaining)) {
      await tx.venue.delete({ where: { id: alias.id } });
      return { deleted: true, remaining: null };
    }

    return { deleted: false, remaining };
  };

  if (!apply) {
    moved.vendorsMoved = vendorsToMove.length;
    moved.itemsMoved = itemsToMove.length;
    moved.reviewsMoved = before.alias.reviews;
    moved.photosMoved = before.alias.photos;
    moved.priceReportsMoved = before.alias.priceReports;
    moved.suggestedItemsMoved = before.alias.suggestedItems;
    moved.gamesMoved = before.alias.games;
    moved.homeUsersMoved = before.alias.homeUsers;

    const projectedRemaining: VenueChildCounts = {
      vendors: Math.max(0, before.alias.vendors - vendorsToMove.length),
      items: Math.max(
        0,
        before.alias.items - itemsToMove.length - itemIdMap.size
      ),
      photos: 0,
      reviews: 0,
      priceReports: 0,
      suggestedItems: 0,
      games: 0,
      homeUsers: 0
    };

    return {
      pair,
      aliasId: alias.id,
      canonicalId: canonical.id,
      before,
      moved,
      conflicts,
      aliasDeleted: false,
      aliasRemaining: projectedRemaining,
      error: undefined
    };
  }

  try {
    const outcome = await prisma.$transaction(async (tx) =>
      execute(tx as unknown as PrismaClient)
    );

    const aliasRemaining = outcome.remaining
      ? outcome.remaining
      : outcome.deleted
        ? null
        : await countVenueChildren(prisma, alias.id);

    return {
      pair,
      aliasId: alias.id,
      canonicalId: canonical.id,
      before,
      moved,
      conflicts,
      aliasDeleted: outcome.deleted,
      aliasRemaining
    };
  } catch (err) {
    return {
      pair,
      aliasId: alias.id,
      canonicalId: canonical.id,
      before,
      moved,
      conflicts,
      aliasDeleted: false,
      aliasRemaining: await countVenueChildren(prisma, alias.id),
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

export async function runVenueMerges(
  prisma: PrismaClient,
  pairs: MergePair[],
  apply: boolean
): Promise<MergePairResult[]> {
  const results: MergePairResult[] = [];
  for (const pair of pairs) {
    results.push(await mergeVenuePair(prisma, pair, apply));
  }
  return results;
}
