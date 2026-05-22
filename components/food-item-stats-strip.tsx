type StatCellProps = {
  label: string;
  value: string;
  detail?: string;
  accent?: "gold" | "fresh" | "default";
};

function StatCell({ label, value, detail, accent = "default" }: StatCellProps) {
  const valueClass =
    accent === "gold"
      ? "text-[var(--slop-gold-bright)]"
      : accent === "fresh"
        ? "text-emerald-200"
        : "text-[var(--slop-cream)]";

  return (
    <div className="item-stats-cell min-w-0 px-2 py-1.5 sm:px-2.5 sm:py-2">
      <p className="truncate text-[0.48rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)] sm:text-[0.5rem]">
        {label}
      </p>
      <p
        className={`mt-0.5 truncate text-base font-black tabular-nums leading-none sm:text-lg ${valueClass}`}
      >
        {value}
      </p>
      {detail ? (
        <p className="mt-0.5 truncate text-[0.5rem] font-semibold text-[var(--slop-cream-dim)]">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

export type FoodItemStatsStripProps = {
  slopScore: string;
  slopDetail?: string;
  slopUnrated?: boolean;
  freshScore: string;
  freshLive: boolean;
  freshDetail: string;
  reviewCount: number;
  reviewDetail?: string;
  priceDisplay: string;
  priceDetail: string;
  replayLabel?: string;
  replayDetail?: string;
};

/** Compact scoreboard strip for item page header. */
export function FoodItemStatsStrip({
  slopScore,
  slopDetail,
  slopUnrated,
  freshScore,
  freshLive,
  freshDetail,
  reviewCount,
  reviewDetail,
  priceDisplay,
  priceDetail,
  replayLabel,
  replayDetail
}: FoodItemStatsStripProps) {
  return (
    <div className="item-stats-strip" role="group" aria-label="Item stats">
      <StatCell
        label="Slop score"
        value={slopScore}
        detail={slopUnrated ? "Awaiting votes" : slopDetail}
        accent="gold"
      />
      <StatCell
        label="Fresh signal"
        value={freshScore}
        detail={freshDetail}
        accent={freshLive ? "fresh" : "default"}
      />
      <StatCell
        label="Reviews"
        value={String(reviewCount)}
        detail={reviewDetail}
      />
      <StatCell label="Price" value={priceDisplay} detail={priceDetail} />
      <StatCell
        label="Replay"
        value={replayLabel ?? "—"}
        detail={replayDetail}
      />
    </div>
  );
}
