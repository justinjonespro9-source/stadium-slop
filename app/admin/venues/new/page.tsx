import { VenueType } from "@prisma/client";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminAccess } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { VENUE_TYPE_OPTIONS } from "@/lib/venue-display";

function parseList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function createVenue(formData: FormData) {
  "use server";

  await requireAdminAccess();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  if (!name || !slug || !city || !state) {
    redirect("/admin/venues/new?error=required");
  }

  const rawType = String(formData.get("venueType") ?? VenueType.STADIUM);
  const venueType = Object.values(VenueType).includes(rawType as VenueType)
    ? (rawType as VenueType)
    : VenueType.STADIUM;

  const reviewRadiusMeters = Number(formData.get("reviewRadiusMeters"));
  const country = String(formData.get("country") ?? "").trim() || "USA";
  const region = String(formData.get("region") ?? "").trim() || "North America";

  const venue = await prisma.venue.create({
    data: {
      name,
      slug,
      city,
      state,
      country,
      region,
      leagues: parseList(formData.get("leagues")),
      teams: parseList(formData.get("teams")),
      sports: parseList(formData.get("sports")),
      primarySport: String(formData.get("primarySport") ?? "").trim() || null,
      recurringEvents: parseList(formData.get("recurringEvents")),
      surfaceType: String(formData.get("surfaceType") ?? "").trim() || null,
      latitude: 39.8283,
      longitude: -98.5795,
      reviewRadiusMeters: Number.isFinite(reviewRadiusMeters)
        ? reviewRadiusMeters
        : 800,
      venueType,
      status: "ACTIVE"
    }
  });

  revalidatePath("/admin/venues");
  redirect(`/admin/venues/${venue.id}`);
}

export default async function AdminNewVenuePage() {
  await requireAdminAccess();

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href="/admin/venues"
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to venues
        </Link>

        <header className="mt-5">
          <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            Add venue
          </p>
          <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            New venue
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Compact form — set map coordinates later from edit. Defaults: USA,
            North America, placeholder lat/long for the map.
          </p>
        </header>

        <form action={createVenue} className="brand-panel mt-8 grid gap-4 rounded-3xl border p-5">
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Name
            <input
              name="name"
              required
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Slug
            <input
              name="slug"
              required
              placeholder="my-venue-slug"
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              City
              <input
                name="city"
                required
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              State
              <input
                name="state"
                required
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Country
              <input
                name="country"
                defaultValue="USA"
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Region
              <input
                name="region"
                defaultValue="North America"
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Venue type
            <select
              name="venueType"
              defaultValue={VenueType.STADIUM}
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            >
              {VENUE_TYPE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Leagues / tours (comma)
            <input
              name="leagues"
              placeholder="MLB, PGA Tour"
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Teams (comma)
            <input name="teams" className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Sports (comma)
            <input name="sports" className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Primary sport (optional)
            <input
              name="primarySport"
              placeholder="Tennis"
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Signature events (comma, optional)
            <input
              name="recurringEvents"
              placeholder="US Open, Fan Week"
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Surface / course type (optional)
            <input
              name="surfaceType"
              placeholder="Hard court, Superspeedway, Links"
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Review radius (m)
            <input
              name="reviewRadiusMeters"
              type="number"
              defaultValue={800}
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>
          <button type="submit" className="brand-cta mt-2 rounded-full px-6 py-3 text-sm font-black">
            Create venue
          </button>
        </form>
      </section>
    </main>
  );
}
