import Image from "next/image";

type BrandBadgeIconProps = {
  size?: number;
  className?: string;
  title?: string;
};

/** Official badge art — use beside verified / featured / pick labels. */
export function BrandBadgeIcon({
  size = 26,
  className = "",
  title
}: BrandBadgeIconProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      title={title}
    >
      <Image
        src="/branding/stadium-slop-badge.png"
        alt={title ?? "Stadium Slop badge"}
        width={size}
        height={size}
        className="object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
      />
    </span>
  );
}
