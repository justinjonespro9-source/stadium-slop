import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "@/lib/site-metadata";

const BLOCKED_AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Bytespider",
  "Amazonbot",
  "PerplexityBot"
] as const;

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/admin/", "/account", "/account/", "/api", "/api/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow
      },
      ...BLOCKED_AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        disallow: ["/"]
      }))
    ],
    sitemap: getAbsoluteUrl("/sitemap.xml")
  };
}
