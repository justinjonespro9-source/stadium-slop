import { getFairFoodImportBadge } from "@/lib/fair-food-badges";
import type { FoodItem } from "@/lib/sample-data";

type FairFoodItemBadgesProps = {
  item: FoodItem;
  tone?: "brand" | "media";
};

export function FairFoodItemBadges({ item, tone = "media" }: FairFoodItemBadgesProps) {
  const label = getFairFoodImportBadge(item);
  if (!label) {
    return null;
  }

  const className =
    tone === "media"
      ? "fair-import-badge fair-import-badge--media"
      : "fair-import-badge fair-import-badge--brand";

  return (
    <span className={className} title={`Import tag: ${label}`}>
      {label}
    </span>
  );
}
