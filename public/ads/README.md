# Sponsor ad assets

## Team-M8tes featured promo

Place the hero image at:

`public/ads/team-m8tes-fandom-filter.png`

All Team-M8tes placements use this image plus the shared copy in `lib/team-m8tes-promo.ts`.

To sync DB placement metadata (title, body, CTA, image URL):

```bash
npm run seed:ad-placements
```

Legacy poster assets (`team-m8tes-poster.png` / `.svg`) are no longer used by the promo component.
