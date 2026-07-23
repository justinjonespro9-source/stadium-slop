# Active venue (0,0) coordinate backfill — radius review notes

Generated alongside `zero-coord-backfill-backlog.json`. Radii were **not** changed.

## All 65 backfill venues

| Flag | Finding |
|------|---------|
| Below 300m | None (all 800m) |
| Above 1,500m | None (all 800m) |
| Current radius | **800m** for every placeholder venue |

## Flagged for human review (no auto-change)

### Large stadium campuses / parking footprints likely larger than 800m
These NFL stadiums often have extensive parking and outbuildings; 800m may under-certify fans in far lots or early tailgates while still covering the bowl:

- `allegiant-stadium` (Las Vegas)
- `caesars-superdome` (New Orleans)
- `empower-field-at-mile-high` (Denver)
- `everbank-stadium` (Jacksonville)
- `highmark-stadium` (Orchard Park)
- `huntington-bank-field` (Cleveland)
- `lambeau-field` (Green Bay)
- `lucas-oil-stadium` (Indianapolis)
- `m-t-bank-stadium` (Baltimore)
- `northwest-stadium` (Landover)
- `raymond-james-stadium` (Tampa)
- `state-farm-stadium` (Glendale)
- `acrisure-stadium` (Pittsburgh)
- `ford-field` (Detroit — downtown footprint smaller; parking still sprawling)
- `paycor-stadium` (Cincinnati)

World Cup host NFL venues in-registry already use **1000m**; consider aligning these to 1000m in a follow-up.

### Shared arenas / multi-team complexes
Still appropriate at 800m for the building itself; note co-tenants share one geofence:

- `american-airlines-center` (NBA + NHL)
- `ball-arena` (NBA + NHL)
- `capital-one-arena` (NBA + NHL)
- `crypto-com-arena` (NBA; LA Live complex adjacency)
- `delta-center` (NBA + NHL)
- `gainbridge-fieldhouse` (NBA + WNBA)
- `little-caesars-arena` (NBA + NHL)
- `madison-square-garden` (NBA + NHL; dense Midtown)
- `scotiabank-arena` (NBA + NHL)
- `target-center` (NBA + WNBA)
- `td-garden` (NBA + NHL)
- `united-center` (NBA + NHL)
- `wells-fargo-center` (NBA + NHL)
- `smoothie-king-center` + `caesars-superdome` (adjacent New Orleans complex — separate venue rows)

### Dense downtown settings (800m may reach nearby buildings/transit)
Certifies the arena; may also cover adjacent blocks — acceptable for on-site food, watch if abuse appears:

- `madison-square-garden`
- `td-garden`
- `capital-one-arena`
- `chase-center`
- `golden-1-center`
- `barclays-center`
- `kaseya-center`
- `scotiabank-arena`

### Fairgrounds / campuses
None in this 65-venue NFL/NBA/NHL set.
