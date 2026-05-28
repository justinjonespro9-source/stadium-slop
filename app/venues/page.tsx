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
    <main className="media-page-shell min-h-screen">
      <VenuesBrowseClient venues={venues} itemsByVenueSlug={itemsByVenueSlug} />
    </main>
  );
}
