import { VenuesBrowseClient } from "@/components/venues-browse-client";
import {
  getPublicFoodItemsByVenueSlug,
  getPublicVenues
} from "@/lib/public-data";
import type { FoodItem } from "@/lib/sample-data";

export default async function VenuesPage() {
  const venues = await getPublicVenues();
  const venueItems = await Promise.all(
    venues.map(async (venue) => ({
      venueSlug: venue.slug,
      items: await getPublicFoodItemsByVenueSlug(venue.slug)
    }))
  );
  const itemsByVenueSlug = Object.fromEntries(
    venueItems.map(({ venueSlug, items }) => [venueSlug, items])
  ) as Record<string, FoodItem[]>;

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-4 lg:px-10">
        <VenuesBrowseClient venues={venues} itemsByVenueSlug={itemsByVenueSlug} />
      </section>
    </main>
  );
}
