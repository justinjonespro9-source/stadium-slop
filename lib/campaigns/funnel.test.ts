import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getActiveCampaign } from "./catalog";
import { funnelConversionPercent, toCampaignFunnelRow } from "./funnel";

describe("campaign funnel math", () => {
  it("uses reviewers / redirect visits for conversion", () => {
    assert.equal(funnelConversionPercent(22, 184), 12);
    assert.equal(funnelConversionPercent(0, 10), 0);
    assert.equal(funnelConversionPercent(5, 0), 0);
  });

  it("shapes a dashboard row from catalog metadata + counts", () => {
    const campaign = getActiveCampaign("mn-fair-card");
    assert.ok(campaign);
    const row = toCampaignFunnelRow(campaign, {
      visits: 184,
      followVisits: 40,
      signups: 37,
      reviewers: 22,
      reviews: 61
    });
    assert.equal(row.label, "MN Fair Postcard");
    assert.equal(row.conversionPercent, 12);
    assert.equal(row.followVisits, 40);
  });
});
