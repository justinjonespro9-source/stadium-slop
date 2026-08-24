import type { FollowSocialLink } from "@/lib/campaigns/follow-links";

type SocialPlatformIconProps = {
  id: FollowSocialLink["id"];
};

export function SocialPlatformIcon({ id }: SocialPlatformIconProps) {
  const className = "follow-page__icon";

  switch (id) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.7 10.3 21 3h-1.9l-5.5 6.4L9.2 3H3.1l6.7 9.8L3 21h1.9l6-7 5.6 7h6.1l-8-10.7Zm-2.1 2.5-.7-1-5.5-7.9h2.4l4.4 6.3.7 1 5.8 8.2h-2.4l-4.7-6.6Z"
          />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.2 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2h-2.5v2.8h2.5V21h3Z"
          />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.2 3h2.3c.3 2.2 1.6 3.9 3.7 4.2v2.3c-1.3 0-2.5-.4-3.6-1.1v6.3c0 3.4-2.7 6.1-6.2 6.1S4.2 18.1 4.2 14.7c0-3.3 2.6-6 5.9-6.1v2.4c-2 .1-3.6 1.7-3.6 3.7 0 2 1.7 3.7 3.8 3.7s3.7-1.6 3.7-3.7V3Z"
          />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.7 12 4.7 12 4.7s-5.7 0-7.5.4A3 3 0 0 0 2.4 7.2 31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.4 7.5.4 7.5.4s5.7 0 7.5-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"
          />
        </svg>
      );
    default:
      return null;
  }
}
