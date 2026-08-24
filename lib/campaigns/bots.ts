/** Link-unfurl bots that would inflate QR / social visit counts. Not used for people. */
const UNFURL_BOT_UA =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Pinterest|Googlebot|bingbot|Applebot|Iframely|Embedly/i;

export function isLikelyUnfurlBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) {
    return false;
  }
  return UNFURL_BOT_UA.test(userAgent);
}
