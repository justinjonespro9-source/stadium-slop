import { StadiumSlopWordmark } from "@/components/brand/stadium-slop-wordmark";
import { SlopScorecardFrame } from "@/components/slop-scorecard-shell";
import { HOME_SCORECARD_EXAMPLE } from "@/lib/home-scorecard-example";
import { slopScoreDisplay } from "@/lib/slop-card-display";

function ExampleSlopScoreBadge({ score }: { score: number }) {
  return (
    <div className="slop-scorecard-score-octagon slop-scorecard-score-octagon--compact shrink-0 text-center">
      <p className="text-[0.38rem] font-black uppercase tracking-[0.14em] text-[var(--slop-ink)]">
        Slop
      </p>
      <p className="text-[1.05rem] font-black tabular-nums leading-none text-[var(--slop-ink)]">
        {slopScoreDisplay(score)}
      </p>
    </div>
  );
}

function ExampleBackStatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="slop-scorecard-back-stat-row">
      <span className="slop-scorecard-back-stat-label">{label}</span>
      <span className="slop-scorecard-back-stat-value">{value}</span>
    </div>
  );
}

function ExampleScorecardFront() {
  const sample = HOME_SCORECARD_EXAMPLE;

  return (
    <article className="home-scorecard-example__card" aria-label="Example scorecard front">
      <p className="home-scorecard-example__face-tag">Front</p>
      <div className="home-scorecard-example__frame">
        <SlopScorecardFrame face="front" className="h-full w-full">
          <div className="flex h-full min-h-0 flex-col">
            <div className="slop-scorecard-header slop-scorecard-header--front relative z-[2] grid shrink-0 grid-cols-[1fr_auto] items-center gap-2 px-2 pt-2">
              <StadiumSlopWordmark size="scorecard" className="min-w-0" />
              <ExampleSlopScoreBadge score={sample.slopScore} />
            </div>
            <div className="slop-scorecard-front-body flex min-h-0 flex-1 flex-col">
              <div className="slop-scorecard-photo-well flex min-h-0 flex-1 flex-col px-2">
                <div
                  className="slop-scorecard-photo-well-inner relative flex min-h-[10.5rem] flex-1 items-center justify-center bg-gradient-to-br from-[#2a1810] via-[#1a120e] to-[#0f0c0a]"
                  aria-hidden
                >
                  <span className="text-5xl opacity-90">{sample.photoEmoji}</span>
                </div>
              </div>
              <div className="slop-scorecard-info-block shrink-0 px-2 pb-2">
                <p className="line-clamp-2 text-[1rem] font-black leading-tight tracking-tight text-[var(--slop-cream)]">
                  {sample.itemName}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[0.58rem] font-bold text-[var(--slop-cream-muted)]">
                  {sample.venueContext}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[0.5rem] font-semibold leading-snug text-[var(--slop-cream-dim)]">
                  <span className="mr-0.5 opacity-80" aria-hidden>
                    📍
                  </span>
                  {sample.locationHint}
                </p>
              </div>
              <div className="slop-scorecard-footer flex shrink-0 items-center gap-2 px-2 pb-2">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--slop-card-orange)] bg-[var(--slop-navy-deep)] text-[0.7rem] font-black text-[var(--slop-cream)]">
                  {sample.reviewerInitials}
                </div>
                <p className="min-w-0 truncate text-[0.65rem] font-black text-[var(--slop-cream)]">
                  {sample.reviewerName}
                </p>
              </div>
            </div>
          </div>
        </SlopScorecardFrame>
      </div>
    </article>
  );
}

function ExampleScorecardBack() {
  const sample = HOME_SCORECARD_EXAMPLE;

  return (
    <article className="home-scorecard-example__card" aria-label="Example scorecard back">
      <p className="home-scorecard-example__face-tag">Back</p>
      <div className="home-scorecard-example__frame">
        <SlopScorecardFrame face="back" className="h-full w-full">
          <div className="flex h-full min-h-0 flex-col overflow-hidden px-2.5 py-2.5">
            <div className="slop-scorecard-header flex shrink-0 items-center justify-between gap-2 py-1">
              <p className="text-[0.55rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                Slop Signals
              </p>
              <StadiumSlopWordmark size="scorecard" className="max-w-[5.5rem]" />
            </div>
            <div className="slop-scorecard-back-stat-panel mt-2 min-h-0 flex-1 space-y-0">
              <ExampleBackStatRow label="Napkin Rating" value={sample.napkinRating} />
              <ExampleBackStatRow label="Replay Value" value={sample.replayValue} />
              <ExampleBackStatRow label="Price Check" value={sample.priceCheck} />
              <ExampleBackStatRow label="Mess signal" value={sample.messSignal} />
            </div>
            <div className="mt-2 shrink-0 rounded-lg border border-[var(--slop-line-strong)] bg-[rgba(6,15,24,0.55)] px-2 py-2">
              <p className="text-[0.48rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                Hot Take
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold leading-snug text-[var(--slop-cream-muted)]">
                &ldquo;{sample.hotTake}&rdquo;
              </p>
            </div>
          </div>
        </SlopScorecardFrame>
      </div>
    </article>
  );
}

export function HomeScorecardExample() {
  return (
    <section
      className="home-scorecard-example mt-10 sm:mt-12"
      aria-labelledby="home-scorecard-example-heading"
    >
      <div className="media-section-heading">
        <div className="min-w-0">
          <p className="media-section-eyebrow">Slop Scorecard</p>
          <h2 id="home-scorecard-example-heading" className="media-section-title">
            How a Slop Scorecard works
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.9375rem]">
            Every review turns into a quick-read food card with a Slop Score, food photo, napkin
            rating, replay value, price check, and a hot take from the crowd.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="home-scorecard-example__badge">Example Scorecard</span>
        <span className="home-scorecard-example__badge home-scorecard-example__badge--muted">
          Illustrative only. Not a live review.
        </span>
      </div>

      <div className="home-scorecard-example__grid mt-4">
        <ExampleScorecardFront />
        <ExampleScorecardBack />
      </div>

      <p className="home-scorecard-example__disclaimer mt-4 max-w-2xl text-xs leading-relaxed text-[var(--media-ink-dim)] sm:text-sm">
        Example only. Real scorecards come from reviews submitted at the venue. Rankings and
        Top Slop lists stay on each venue&apos;s page.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[var(--media-ink-dim)]">
        Other bites fans review include fair classics like Fairground Cheese Curds or stadium
        staples like Spicy Chicken Sandwich.
      </p>
    </section>
  );
}
