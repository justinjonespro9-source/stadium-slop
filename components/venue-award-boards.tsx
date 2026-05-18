import Link from "next/link";

import type { VenueAwardBoard } from "@/lib/venue-awards";

type VenueAwardBoardsProps = {
  venueSlug: string;
  boards: VenueAwardBoard[];
};

const boardAccent: Record<
  VenueAwardBoard["id"],
  { border: string; header: string; live?: boolean }
> = {
  "hot-tonight": {
    border: "border-emerald-500/30",
    header: "bg-[color:rgba(6,22,16,0.35)]",
    live: true
  },
  "fan-favorites": {
    border: "border-[var(--slop-gold)]/35",
    header: "bg-[color:rgba(244,179,33,0.08)]"
  },
  "worth-the-walk": {
    border: "border-[var(--slop-orange)]/35",
    header: "bg-[color:rgba(255,159,28,0.08)]"
  },
  "season-standouts": {
    border: "border-[var(--slop-line-strong)]",
    header: "bg-[color:rgba(6,15,24,0.55)]"
  }
};

export function VenueAwardBoards({ venueSlug, boards }: VenueAwardBoardsProps) {
  return (
    <section
      className="border-b border-[var(--slop-line-strong)] py-4 sm:py-5"
      aria-labelledby="venue-awards-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <AwardsSectionHeading />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {boards.map((board) => (
          <AwardBoardCard key={board.id} venueSlug={venueSlug} board={board} />
        ))}
      </div>
    </section>
  );
}

function AwardsSectionHeading() {
  return (
    <div>
      <p
        id="venue-awards-heading"
        className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--slop-gold-dim)]"
      >
        Fan-powered boards
      </p>
      <p className="mt-1 text-xs leading-snug text-[var(--slop-cream-dim)] sm:text-sm">
        Live picks from reviews and game-day fresh signals — not permanent trophies
        yet.
      </p>
    </div>
  );
}

function AwardBoardCard({
  venueSlug,
  board
}: {
  venueSlug: string;
  board: VenueAwardBoard;
}) {
  const accent = boardAccent[board.id];

  return (
    <article
      className={`overflow-hidden rounded-xl border ${accent.border} ${accent.header}`}
    >
      <header className="border-b border-[var(--slop-line)]/60 px-3 py-2.5 sm:px-4">
        <BoardTitle board={board} accent={accent} />
        <p className="mt-1 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs">
          {board.subtitle}
        </p>
      </header>

      {board.picks.length > 0 ? (
        <ol className="divide-y divide-[var(--slop-line)]/50">
          {board.picks.map(({ item, stats, detail }, index) => (
            <li key={item.slug}>
              <Link
                href={`/venues/${venueSlug}/${item.slug}`}
                className="flex items-center gap-2.5 px-3 py-2.5 transition hover:bg-[color:rgba(6,15,24,0.45)] sm:px-4"
              >
                <span
                  className={`w-6 shrink-0 text-center font-mono text-sm font-black tabular-nums ${
                    index === 0 ? "text-[var(--slop-gold-bright)]" : "text-[var(--slop-cream-dim)]"
                  }`}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-[var(--slop-cream)]">
                    {item.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.65rem] text-[var(--slop-cream-dim)]">
                    {detail}
                  </span>
                </span>
                <span className="shrink-0 text-base font-black tabular-nums text-[var(--slop-orange)]">
                  {stats.averageSlopScore.toFixed(1)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-3 py-4 text-xs leading-snug text-[var(--slop-cream-dim)] sm:px-4">
          {board.emptyMessage}
        </p>
      )}
    </article>
  );
}

function BoardTitle({
  board,
  accent
}: {
  board: VenueAwardBoard;
  accent: (typeof boardAccent)[VenueAwardBoard["id"]];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="text-sm font-black text-[var(--slop-cream)]">{board.title}</h3>
      {accent.live ? (
        <span className="inline-flex items-center gap-1 rounded border border-emerald-400/40 bg-emerald-950/50 px-1.5 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.12em] text-emerald-100">
          <span
            className="slop-live-dot inline-block h-1 w-1 rounded-full bg-emerald-400"
            aria-hidden
          />
          Live
        </span>
      ) : (
        <span className="rounded border border-[var(--slop-line)] px-1.5 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
          This season
        </span>
      )}
    </div>
  );
}
