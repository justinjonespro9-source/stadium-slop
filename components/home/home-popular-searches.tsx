import Link from "next/link";

const POPULAR_SEARCHES = [
  { label: "Dodger Stadium", href: "/venues/dodger-stadium" },
  { label: "World Cup 2026", href: "/world-cup-stadium-food-guide" },
  { label: "Wrigley Field", href: "/venues/wrigley-field" },
  { label: "SoFi Stadium", href: "/venues/sofi-stadium" },
  { label: "MetLife Stadium", href: "/venues/metlife-stadium" },
  { label: "All venues", href: "/venues" }
] as const;

export function HomePopularSearches() {
  return (
    <div className="mt-4">
      <p className="text-[0.6rem] font-black uppercase tracking-[0.12em] text-white/55">
        Popular searches
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
        {POPULAR_SEARCHES.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[0.7rem] font-bold text-white/90 backdrop-blur-sm transition hover:border-[var(--media-orange)]/50 hover:bg-white/15 sm:text-xs"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
