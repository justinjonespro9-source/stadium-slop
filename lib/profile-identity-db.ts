import "server-only";

import {
  HANDLE_BODY_MAX,
  normalizeContributorHandle
} from "@/lib/profile-identity";
import { prisma } from "@/lib/prisma";

export async function uniqueContributorHandle(
  base: string,
  excludeUserId?: string
): Promise<string> {
  const normalized = normalizeContributorHandle(base) ?? "@fan";
  let candidate = normalized;
  let suffix = 0;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { handle: candidate },
      select: { id: true }
    });
    if (!existing || existing.id === excludeUserId) {
      return candidate;
    }
    suffix += 1;
    const body = normalized.replace(/^@/, "");
    candidate = `@${body}${suffix}`;
  }
}

export function handleBaseFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "fan";
  const cleaned = local.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  return cleaned.slice(0, HANDLE_BODY_MAX) || "fan";
}
