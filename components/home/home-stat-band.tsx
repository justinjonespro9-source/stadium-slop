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
      className="-mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3"
    >
      {STAT_ITEMS.map(({ key, label }) => (
        <div key={key} className="media-stat-card">
          <p className="media-stat-value">{formatCount(stats[key])}</p>
          <p className="media-stat-label">{label}</p>
        </div>
      ))}
    </section>
  );
}
