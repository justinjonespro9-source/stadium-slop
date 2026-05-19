import { ImageResponse } from "next/og";

import { createVenueOpenGraphElement } from "@/lib/og/card-venue";
import { getPublicVenueBySlug } from "@/lib/public-data";
import { OG_CARD } from "@/lib/site-metadata";

export const runtime = "nodejs";

export const alt = "Venue Slop Scoreboard on Stadium Slop";

export const size = { width: OG_CARD.width, height: OG_CARD.height };

export const contentType = "image/png";

type OgProps = {
  params: Promise<{ venueSlug: string }>;
};

export default async function Image({ params }: OgProps) {
  const { venueSlug } = await params;
  const venue = await getPublicVenueBySlug(venueSlug);
  return new ImageResponse(createVenueOpenGraphElement(venue ?? null), {
    width: OG_CARD.width,
    height: OG_CARD.height
  });
}
