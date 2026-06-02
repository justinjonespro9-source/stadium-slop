import type { MetadataRoute } from "next";

import { loadPublicSitemapEntries } from "@/lib/public-sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { entries } = await loadPublicSitemapEntries();
  return entries;
}
