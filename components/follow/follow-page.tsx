import Link from "next/link";

import type { FollowSocialLink } from "@/lib/campaigns/follow-links";

import { StadiumSlopWordmark } from "@/components/brand/stadium-slop-wordmark";
import { SocialPlatformIcon } from "@/components/follow/social-platform-icon";

type FollowPageProps = {
  socialLinks: FollowSocialLink[];
};

export function FollowPage({ socialLinks }: FollowPageProps) {
  return (
    <main className="follow-page">
      <div className="follow-page__panel">
        <header className="follow-page__brand">
          <StadiumSlopWordmark
            size="header"
            priority
            className="follow-page__wordmark"
          />
        </header>

        <h1 className="follow-page__headline">Follow the Slop.</h1>
        <p className="follow-page__lede">
          Live food rankings, leaderboard updates, and what&apos;s actually worth
          ordering.
        </p>

        <ul className="follow-page__socials">
          {socialLinks.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                className="follow-page__social"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SocialPlatformIcon id={link.id} />
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <section className="follow-page__venue" aria-labelledby="follow-venue-heading">
          <p id="follow-venue-heading" className="follow-page__venue-copy">
            At a game or the Fair? Rate what you&apos;re eating.
          </p>
          <Link href="/venues" className="follow-page__venue-cta">
            Find Your Venue
          </Link>
        </section>

        <p className="follow-page__free">100% FREE • NOTHING TO DOWNLOAD</p>
      </div>
    </main>
  );
}
