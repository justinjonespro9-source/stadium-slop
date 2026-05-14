import type { FoodItem, Vendor } from "./sample-data";

export function bpVendor(
  venueSlug: string,
  slug: string,
  name: string,
  section: string,
  location: string,
  lineIntel?: string
): Vendor {
  return {
    slug,
    name,
    venueSlug,
    section,
    location,
    averageSlopScore: 0,
    lineIntel
  };
}

export function bpItem(
  venueSlug: string,
  venueTag: string,
  vendorSlug: string,
  slug: string,
  name: string,
  category: string,
  description: string,
  options: {
    itemType?: FoodItem["itemType"];
    location?: string;
    sections?: string[];
    tags?: string[];
    alcoholic?: boolean;
    ageRestricted?: boolean;
    beverageStyle?: FoodItem["beverageStyle"];
  } = {}
): FoodItem {
  const itemType = options.itemType ?? "Food";
  return {
    slug,
    name,
    venueSlug,
    vendorSlug,
    itemType,
    category,
    location: options.location ?? "Concourse",
    sections: options.sections,
    price: 0,
    priceLastConfirmedLabel: "Unreported",
    priceReportCount: 0,
    rating: 0,
    worthItScore: 0,
    slopScore: 0,
    verdict: "Solid Role Player",
    runItBackPercent: 70,
    valueLabel: "Fair Deal",
    servedRightLabel: "Not Applicable",
    lineWaitLabel: "Not Applicable",
    napkinRating: 3,
    napkinLabel: "Two-Handed Problem",
    reviewCount: 0,
    tags: options.tags ?? [venueTag, "Concessions seed"],
    description,
    availabilityStatus: "Fan reported",
    lastConfirmed: "Concessions seed",
    freshReviewCount: 0,
    freshWindowLabel: "seed",
    freshSignal: "Mixed Signals",
    freshSignalReason: "Awaiting fan price and line reports.",
    alcoholic: options.alcoholic,
    ageRestricted: options.ageRestricted,
    beverageStyle: options.beverageStyle
  };
}
