import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/admin/", "/account", "/account/", "/api", "/api/"];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow
    },
    sitemap: getAbsoluteUrl("/sitemap.xml")
  };
}
