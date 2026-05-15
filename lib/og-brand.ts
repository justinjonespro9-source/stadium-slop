/** Brand tokens for `@vercel/og` / ImageResponse layouts (must use hex / rgba only) */
export const OG = {
  navy: "#0b1b2b",
  navyDeep: "#060f18",
  navyMid: "#122536",
  gold: "#f4b321",
  goldBright: "#ffc94a",
  goldDim: "#c9a35a",
  cream: "#f5e9d0",
  creamMuted: "rgba(245, 233, 208, 0.78)",
  creamDim: "rgba(245, 233, 208, 0.52)",
  red: "#c63d2f",
  white: "#ffffff",
  ink: "#111111"
} as const;

export const FONT =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

export function ellipsis(str: string, max: number): string {
  const t = str.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}
