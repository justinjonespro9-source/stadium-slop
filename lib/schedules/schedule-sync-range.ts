/** Shared CLI date window parsing for league schedule sync scripts. */

export type ScheduleSyncDateRange = {
  startDate: string;
  endDate: string;
};

export function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addLocalDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function parsePositiveInt(raw: string | undefined, fallback: number) {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Inclusive local calendar dates YYYY-MM-DD. */
export function parseScheduleSyncCliRange(
  argv: string[],
  defaultDays: number
): ScheduleSyncDateRange {
  let days = defaultDays;
  let start: string | undefined;
  let end: string | undefined;

  for (const arg of argv) {
    if (arg.startsWith("--days=")) {
      days = parsePositiveInt(arg.slice("--days=".length), defaultDays);
    } else if (arg.startsWith("--start=")) {
      start = arg.slice("--start=".length).trim();
    } else if (arg.startsWith("--end=")) {
      end = arg.slice("--end=".length).trim();
    }
  }

  const today = new Date();
  const startDate = start ?? localDateKey(today);
  const endDate = end ?? localDateKey(addLocalDays(today, days));

  return { startDate, endDate };
}

export function listDatesInRange(range: ScheduleSyncDateRange): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${range.startDate}T12:00:00`);
  const end = new Date(`${range.endDate}T12:00:00`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) {
    return dates;
  }
  while (cursor <= end) {
    dates.push(localDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function seasonYearFromRange(range: ScheduleSyncDateRange, fallback?: number) {
  const match = /^(\d{4})-/.exec(range.startDate);
  if (match) {
    return Number.parseInt(match[1], 10);
  }
  return fallback ?? new Date().getFullYear();
}

export function utcInstantInRange(iso: string, range: ScheduleSyncDateRange): boolean {
  const t = new Date(iso).getTime();
  const start = new Date(`${range.startDate}T00:00:00Z`).getTime();
  const end = new Date(`${range.endDate}T23:59:59Z`).getTime();
  return t >= start && t <= end;
}
