import { EntityStatus, ItemCategory, ItemType } from "@prisma/client";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { requireAdminAccess } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

type AdminItemDetailPageProps = {
  params: Promise<{
    itemId: string;
  }>;
};

function parseSections(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((section) => section.trim())
    .filter(Boolean);
}

async function updateFoodItem(formData: FormData) {
  "use server";

  await requireAdminAccess();
  const itemId = String(formData.get("itemId") ?? "");
  const reportedPriceValue = String(formData.get("reportedPrice") ?? "").trim();
  const reportedPrice = reportedPriceValue ? Number(reportedPriceValue) : null;

  await prisma.foodItem.update({
    where: { id: itemId },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      vendorId: String(formData.get("vendorId") ?? ""),
      itemType: String(formData.get("itemType") ?? ItemType.FOOD) as ItemType,
      category: String(formData.get("category") ?? ItemCategory.OTHER) as ItemCategory,
      customCategoryLabel:
        String(formData.get("customCategoryLabel") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      sections: parseSections(formData.get("sections")),
      reportedPrice,
      status: String(formData.get("status") ?? EntityStatus.ACTIVE) as EntityStatus
    }
  });

  const published = await prisma.foodItem.findUnique({
    where: { id: itemId },
    select: { slug: true, venue: { select: { slug: true } } }
  });
  if (published?.venue?.slug) {
    revalidatePath(`/venues/${published.venue.slug}/${published.slug}`);
  }

  revalidatePath(`/admin/items/${itemId}`);
  redirect(`/admin/items/${itemId}`);
}

export default async function AdminItemDetailPage({
  params
}: AdminItemDetailPageProps) {
  await requireAdminAccess();

  const { itemId } = await params;
  const item = await prisma.foodItem.findUnique({
    where: { id: itemId },
    include: {
      venue: true,
      vendor: true
    }
  });

  if (!item) {
    notFound();
  }

  const vendors = await prisma.vendor.findMany({
    where: { venueId: item.venueId },
    orderBy: { name: "asc" }
  });

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href={`/admin/venues/${item.venueId}`}
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to venue
        </Link>

        <header className="mt-5">
          <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            Item edit
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {item.name}
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            {item.venue.name} · {item.vendor.name}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/venues/${item.venue.slug}/${item.slug}`}
              className="inline-flex rounded-full border border-[var(--slop-orange)] px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-[var(--slop-orange)] hover:bg-[var(--slop-orange)] hover:text-[var(--slop-ink)]"
            >
              View public item page
            </Link>
            <Link
              href={`/venues/${item.venue.slug}`}
              className="inline-flex rounded-full border border-zinc-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300 hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
            >
              View public venue
            </Link>
            <Link
              href={`/venues/${item.venue.slug}/vendors/${item.vendor.slug}`}
              className="inline-flex rounded-full border border-zinc-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300 hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
            >
              View public vendor
            </Link>
          </div>
        </header>

        <form action={updateFoodItem} className="brand-panel mt-8 rounded-3xl border p-5">
          <input type="hidden" name="itemId" value={item.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["name", "Name", item.name],
              ["slug", "Slug", item.slug],
              ["customCategoryLabel", "Category label", item.customCategoryLabel ?? ""],
              ["location", "Location", item.location],
              ["sections", "Sections", item.sections.join(", ")],
              [
                "reportedPrice",
                "Reported price",
                item.reportedPrice ? String(item.reportedPrice) : ""
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
              Vendor
              <select
                name="vendorId"
                defaultValue={item.vendorId}
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
              >
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Item type
              <select
                name="itemType"
                defaultValue={item.itemType}
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
              >
                {Object.values(ItemType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Category
              <select
                name="category"
                defaultValue={item.category}
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
              >
                {Object.values(ItemCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Status
              <select
                name="status"
                defaultValue={item.status}
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
              >
                <option value={EntityStatus.ACTIVE}>Active</option>
                <option value={EntityStatus.HIDDEN}>Inactive / hidden</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-300 sm:col-span-2">
              Description
              <textarea
                name="description"
                defaultValue={item.description}
                className="min-h-32 rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="brand-cta rounded-full px-6 py-3 text-sm font-black"
            >
              Save item
            </button>
            <p className="text-xs leading-5 text-zinc-500">
              No hard delete yet. Use inactive/hidden for cleanup.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
