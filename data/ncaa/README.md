# NCAA venue + menu import

Structured JSON import for college football and basketball venues. Follows the same idempotent upsert pattern as MLB and MLS/NWSL imports.

## Payload shape

```json
{
  "version": 1,
  "venues": [
    {
      "slug": "michigan-stadium",
      "name": "Michigan Stadium",
      "school": "University of Michigan",
      "team": "Michigan Wolverines",
      "sport": "Football",
      "conference": "Big Ten",
      "subdivision": "FBS",
      "city": "Ann Arbor",
      "state": "MI",
      "latitude": 42.2659,
      "longitude": -83.7487,
      "reviewRadiusMeters": 1200,
      "timeZone": "America/Detroit",
      "venueType": "COLLEGE_STADIUM",
      "mergeIntoVenueSlug": "snapdragon-stadium",
      "sourceUrl": "https://mgoblue.com/sports/football"
    }
  ],
  "items": [
    {
      "venueSlug": "michigan-stadium",
      "vendor": "Tony's BBQ",
      "section": "North End Zone",
      "item_name": "Tony's BBQ Pulled Pork Sandwich",
      "description": "...",
      "category": "bbq",
      "source_url": "https://mgoblue.com/sports/football",
      "tags": ["college-football", "signature"]
    }
  ]
}
```

## Metadata mapping

| JSON field | DB field |
|------------|----------|
| `school` | `Venue.school` |
| `team` | `Venue.teams[]` |
| `sport` | `Venue.sports[]`, `Venue.primarySport` |
| `conference`, `subdivision` | `Venue.leagues[]` (with `NCAA`) |
| `timeZone` | `Venue.timeZone` |
| `reviewRadiusMeters` | `Venue.reviewRadiusMeters` |
| `venueType` | `Venue.venueType` (default `COLLEGE_STADIUM`) |
| `mergeIntoVenueSlug` | Merges tenant into existing pro/shared venue |

Geo fallbacks live in `lib/ncaa-venue-geo.ts`. Shared-venue tenants are merged via `lib/ncaa-venue-registry.ts` and `lib/venue-teams.ts`.

## Flat CSV alternative

The league CSV importer also accepts optional NCAA columns:

- `school`, `conference`, `sport`, `timezone`, `review_radius_meters`

Use `league=NCAA` (or `NCAA Football` / `NCAA Basketball`) for flat spreadsheet rows.

## Run import

```bash
npm run import:ncaa -- --dry-run
npm run import:ncaa -- --apply
npm run import:ncaa -- --apply ./data/ncaa/custom-pack.json
```

## Source of truth

Curate item-level rows from official athletics gameday / concessions pages. The pilot pack (`ncaa-venues.json`) uses athletics site URLs as `source_url` anchors — re-verify menus each season.

Excluded automatically: alcohol, generic beverages, generic popcorn/peanuts/candy, vendor-name-only stubs.

## Shared venues

When a college tenant shares a building with pro sports (e.g. San Diego State at Snapdragon Stadium), set `mergeIntoVenueSlug` to the canonical Stadium Slop slug. The import attaches the college team without duplicating the venue row.
