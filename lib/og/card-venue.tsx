import type { ReactElement } from "react";

import { OgScoreboardShell } from "@/lib/og/card-shell";
import { ellipsis, FONT, OG } from "@/lib/og-brand";
import type { Venue } from "@/lib/sample-data";
import { SITE_TAGLINE_SHORT } from "@/lib/site-metadata";

function VenueNotFoundInner(): ReactElement {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <p
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "0.2em",
          color: OG.gold,
          textTransform: "uppercase"
        }}
      >
        Venue
      </p>
      <h1
        style={{
          margin: "12px 0 0",
          fontFamily: FONT,
          fontSize: 58,
          fontWeight: 900,
          lineHeight: 1.05,
          color: OG.cream
        }}
      >
        Not on the board
      </h1>
      <p style={{ margin: "18px 0 0", fontSize: 26, fontWeight: 600, color: OG.creamMuted }}>
        {SITE_TAGLINE_SHORT}
      </p>
    </div>
  );
}

function VenueInner({ venue }: { venue: Venue }): ReactElement {
  const teams = venue.teams.filter(Boolean).slice(0, 3);
  const teamLine = teams.length ? teams.join(" · ") : null;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            borderRadius: 999,
            border: `1px solid rgba(244,179,33,0.45)`,
            background: "rgba(244,179,33,0.08)"
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: OG.red,
              boxShadow: "0 0 12px rgba(198,61,47,0.85)"
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: OG.goldBright,
              textTransform: "uppercase"
            }}
          >
            Game Day Rankings
          </span>
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: OG.creamDim,
            textTransform: "uppercase"
          }}
        >
          {ellipsis(`${venue.city}, ${venue.state}`, 48)}
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "36px 40px",
          borderRadius: 24,
          border: "1px solid rgba(245,233,208,0.14)",
          background: `linear-gradient(135deg, rgba(18,37,54,0.95) 0%, rgba(6,15,24,0.9) 55%, rgba(11,27,43,0.92) 100%)`,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(198,61,47,0.12), 0 24px 64px rgba(0,0,0,0.45)"
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: OG.goldDim,
            textTransform: "uppercase"
          }}
        >
          {venue.primarySport ?? venue.sports[0] ?? "Venue"}
        </p>
        <h1
          style={{
            margin: "14px 0 0",
            fontFamily: FONT,
            fontSize: 62,
            fontWeight: 900,
            lineHeight: 1.02,
            color: OG.cream,
            maxWidth: 980
          }}
        >
          {ellipsis(venue.name, 52)}
        </h1>
        {teamLine ? (
          <p
            style={{
              margin: "20px 0 0",
              fontSize: 30,
              fontWeight: 700,
              color: OG.goldBright,
              maxWidth: 980
            }}
          >
            {ellipsis(teamLine, 96)}
          </p>
        ) : (
          <p style={{ margin: "20px 0 0", fontSize: 28, fontWeight: 600, color: OG.creamMuted }}>
            Fan-powered concession intel
          </p>
        )}
        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 16,
            alignItems: "stretch"
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              borderRadius: 16,
              border: "1px solid rgba(245,233,208,0.12)",
              background: "rgba(0,0,0,0.22)",
              padding: "16px 20px"
            }}
          >
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: OG.creamDim }}>LOCATION</p>
            <p style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 800, color: OG.cream }}>
              {venue.city}, {venue.state}
            </p>
          </div>
          <div
            style={{
              width: 200,
              borderRadius: 16,
              border: `2px solid ${OG.gold}`,
              background: `linear-gradient(180deg, rgba(244,179,33,0.15), rgba(6,15,24,0.5))`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 6
            }}
          >
            <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: OG.red, letterSpacing: "0.12em" }}>
              LIVE
            </p>
            <p style={{ margin: 0, fontSize: 42, fontWeight: 900, color: OG.goldBright }}>◇</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function createVenueOpenGraphElement(venue: Venue | null): ReactElement {
  return <OgScoreboardShell>{venue ? <VenueInner venue={venue} /> : <VenueNotFoundInner />}</OgScoreboardShell>;
}
