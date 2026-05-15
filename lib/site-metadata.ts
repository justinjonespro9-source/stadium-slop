import type { Metadata } from "next";

/** Canonical site origin for OG/Twitter absolute URLs — set NEXT_PUBLIC_SITE_URL in production */
export function getSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (raw && raw.trim()) {
    const trimmed = raw.trim().replace(/\/$/, "");
    return new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  }
  return new URL("http://localhost:3000");
}

export function getAbsoluteUrl(pathWithLeadingSlash: string): string {
  const base = getSiteUrl();
  const p = pathWithLeadingSlash.startsWith("/") ? pathWithLeadingSlash : `/${pathWithLeadingSlash}`;
  return new URL(p, `${base.origin}/`).toString();
}

export const SITE_TAGLINE_SHORT = "Fan-powered stadium food rankings.";

/** Shared OG/Twitter sizing (recommended social preview) */
export const OG_CARD = { width: 1200 as const, height: 630 as const };

/** Baseline Metadata — compose with segment opengraph-image + generateMetadata where needed */
export function buildRootMetadata(): Metadata {
  const base = getSiteUrl();
  return {
    metadataBase: base,
    title: {
      default: "Stadium Slop",
      template: "%s · Stadium Slop"
    },
    description: SITE_TAGLINE_SHORT,
    keywords: ["stadium food", "ballpark food", "arena food", "reviews", "slop score"],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: base.toString(),
      siteName: "Stadium Slop",
      title: `Stadium Slop — ${SITE_TAGLINE_SHORT}`,
      description: SITE_TAGLINE_SHORT
    },
    twitter: {
      card: "summary_large_image",
      title: `Stadium Slop — ${SITE_TAGLINE_SHORT}`,
      description: SITE_TAGLINE_SHORT
    }
  };
}
