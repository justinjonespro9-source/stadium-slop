import type { HomepageStats } from "@/lib/homepage-data";

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return value.toLocaleString("en-US");
}

const STAT_ITEMS = [
  { key: "venueCount", label: "Venues" },
  { key: "menuItemCount", label: "Menu Items" },
  { key: "reviewCount", label: "Reviews" },
  { key: "rankedItemCount", label: "Top Slop Rankings" }
] as const satisfies { key: keyof HomepageStats; label: string }[];

export function HomeStatBand({ stats }: { stats: HomepageStats }) {
  return (
    <section
      aria-label="Stadium Slop at a glance"
      className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
    >
      {STAT_ITEMS.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.5)] px-3 py-3 text-center sm:rounded-2xl sm:px-4 sm:py-4"
        >
          <p className="text-xl font-black tabular-nums text-[var(--slop-gold-bright)] sm:text-2xl">
            {formatCount(stats[key])}
          </p>
          <p className="mt-0.5 text-[0.6rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)] sm:text-[0.65rem]">
            {label}
          </p>
        </div>
      ))}
    </section>
  );
}
