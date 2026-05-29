import "server-only";

import { EntityStatus, type AdPlacement } from "@prisma/client";

import { STATIC_AD_BY_PLACEMENT, type StaticAd } from "@/lib/ad-static-fallbacks";
import { cachePublicRead } from "@/lib/public-read-cache";
import { prisma } from "@/lib/prisma";

export type ActiveAd = Pick<
  AdPlacement,
  | "id"
  | "placementKey"
  | "title"
  | "body"
  | "imageUrl"
  | "ctaLabel"
  | "ctaHref"
  | "sponsorName"
>;

function asActiveAd(ad: StaticAd): ActiveAd {
  return ad;
}

const AD_SELECT = {
  id: true,
  placementKey: true,
  title: true,
  body: true,
  imageUrl: true,
  ctaLabel: true,
  ctaHref: true,
  sponsorName: true,
  updatedAt: true
} as const;

function staticFallbackMap(): Map<string, ActiveAd> {
  return new Map(
    Object.entries(STATIC_AD_BY_PLACEMENT).map(([key, ad]) => [key, asActiveAd(ad)])
  );
}

async function loadActiveAdsByPlacement(): Promise<Map<string, ActiveAd>> {
  try {
    const now = new Date();
    const rows = await prisma.adPlacement.findMany({
      where: {
        status: EntityStatus.ACTIVE,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
        ]
      },
      orderBy: { updatedAt: "desc" },
      select: AD_SELECT
    });

    const map = new Map<string, ActiveAd>();
    for (const row of rows) {
      const key = row.placementKey.trim();
      if (!key || map.has(key)) {
        continue;
      }
      map.set(key, {
        id: row.id,
        placementKey: row.placementKey,
        title: row.title,
        body: row.body,
        imageUrl: row.imageUrl,
        ctaLabel: row.ctaLabel,
        ctaHref: row.ctaHref,
        sponsorName: row.sponsorName
      });
    }

    for (const [key, ad] of Object.entries(STATIC_AD_BY_PLACEMENT)) {
      if (!map.has(key)) {
        map.set(key, asActiveAd(ad));
      }
    }

    return map;
  } catch (error) {
    console.warn("[ads] Failed to load active placements — using static fallbacks", error);
    return staticFallbackMap();
  }
}

const getActiveAdsByPlacementCached = cachePublicRead(
  ["active-ad-placements"],
  loadActiveAdsByPlacement,
  600
);

/**
 * Returns the newest active ad for a placement key, or null if none.
 * Backed by one cached query for all placements (not one DB round-trip per slot).
 */
export async function getActiveAdForPlacement(
  placementKey: string
): Promise<ActiveAd | null> {
  const key = placementKey.trim();
  if (!key) {
    return null;
  }

  const map = await getActiveAdsByPlacementCached();
  return map.get(key) ?? (STATIC_AD_BY_PLACEMENT[key] ? asActiveAd(STATIC_AD_BY_PLACEMENT[key]) : null);
}
