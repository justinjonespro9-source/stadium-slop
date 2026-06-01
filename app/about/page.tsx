import type { Metadata } from "next";

import { AboutPage } from "@/components/about/about-page";
import { getAbsoluteUrl, OG_CARD, SITE_TAGLINE_SHORT } from "@/lib/site-metadata";

export const dynamic = "force-static";

const TITLE = "About Stadium Slop";
const DESCRIPTION =
  "Stadium Slop is a fan-powered food guide for stadiums, state fairs, and live events — Slop Score rankings, real photos, and venue-verified reviews.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: getAbsoluteUrl("/about")
  },
  openGraph: {
    title: `${TITLE} · Stadium Slop`,
    description: DESCRIPTION,
    url: getAbsoluteUrl("/about"),
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
    title: `${TITLE} · Stadium Slop`,
    description: SITE_TAGLINE_SHORT,
    images: [getAbsoluteUrl("/opengraph-image")]
  }
};

export default function AboutRoute() {
  return <AboutPage />;
}
