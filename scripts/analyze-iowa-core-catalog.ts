/**
 * One-off analysis for Iowa core-catalog QA (not imported in prod).
 * Usage: npx tsx scripts/analyze-iowa-core-catalog.ts
 *
 * Live DB duplicate audit: npx tsx scripts/audit-iowa-state-fair-duplicates.ts --dry-run
 */

import { parseIowaStateFairCoreCatalog } from "../lib/fair-import/parsers/iowa-state-fair-core-catalog";
import { normalizeIowaFoodDedupeKey } from "../lib/fair-import/iowa-food-name-normalize";
import { normalizeMenuItemName } from "../lib/venue-menu-import/normalize";

async function main() {
  const result = await parseIowaStateFairCoreCatalog();
  const items = result.items;
  const byVendor = new Map<string, string[]>();
  for (const it of items) {
    const v = it.vendorName ?? "?";
    if (!byVendor.has(v)) byVendor.set(v, []);
    byVendor.get(v)!.push(it.name);
  }

  console.log("=== TOP 25 VENDORS BY ITEM COUNT ===");
  const top25 = [...byVendor.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 25);
  for (const [v, names] of top25) {
    console.log(`${names.length}\t${v}`);
    console.log(`  ${names.slice(0, 6).join(" | ")}`);
  }

  const longest = [...items.map((i) => i.name)].sort((a, b) => b.length - a.length).slice(0, 12);
  console.log("\n=== LONGEST ITEM NAMES ===");
  for (const n of longest) console.log(`${n.length}\t${n}`);

  const genericRe =
    /^(soda|water|coffee|lemonade|fries|nachos|pretzel|popcorn|hot dog|hamburger|chips|candy|cookie|milk|tea|gatorade|smoothie|refill)/i;
  const generic = items.filter(
    (i) =>
      genericRe.test(i.name) ||
      /\b(bottled water|large soda|small soda|iced tea|sweet tea)\b/i.test(i.name)
  );
  console.log(`\n=== GENERIC-SOUNDING IN WOULD-ADD: ${generic.length} ===`);
  for (const i of generic.slice(0, 30)) {
    console.log(`  ${i.vendorName} — ${i.name}`);
  }

  const nameCount = new Map<string, string[]>();
  for (const it of items) {
    const k = normalizeMenuItemName(it.name);
    if (!nameCount.has(k)) nameCount.set(k, []);
    nameCount.get(k)!.push(it.vendorName ?? "?");
  }
  const dupNames = [...nameCount.entries()]
    .filter(([, v]) => v.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 15);
  console.log("\n=== DUPLICATE NAMES ACROSS VENDORS ===");
  for (const [n, vendors] of dupNames) {
    console.log(`${vendors.length}\t${n}`);
    console.log(`  ${vendors.slice(0, 5).join("; ")}`);
  }

  const iowaNear = new Map<string, string[]>();
  for (const it of items) {
    const k = normalizeIowaFoodDedupeKey(it.name);
    if (!iowaNear.has(k)) iowaNear.set(k, []);
    iowaNear.get(k)!.push(`${it.vendorName ?? "?"}: ${it.name}`);
  }
  const nearDupes = [...iowaNear.entries()]
    .filter(([, lines]) => lines.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20);
  console.log("\n=== IOWA NEAR-DUPLICATE NAMES (import preview) ===");
  for (const [k, lines] of nearDupes) {
    console.log(`${lines.length}\t${k}`);
    for (const line of lines.slice(0, 4)) console.log(`  ${line}`);
  }

  console.log(`\nParsed (post quality + drink filter): ${items.length}`);
  console.log(`Vendors: ${byVendor.size}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
