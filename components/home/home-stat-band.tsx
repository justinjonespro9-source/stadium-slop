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
    key: "venueCount" as const,
    label: "Venues",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 20V8l8-5 8 5v12" strokeLinejoin="round" />
        <path d="M9 20v-6h6v6" />
      </svg>
    )
  },
  {
    key: "menuItemCount" as const,
    label: "Menu Items",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M6 4h12v4H6zM6 10h12v10H6z" strokeLinejoin="round" />
      </svg>
    )
  }
] satisfies {
  key: keyof HomepageStats;
  label: string;
  icon: ReactNode;
}[];

export function HomeStatBand({ stats }: { stats: HomepageStats }) {
  return (
    <section
      aria-label="Stadium Slop at a glance"
      className="home-stat-band mt-4 sm:mt-6"
    >
      <div className="home-stat-band__grid">
        {STAT_ITEMS.map(({ key, label, icon }) => (
          <div key={key} className="media-stat-card home-stat-band__card">
            <span className="media-stat-icon home-stat-band__icon">{icon}</span>
            <p className="media-stat-value home-stat-band__value">
              {formatCount(stats[key])}
            </p>
            <p className="media-stat-label">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
