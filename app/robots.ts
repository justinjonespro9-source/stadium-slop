import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "@/lib/site-metadata";

/**
 * Public /robots.txt via Next.js MetadataRoute.
 * Allows normal crawling of venues, menus, food items, and state-fair pages.
 * Blocks AhrefsBot and keeps crawlers off action / account / moderation surfaces.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "AhrefsBot",
        disallow: "/"
      },
      {
        userAgent: "*",
        disallow: [
          "/claim",
          "/suggest-correction",
          "/report-content",
          "/login",
          // Existing account / moderation / API surfaces (not public content)
          "/admin",
          "/account",
          "/api"
        ]
      }
    ],
    sitemap: getAbsoluteUrl("/sitemap.xml")
  };
}
