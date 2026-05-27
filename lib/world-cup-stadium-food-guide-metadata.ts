import type { Metadata } from "next";

import {
  getWorldCupGuideContent,
  worldCupGuideAlternateLanguages,
  type WorldCupGuideLocale
} from "@/lib/world-cup-stadium-food-guide-content";
import { getAbsoluteUrl, OG_CARD } from "@/lib/site-metadata";

const OG_ALT = "Stadium Slop — fan-powered stadium food rankings";

export function buildWorldCupGuideMetadata(locale: WorldCupGuideLocale): Metadata {
  const content = getWorldCupGuideContent(locale);
  const { title, description, keywords } = content.metadata;
  const canonical = getAbsoluteUrl(content.path);
  const languages = worldCupGuideAlternateLanguages();
  const ogImage = getAbsoluteUrl("/opengraph-image");

  return {
    title: { absolute: title },
    description,
    keywords: [...keywords],
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: locale === "es" ? "es_MX" : "en_US",
      alternateLocale: locale === "es" ? ["en_US"] : ["es_MX"],
      images: [
        {
          url: ogImage,
          width: OG_CARD.width,
          height: OG_CARD.height,
          alt: OG_ALT
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}
