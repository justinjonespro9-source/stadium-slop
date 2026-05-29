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
      headers: { accept: "text/plain, application/json, */*" }
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
    console.error(`FAIL /health status=${health.status} body=${health.body.slice(0, 200)}`);
    process.exit(1);
  }
  console.log("OK /health");

  const robots = await fetchText("/robots.txt", base);
  if (robots.status !== 200) {
    console.error(`FAIL /robots.txt status=${robots.status}`);
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
