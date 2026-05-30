import type { Metadata } from "next";

import { StateFairFoodGuidePage } from "@/components/state-fair/state-fair-food-guide-page";
import { getAbsoluteUrl, OG_CARD } from "@/lib/site-metadata";

export const dynamic = "force-static";

const TITLE = "State Fair Slop — Find fair foods worth the line";
const DESCRIPTION =
  "Preview State Fair Slop from Stadium Slop — fan-powered state fair food discovery and rankings, starting with the Minnesota State Fair.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · Stadium Slop` },
  description: DESCRIPTION,
  keywords: [
    "state fair food",
    "Minnesota State Fair food",
    "fair food rankings",
    "state fair reviews",
    "Stadium Slop"
  ],
  alternates: {
    canonical: getAbsoluteUrl("/state-fair-food-guide")
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: getAbsoluteUrl("/state-fair-food-guide"),
    type: "website",
    images: [
      {
        url: getAbsoluteUrl("/opengraph-image"),
        width: OG_CARD.width,
        height: OG_CARD.height,
        alt: "Stadium Slop — fan-powered food rankings"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [getAbsoluteUrl("/opengraph-image")]
  }
};

export default function StateFairFoodGuideRoute() {
  return <StateFairFoodGuidePage />;
}
