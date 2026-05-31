# State Fair Slop — fair import

Preview listings use **2025 public sources** (official fair announcements). No third-party review opinions are imported.

## Commands

```bash
# Ensure venue shells (dry-run first)
npm run ensure:fair-venues -- --dry-run
npm run ensure:fair-venues -- --apply

# Menu import (ensures venues in dry-run preview; use --apply to write)
npm run import:fair-menu -- --fair=minnesota-state-fair --dry-run
npm run import:fair-menu -- --fair=minnesota-state-fair --source=core-catalog --dry-run
npm run import:fair-menu -- --fair=all --dry-run
npm run import:fair-menu -- --fair=all --apply
```

### Minnesota core catalog

`--source=core-catalog` (Minnesota only) pulls item names from the official kickoff vendor page at [mnstatefair.org/kickoff-to-summer/vendors](https://www.mnstatefair.org/kickoff-to-summer/vendors/), dedupes the 2025 new-food preview list, and tags rows with `core-catalog` + `official-source`.

## Fairgrounds geolocation

Approximate fair center coordinates and review radii live in `lib/fair-import/venues.ts` (1100–1400 m). Sync to the database after changing registry values:

```bash
npm run sync:fair-venue-geo
npm run sync:fair-venue-geo -- --apply
```

IANA timezones: `lib/fair-venue-geo.ts` (America/Chicago except The Big E → America/New_York).

## Fair slugs

- `minnesota-state-fair`
- `iowa-state-fair`
- `state-fair-of-texas`
- `wisconsin-state-fair`
- `the-big-e` (venue shell only — menu TODO)
