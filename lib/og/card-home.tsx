import type { ReactElement } from "react";

import { OgScoreboardShell } from "@/lib/og/card-shell";
import { fetchPublicAssetDataUrl } from "@/lib/og/fetch-site-asset";
import { FONT, OG } from "@/lib/og-brand";
import {
  SITE_HOME_OG_DOMAIN,
  SITE_HOME_OG_HEADLINE,
  SITE_HOME_OG_SUBLINE
} from "@/lib/site-metadata";

const OG_ACCENT_ORANGE = "#ff6b1a";

export async function createHomeOpenGraphElement(): Promise<ReactElement> {
  const wordmark = await fetchPublicAssetDataUrl("/branding/stadium-slop-wordmark.png");

  return (
    <OgScoreboardShell footerBadge={SITE_HOME_OG_DOMAIN}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 32
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {wordmark ? (
            // eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse
            <img
              src={wordmark}
              alt=""
              width={640}
              height={148}
              style={{
                width: 640,
                height: 148,
                objectFit: "contain",
                objectPosition: "left center"
              }}
            />
          ) : (
            <p
              style={{
                margin: 0,
                fontFamily: FONT,
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "0.2em",
                color: OG.cream,
                textTransform: "uppercase"
              }}
            >
              Stadium Slop
            </p>
          )}

          <div
            style={{
              width: 120,
              height: 4,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${OG_ACCENT_ORANGE}, ${OG.goldBright})`
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 980 }}>
          <p
            style={{
              margin: 0,
              fontFamily: FONT,
              fontSize: 52,
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: OG.cream,
              textShadow: "0 4px 32px rgba(0,0,0,0.45)"
            }}
          >
            {SITE_HOME_OG_HEADLINE}
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: FONT,
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: OG.goldBright
            }}
          >
            {SITE_HOME_OG_SUBLINE}
          </p>
        </div>
      </div>
    </OgScoreboardShell>
  );
}
