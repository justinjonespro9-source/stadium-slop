# Stadium Slop Data Model Plan

This is a database-readiness plan for moving from `lib/sample-data.ts` to real persistence later. It is not a Prisma schema and does not wire a database yet.

## Core Entities

`Reviewer`
: A user-owned fan profile. Owns reviews, helpful likes, photos, suggested items, price reports, and report flags. Public profile surfaces should show display name, handle, avatar, review history, helpful likes received, verified game-day reviews, and photo uploads.

`Venue`
: A stadium, arena, or ballpark. Venues contain vendors and set the review geofence radius used for verified game-day reviews.

`Vendor`
: A concession stand or vendor inside a venue. Vendors belong to one venue and contain items. Vendors should not have a cumulative public rating; public rankings should remain item-based.

`Item`
: A reviewable food or drink listing. Items belong to one venue and one vendor. Item stats are calculated from reviews, not stored as source-of-truth scores.

`Review`
: A structured fan review for an item. Reviews belong to one user and one item, and carry Slop Score, Napkin Rating, labels, optional note, optional photo metadata, verified game-day status, season label, and date/game-day fields.

`HelpfulLike`
: A signed-in user marking one review as helpful. Helpful likes should not create comments, dislikes, DMs, or follower graphs.

`Photo`
: A user-uploaded image record. Photos can be food photos, profile photos, or menu board / price proof photos. Food photos may be attached to reviews. Profile photos may be attached to reviewers.

`PriceReport`
: A user-submitted reported price for an item. Price reports can optionally include a menu board / price proof photo and require admin approval or merge.

`SuggestedItem`
: A user-submitted missing item/vendor/menu suggestion. Suggestions require admin review before becoming public items.

`ReportFlag`
: A user or system report for duplicate content, suspicious activity, bad intel, inappropriate photos, or other moderation concerns.

## Relationships

`Venue -> Vendor -> Item -> Review`
: Venues have many vendors. Vendors have many items. Items have many reviews.

`User -> Review`
: A reviewer owns each review. The review should keep the stable `userId`; display name and handle can be denormalized later only if needed for feed performance.

`User -> HelpfulLike`
: A signed-in user can mark reviews helpful. Enforce one helpful like per user per review.

`User -> Photo`
: A signed-in user owns uploaded photos. Photos can support review trust, profile trust, and price proof.

`Item -> PriceReport`
: Items can receive many price reports. Approved/merged price reports can update the item display price and confirmation metadata.

`User -> SuggestedItem`
: A signed-in user can suggest missing vendors, sections, and menu items.

`User -> ReportFlag`
: A signed-in user can flag reviews, photos, users, price reports, or items for moderation.

## Future Constraints

- Enforce one review per user per item per game/day.
- Enforce one helpful like per user per review.
- Reviews power `allTime`, `season`, and `gameDayFresh` stats.
- `gameDayFresh` should use verified game-day reviews and a time/game window.
- `season` should use review season labels or event dates.
- `allTime` should use every visible review for the item.
- Item stats should be calculated from visible reviews, not manually maintained as canonical item fields.
- Vendor has no cumulative public rating. Vendor pages can show item lineups and item-level stats only.
- Hidden/removed reviews should be excluded from public stats.
- Promoted placements can buy visibility, not rating influence.

## Admin Needs

- Edit venues, teams, leagues, review radius, and venue metadata.
- Edit vendors, sections, locations, and line intel.
- Edit items, categories, sections, sponsorship metadata, availability, and age restriction metadata.
- Approve suggested items or merge them into existing items.
- Approve, reject, or merge price updates.
- Hide or remove reviews from public display and stats.
- Manage users, including suspension and profile review.
- Review flags/reports for duplicate content, suspicious activity, bad intel, or inappropriate photos.
- Review menu board / price proof photos before they affect displayed prices.

## Current Mock Mapping

- `Reviewer`, `HelpfulLike`, `PriceReport`, `SuggestedItem`, and `ReportFlag` are TypeScript-ready models only.
- Current venue, vendor, item, photo, and review sample data continues to live in `lib/sample-data.ts`.
- `lib/slop-stats.ts` already models the intended direction: item standings are computed from review rows.
- Existing item fields like `slopScore`, `reviewCount`, and `priceReportCount` are useful mock display fields, but future persistence should calculate or roll them up from reviews and approved reports.
