# MLS / NWSL import data

Structured concession import from `SS_MLS_NWSL_VENUE_ITEMS.docx`.

## Commands

```bash
# Parse DOCX → CSV (no database)
npx tsx scripts/parse-mls-nwsl-docx.ts

# Parse + upsert venues, teams, vendors, items
npm run import:mls-nwsl
```

Default DOCX path: `~/Documents/SS_MLS_NWSL_VENUE_ITEMS.docx`

## Shared stadiums

Soccer tenants merge into existing NFL/MLB venues (no duplicate slugs):

- Mercedes-Benz Stadium — Atlanta United FC
- Bank of America Stadium — Charlotte FC
- Soldier Field — Chicago Fire FC
- Gillette Stadium — New England Revolution, Boston Legacy FC
- Lumen Field — Seattle Sounders FC, Seattle Reign FC
- Yankee Stadium / Citi Field — New York City FC

Multi-tenant soccer-only venues (e.g. Audi Field, Shell Energy Stadium, BMO Stadium) are created or updated in place.

Soccer-specific venues with a single MLS tenant include:

- Toyota Stadium (`toyota-stadium`) — FC Dallas, Frisco TX
- DICK'S Sporting Goods Park (`dick-s-sporting-goods-park`) — Colorado Rapids, Commerce City CO

## Output

- `mls-nwsl-venues-import.cleaned.csv` — flat rows for review / `import:league` compatibility
- Import logs: venues created/updated, teams attached, vendors/items upserted, review flags
