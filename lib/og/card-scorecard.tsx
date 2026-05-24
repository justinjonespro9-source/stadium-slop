import type { ReactElement } from "react";

import { OgScoreboardShell } from "@/lib/og/card-shell";
import { ellipsis, FONT, OG } from "@/lib/og-brand";
import { pickSlopCardHighlights, slopScoreDisplay } from "@/lib/slop-card-display";
import type { PublicScorecardView } from "@/lib/public-scorecard";
import { SITE_TAGLINE_SHORT } from "@/lib/site-metadata";

function ScorecardFallbackInner(): ReactElement {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <p
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: "0.16em",
          color: OG.gold,
          textTransform: "uppercase"
        }}
      >
        Official scorecard
      </p>
      <h1
        style={{
          margin: "14px 0 0",
          fontFamily: FONT,
          fontSize: 52,
          fontWeight: 900,
          lineHeight: 1.06,
          color: OG.cream
        }}
      >
        Slop Scorecard not found
      </h1>
      <p style={{ margin: "18px 0 0", fontSize: 24, color: OG.creamMuted }}>
        {SITE_TAGLINE_SHORT}
      </p>
    </div>
  );
}

function ScorecardHeroPanel({
  photoUrl,
  placeholderEmoji
}: {
  photoUrl?: string;
  placeholderEmoji?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse
      <img
        src={photoUrl}
        alt=""
        width={420}
        height={420}
        style={{
          width: 420,
          height: 420,
          borderRadius: 16,
          objectFit: "cover",
          border: "3px solid rgba(244,179,33,0.55)",
          boxShadow: "0 20px 48px rgba(0,0,0,0.55)"
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 420,
        height: 420,
        borderRadius: 16,
        border: "2px dashed rgba(244,179,33,0.4)",
        background: `linear-gradient(160deg, ${OG.navyMid}, ${OG.navyDeep})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 108,
        boxShadow: "inset 0 0 80px rgba(244,179,33,0.1)"
      }}
    >
      {placeholderEmoji?.trim() || "🍔"}
    </div>
  );
}

function SlopScoreBadge({ score }: { score: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 148,
        padding: "16px 20px",
        borderRadius: 14,
        border: `3px solid ${OG.gold}`,
        background: `linear-gradient(165deg, rgba(255,159,28,0.22), rgba(6,15,24,0.85))`,
        boxShadow: "0 8px 28px rgba(0,0,0,0.45)"
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: "0.18em",
          color: OG.creamMuted,
          textTransform: "uppercase"
        }}
      >
        Slop Score
      </p>
      <p
        style={{
          margin: "6px 0 0",
          fontFamily: FONT,
          fontSize: 72,
          fontWeight: 900,
          lineHeight: 1,
          color: OG.goldBright,
          letterSpacing: "-0.03em"
        }}
      >
        {slopScoreDisplay(score)}
      </p>
    </div>
  );
}

function ScorecardLoadedInner({ view }: { view: PublicScorecardView }): ReactElement {
  const { review, itemName, venueName, photoUrl, photoPlaceholderEmoji, metaLine } =
    view;
  const reviewerName = review.reviewerName?.trim() || "Stadium fan";
  const handleRaw = review.reviewerHandle?.replace(/^@+/, "").trim();
  const handleLine = handleRaw ? `@${handleRaw}` : null;
  const hotTake = review.note?.trim();
  const highlight = pickSlopCardHighlights(review.labels, [])[0];
  const placeholder = photoPlaceholderEmoji?.trim() || "🍔";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "row", gap: 32, alignItems: "stretch" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid rgba(244,179,33,0.55)",
              background: "rgba(244,179,33,0.14)",
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: OG.goldBright,
              textTransform: "uppercase"
            }}
          >
            Official Stadium Slop Scorecard
          </span>
          {review.verifiedGameDay ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 999,
                border: "1px solid rgba(52,211,153,0.5)",
                background: "rgba(6,22,16,0.75)",
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.08em",
                color: "#a7f3d0",
                textTransform: "uppercase"
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "#34d399"
                }}
              />
              Game-day
            </span>
          ) : null}
          {review.isTestReview ? (
            <span
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                border: "1px solid rgba(251,191,36,0.55)",
                fontSize: 13,
                fontWeight: 900,
                color: "#fde68a",
                textTransform: "uppercase"
              }}
            >
              QA
            </span>
          ) : null}
        </div>

        <h1
          style={{
            margin: "18px 0 0",
            fontFamily: FONT,
            fontSize: 48,
            fontWeight: 900,
            lineHeight: 1.05,
            color: OG.cream,
            maxWidth: 640
          }}
        >
          {ellipsis(itemName, 48)}
        </h1>

        <p style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 700, color: OG.goldBright }}>
          {ellipsis(venueName, 44)}
        </p>

        {metaLine ? (
          <p style={{ margin: "8px 0 0", fontSize: 18, fontWeight: 600, color: OG.creamDim }}>
            {ellipsis(metaLine, 72)}
          </p>
        ) : null}

        <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-start" }}>
          <SlopScoreBadge score={review.slopScore} />
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid rgba(245,233,208,0.16)",
                background: "rgba(0,0,0,0.28)"
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  color: OG.creamDim,
                  textTransform: "uppercase"
                }}
              >
                Reviewed by
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 800, color: OG.cream }}>
                {ellipsis(reviewerName, 32)}
              </p>
              {handleLine ? (
                <p style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 600, color: OG.goldDim }}>
                  {ellipsis(handleLine, 28)}
                </p>
              ) : null}
            </div>
            {highlight ? (
              <span
                style={{
                  alignSelf: "flex-start",
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(244,179,33,0.45)",
                  background: "rgba(244,179,33,0.12)",
                  fontSize: 15,
                  fontWeight: 900,
                  color: OG.goldBright,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase"
                }}
              >
                {ellipsis(highlight, 36)}
              </span>
            ) : null}
          </div>
        </div>

        {hotTake ? (
          <div
            style={{
              marginTop: 18,
              padding: "14px 18px",
              borderRadius: 12,
              border: "1px solid rgba(245,233,208,0.12)",
              background: "rgba(6,15,24,0.55)",
              maxWidth: 680
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.1em",
                color: OG.creamDim,
                textTransform: "uppercase"
              }}
            >
              Hot Take
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 20,
                fontWeight: 600,
                lineHeight: 1.35,
                color: OG.creamMuted,
                fontStyle: "italic"
              }}
            >
              &ldquo;{ellipsis(hotTake, 120)}&rdquo;
            </p>
          </div>
        ) : null}

        <p style={{ margin: "auto 0 0", paddingTop: 16, fontSize: 17, color: OG.creamDim }}>
          Fan-powered stadium food review
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        <ScorecardHeroPanel photoUrl={photoUrl} placeholderEmoji={placeholder} />
      </div>
    </div>
  );
}

export function createScorecardOpenGraphElement(
  view: PublicScorecardView | null
): ReactElement {
  if (!view) {
    return (
      <OgScoreboardShell>
        <ScorecardFallbackInner />
      </OgScoreboardShell>
    );
  }

  return (
    <OgScoreboardShell>
      <ScorecardLoadedInner view={view} />
    </OgScoreboardShell>
  );
}
