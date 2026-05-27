import type { MetadataRoute } from "next";

import {
  WORLD_CUP_GUIDE_PATH_EN,
  WORLD_CUP_GUIDE_PATH_ES
} from "@/lib/world-cup-stadium-food-guide-content";
import { getAbsoluteUrl } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: getAbsoluteUrl(WORLD_CUP_GUIDE_PATH_EN),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: getAbsoluteUrl(WORLD_CUP_GUIDE_PATH_ES),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85
    }
  ];
}
