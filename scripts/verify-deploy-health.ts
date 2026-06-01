/**
 * Post-deploy smoke checks — no DB, no third-party services.
 *
 * Usage:
 *   DEPLOY_URL=https://stadiumslop.com npx tsx scripts/verify-deploy-health.ts
 *   npm run start   # separate terminal
 *   DEPLOY_URL=http://127.0.0.1:3000 npm run verify:deploy-health
 */

const DEFAULT_BASE = "http://127.0.0.1:3000";
const TIMEOUT_MS = 15_000;

/** Browser-like UA so Vercel firewall/bot checks allow the smoke fetch. */
const DEPLOY_CHECK_HEADERS = {
  accept: "text/plain, application/json, */*",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 StadiumSlopDeployHealth/1.0"
} as const;

function formatFetchFailure(path: string, status: number, body: string): string {
  const preview = body.slice(0, 200);
  if (status === 429) {
    return (
      `FAIL ${path} status=429\n` +
      "Received 429 before app route; likely Vercel firewall/bot/rate-limit protection.\n" +
      `body=${preview}`
    );
  }
  return `FAIL ${path} status=${status} body=${preview}`;
}

function resolveBaseUrl(): string {
  const raw =
    process.env.DEPLOY_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : "") ||
    DEFAULT_BASE;
  return raw.replace(/\/$/, "");
}

async function fetchText(path: string, base: string): Promise<{ status: number; body: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${base}${path}`, {
      signal: controller.signal,
      headers: DEPLOY_CHECK_HEADERS
    });
    return { status: response.status, body: await response.text() };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const base = resolveBaseUrl();
  console.log(`Checking deploy health at ${base}`);

  const health = await fetchText("/health", base);
  if (health.status !== 200 || !health.body.includes('"ok":true')) {
    console.error(formatFetchFailure("/health", health.status, health.body));
    process.exit(1);
  }
  console.log("OK /health");

  const robots = await fetchText("/robots.txt", base);
  if (robots.status !== 200) {
    console.error(formatFetchFailure("/robots.txt", robots.status, robots.body));
    process.exit(1);
  }

  const robotsBody = robots.body;
  const checks = [
    ["User-agent", /User-agent:\s*\*/i.test(robotsBody)],
    ["disallow /admin", /Disallow:\s*\/admin/i.test(robotsBody)],
    ["disallow /account", /Disallow:\s*\/account/i.test(robotsBody)],
    ["disallow /api", /Disallow:\s*\/api/i.test(robotsBody)],
    ["GPTBot block", /User-agent:\s*GPTBot/i.test(robotsBody)],
    ["sitemap", /Sitemap:/i.test(robotsBody)]
  ] as const;

  for (const [name, ok] of checks) {
    if (!ok) {
      console.error(`FAIL /robots.txt missing ${name}`);
      process.exit(1);
    }
  }

  console.log("OK /robots.txt (static metadata route reachable)");
  console.log("Deploy health checks passed.");
}

main().catch((error) => {
  console.error("Deploy health check failed:", error);
  process.exit(1);
});
