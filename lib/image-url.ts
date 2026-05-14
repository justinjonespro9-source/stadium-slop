/** Treat null, undefined, whitespace, and "" as missing (seed rows often omit url). */
export function normalizePublicImageUrl(
  raw: string | null | undefined
): string | undefined {
  if (raw == null) {
    return undefined;
  }
  const s = String(raw).trim();
  if (!s) {
    return undefined;
  }
  return s;
}

export function hasPublicImageUrl(raw: string | null | undefined): boolean {
  return Boolean(normalizePublicImageUrl(raw));
}
