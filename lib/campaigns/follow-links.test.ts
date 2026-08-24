import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { FACEBOOK_URL_ENV, getFollowPageSocialLinks } from "./follow-links";

describe("follow page social links", () => {
  it("uses verified Stadium Slop accounts and omits Facebook by default", () => {
    const links = getFollowPageSocialLinks({});
    const ids = links.map((link) => link.id);
    assert.deepEqual(ids, ["instagram", "x", "tiktok", "youtube"]);
    assert.equal(
      links.find((link) => link.id === "instagram")?.href,
      "https://www.instagram.com/stadiumslop/"
    );
    assert.equal(links.find((link) => link.id === "x")?.href, "https://x.com/StadiumSlop");
    assert.ok(!ids.includes("facebook"));
    assert.ok(!ids.includes("linkedin"));
  });

  it("inserts Facebook only when a https facebook.com URL is configured", () => {
    const rejected = getFollowPageSocialLinks({
      [FACEBOOK_URL_ENV]: "https://example.com/not-facebook"
    });
    assert.ok(!rejected.some((link) => link.id === "facebook"));

    const accepted = getFollowPageSocialLinks({
      [FACEBOOK_URL_ENV]: "https://www.facebook.com/StadiumSlop"
    });
    assert.equal(accepted[2]?.id, "facebook");
    assert.match(accepted[2]?.href ?? "", /^https:\/\/www\.facebook\.com\/StadiumSlop/);
  });
});
