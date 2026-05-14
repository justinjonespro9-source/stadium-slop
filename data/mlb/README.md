# MLB-first venue / vendor / item import

Stadium Slop is expanding **MLB / baseball first**. Use this folder for bulk ballpark data; golf, tennis, racing, etc. are out of scope for now.

## Canonical MLB-only venue seed (30 clubs)

**`mlb-ballparks-venues.json`** — import-ready list of all current MLB ballparks (`venues` only; `vendors` is an empty array). Optional per-row **`reviewNotes`** flags manual QA (temporary A’s park, rebrands, city labels). Same schema as `lib/mlb-import-shape.ts` (`MlbVenueImportRow` + optional `reviewNotes`).

Apply:

```bash
npx tsx scripts/apply-mlb-import.ts ./data/mlb/mlb-ballparks-venues.json
```

`lib/sample-data.ts` merges this file into the in-app / Prisma seed venue list plus a small set of non-MLB demo venues (NFL/NHL) so existing demo vendors still resolve.

## Full import shape (venues + vendors + optional items)

See **`mlb-import.example.json`**. Top-level fields:

- `version` — must be `1`
- `venues` — ballparks (slug, name, city, state, team, lat/lng, …)
- `vendors` — optional for venues-only files: omit or use `[]`
- `items` (optional) — menu rows tied to `venueSlug` + `vendorSlug`

Types live in `lib/mlb-import-shape.ts`.

## Apply an import file

Requires `DATABASE_URL` and a migrated database.

```bash
npx tsx scripts/apply-mlb-import.ts ./data/mlb/my-import.json
```

The script upserts venues, then vendors, then optional items (minimal Prisma defaults for enums not in the file).

## Vendor spreadsheet → JSON / CSV

There is **no checked-in vendor spreadsheet** in this repo (nothing to parse automatically).

1. Export your sheet to **CSV** with headers similar to:
   - Venues: `slug,name,city,state,team,latitude,longitude`
   - Vendors: `venue_slug,vendor_slug,name,section,location`
2. Convert to JSON with any tool you prefer (Python `csv.DictReader`, Google Apps Script, `jq`, Excel → Save As CSV → small Node script).
3. Match the keys in **`mlb-import.example.json`** (snake_case in CSV can map to camelCase in JSON).
4. Run `apply-mlb-import.ts` on the result.

If you only have PDFs or photos of menus, transcribe a minimal CSV first; the app does not OCR vendor lists.

## Seed vs import

- **`prisma db seed`** loads `lib/sample-data` (MLB venues from **`mlb-ballparks-venues.json`** plus non-MLB demo stubs).
- **JSON import** is for larger or updated MLB lists without editing TypeScript.
