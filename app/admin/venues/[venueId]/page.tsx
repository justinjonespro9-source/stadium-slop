import { VenueType } from "@prisma/client";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { VENUE_TYPE_OPTIONS } from "@/lib/venue-display";

type AdminVenueDetailPageProps = {
  params: Promise<{
    venueId: string;
  }>;
};

function parseList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function updateVenue(formData: FormData) {
  "use server";

  const venueId = String(formData.get("venueId") ?? "");
  const reviewRadiusMeters = Number(formData.get("reviewRadiusMeters"));

  const rawType = String(formData.get("venueType") ?? VenueType.STADIUM);
  const venueType = Object.values(VenueType).includes(rawType as VenueType)
    ? (rawType as VenueType)
    : VenueType.STADIUM;

  await prisma.venue.update({
    where: { id: venueId },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      state: String(formData.get("state") ?? "").trim(),
      country: String(formData.get("country") ?? "").trim() || "USA",
      region: String(formData.get("region") ?? "").trim() || "North America",
      leagues: parseList(formData.get("leagues")),
      teams: parseList(formData.get("teams")),
      sports: parseList(formData.get("sports")),
      primarySport: String(formData.get("primarySport") ?? "").trim() || null,
      recurringEvents: parseList(formData.get("recurringEvents")),
      surfaceType: String(formData.get("surfaceType") ?? "").trim() || null,
      venueType,
      reviewRadiusMeters: Number.isFinite(reviewRadiusMeters)
        ? reviewRadiusMeters
        : 800
    }
  });

  revalidatePath("/admin/venues");
  revalidatePath(`/admin/venues/${venueId}`);
  redirect(`/admin/venues/${venueId}`);
}

async function createVendor(formData: FormData) {
  "use server";

  const venueId = String(formData.get("venueId") ?? "");
  const name = String(formData.get("vendorName") ?? "").trim();
  const slug = String(formData.get("vendorSlug") ?? "").trim();

  if (!venueId || !name || !slug) {
    redirect(`/admin/venues/${venueId}`);
  }

  await prisma.vendor.upsert({
    where: {
      venueId_slug: {
        venueId,
        slug
      }
    },
    update: {
      name,
      section: String(formData.get("vendorSection") ?? "").trim(),
      location: String(formData.get("vendorLocation") ?? "").trim(),
      status: "ACTIVE"
    },
    create: {
      venueId,
      name,
      slug,
      section: String(formData.get("vendorSection") ?? "").trim(),
      location: String(formData.get("vendorLocation") ?? "").trim(),
      status: "ACTIVE"
    }
  });

  revalidatePath(`/admin/venues/${venueId}`);
  redirect(`/admin/venues/${venueId}`);
}

export default async function AdminVenueDetailPage({
  params
}: AdminVenueDetailPageProps) {
  const { venueId } = await params;
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    include: {
      vendors: {
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { items: true }
          }
        }
      },
      items: {
        orderBy: { name: "asc" },
        include: {
          vendor: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!venue) {
    notFound();
  }

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href="/admin/venues"
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to venues
        </Link>

        <header className="mt-5">
          <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            Venue edit
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {venue.name}
          </h1>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <form action={updateVenue} className="brand-panel rounded-3xl border p-5">
            <input type="hidden" name="venueId" value={venue.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["name", "Name", venue.name],
                ["slug", "Slug", venue.slug],
                ["city", "City", venue.city],
                ["state", "State", venue.state],
                ["country", "Country", venue.country],
                ["region", "Region", venue.region],
                ["leagues", "Leagues / tours (comma)", venue.leagues.join(", ")],
                ["teams", "Teams", venue.teams.join(", ")],
                ["sports", "Sports", venue.sports.join(", ")],
                [
                  "primarySport",
                  "Primary sport (optional)",
                  venue.primarySport ?? ""
                ],
                [
                  "recurringEvents",
                  "Signature events (comma, optional)",
                  venue.recurringEvents.join(", ")
                ],
                [
                  "surfaceType",
                  "Surface / course type (optional)",
                  venue.surfaceType ?? ""
                ],
                [
                  "reviewRadiusMeters",
                  "Review radius meters",
                  String(venue.reviewRadiusMeters)
                ]
              ].map(([name, label, value]) => (
                <label key={name} className="grid gap-2 text-sm font-bold text-zinc-300">
                  {label}
                  <input
                    name={name}
                    defaultValue={value}
                    className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
                  />
                </label>
              ))}
              <label className="grid gap-2 text-sm font-bold text-zinc-300">
                Venue type
                <select
                  name="venueType"
                  defaultValue={venue.venueType}
                  className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
                >
                  {VENUE_TYPE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="submit"
              className="brand-cta mt-5 rounded-full px-6 py-3 text-sm font-black"
            >
              Save venue
            </button>
          </form>

          <div className="grid gap-5">
            <section className="brand-card rounded-3xl border p-5">
              <h2 className="text-xl font-black">Vendors</h2>
              <form action={createVendor} className="mt-4 grid gap-3 rounded-2xl bg-black p-4">
                <input type="hidden" name="venueId" value={venue.id} />
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-500">
                  Add Vendor
                </p>
                <input
                  name="vendorName"
                  required
                  placeholder="Vendor name"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  name="vendorSlug"
                  required
                  placeholder="vendor-slug"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  name="vendorSection"
                  required
                  placeholder="Section or concourse"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  name="vendorLocation"
                  required
                  placeholder="Location"
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
                />
                <button
                  type="submit"
                  className="brand-cta rounded-full px-5 py-3 text-sm font-black"
                >
                  Add vendor
                </button>
              </form>
              <div className="mt-4 grid gap-2">
                {venue.vendors.map((vendor) => (
                  <Link
                    key={vendor.id}
                    href={`/admin/vendors/${vendor.id}`}
                    className="rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-[var(--slop-orange)]"
                  >
                    <p className="font-black">{vendor.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {vendor.section} · {vendor.location} · {vendor._count.items} items
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="brand-card rounded-3xl border p-5">
              <h2 className="text-xl font-black">Food items</h2>
              <div className="mt-4 grid gap-2">
                {venue.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/items/${item.id}`}
                    className="rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-[var(--slop-orange)]"
                  >
                    <p className="font-black">{item.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {item.vendor.name} · {item.status}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
