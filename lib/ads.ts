import "server-only";

import { EntityStatus, type AdPlacement } from "@prisma/client";

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

/**
 * Returns the newest active ad for a placement key, or null if none / on DB error.
 */
export async function getActiveAdForPlacement(
  placementKey: string
): Promise<ActiveAd | null> {
  const key = placementKey.trim();
  if (!key) {
    return null;
  }

  try {
    const now = new Date();
    const ad = await prisma.adPlacement.findFirst({
      where: {
        placementKey: key,
        status: EntityStatus.ACTIVE,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
        ]
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        placementKey: true,
        title: true,
        body: true,
        imageUrl: true,
        ctaLabel: true,
        ctaHref: true,
        sponsorName: true
      }
    });

    return ad;
  } catch (error) {
    console.warn(`[ads] Failed to load placement "${key}"`, error);
    return null;
  }
}
