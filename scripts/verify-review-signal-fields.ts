#!/usr/bin/env npx tsx
/**
 * Regression check: Napkin Rating eligibility for representative venue/item shapes.
 * Run: npx tsx scripts/verify-review-signal-fields.ts
 */

import { verifyReviewSignalFieldFixtures } from "../lib/item-eligibility";

const result = verifyReviewSignalFieldFixtures();

if (result.ok) {
  console.log("Review signal field fixtures: OK");
  process.exit(0);
}

console.error("Review signal field fixtures: FAILED");
for (const failure of result.failures) {
  console.error(`  - ${failure}`);
}
process.exit(1);
