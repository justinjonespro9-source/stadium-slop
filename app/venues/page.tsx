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
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
        <header className="py-12">
          <p className="brand-pill mb-4 inline-flex rounded-full border px-4 py-2 text-sm font-semibold">
            Browse Venues
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Start with the venues in the Stadium Slop sample set.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            MLB ballparks lead the list; NFL/NHL neighbors stay for demos. Use
            search or open a venue card.
          </p>
        </header>

        <VenuesBrowseClient venues={venues} itemsByVenueSlug={itemsByVenueSlug} />
      </section>
    </main>
  );
}
