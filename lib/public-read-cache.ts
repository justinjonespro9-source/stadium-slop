import "server-only";

import { unstable_cache } from "next/cache";

/** Public catalog pages — safe to cache briefly (not real-time game-day). */
export const PUBLIC_READ_REVALIDATE_SECONDS = 300;

export function cachePublicRead<T>(
  keyParts: string[],
  fn: () => Promise<T>,
  revalidate = PUBLIC_READ_REVALIDATE_SECONDS
): () => Promise<T> {
  return unstable_cache(fn, keyParts, { revalidate });
}
