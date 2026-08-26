import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { CampaignDefinition } from "@/lib/campaigns/catalog";

import {
  buildCampaignAnalyticsRows,
  formatCampaignChannel,
  resolveCampaignAnalyticsDateRange
} from "./campaign-analytics";

const SAMPLE: CampaignDefinition = {
  slug: "mn-fair-card",
  label: "MN Fair Postcard",
  product: "state-fair-slop",
  venueSlug: "minnesota-state-fair",
  eventKey: "minnesota-state-fair-2026",
  channel: "postcard",
  destinationPath: "/venues/minnesota-state-fair",
  active: true,
  createdAt: "2026-08-23"
};

describe("campaign analytics helpers", () => {
  it("parses UTC day ranges and swaps inverted from/to", () => {
    const range = resolveCampaignAnalyticsDateRange({
      from: "2026-08-27",
      to: "2026-09-07"
    });
    assert.equal(range.fromParam, "2026-08-27");
    assert.equal(range.toParam, "2026-09-07");
    assert.equal(range.from?.toISOString(), "2026-08-27T00:00:00.000Z");
    assert.equal(range.toExclusive?.toISOString(), "2026-09-08T00:00:00.000Z");

    const swapped = resolveCampaignAnalyticsDateRange({
      from: "2026-09-07",
      to: "2026-08-27"
    });
    assert.equal(swapped.from?.toISOString(), "2026-08-27T00:00:00.000Z");
    assert.equal(swapped.toExclusive?.toISOString(), "2026-09-08T00:00:00.000Z");

    const invalid = resolveCampaignAnalyticsDateRange({ from: "nope", to: "" });
    assert.equal(invalid.from, null);
    assert.equal(invalid.toExclusive, null);
  });

  it("builds catalog rows with reviewer conversion", () => {
    const rows = buildCampaignAnalyticsRows(
      [SAMPLE],
      new Map([
        [
          "mn-fair-card",
          {
            redirectVisits: 184,
            followVisits: 40,
            signups: 37,
            reviewers: 22,
            reviews: 61
          }
        ]
      ])
    );

    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.label, "MN Fair Postcard");
    assert.equal(rows[0]?.channel, "postcard");
    assert.equal(rows[0]?.redirectVisits, 184);
    assert.equal(rows[0]?.followVisits, 40);
    assert.equal(rows[0]?.conversionPercent, 12);
    assert.equal(formatCampaignChannel("postcard"), "Postcard");
  });

  it("defaults missing campaign counts to zero", () => {
    const rows = buildCampaignAnalyticsRows([SAMPLE], new Map());
    assert.deepEqual(rows[0], {
      slug: "mn-fair-card",
      label: "MN Fair Postcard",
      channel: "postcard",
      destinationPath: "/venues/minnesota-state-fair",
      redirectVisits: 0,
      followVisits: 0,
      signups: 0,
      reviewers: 0,
      reviews: 0,
      conversionPercent: 0
    });
  });
});
