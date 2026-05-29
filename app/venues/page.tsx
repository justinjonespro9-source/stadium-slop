import { VenuesBrowseClient } from "@/components/venues-browse-client";
import { getVenueBrowseSummariesByVenueSlug } from "@/lib/venue-browse-data";
import { getPublicVenues } from "@/lib/public-data";
import { withPublicRouteTiming } from "@/lib/route-timing";

export const revalidate = 300;

export default async function VenuesPage() {
  return withPublicRouteTiming("venues-browse", async () => {
    const [venues, summariesByVenueSlug] = await Promise.all([
      getPublicVenues(),
      getVenueBrowseSummariesByVenueSlug()
    ]);

    return (
      <main className="media-page-shell min-h-screen">
        <VenuesBrowseClient venues={venues} summariesByVenueSlug={summariesByVenueSlug} />
      </main>
    );
  });
}
