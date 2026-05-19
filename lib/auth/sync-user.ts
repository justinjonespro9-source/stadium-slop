import "server-only";

import { UserRole } from "@prisma/client";

import { resolveUserRoleForEmail } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

function handleBaseFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "fan";
  const cleaned = local.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  return cleaned.slice(0, 24) || "fan";
}

async function uniqueHandle(base: string): Promise<string> {
  let candidate = base.startsWith("@") ? base : `@${base}`;
  let suffix = 0;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { handle: candidate },
      select: { id: true }
    });
    if (!existing) {
      return candidate;
    }
    suffix += 1;
    candidate = `@${base.replace(/^@/, "")}${suffix}`;
  }
}

export type OAuthProfileInput = {
  email: string;
  displayName: string;
  avatarUrl?: string | null;
};

/** Upsert contributor profile on Google sign-in (JWT session — no Auth.js Account table). */
export async function syncUserFromOAuth(input: OAuthProfileInput) {
  const email = input.email.trim().toLowerCase();
  const role =
    resolveUserRoleForEmail(email) === "ADMIN" ? UserRole.ADMIN : UserRole.REVIEWER;
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, handle: true }
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        displayName: input.displayName,
        avatarUrl: input.avatarUrl ?? undefined,
        role
      }
    });
  }

  const handle = await uniqueHandle(handleBaseFromEmail(email));

  return prisma.user.create({
    data: {
      email,
      displayName: input.displayName,
      handle,
      avatarUrl: input.avatarUrl ?? null,
      role
    }
  });
}
