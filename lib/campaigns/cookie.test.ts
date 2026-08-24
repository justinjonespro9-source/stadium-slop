import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { planCampaignCookies } from "./apply-cookies";

describe("campaign cookie plan", () => {
  it("sets first-touch from src and does not overwrite an existing campaign", () => {
    const first = planCampaignCookies({
      pathname: "/venues/minnesota-state-fair",
      src: "mn-fair-card",
      existingCampaignSlug: null,
      existingFollowTouchSlug: null
    });
    assert.deepEqual(first, {
      firstTouchSlug: "mn-fair-card",
      setFirstTouch: true,
      followTouchSlug: null
    });

    const second = planCampaignCookies({
      pathname: "/follow",
      src: "mn-fair-facebook",
      existingCampaignSlug: "mn-fair-card",
      existingFollowTouchSlug: null
    });
    assert.equal(second.setFirstTouch, false);
    assert.equal(second.firstTouchSlug, "mn-fair-card");
    assert.equal(second.followTouchSlug, "mn-fair-card");
  });

  it("records a follow touch once per campaign in a session", () => {
    const firstFollow = planCampaignCookies({
      pathname: "/follow",
      src: "mn-fair-card",
      existingCampaignSlug: null,
      existingFollowTouchSlug: null
    });
    assert.equal(firstFollow.followTouchSlug, "mn-fair-card");

    const refresh = planCampaignCookies({
      pathname: "/follow",
      src: "mn-fair-card",
      existingCampaignSlug: "mn-fair-card",
      existingFollowTouchSlug: "mn-fair-card"
    });
    assert.equal(refresh.setFirstTouch, false);
    assert.equal(refresh.followTouchSlug, null);
  });

  it("ignores inactive or unknown src values", () => {
    const plan = planCampaignCookies({
      pathname: "/follow",
      src: "unknown-campaign",
      existingCampaignSlug: null,
      existingFollowTouchSlug: null
    });
    assert.equal(plan.firstTouchSlug, null);
    assert.equal(plan.setFirstTouch, false);
    assert.equal(plan.followTouchSlug, null);
  });
});
