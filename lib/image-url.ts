/** Treat null, undefined, whitespace, and "" as missing (seed rows often omit url). */
export function normalizePublicImageUrl(
  raw: string | null | undefined
): string | undefined {
  if (raw == null) {
    return undefined;
  }
  let s = String(raw).trim();
  if (!s) {
    return undefined;
  }
  if (s.startsWith("//")) {
    s = `https:${s}`;
  } else if (/^http:\/\//i.test(s)) {
    s = `https://${s.slice("http://".length)}`;
  }
  return s;
}

export function hasPublicImageUrl(raw: string | null | undefined): boolean {
  return Boolean(normalizePublicImageUrl(raw));
}
