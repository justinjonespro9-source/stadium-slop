import type { ReactNode } from "react";

import type { HomepageStats } from "@/lib/homepage-data";

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return value.toLocaleString("en-US");
}

const STAT_ITEMS = [
  {
    key: "venueCount",
    label: "Venues",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 20V8l8-5 8 5v12" strokeLinejoin="round" />
        <path d="M9 20v-6h6v6" />
      </svg>
    )
  },
  {
    key: "menuItemCount",
    label: "Menu Items",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M6 4h12v4H6zM6 10h12v10H6z" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    key: "reviewCount",
    label: "Reviews",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 5h16v12H8l-4 4V5z" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    key: "rankedItemCount",
    label: "Top Slop Rankings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M6 18V8M12 18V4M18 18v-6" strokeLinecap="round" />
      </svg>
    )
  }
] as const satisfies {
  key: keyof HomepageStats;
  label: string;
  icon: ReactNode;
}[];

export function HomeStatBand({ stats }: { stats: HomepageStats }) {
  return (
    <section
      aria-label="Stadium Slop at a glance"
      className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-4 sm:gap-3"
    >
      {STAT_ITEMS.map(({ key, label, icon }) => (
        <div key={key} className="media-stat-card">
          <span className="media-stat-icon">{icon}</span>
          <p className="media-stat-value">{formatCount(stats[key])}</p>
          <p className="media-stat-label">{label}</p>
        </div>
      ))}
    </section>
  );
}
