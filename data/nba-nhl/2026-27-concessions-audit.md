# 2026–27 NBA and NHL concessions coverage audit

Read-only production inventory taken 2026-10-26T13:51:12.884Z. No vendors, items, reviews, locations, or schedules were changed. No external menu research was done.

Venue scope is the distinct `venueId` on NBA and NHL `Game` rows for season 2026. Shared buildings are one venue. A building is a normal home arena when it is the plurality non-neutral site for at least one club. Every other building on the schedule is special or neutral.

## Totals

- Unique venues: **60** (51 normal home arenas, 9 special or neutral sites)
- Games: **2544** (NBA 1200, NHL 1344)
- Active vendors: **721** (inactive 0)
- Active items: **1217** (inactive 8)
- STRONG 6 · GOOD 26 · THIN 19 · EMPTY 0
- SUSPICIOUS 28 (a venue can also be THIN or GOOD)
- EVENT-SPECIFIC / PENDING 9
- Active items with a price: **1**
- Vendor-as-item rows: **351**
- Headline-CSV rows: **499** · structured rows: **718**

Menus are venue-level. `FoodItem` and `Vendor` have no league column, so NBA and NHL do not get separate catalogs at a shared building.

Two layers show up in the same venues:

- **Headline CSV.** `customCategoryLabel` is Headline Item, Local Partner, Drinks/Social, Dietary/Value, or Seafood. Tags include `Import` and `import-season:2026`. Descriptions are editorial blurbs. The item name is often the vendor name. The CSV section is stored on `sections`. This matches the league headline importer and the cleaned CSVs in `data/league-import/`. Items do not store a source URL.
- **Structured import.** No headline label. Tags such as `Meals`, `local-vendor`, and `signature`. The location string names a concourse and section, and `sections` is empty. Created in May and June 2026. No source URL.

Prices are missing on all but one active item in this scope (North Star Walleye Basket at Grand Casino Arena). That gap is catalog-wide. It is recorded on every venue and is not, by itself, the SUSPICIOUS flag.

## Classification

- **STRONG** — normal home, 30+ active items, at least 20 structured items, vendor-as-item under 40%, specific location on at least half the items.
- **GOOD** — normal home, 20–29 active items.
- **THIN** — normal home, 1–19 active items.
- **EMPTY** — normal home, 0 active items.
- **SUSPICIOUS** — added when the whole menu is headline CSV, vendor-as-item is at least 40%, specific location is under 50%, or an item bundles several generic foods into one row.
- **EVENT-SPECIFIC / PENDING** — the building is not any club's plurality home.

Research priority: HIGH for thin or empty home arenas, MEDIUM for GOOD home arenas (including GOOD + SUSPICIOUS), LOW for STRONG home arenas, and EVENT-SPECIFIC / PENDING for special sites.

## Top 10 deepest menus

Ranked by active item count across every in-scope building. AT&T Stadium is the Cowboys/NFL building menu, not an NHL Stadium Series menu.

1. **Frost Bank Center** — 78 active items, 71 structured, STRONG, NBA
2. **AT&T Stadium** — 60 active items, 53 structured, EVENT-SPECIFIC / PENDING, special site
3. **T-Mobile Arena** — 52 active items, 44 structured, STRONG, NHL
4. **Lenovo Center** — 49 active items, 42 structured, STRONG, NHL
5. **Madison Square Garden** — 44 active items, 36 structured, STRONG, BOTH
6. **Honda Center** — 34 active items, 25 structured, STRONG, NHL
7. **Canada Life Centre** — 31 active items, 26 structured, STRONG, NHL
8. **Prudential Center** — 29 active items, 17 structured, GOOD, NHL
9. **Ball Arena** — 28 active items, 22 structured, GOOD, BOTH
10. **Capital One Arena** — 28 active items, 22 structured, GOOD, BOTH

Tied with the 10th place count: Scotiabank Saddledome (28).

## Top 15 thinnest normal home arenas

Special and neutral sites are excluded.

1. **Benchmark International Arena** — 9 active items, THIN + SUSPICIOUS, NHL
2. **Target Center** — 9 active items, THIN + SUSPICIOUS, NBA
3. **Amerant Bank Arena** — 10 active items, THIN + SUSPICIOUS, NHL
4. **Barclays Center** — 10 active items, THIN + SUSPICIOUS, NBA
5. **Climate Pledge Arena** — 10 active items, THIN + SUSPICIOUS, NHL
6. **Grand Casino Arena** — 10 active items, THIN + SUSPICIOUS, NHL
7. **TD Garden** — 10 active items, THIN + SUSPICIOUS, BOTH
8. **Chase Center** — 11 active items, THIN + SUSPICIOUS, NBA
9. **Crypto.com Arena** — 11 active items, THIN + SUSPICIOUS, BOTH
10. **Fiserv Forum** — 11 active items, THIN + SUSPICIOUS, NBA
11. **Golden 1 Center** — 11 active items, THIN + SUSPICIOUS, NBA
12. **Wells Fargo Center** — 11 active items, THIN + SUSPICIOUS, BOTH
13. **Smoothie King Center** — 12 active items, THIN + SUSPICIOUS, NBA
14. **Toyota Center** — 12 active items, THIN + SUSPICIOUS, NBA
15. **FedExForum** — 13 active items, THIN + SUSPICIOUS, NBA

Same item count as 15th: Kia Center (13), Moda Center (13).

## Empty normal home arenas

None. Every everyday NBA or NHL home arena on this schedule has at least one active item. The smallest home menus have 9 items, and those 9 are headline-CSV rows.

## Most suspicious menus

Score weighs vendor-as-item rate, a pure headline-CSV menu, weak location coverage, and bundle rows. Only normal home arenas are ranked.

1. **Chase Center** — score 81.8, 11 items, entire active menu is a headline-CSV import; vendor-as-item rate 100%
2. **Amerant Bank Arena** — score 75.0, 10 items, entire active menu is a headline-CSV import; vendor-as-item rate 90%
3. **United Center** — score 70.6, 16 items, entire active menu is a headline-CSV import; vendor-as-item rate 81%
4. **Toyota Center** — score 69.2, 12 items, entire active menu is a headline-CSV import; vendor-as-item rate 75%
5. **FedExForum** — score 68.5, 13 items, entire active menu is a headline-CSV import; vendor-as-item rate 77%
6. **Moda Center** — score 68.5, 13 items, entire active menu is a headline-CSV import; vendor-as-item rate 77%
7. **Kia Center** — score 66.2, 13 items, entire active menu is a headline-CSV import; vendor-as-item rate 69%
8. **Grand Casino Arena** — score 65.0, 10 items, entire active menu is a headline-CSV import; vendor-as-item rate 70%
9. **Crypto.com Arena** — score 63.6, 11 items, entire active menu is a headline-CSV import; vendor-as-item rate 64%
10. **Wells Fargo Center** — score 63.6, 11 items, entire active menu is a headline-CSV import; vendor-as-item rate 64%
11. **Target Center** — score 63.3, 9 items, entire active menu is a headline-CSV import; vendor-as-item rate 67%
12. **Barclays Center** — score 60.0, 10 items, entire active menu is a headline-CSV import; vendor-as-item rate 60%
13. **Climate Pledge Arena** — score 60.0, 10 items, entire active menu is a headline-CSV import; vendor-as-item rate 60%
14. **Smoothie King Center** — score 59.2, 12 items, entire active menu is a headline-CSV import; vendor-as-item rate 58%
15. **Fiserv Forum** — score 59.1, 11 items, entire active menu is a headline-CSV import; vendor-as-item rate 55%

## Shared arenas

Each shared building is one venue id and one vendor/item set. No venue has two copies of the same dish split by league.

Additional shared buildings found on the schedule, beyond the named list: Capital One Arena, Delta Center.

- **American Airlines Center** — NBA 40 games, NHL 41 games, 27 active items, 15 active vendors. NBA-only rows 9, NHL-only rows 0, rows tagged both 18. One venue-level menu. Structured rows are tagged for both leagues on the same item. No parallel NBA and NHL catalogs.
- **Ball Arena** — NBA 40 games, NHL 42 games, 28 active items, 11 active vendors. NBA-only rows 6, NHL-only rows 0, rows tagged both 22. One venue-level menu. Structured rows are tagged for both leagues on the same item. No parallel NBA and NHL catalogs.
- **Capital One Arena** — NBA 40 games, NHL 42 games, 28 active items, 13 active vendors. NBA-only rows 6, NHL-only rows 0, rows tagged both 22. One venue-level menu. Structured rows are tagged for both leagues on the same item. No parallel NBA and NHL catalogs.
- **Crypto.com Arena** — NBA 40 games, NHL 42 games, 11 active items, 9 active vendors. NBA-only rows 11, NHL-only rows 0, rows tagged both 0. One venue-level menu. Headline rows are tagged NBA only, so the NHL tenant has no separately imported items. This is a provenance gap, not a second menu.
- **Delta Center** — NBA 40 games, NHL 41 games, 25 active items, 20 active vendors. NBA-only rows 6, NHL-only rows 0, rows tagged both 19. One venue-level menu. Structured rows are tagged for both leagues on the same item. No parallel NBA and NHL catalogs.
- **Little Caesars Arena** — NBA 40 games, NHL 42 games, 20 active items, 14 active vendors. NBA-only rows 9, NHL-only rows 0, rows tagged both 11. One venue-level menu. Structured rows are tagged for both leagues on the same item. No parallel NBA and NHL catalogs.
- **Madison Square Garden** — NBA 40 games, NHL 42 games, 44 active items, 30 active vendors. NBA-only rows 8, NHL-only rows 0, rows tagged both 36. One venue-level menu. Structured rows are tagged for both leagues on the same item. No parallel NBA and NHL catalogs.
- **Scotiabank Arena** — NBA 40 games, NHL 42 games, 26 active items, 14 active vendors. NBA-only rows 8, NHL-only rows 0, rows tagged both 18. One venue-level menu. Structured rows are tagged for both leagues on the same item. No parallel NBA and NHL catalogs.
- **TD Garden** — NBA 40 games, NHL 42 games, 10 active items, 8 active vendors. NBA-only rows 10, NHL-only rows 0, rows tagged both 0. One venue-level menu. Headline rows are tagged NBA only, so the NHL tenant has no separately imported items. This is a provenance gap, not a second menu.
- **United Center** — NBA 40 games, NHL 41 games, 16 active items, 13 active vendors. NBA-only rows 16, NHL-only rows 0, rows tagged both 0. One venue-level menu. Headline rows are tagged NBA only, so the NHL tenant has no separately imported items. This is a provenance gap, not a second menu.
- **Wells Fargo Center** — NBA 40 games, NHL 42 games, 11 active items, 10 active vendors. NBA-only rows 11, NHL-only rows 0, rows tagged both 0. One venue-level menu. Headline rows are tagged NBA only, so the NHL tenant has no separately imported items. This is a provenance gap, not a second menu.

## Special and neutral sites

These buildings are on the 2026–27 schedule and are not any club's everyday home. Existing soccer, football, or concert food is not treated as an NBA or NHL event menu.

- **AT&T Stadium** (`att-stadium`) — NHL, NBA 0, NHL 1, neutral-site games 0. Vendors 22 active / 0 inactive. Items 60 active / 8 inactive. Menu: other sport or event at this building. Home side on the schedule: Dallas Stars (NHL, 1 game). STADIUM in Arlington. Venue-record leagues: NFL. Recurring events on the venue: FIFA World Cup 2026. 0 of 1 scheduled games are neutral-site.
- **Accor Arena** (`accor-arena`) — NBA, NBA 1, NHL 0, neutral-site games 1. Vendors 0 active / 0 inactive. Items 0 active / 0 inactive. Menu: no menu. Home side on the schedule: San Antonio Spurs (NBA, 1 game). ARENA in Paris. Venue-record leagues: NBA. Recurring events on the venue: NBA Paris Game. 1 of 1 scheduled games are neutral-site.
- **Arena CDMX** (`arena-cdmx`) — NBA, NBA 1, NHL 0, neutral-site games 1. Vendors 0 active / 0 inactive. Items 0 active / 0 inactive. Menu: no menu. Home side on the schedule: Indiana Pacers (NBA, 1 game). ARENA in Mexico City. Venue-record leagues: NBA. Recurring events on the venue: NBA Mexico City Game. 1 of 1 scheduled games are neutral-site.
- **Co-op Live** (`co-op-live`) — NBA, NBA 1, NHL 0, neutral-site games 1. Vendors 0 active / 0 inactive. Items 0 active / 0 inactive. Menu: no menu. Home side on the schedule: New Orleans Pelicans (NBA, 1 game). ARENA in Manchester. Venue-record leagues: NBA. Recurring events on the venue: NBA Manchester Game. 1 of 1 scheduled games are neutral-site.
- **Moody Center** (`moody-center`) — NBA, NBA 3, NHL 0, neutral-site games 0. Vendors 0 active / 0 inactive. Items 0 active / 0 inactive. Menu: no menu. Home side on the schedule: San Antonio Spurs (NBA, 3 games). ARENA in Austin. Venue-record leagues: NBA. Recurring events on the venue: San Antonio Spurs Austin games. 0 of 3 scheduled games are neutral-site.
- **PSD Bank Dome** (`psd-bank-dome`) — NHL, NBA 0, NHL 2, neutral-site games 2. Vendors 0 active / 0 inactive. Items 0 active / 0 inactive. Menu: no menu. Home side on the schedule: Ottawa Senators (NHL, 2 games). ARENA in Düsseldorf. Venue-record leagues: NHL. Recurring events on the venue: NHL Global Series. 2 of 2 scheduled games are neutral-site.
- **Princess Auto Stadium** (`princess-auto-stadium`) — NHL, NBA 0, NHL 1, neutral-site games 0. Vendors 0 active / 0 inactive. Items 0 active / 0 inactive. Menu: no menu. Home side on the schedule: Winnipeg Jets (NHL, 1 game). STADIUM in Winnipeg. Venue-record leagues: NHL. Recurring events on the venue: NHL Heritage Classic. 0 of 1 scheduled games are neutral-site.
- **Rice-Eccles Stadium** (`rice-eccles-stadium`) — NHL, NBA 0, NHL 1, neutral-site games 0. Vendors 0 active / 0 inactive. Items 0 active / 0 inactive. Menu: no menu. Home side on the schedule: Utah Mammoth (NHL, 1 game). COLLEGE_STADIUM in Salt Lake City. Venue-record leagues: NCAA, FBS, Big 12. Recurring events on the venue: none. 0 of 1 scheduled games are neutral-site.
- **Veikkaus Arena** (`veikkaus-arena`) — NHL, NBA 0, NHL 2, neutral-site games 2. Vendors 0 active / 0 inactive. Items 0 active / 0 inactive. Menu: no menu. Home side on the schedule: Carolina Hurricanes (NHL, 1 game), Seattle Kraken (NHL, 1 game). ARENA in Helsinki. Venue-record leagues: NHL. Recurring events on the venue: NHL Global Series. 2 of 2 scheduled games are neutral-site.

## Review traction

- Public reviews: **0**
- Unique public reviewers: **0**
- Venues with at least one public review: **0**
- Items with at least one public review: **0**
- Excluded hidden or test reviews: **5**, all at grand-casino-arena

Public means `status = ACTIVE` and `isTestReview = false`.

## Research priority

### High (19)

Thin everyday menus. These are headline-CSV catalogs, usually with the vendor name reused as the item.

- Benchmark International Arena — 9 active items (THIN + SUSPICIOUS)
- Target Center — 9 active items (THIN + SUSPICIOUS)
- Amerant Bank Arena — 10 active items (THIN + SUSPICIOUS)
- Barclays Center — 10 active items (THIN + SUSPICIOUS)
- Climate Pledge Arena — 10 active items (THIN + SUSPICIOUS)
- Grand Casino Arena — 10 active items (THIN + SUSPICIOUS)
- TD Garden — 10 active items (THIN + SUSPICIOUS)
- Chase Center — 11 active items (THIN + SUSPICIOUS)
- Crypto.com Arena — 11 active items (THIN + SUSPICIOUS)
- Fiserv Forum — 11 active items (THIN + SUSPICIOUS)
- Golden 1 Center — 11 active items (THIN + SUSPICIOUS)
- Wells Fargo Center — 11 active items (THIN + SUSPICIOUS)
- Smoothie King Center — 12 active items (THIN + SUSPICIOUS)
- Toyota Center — 12 active items (THIN + SUSPICIOUS)
- FedExForum — 13 active items (THIN + SUSPICIOUS)
- Kia Center — 13 active items (THIN + SUSPICIOUS)
- Moda Center — 13 active items (THIN + SUSPICIOUS)
- United Center — 16 active items (THIN + SUSPICIOUS)
- Bridgestone Arena — 19 active items (THIN + SUSPICIOUS)

### Medium (26)

A structured core exists. Prices are missing, and several of these are also SUSPICIOUS because of vendor-as-item rate or thin location text.

- Little Caesars Arena — 20 active items (GOOD)
- Paycom Center — 21 active items (GOOD + SUSPICIOUS)
- Spectrum Center — 21 active items (GOOD + SUSPICIOUS)
- Kaseya Center — 22 active items (GOOD + SUSPICIOUS)
- SAP Center — 22 active items (GOOD)
- State Farm Arena — 22 active items (GOOD + SUSPICIOUS)
- Bell Centre — 24 active items (GOOD + SUSPICIOUS)
- Enterprise Center — 24 active items (GOOD)
- Intuit Dome — 24 active items (GOOD)
- KeyBank Center — 24 active items (GOOD)
- Canadian Tire Centre — 25 active items (GOOD)
- Delta Center — 25 active items (GOOD)
- Footprint Center — 25 active items (GOOD + SUSPICIOUS)
- Rocket Arena — 25 active items (GOOD)
- Rogers Arena — 25 active items (GOOD)
- Rogers Place — 25 active items (GOOD)
- Scotiabank Arena — 26 active items (GOOD + SUSPICIOUS)
- American Airlines Center — 27 active items (GOOD)
- Gainbridge Fieldhouse — 27 active items (GOOD + SUSPICIOUS)
- Nationwide Arena — 27 active items (GOOD)
- PPG Paints Arena — 27 active items (GOOD)
- UBS Arena — 27 active items (GOOD)
- Ball Arena — 28 active items (GOOD)
- Capital One Arena — 28 active items (GOOD)
- Scotiabank Saddledome — 28 active items (GOOD + SUSPICIOUS)
- Prudential Center — 29 active items (GOOD)

### Low (6)

Structured menus with real dish names and location text. Still missing prices. Keep them and patch metadata later.

- Frost Bank Center — 78 active items (STRONG)
- T-Mobile Arena — 52 active items (STRONG)
- Lenovo Center — 49 active items (STRONG)
- Madison Square Garden — 44 active items (STRONG)
- Honda Center — 34 active items (STRONG)
- Canada Life Centre — 31 active items (STRONG)

### Event-specific / pending

- **AT&T Stadium** — 60 active items, 22 active vendors. other sport or event at this building.
- **Accor Arena** — 0 active items, 0 active vendors. no menu.
- **Arena CDMX** — 0 active items, 0 active vendors. no menu.
- **Co-op Live** — 0 active items, 0 active vendors. no menu.
- **Moody Center** — 0 active items, 0 active vendors. no menu.
- **PSD Bank Dome** — 0 active items, 0 active vendors. no menu.
- **Princess Auto Stadium** — 0 active items, 0 active vendors. no menu.
- **Rice-Eccles Stadium** — 0 active items, 0 active vendors. no menu.
- **Veikkaus Arena** — 0 active items, 0 active vendors. no menu.

## Recommendation

Do the next pass as a targeted research set, not an NFL-style refresh of every NBA and NHL building.

All 51 everyday arenas already have a menu, and none are empty. Six are strong enough to keep: Frost Bank Center, T-Mobile Arena, Lenovo Center, Madison Square Garden, Honda Center, and Canada Life Centre. Twenty-six more have 20–29 active items and a structured layer under the headline rows. Rebuilding those would throw away dish names and locations that are already usable.

The real hole is the 19 thin home arenas. Their menus are the headline CSV: 9 to 19 items, high vendor-as-item rates, no prices, and long blurbs instead of a stand list. That set includes TD Garden, United Center, Wells Fargo Center, and Crypto.com Arena. Research those next, then the nine GOOD arenas flagged SUSPICIOUS for a vendor-as-item rate of 40% or more, location text on under half the items, or a generic-food bundle row.

Leave the nine special sites pending. Eight have no food rows. AT&T Stadium's 60 active items are the Cowboys/NFL menu. That is evidence about the building, not about the NHL Stadium Series, and it should not be copied onto the hockey game as if it were event research. Do not import soccer, college football, or concert food onto Moody Center, Arena CDMX, Accor Arena, Co-op Live, Veikkaus Arena, PSD Bank Dome, Princess Auto Stadium, or Rice-Eccles Stadium without an event-specific source.

A later import can also fill prices and `sections` arrays on the strong and good menus. That is a metadata pass. It is not a reason to re-research every dish.

## Venue appendix

| Venue | Leagues | NBA | NHL | Role | Active vendors | Active items | Structured | Vendor-as-item | Location | Price | Labels | Priority |
| --- | --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Accor Arena | NBA | 1 | 0 | special | 0 | 0 | 0 | 0 | 0 | 0 | EVENT-SPECIFIC / PENDING | EVENT-SPECIFIC / PENDING |
| Amerant Bank Arena | NHL | 0 | 42 | home | 9 | 10 | 0 | 9 | 10 | 0 | THIN + SUSPICIOUS | HIGH |
| American Airlines Center | BOTH | 40 | 41 | home | 15 | 27 | 18 | 4 | 27 | 0 | GOOD | MEDIUM |
| Arena CDMX | NBA | 1 | 0 | special | 0 | 0 | 0 | 0 | 0 | 0 | EVENT-SPECIFIC / PENDING | EVENT-SPECIFIC / PENDING |
| AT&T Stadium | NHL | 0 | 1 | special | 22 | 60 | 53 | 7 | 34 | 0 | EVENT-SPECIFIC / PENDING | EVENT-SPECIFIC / PENDING |
| Ball Arena | BOTH | 40 | 42 | home | 11 | 28 | 22 | 6 | 27 | 0 | GOOD | MEDIUM |
| Barclays Center | NBA | 40 | 0 | home | 7 | 10 | 0 | 6 | 10 | 0 | THIN + SUSPICIOUS | HIGH |
| Bell Centre | NHL | 0 | 42 | home | 11 | 24 | 16 | 4 | 10 | 0 | GOOD + SUSPICIOUS | MEDIUM |
| Benchmark International Arena | NHL | 0 | 42 | home | 9 | 9 | 0 | 4 | 9 | 0 | THIN + SUSPICIOUS | HIGH |
| Bridgestone Arena | NHL | 0 | 42 | home | 11 | 19 | 10 | 9 | 17 | 0 | THIN + SUSPICIOUS | HIGH |
| Canada Life Centre | NHL | 0 | 41 | home | 12 | 31 | 26 | 4 | 19 | 0 | STRONG | LOW |
| Canadian Tire Centre | NHL | 0 | 41 | home | 18 | 25 | 19 | 3 | 25 | 0 | GOOD | MEDIUM |
| Capital One Arena | BOTH | 40 | 42 | home | 13 | 28 | 22 | 3 | 28 | 0 | GOOD | MEDIUM |
| Chase Center | NBA | 40 | 0 | home | 11 | 11 | 0 | 11 | 10 | 0 | THIN + SUSPICIOUS | HIGH |
| Climate Pledge Arena | NHL | 0 | 41 | home | 9 | 10 | 0 | 6 | 10 | 0 | THIN + SUSPICIOUS | HIGH |
| Co-op Live | NBA | 1 | 0 | special | 0 | 0 | 0 | 0 | 0 | 0 | EVENT-SPECIFIC / PENDING | EVENT-SPECIFIC / PENDING |
| Crypto.com Arena | BOTH | 40 | 42 | home | 9 | 11 | 0 | 7 | 10 | 0 | THIN + SUSPICIOUS | HIGH |
| Delta Center | BOTH | 40 | 41 | home | 20 | 25 | 19 | 4 | 14 | 0 | GOOD | MEDIUM |
| Enterprise Center | NHL | 0 | 42 | home | 13 | 24 | 14 | 5 | 24 | 0 | GOOD | MEDIUM |
| FedExForum | NBA | 40 | 0 | home | 13 | 13 | 0 | 10 | 13 | 0 | THIN + SUSPICIOUS | HIGH |
| Fiserv Forum | NBA | 40 | 0 | home | 8 | 11 | 0 | 6 | 10 | 0 | THIN + SUSPICIOUS | HIGH |
| Footprint Center | NBA | 40 | 0 | home | 12 | 25 | 20 | 3 | 4 | 0 | GOOD + SUSPICIOUS | MEDIUM |
| Frost Bank Center | NBA | 36 | 0 | home | 27 | 78 | 71 | 7 | 78 | 0 | STRONG | LOW |
| Gainbridge Fieldhouse | NBA | 39 | 0 | home | 19 | 27 | 14 | 14 | 25 | 0 | GOOD + SUSPICIOUS | MEDIUM |
| Golden 1 Center | NBA | 40 | 0 | home | 8 | 11 | 0 | 6 | 11 | 0 | THIN + SUSPICIOUS | HIGH |
| Grand Casino Arena | NHL | 0 | 42 | home | 9 | 10 | 0 | 7 | 10 | 1 | THIN + SUSPICIOUS | HIGH |
| Honda Center | NHL | 0 | 42 | home | 15 | 34 | 25 | 2 | 34 | 0 | STRONG | LOW |
| Intuit Dome | NBA | 40 | 0 | home | 6 | 24 | 21 | 2 | 21 | 0 | GOOD | MEDIUM |
| Kaseya Center | NBA | 40 | 0 | home | 14 | 22 | 10 | 11 | 20 | 0 | GOOD + SUSPICIOUS | MEDIUM |
| KeyBank Center | NHL | 0 | 42 | home | 20 | 24 | 13 | 7 | 24 | 0 | GOOD | MEDIUM |
| Kia Center | NBA | 40 | 0 | home | 13 | 13 | 0 | 9 | 12 | 0 | THIN + SUSPICIOUS | HIGH |
| Lenovo Center | NHL | 0 | 41 | home | 22 | 49 | 42 | 6 | 49 | 0 | STRONG | LOW |
| Little Caesars Arena | BOTH | 40 | 42 | home | 14 | 20 | 11 | 5 | 20 | 0 | GOOD | MEDIUM |
| Madison Square Garden | BOTH | 40 | 42 | home | 30 | 44 | 36 | 12 | 44 | 0 | STRONG | LOW |
| Moda Center | NBA | 40 | 0 | home | 13 | 13 | 0 | 10 | 13 | 0 | THIN + SUSPICIOUS | HIGH |
| Moody Center | NBA | 3 | 0 | special | 0 | 0 | 0 | 0 | 0 | 0 | EVENT-SPECIFIC / PENDING | EVENT-SPECIFIC / PENDING |
| Nationwide Arena | NHL | 0 | 42 | home | 14 | 27 | 14 | 9 | 15 | 0 | GOOD | MEDIUM |
| Paycom Center | NBA | 40 | 0 | home | 16 | 21 | 11 | 9 | 21 | 0 | GOOD + SUSPICIOUS | MEDIUM |
| PPG Paints Arena | NHL | 0 | 42 | home | 16 | 27 | 12 | 6 | 25 | 0 | GOOD | MEDIUM |
| Princess Auto Stadium | NHL | 0 | 1 | special | 0 | 0 | 0 | 0 | 0 | 0 | EVENT-SPECIFIC / PENDING | EVENT-SPECIFIC / PENDING |
| Prudential Center | NHL | 0 | 42 | home | 17 | 29 | 17 | 8 | 21 | 0 | GOOD | MEDIUM |
| PSD Bank Dome | NHL | 0 | 2 | special | 0 | 0 | 0 | 0 | 0 | 0 | EVENT-SPECIFIC / PENDING | EVENT-SPECIFIC / PENDING |
| Rice-Eccles Stadium | NHL | 0 | 1 | special | 0 | 0 | 0 | 0 | 0 | 0 | EVENT-SPECIFIC / PENDING | EVENT-SPECIFIC / PENDING |
| Rocket Arena | NBA | 40 | 0 | home | 15 | 25 | 15 | 7 | 18 | 0 | GOOD | MEDIUM |
| Rogers Arena | NHL | 0 | 42 | home | 10 | 25 | 16 | 5 | 19 | 0 | GOOD | MEDIUM |
| Rogers Place | NHL | 0 | 42 | home | 19 | 25 | 17 | 5 | 25 | 0 | GOOD | MEDIUM |
| SAP Center | NHL | 0 | 42 | home | 14 | 22 | 10 | 1 | 19 | 0 | GOOD | MEDIUM |
| Scotiabank Arena | BOTH | 40 | 42 | home | 14 | 26 | 18 | 5 | 9 | 0 | GOOD + SUSPICIOUS | MEDIUM |
| Scotiabank Saddledome | NHL | 0 | 42 | home | 18 | 28 | 22 | 5 | 9 | 0 | GOOD + SUSPICIOUS | MEDIUM |
| Smoothie King Center | NBA | 39 | 0 | home | 11 | 12 | 0 | 7 | 12 | 0 | THIN + SUSPICIOUS | HIGH |
| Spectrum Center | NBA | 40 | 0 | home | 13 | 21 | 13 | 8 | 21 | 0 | GOOD + SUSPICIOUS | MEDIUM |
| State Farm Arena | NBA | 40 | 0 | home | 12 | 22 | 11 | 10 | 19 | 0 | GOOD + SUSPICIOUS | MEDIUM |
| T-Mobile Arena | NHL | 0 | 42 | home | 24 | 52 | 44 | 7 | 52 | 0 | STRONG | LOW |
| Target Center | NBA | 40 | 0 | home | 6 | 9 | 0 | 6 | 9 | 0 | THIN + SUSPICIOUS | HIGH |
| TD Garden | BOTH | 40 | 42 | home | 8 | 10 | 0 | 5 | 8 | 0 | THIN + SUSPICIOUS | HIGH |
| Toyota Center | NBA | 40 | 0 | home | 10 | 12 | 0 | 9 | 11 | 0 | THIN + SUSPICIOUS | HIGH |
| UBS Arena | NHL | 0 | 42 | home | 18 | 27 | 16 | 10 | 19 | 0 | GOOD | MEDIUM |
| United Center | BOTH | 40 | 41 | home | 13 | 16 | 0 | 13 | 16 | 0 | THIN + SUSPICIOUS | HIGH |
| Veikkaus Arena | NHL | 0 | 2 | special | 0 | 0 | 0 | 0 | 0 | 0 | EVENT-SPECIFIC / PENDING | EVENT-SPECIFIC / PENDING |
| Wells Fargo Center | BOTH | 40 | 42 | home | 10 | 11 | 0 | 7 | 10 | 0 | THIN + SUSPICIOUS | HIGH |
