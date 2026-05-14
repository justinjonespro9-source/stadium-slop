# MLB-first venue / vendor / item import

Stadium Slop is expanding **MLB / baseball first**. Use this folder for bulk ballpark data; golf, tennis, racing, etc. are out of scope for now.

## Canonical JSON shape

See **`mlb-import.example.json`**. Top-level fields:

- `version` — must be `1`
- `venues` — ballparks (slug, name, city, state, team, lat/lng, …)
- `vendors` — stands / bars (`venueSlug`, `slug`, `name`, `section`, `location`)
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

- **`prisma db seed`** still loads `lib/sample-data` (includes MLB ballpark stubs for offline fallback).
- **JSON import** is for larger or updated MLB lists without editing TypeScript.
