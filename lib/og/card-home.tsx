import type { ReactElement } from "react";

import { OgScoreboardShell } from "@/lib/og/card-shell";
import { fetchPublicAssetDataUrl } from "@/lib/og/fetch-site-asset";
import { ellipsis, FONT, OG } from "@/lib/og-brand";
import { SITE_TAGLINE_SHORT } from "@/lib/site-metadata";

export async function createHomeOpenGraphElement(): Promise<ReactElement> {
  const wordmark = await fetchPublicAssetDataUrl("/branding/stadium-slop-wordmark.png");

  return (
    <OgScoreboardShell>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 72,
              minHeight: 72,
              borderRadius: 16,
              border: `2px solid rgba(244,179,33,0.45)`,
              background: `linear-gradient(160deg, ${OG.navyMid}, ${OG.navyDeep})`,
              fontSize: 36,
              fontWeight: 900,
              color: OG.goldBright,
              boxShadow: "0 12px 40px rgba(0,0,0,0.45)"
            }}
          >
            SS
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            {wordmark ? null : (
              <p
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  color: OG.gold,
                  textTransform: "uppercase"
                }}
              >
                Stadium Slop
              </p>
            )}
            {wordmark ? (
              // eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse
              <img
                src={wordmark}
                alt=""
                width={520}
                height={120}
                style={{
                  width: 520,
                  height: 120,
                  objectFit: "contain",
                  objectPosition: "left center"
                }}
              />
            ) : (
              <p
                style={{
                  margin: 0,
                  fontFamily: FONT,
                  fontSize: 56,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  color: OG.cream,
                  textShadow: `0 0 42px rgba(244,179,33,0.25)`,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "baseline",
                  gap: 10
                }}
              >
                <span>Stadium</span>
                <span style={{ color: OG.goldBright }}>Slop</span>
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            padding: "28px 32px",
            borderRadius: 20,
            border: "1px solid rgba(245,233,208,0.18)",
            background: `linear-gradient(125deg, rgba(18,37,54,0.92) 0%, rgba(6,15,24,0.88) 100%)`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 16px 48px rgba(0,0,0,0.35)"
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.22em",
              color: OG.gold,
              textTransform: "uppercase"
            }}
          >
            Broadcast
          </p>
          <p
            style={{
              margin: "14px 0 0",
              fontSize: 42,
              fontWeight: 900,
              lineHeight: 1.2,
              color: OG.cream,
              maxWidth: 920
            }}
          >
            {ellipsis(SITE_TAGLINE_SHORT, 120)}
          </p>
          <p
            style={{
              margin: "16px 0 0",
              fontSize: 24,
              fontWeight: 600,
              color: OG.creamMuted,
              maxWidth: 880
            }}
          >
            Game-day signals · fan photos · venue standings
          </p>
        </div>
      </div>
    </OgScoreboardShell>
  );
}
