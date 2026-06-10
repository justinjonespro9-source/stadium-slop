# League venue / vendor / menu import (flat rows)

Stadium Slop can ingest **one spreadsheet row per menu item** without editing TypeScript. This folder holds templates only — **no full league data is checked in yet**.

## CSV columns

| Column | Required | Maps to |
|--------|----------|---------|
| `league` | yes | `Venue.leagues[]` |
| `team` | yes | `Venue.teams[]` (deduped by normalized slug) |
| `venue` | yes | `Venue.name` + venue slug |
| `city` | yes | `Venue.city` |
| `state` | yes | `Venue.state` |
| `vendor` | yes | Vendor brand name |
| `stand_name` | no | Stand segment → vendor slug `{vendor}--{stand}` |
| `section` | no | `Vendor.section` / item sections |
| `item_name` | yes | `FoodItem.name` + item slug |
| `description` | no | `FoodItem.description` |
| `price` | no | `FoodItem.basePrice` (empty = null) |
| `category` | no | `ItemCategory` / `customCategoryLabel` |
| `source_url` | no | `FoodItem.tags` (`import-source:…`) until a DB column exists |
| `season` | no | `FoodItem.seasonIntroduced` |

Optional columns: `venue_slug`, `latitude`, `longitude`, `school`, `conference`, `sport`, `subdivision`, `timezone`, `review_radius_meters`.

For NCAA college venues, prefer the structured JSON importer: `npm run import:ncaa -- --dry-run` (see `data/ncaa/README.md`).

Lines starting with `#` are ignored.

## Slug rules

Implemented in `lib/import-slugs.ts`:

- **Venue** — `slugify(venue)` or explicit `venue_slug`
- **Team** — slug used only to dedupe names on `Venue.teams[]`
- **Vendor** — `slugify(vendor)` or `slugify(vendor--stand)` when `stand_name` is set
- **Stand** — encoded in vendor slug (no `Stand` table yet)
- **Food item** — `slugify({vendorSlug}-{item_name})` unique per venue

## Duplicate prevention

Repeated imports **upsert** on stable keys:

- `Venue.slug` (global unique)
- `Vendor` — `@@unique([venueId, slug])`
- `FoodItem` — `@@unique([venueId, slug])`

Existing reviews and user data are not deleted when re-importing menus.

## Run an import

```bash
npm run import:league -- ./data/league-import/your-menu.csv
npm run import:league -- ./data/league-import/your-menu.json
```

JSON shape: `{ "version": 1, "rows": [ { "league": "MLB", ... } ] }` — see `league-import.example.json`.

## Seed vs import

- **`npm run db:seed`** — still uses `lib/sample-data.ts` (MLB JSON + demo venues). Unchanged.
- **`npm run import:mlb`** — structured MLB JSON (`lib/mlb-import-shape.ts`).
- **`npm run import:league`** — flat CSV/JSON for full league spreadsheets.

## Schema (future)

No migration in the template pass. Possible later fields: `FoodItem.importSourceUrl`, dedicated `Stand` / `Team` models. See comments in `lib/league-import-shape.ts`.
