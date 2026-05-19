import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";

export type SessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role?: string;
  isAdmin: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    role: session.user.role,
    isAdmin: Boolean(session.user.isAdmin)
  };
}

export async function requireSessionUser(nextPath?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (user) {
    return user;
  }

  const next =
    nextPath && nextPath.startsWith("/")
      ? `?next=${encodeURIComponent(nextPath)}`
      : "";
  redirect(`/login${next}`);
}

export async function requireSessionUserId(nextPath?: string): Promise<string> {
  const user = await requireSessionUser(nextPath);
  return user.id;
}
