# NFL 2026 regular-season schedule

Canonical source: ESPN’s public NFL scoreboard (season type 2, weeks 1–18).

```
https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&year=2026&week=N
```

`2026-regular-season.json` is a snapshot of those events. Kickoff `startsAt` values are ESPN ISO-8601 **UTC instants** (`…Z`). The importer parses them with `new Date(iso)` and must not treat local wall-clock digits as UTC.

## Commands

```bash
npm run fetch:nfl-schedule          # refresh the snapshot from ESPN
npm run sync:nfl-schedule           # dry-run from the snapshot
npm run sync:nfl-schedule -- --apply
npm run sync:nfl-schedule -- --live --apply   # fetch ESPN, then upsert
npm run test:nfl-schedule
```

Upserts are keyed on `Game.externalId` = `nfl-{espnEventId}`. Re-runs update existing canonical rows and do not delete unrelated leagues or seasons.

## 2026 concessions audit (no production writes)

Food and beverage coverage for the 38 venues used by the 2026 regular-season schedule.

| File | Role |
| --- | --- |
| `2026-concessions-inventory.json` | Read-only snapshot of production Venue / Vendor / FoodItem rows for those 38 venues |
| `2026-concessions-audit.json` | First-pass multi-source reconciliation (new / update / duplicate / possibly discontinued) |
| `scripts/generate-nfl-concessions-audit.py` | Regenerates the audit JSON from the inventory plus researched findings |

Do not import the audit JSON into production as-is. Official stadium/team/operator directories were used in addition to the prior headline CSV, which under-represents real stand menus.

Nissan Stadium pilot payload: `2026-concessions/nissan-stadium.json`. Import with:

```
npm run import:nfl-concessions -- --venue nissan-stadium --dry-run
npm run import:nfl-concessions -- --venue nissan-stadium --apply
```
