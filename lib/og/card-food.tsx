import type { ReactElement } from "react";

import { OgScoreboardShell } from "@/lib/og/card-shell";
import { ellipsis, FONT, OG } from "@/lib/og-brand";
import { isUnratedItemStats } from "@/components/food-item-empty-states";
import type { ItemSlopStats } from "@/lib/slop-stats";
import { getSlopScoreTier } from "@/lib/slop-stats";
import type { FoodItem, Venue } from "@/lib/sample-data";
import { SITE_TAGLINE_SHORT } from "@/lib/site-metadata";

function FoodFallbackInner(props: {
  headline: string;
  sub: string;
}): ReactElement {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <p
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "0.18em",
          color: OG.gold,
          textTransform: "uppercase"
        }}
      >
        Concession slate
      </p>
      <h1
        style={{
          margin: "12px 0 0",
          fontFamily: FONT,
          fontSize: 54,
          fontWeight: 900,
          lineHeight: 1.06,
          color: OG.cream,
          maxWidth: 980
        }}
      >
        {ellipsis(props.headline, 56)}
      </h1>
      <p style={{ margin: "18px 0 0", fontSize: 26, fontWeight: 600, color: OG.creamMuted }}>
        {ellipsis(props.sub, 140)}
      </p>
      <p style={{ margin: "22px 0 0", fontSize: 22, color: OG.creamDim }}>{SITE_TAGLINE_SHORT}</p>
    </div>
  );
}

function FoodHeroPanel({
  heroUrl,
  fallbackEmoji,
  alt
}: {
  heroUrl?: string;
  fallbackEmoji: string;
  alt: string;
}) {
  if (heroUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse
      <img
        src={heroUrl}
        alt={alt}
        width={460}
        height={460}
        style={{
          width: 460,
          height: 460,
          borderRadius: 20,
          objectFit: "cover",
          border: `2px solid rgba(244,179,33,0.5)`,
          boxShadow: "0 18px 50px rgba(0,0,0,0.55)"
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 460,
        height: 460,
        borderRadius: 20,
        border: `2px dashed rgba(244,179,33,0.45)`,
        background: `linear-gradient(155deg, ${OG.navyMid}, ${OG.navyDeep})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 120,
        boxShadow: "inset 0 0 60px rgba(244,179,33,0.08)"
      }}
    >
      {fallbackEmoji}
    </div>
  );
}

function FoodLoadedInner(props: {
  venue: Venue;
  item: FoodItem;
  seasonStats: ItemSlopStats | null;
  freshStats: ItemSlopStats | null;
  heroUrl?: string;
  fallbackEmoji: string;
}): ReactElement {
  const season = props.seasonStats;
  const fresh = props.freshStats;
  const unrated = !season || isUnratedItemStats(season.reviewCount);
  const scoreDisplay = unrated ? "—" : season.averageSlopScore.toFixed(1);
  const tierDisplay = unrated ? "Awaiting first season score" : getSlopScoreTier(season.averageSlopScore);

  let freshLine = "No Game Day Fresh signal yet.";
  if (fresh?.hasFreshToday) {
    const score = fresh.averageSlopScore.toFixed(1);
    const tail = props.item.freshWindowLabel?.trim()
      ? ` · ${ellipsis(props.item.freshWindowLabel, 40)}`
      : "";
    freshLine = `Game Day Fresh ${score}${tail}`;
  }

  const heroAlt = `${props.item.name} fan photo`;
  const fallbackEmoji = props.fallbackEmoji.trim() || "🍔";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "row", gap: 36, alignItems: "stretch" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid rgba(245,233,208,0.22)",
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: OG.gold,
              textTransform: "uppercase"
            }}
          >
            Fan photo card
          </span>
          {props.item.isNewThisSeason ? (
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${OG.red}`,
                fontSize: 15,
                fontWeight: 900,
                color: OG.red,
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}
            >
              New
            </span>
          ) : null}
        </div>

        <h1
          style={{
            margin: "20px 0 0",
            fontFamily: FONT,
            fontSize: 52,
            fontWeight: 900,
            lineHeight: 1.05,
            color: OG.cream,
            maxWidth: 620
          }}
        >
          {ellipsis(props.item.name, 52)}
        </h1>

        <p style={{ margin: "12px 0 0", fontSize: 24, fontWeight: 700, color: OG.goldBright }}>
          {ellipsis(props.venue.name, 52)}
        </p>

        <div style={{ marginTop: 28, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div
            style={{
              minWidth: 200,
              flex: "1 1 200px",
              display: "flex",
              flexDirection: "column",
              borderRadius: 18,
              border: `2px solid ${OG.gold}`,
              background: `linear-gradient(165deg, rgba(244,179,33,0.18), rgba(6,15,24,0.75))`,
              padding: "20px 22px"
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: "0.16em",
                color: OG.creamMuted,
                textTransform: "uppercase"
              }}
            >
              Season Slop Score
            </p>
            <p
              style={{
                margin: "10px 0 0",
                fontFamily: FONT,
                fontSize: 64,
                fontWeight: 900,
                color: unrated ? OG.creamDim : OG.goldBright,
                letterSpacing: "-0.02em"
              }}
            >
              {scoreDisplay}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 650, color: OG.cream }}>
              {ellipsis(tierDisplay, 80)}
            </p>
          </div>

          <div
            style={{
              minWidth: 220,
              flex: "1 1 220px",
              display: "flex",
              flexDirection: "column",
              borderRadius: 18,
              border: fresh?.hasFreshToday ? `2px solid rgba(52,211,153,0.55)` : "1px solid rgba(245,233,208,0.14)",
              background: fresh?.hasFreshToday
                ? "linear-gradient(160deg, rgba(6,22,16,0.85), rgba(6,15,24,0.78))"
                : "rgba(0,0,0,0.22)",
              padding: "18px 20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {fresh?.hasFreshToday ? (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: "#34d399",
                    boxShadow: "0 0 10px rgba(52,211,153,0.9)"
                  }}
                />
              ) : null}
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  color: fresh?.hasFreshToday ? "#a7f3d0" : OG.creamDim,
                  textTransform: "uppercase"
                }}
              >
                Fresh / Game Day
              </p>
            </div>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.35,
                color: OG.cream
              }}
            >
              {ellipsis(freshLine, 120)}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <FoodHeroPanel
          heroUrl={props.heroUrl}
          fallbackEmoji={fallbackEmoji}
          alt={heroAlt}
        />
      </div>
    </div>
  );
}

export function createFoodOpenGraphElement(opts: {
  venue: Venue | null;
  item: FoodItem | null;
  seasonStats: ItemSlopStats | null;
  freshStats: ItemSlopStats | null;
  heroUrl?: string;
  fallbackEmoji?: string;
}): ReactElement {
  if (!opts.venue || !opts.item) {
    return (
      <OgScoreboardShell>
        <FoodFallbackInner headline="Item not found" sub="Browse venues for live concession intel." />
      </OgScoreboardShell>
    );
  }

  return (
    <OgScoreboardShell>
      <FoodLoadedInner
        venue={opts.venue}
        item={opts.item}
        seasonStats={opts.seasonStats}
        freshStats={opts.freshStats}
        heroUrl={opts.heroUrl}
        fallbackEmoji={opts.fallbackEmoji ?? "🍔"}
      />
    </OgScoreboardShell>
  );
}
