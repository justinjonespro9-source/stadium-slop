import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CAMPAIGN_CATALOG,
  getActiveCampaign,
  isActiveCampaignSlug,
  normalizeCampaignSlug
} from "./catalog";

describe("campaign catalog", () => {
  it("sends Minnesota Fair campaigns to the canonical venue page", () => {
    const slugs = [
      "mn-fair-card",
      "mn-fair-founder",
      "mn-fair-facebook",
      "mn-fair-instagram",
      "mn-fair-x",
      "mn-fair-media"
    ];

    for (const slug of slugs) {
      const campaign = getActiveCampaign(slug);
      assert.ok(campaign);
      assert.equal(campaign.destinationPath, "/venues/minnesota-state-fair");
      assert.equal(campaign.venueSlug, "minnesota-state-fair");
      assert.equal(campaign.product, "state-fair-slop");
      assert.equal(campaign.active, true);
    }
  });

  it("rejects unknown and malformed slugs", () => {
    assert.equal(getActiveCampaign("not-a-campaign"), null);
    assert.equal(normalizeCampaignSlug("MN-FAIR-CARD"), "mn-fair-card");
    assert.equal(normalizeCampaignSlug("../admin"), null);
    assert.equal(isActiveCampaignSlug("mn-fair-card"), true);
    assert.equal(isActiveCampaignSlug("mn-fair-card?x=1"), false);
  });

  it("keeps catalog slugs unique", () => {
    const slugs = CAMPAIGN_CATALOG.map((campaign) => campaign.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });
});
