import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  parseNflConcessionsPayload,
  qualityErrorsForPayload
} from "./nfl-concessions-import";

const NISSAN_FILE = "data/nfl/2026-concessions/nissan-stadium.json";

describe("nfl concessions import payload", () => {
  const payload = parseNflConcessionsPayload(
    JSON.parse(readFileSync(NISSAN_FILE, "utf8"))
  );

  it("is a Nissan-only HIGH-confidence payload", () => {
    assert.equal(payload.venueSlug, "nissan-stadium");
    assert.equal(payload.league, "NFL");
    assert.equal(payload.source.url, "https://nissanstadium.com/concessions/");
    assert.equal(payload.vendors.length, 14);
    assert.equal(payload.items.length, 31);
    assert.ok(payload.vendors.every((vendor) => vendor.confidence === "HIGH"));
    assert.ok(payload.items.every((item) => item.confidence === "HIGH"));
  });

  it("passes quality checks", () => {
    assert.deepEqual(qualityErrorsForPayload(payload), []);
  });

  it("does not import generic filler or category headings", () => {
    const names = payload.items.map((item) => item.name.toLowerCase());
    for (const banned of [
      "coke",
      "sprite",
      "titanspay",
      "non-alcoholic beverages",
      "canned beer",
      "popcorn",
      "peanuts",
      "mexican",
      "bbq",
      "chicken"
    ]) {
      assert.equal(names.includes(banned), false, banned);
    }
  });

  it("requires every item to belong to a payload vendor", () => {
    const vendors = new Set(payload.vendors.map((vendor) => vendor.name));
    for (const item of payload.items) {
      assert.ok(vendors.has(item.vendorName), item.vendorName);
    }
  });

  it("only allows item=vendor when explicitly flagged", () => {
    const flagged = payload.items.filter(
      (item) => item.name.toLowerCase() === item.vendorName.toLowerCase()
    );
    assert.deepEqual(
      flagged.map((item) => item.name).sort(),
      ["ICEE", "Kettle Corn"]
    );
    assert.ok(flagged.every((item) => item.allowItemNameEqualsVendor === true));
  });
});

describe("nfl concessions quality gate", () => {
  it("rejects placeholder vendors and generic soda items", () => {
    const payload = parseNflConcessionsPayload(
      JSON.parse(readFileSync(NISSAN_FILE, "utf8"))
    );
    payload.vendors.push({
      name: "General Concessions",
      section: "100",
      location: "Section 100",
      status: "ACTIVE",
      sourceUrl: payload.source.url,
      confidence: "HIGH"
    });
    payload.items.push({
      name: "Coke",
      vendorName: "Classic Hits",
      description: "Fountain soda",
      itemType: "NON_ALCOHOLIC_DRINK",
      category: "BEVERAGE",
      sections: ["105"],
      location: "105",
      basePrice: null,
      status: "ACTIVE",
      sourceUrl: payload.source.url,
      confidence: "HIGH"
    });
    const errors = qualityErrorsForPayload(payload);
    assert.ok(errors.some((error) => /Placeholder vendor/i.test(error)));
    assert.ok(errors.some((error) => /Generic filler item: Coke/i.test(error)));
  });

  it("accepts Lambeau stand codes used in official Packers PDFs", () => {
    const payload = parseNflConcessionsPayload(
      JSON.parse(readFileSync(NISSAN_FILE, "utf8"))
    );
    payload.vendors.push({
      name: "Fox River Market BBQ",
      section: "105-M",
      location: "105-M, 133-M",
      status: "ACTIVE",
      sourceUrl: payload.source.url,
      confidence: "HIGH"
    });
    payload.items.push({
      name: "Horse Collar",
      vendorName: "Fox River Market BBQ",
      description: "Official 2026 Packers F&B by Item listing.",
      itemType: "FOOD",
      category: "SAVORY",
      sections: ["105-M", "133-M", "P111", "P113-I", "JTV", "742-I"],
      location: "105-M, 133-M, P111, P113-I, JTV, 742-I",
      basePrice: null,
      status: "ACTIVE",
      sourceUrl: payload.source.url,
      confidence: "HIGH",
      existingItemSlug: "horse-collar-test"
    });
    assert.deepEqual(qualityErrorsForPayload(payload), []);
  });
});

const LAMBEAU_FILE = "data/nfl/2026-concessions/lambeau-field.json";

describe("lambeau field concessions payload", () => {
  const payload = parseNflConcessionsPayload(
    JSON.parse(readFileSync(LAMBEAU_FILE, "utf8"))
  );

  it("is a Lambeau-only HIGH-confidence payload with provenance", () => {
    assert.equal(payload.venueSlug, "lambeau-field");
    assert.equal(payload.league, "NFL");
    assert.match(payload.source.url, /packers/);
    assert.ok(payload.vendors.every((vendor) => vendor.confidence === "HIGH"));
    assert.ok(payload.items.every((item) => item.confidence === "HIGH"));
    assert.ok((payload.staleReview ?? []).length > 0);
  });

  it("passes quality checks and keeps update anchors", () => {
    assert.deepEqual(qualityErrorsForPayload(payload), []);
    const updateSlugs = payload.items
      .map((item) => item.existingItemSlug)
      .filter((slug): slug is string => Boolean(slug));
    assert.ok(updateSlugs.includes("loaded-big-pretzel-loaded-big-pretzel"));
    assert.ok(updateSlugs.includes("bratcho-bratcho") === false);
  });
});

const HIGHMARK_FILE = "data/nfl/2026-concessions/highmark-stadium.json";

describe("highmark stadium concessions payload", () => {
  const payload = parseNflConcessionsPayload(
    JSON.parse(readFileSync(HIGHMARK_FILE, "utf8"))
  );

  it("is a Highmark-only HIGH-confidence payload from the official Bills menu", () => {
    assert.equal(payload.venueSlug, "highmark-stadium");
    assert.equal(payload.league, "NFL");
    assert.match(payload.source.url, /buffalobills\.com/);
    assert.ok(payload.vendors.every((vendor) => vendor.confidence === "HIGH"));
    assert.ok(payload.items.every((item) => item.confidence === "HIGH"));
    assert.ok((payload.staleReview ?? []).length > 0);
  });

  it("passes quality checks and updates canonical Beef on Weck in place", () => {
    assert.deepEqual(qualityErrorsForPayload(payload), []);
    const beef = payload.items.find((item) => item.existingItemSlug === "beef-on-weck-beef-on-weck");
    assert.ok(beef);
    assert.equal(beef?.name, "Beef on Weck");
    assert.equal(beef?.vendorName, "Kaisertown");
    assert.ok(!payload.items.some((item) => /charlie the butcher/i.test(item.location)));
    assert.ok(!payload.vendors.some((vendor) => /la nova/i.test(vendor.name)));
  });
});

const US_BANK_FILE = "data/nfl/2026-concessions/us-bank-stadium.json";

describe("u.s. bank stadium concessions payload", () => {
  const payload = parseNflConcessionsPayload(
    JSON.parse(readFileSync(US_BANK_FILE, "utf8"))
  );

  it("is a U.S. Bank-only HIGH-confidence payload from the official Aramark directory", () => {
    assert.equal(payload.venueSlug, "u-s-bank-stadium");
    assert.equal(payload.league, "NFL");
    assert.match(payload.source.url, /usbankstadium\.com/);
    assert.ok(payload.vendors.every((vendor) => vendor.confidence === "HIGH"));
    assert.ok(payload.items.every((item) => item.confidence === "HIGH"));
    assert.ok((payload.staleReview ?? []).length > 0);
  });

  it("updates canonical Parlour Burger and Centro Hippo Pocket in place", () => {
    assert.deepEqual(qualityErrorsForPayload(payload), []);
    const parlour = payload.items.find(
      (item) => item.existingItemSlug === "parlour-burger-parlour-burger"
    );
    assert.ok(parlour);
    assert.equal(parlour?.name, "Parlour Burger");
    assert.equal(parlour?.vendorName, "Parlour");
    const hippo = payload.items.find(
      (item) => item.existingItemSlug === "the-hippo-pocket-the-hippo-pocket"
    );
    assert.ok(hippo);
    assert.equal(hippo?.vendorName, "Centro");
    assert.equal(
      (payload.staleReview ?? []).some((row) => /hippo pocket/i.test(row.existingName)),
      false
    );
    const raid = payload.items.find((item) => item.name === "The Raid Burger");
    assert.ok(raid?.labeledNewFor2026);
    assert.deepEqual(raid?.sections, ["101", "328"]);
  });
});

describe("strong-source 2026 concession payloads", () => {
  const files = [
    "data/nfl/2026-concessions/m-t-bank-stadium.json",
    "data/nfl/2026-concessions/lucas-oil-stadium.json",
    "data/nfl/2026-concessions/caesars-superdome.json",
    "data/nfl/2026-concessions/everbank-stadium.json",
    "data/nfl/2026-concessions/metlife-stadium.json",
    "data/nfl/2026-concessions/gillette-stadium.json",
    "data/nfl/2026-concessions/sofi-stadium.json",
    "data/nfl/2026-concessions/hard-rock-stadium.json"
  ];

  for (const file of files) {
    it(`${file} is HIGH-confidence and passes quality`, () => {
      const payload = parseNflConcessionsPayload(JSON.parse(readFileSync(file, "utf8")));
      assert.equal(payload.league, "NFL");
      assert.ok(payload.vendors.every((vendor) => vendor.confidence === "HIGH"));
      assert.ok(payload.items.every((item) => item.confidence === "HIGH"));
      assert.deepEqual(qualityErrorsForPayload(payload), []);
    });
  }
});

describe("skipped-strong 2026 concession payloads", () => {
  const files = [
    "data/nfl/2026-concessions/allegiant-stadium.json",
    "data/nfl/2026-concessions/raymond-james-stadium.json"
  ];

  for (const file of files) {
    it(`${file} is HIGH-confidence and passes quality`, () => {
      const payload = parseNflConcessionsPayload(JSON.parse(readFileSync(file, "utf8")));
      assert.equal(payload.league, "NFL");
      assert.ok(payload.vendors.every((vendor) => vendor.confidence === "HIGH"));
      assert.ok(payload.items.every((item) => item.confidence === "HIGH"));
      assert.deepEqual(qualityErrorsForPayload(payload), []);
    });
  }
});

describe("moderate-promoted 2026 concession payloads", () => {
  const files = [
    "data/nfl/2026-concessions/acrisure-stadium.json",
    "data/nfl/2026-concessions/empower-field-at-mile-high.json",
    "data/nfl/2026-concessions/ford-field.json",
    "data/nfl/2026-concessions/geha-field-at-arrowhead-stadium.json",
    "data/nfl/2026-concessions/huntington-bank-field.json",
    "data/nfl/2026-concessions/lincoln-financial-field.json",
    "data/nfl/2026-concessions/lumen-field.json",
    "data/nfl/2026-concessions/northwest-stadium.json",
    "data/nfl/2026-concessions/nrg-stadium.json",
    "data/nfl/2026-concessions/paycor-stadium.json"
  ];

  for (const file of files) {
    it(`${file} is HIGH-confidence and passes quality`, () => {
      const payload = parseNflConcessionsPayload(JSON.parse(readFileSync(file, "utf8")));
      assert.equal(payload.league, "NFL");
      assert.ok(payload.vendors.every((vendor) => vendor.confidence === "HIGH"));
      assert.ok(payload.items.every((item) => item.confidence === "HIGH"));
      assert.deepEqual(qualityErrorsForPayload(payload), []);
    });
  }
});

