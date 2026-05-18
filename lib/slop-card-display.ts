/** Client-safe Slop Card label + layout helpers (no DB). */

const HIGHLIGHT_PRIORITY = [
  "Trending Tonight",
  "Fan Favorite",
  "Worth the Walk",
  "Run It Back",
  "Steal",
  "Worth the Price of Admission",
  "Game Day Starter"
] as const;

export type SlopCardHighlightTone = "gold" | "emerald" | "orange" | "cream";

export function highlightToneForLabel(label: string): SlopCardHighlightTone {
  const lower = label.toLowerCase();
  if (lower.includes("trending") || lower.includes("fresh") || lower.includes("live")) {
    return "emerald";
  }
  if (
    lower.includes("worth the walk") ||
    lower.includes("worth the price") ||
    lower.includes("steal") ||
    lower.includes("run it back")
  ) {
    return "orange";
  }
  if (lower.includes("fan favorite") || lower.includes("photo favorite")) {
    return "gold";
  }
  return "cream";
}

export function pickSlopCardHighlights(
  labels: string[],
  extra: string[] = [],
  max = 3
): string[] {
  const pool = [...new Set([...extra, ...labels])];
  const picked: string[] = [];

  for (const priority of HIGHLIGHT_PRIORITY) {
    const match = pool.find(
      (l) => l.toLowerCase() === priority.toLowerCase() || l.includes(priority)
    );
    if (match && !picked.includes(match)) {
      picked.push(match);
    }
    if (picked.length >= max) {
      return picked;
    }
  }

  for (const label of pool) {
    if (!picked.includes(label)) {
      picked.push(label);
    }
    if (picked.length >= max) {
      break;
    }
  }

  return picked.slice(0, max);
}

export function formatSlopCardMetaRow(parts: {
  locationLine?: string;
  verifiedGameDay?: boolean;
  dateLabel?: string;
}): string {
  const segments: string[] = [];
  if (parts.locationLine?.trim()) {
    segments.push(parts.locationLine.trim());
  }
  if (parts.verifiedGameDay) {
    segments.push("Game day verified");
  } else if (parts.dateLabel?.trim()) {
    segments.push(parts.dateLabel.trim());
  }
  return segments.length > 0 ? segments.join(" · ") : "Fan-powered guide";
}

export function slopCardLocationLine(
  item: { location: string; sections?: string[] },
  vendor?: { section?: string } | null
): string {
  if (item.sections && item.sections.length === 1) {
    return `Sec ${item.sections[0]}`;
  }
  if (item.sections && item.sections.length > 1) {
    return "Multiple sections";
  }
  if (vendor?.section?.trim()) {
    return vendor.section.trim();
  }
  return item.location;
}

export function slopScoreDisplay(score: number): string {
  return score.toFixed(1);
}
