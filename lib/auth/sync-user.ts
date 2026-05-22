import "server-only";

import { UserRole } from "@prisma/client";

import { resolveUserRoleForEmail } from "@/lib/auth/admin";
import {
  handleBaseFromEmail,
  uniqueContributorHandle
} from "@/lib/profile-identity-db";
import { prisma } from "@/lib/prisma";

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
    const current = await prisma.user.findUnique({
      where: { id: existing.id },
      select: { avatarUrl: true }
    });
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        avatarUrl:
          current?.avatarUrl != null && current.avatarUrl !== ""
            ? undefined
            : (input.avatarUrl ?? undefined),
        role
      }
    });
  }

  const handle = await uniqueContributorHandle(handleBaseFromEmail(email));

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
