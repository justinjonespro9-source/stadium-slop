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
            <Link href={item.href} className="media-pill sm:text-xs">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
