import { ImageResponse } from "next/og";

import { createFoodOpenGraphElement } from "@/lib/og/card-food";
import {
  getPublicFoodItemBySlug,
  getPublicPhotosForFoodItem,
  getPublicVenueBySlug
} from "@/lib/public-data";
import { getVenueItemSlopStatsMap, resolveVenueItemSlopStats } from "@/lib/slop-stats";
import type { FoodItem, Venue } from "@/lib/sample-data";
import { OG_CARD } from "@/lib/site-metadata";

export const runtime = "nodejs";

export const alt = "Stadium concession item card on Stadium Slop";

export const size = { width: OG_CARD.width, height: OG_CARD.height };

export const contentType = "image/png";

type OgProps = {
  params: Promise<{ venueSlug: string; foodSlug: string }>;
};

export default async function Image({ params }: OgProps) {
  const { venueSlug, foodSlug } = await params;
  const venue = await getPublicVenueBySlug(venueSlug);
  const itemRaw = venue
    ? await getPublicFoodItemBySlug(venue.slug, foodSlug)
    : await getPublicFoodItemBySlug(venueSlug, foodSlug);

  let heroUrl: string | undefined;
  let fallbackEmoji = "🍔";
  let season: ReturnType<typeof resolveVenueItemSlopStats> | null = null;
  let fresh: ReturnType<typeof resolveVenueItemSlopStats> | null = null;

  let displayVenue: Venue | null = null;
  let displayItem: FoodItem | null = null;

  if (
    venue &&
    itemRaw &&
    itemRaw.venueSlug.trim().toLowerCase() === venue.slug.trim().toLowerCase()
  ) {
    displayVenue = venue;
    displayItem = itemRaw;
    const photos = await getPublicPhotosForFoodItem(venue.slug, itemRaw.slug);
    const firstVisual = photos.find((p) => p.imageUrl);
    heroUrl = firstVisual?.imageUrl;
    fallbackEmoji =
      photos.find((p) => !p.imageUrl)?.imagePlaceholder ??
      photos[0]?.imagePlaceholder ??
      "🍔";

    const venueStatsMap = await getVenueItemSlopStatsMap(venue.slug);
    season = resolveVenueItemSlopStats(venueStatsMap, itemRaw.slug, "season");
    fresh = resolveVenueItemSlopStats(venueStatsMap, itemRaw.slug, "gameDayFresh");
  }

  const element = createFoodOpenGraphElement({
    venue: displayVenue,
    item: displayItem,
    seasonStats: season,
    freshStats: fresh,
    heroUrl,
    fallbackEmoji
  });

  return new ImageResponse(element, {
    width: OG_CARD.width,
    height: OG_CARD.height
  });
}
