import Image from "next/image";
import type { ReactNode } from "react";

import type { HomepageStats } from "@/lib/homepage-data";
import {
  HOME_STAT_MENU_BACKGROUND,
  HOME_STAT_VENUES_BACKGROUND
} from "@/lib/media-assets";

function formatCount(value: number): string {
  if (value >= 10_000) {
    return `${Math.round(value / 1000)}k`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return value.toLocaleString("en-US");
}

function StadiumArenaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="home-stat-photo-card__icon-svg">
      <ellipse cx="12" cy="14.5" rx="8.5" ry="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 14.5c1.2-4.5 4.8-7.5 8.5-7.5s7.3 3 8.5 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5 11.5c2-2.2 4.4-3.2 7-3.2s5 1 7 3.2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M12 7.25V5.5M9 6l3-1.5 3 1.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function ConcessionsTrayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="home-stat-photo-card__icon-svg">
      <path
        d="M4 16h16l-1.2-6.2a1 1 0 0 0-.98-.8H6.18a1 1 0 0 0-.98.8L4 16Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7 9.5h3.2v4.2H7V9.5Z" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M11.2 10.2c.6 1.4 1.2 2.4 2 3.1.8.7 1.6 1 2.5 1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path d="M14.5 9.8h2.8l-.6 3.9h-2.1l-.1-3.9Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <ellipse cx="12" cy="17.25" rx="7.5" ry="1.1" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

type StatPhotoCardProps = {
  value: string;
  label: string;
  imageSrc: string;
  imagePosition?: string;
  icon: ReactNode;
};

function StatPhotoCard({ value, label, imageSrc, imagePosition = "center", icon }: StatPhotoCardProps) {
  return (
    <article className="home-stat-photo-card">
      <div className="home-stat-photo-card__media" aria-hidden>
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 639px) 100%, 50vw"
          className="home-stat-photo-card__image"
          style={{ objectPosition: imagePosition }}
        />
        <div className="home-stat-photo-card__overlay" />
        <div className="home-stat-photo-card__vignette" />
      </div>
      <div className="home-stat-photo-card__content">
        <span className="home-stat-photo-card__icon-badge">{icon}</span>
        <p className="home-stat-photo-card__value">{value}</p>
        <p className="home-stat-photo-card__label">{label}</p>
      </div>
    </article>
  );
}

export function HomeStatBand({ stats }: { stats: HomepageStats }) {
  return (
    <section aria-label="Stadium Slop at a glance" className="home-stat-band">
      <div className="home-stat-band__grid">
        <StatPhotoCard
          value={formatCount(stats.venueCount)}
          label="Venues covered"
          imageSrc={HOME_STAT_VENUES_BACKGROUND}
          imagePosition="center 42%"
          icon={<StadiumArenaIcon />}
        />
        <StatPhotoCard
          value={formatCount(stats.menuItemCount)}
          label="Menu items tracked"
          imageSrc={HOME_STAT_MENU_BACKGROUND}
          imagePosition="center 55%"
          icon={<ConcessionsTrayIcon />}
        />
      </div>
    </section>
  );
}
