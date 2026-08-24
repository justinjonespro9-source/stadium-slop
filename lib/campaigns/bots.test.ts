import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isLikelyUnfurlBot } from "./bots";

describe("unfurl bot detection", () => {
  it("skips common link-preview user agents", () => {
    assert.equal(isLikelyUnfurlBot("facebookexternalhit/1.1"), true);
    assert.equal(isLikelyUnfurlBot("Twitterbot/1.0"), true);
    assert.equal(isLikelyUnfurlBot("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"), false);
    assert.equal(isLikelyUnfurlBot(null), false);
  });
});
