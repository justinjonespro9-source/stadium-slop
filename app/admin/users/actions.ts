"use server";

import { EntityStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminAccess } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

function revalidateUserAdminPaths(userId: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin");
}

export async function promoteUserToAdmin(formData: FormData) {
  const actor = await requireAdminAccess();
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) {
    redirect("/admin/users?error=missing-user");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: UserRole.ADMIN }
  });

  revalidateUserAdminPaths(userId);
  redirect(`/admin/users/${userId}?updated=role`);
}

export async function demoteUserToReviewer(formData: FormData) {
  const actor = await requireAdminAccess();
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) {
    redirect("/admin/users?error=missing-user");
  }

  if (userId === actor.userId) {
    redirect(`/admin/users/${userId}?error=self-demotion`);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: UserRole.REVIEWER }
  });

  revalidateUserAdminPaths(userId);
  redirect(`/admin/users/${userId}?updated=role`);
}

export async function suspendUserAccount(formData: FormData) {
  const actor = await requireAdminAccess();
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) {
    redirect("/admin/users?error=missing-user");
  }

  if (userId === actor.userId) {
    redirect(`/admin/users/${userId}?error=self-suspend`);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: EntityStatus.SUSPENDED }
  });

  revalidateUserAdminPaths(userId);
  redirect(`/admin/users/${userId}?updated=status`);
}

export async function reactivateUserAccount(formData: FormData) {
  await requireAdminAccess();
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) {
    redirect("/admin/users?error=missing-user");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: EntityStatus.ACTIVE }
  });

  revalidateUserAdminPaths(userId);
  redirect(`/admin/users/${userId}?updated=status`);
}
