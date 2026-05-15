import { arrayBufferToBase64 } from "@/lib/og/array-buffer-base64";
import { getSiteUrl } from "@/lib/site-metadata";

/**
 * Loads a `/public` asset via the configured site origin so OG routes can embed
 * it as a data URL (works on Vercel where filesystem reads are unreliable).
 */
export async function fetchPublicAssetDataUrl(
  pathname: string
): Promise<string | undefined> {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  try {
    const url = new URL(path, `${getSiteUrl().origin}/`);
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) {
      return undefined;
    }
    const buf = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    const ct = res.headers.get("content-type") ?? "application/octet-stream";
    return `data:${ct};base64,${base64}`;
  } catch {
    return undefined;
  }
}
