import { ImageResponse } from "next/og";

import { createHomeOpenGraphElement } from "@/lib/og/card-home";
import { OG_CARD, SITE_HOME_OG_ALT } from "@/lib/site-metadata";

export const runtime = "nodejs";

export const alt = SITE_HOME_OG_ALT;

export const size = { width: OG_CARD.width, height: OG_CARD.height };

export const contentType = "image/png";

export default async function Image() {
  const element = await createHomeOpenGraphElement();
  return new ImageResponse(element, {
    width: OG_CARD.width,
    height: OG_CARD.height
  });
}
