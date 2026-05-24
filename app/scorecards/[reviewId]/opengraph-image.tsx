import { ImageResponse } from "next/og";

import { createScorecardOpenGraphElement } from "@/lib/og/card-scorecard";
import { getPublicScorecardByReviewId } from "@/lib/public-scorecard";
import { OG_CARD } from "@/lib/site-metadata";

export const runtime = "nodejs";

export const alt = "Official Stadium Slop Scorecard";

export const size = { width: OG_CARD.width, height: OG_CARD.height };

export const contentType = "image/png";

type OgProps = {
  params: Promise<{ reviewId: string }>;
};

export async function buildScorecardOgImageResponse(reviewId: string) {
  const view = await getPublicScorecardByReviewId(reviewId);
  return new ImageResponse(createScorecardOpenGraphElement(view), {
    width: OG_CARD.width,
    height: OG_CARD.height
  });
}

export default async function Image({ params }: OgProps) {
  const { reviewId } = await params;
  return buildScorecardOgImageResponse(reviewId);
}
