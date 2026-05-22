"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getContributorUserId } from "@/lib/auth/contributor-id";
import {
  isCloudinaryConfigured,
  logUploadFailure,
  photoErrorQueryFromUploadFailure,
  uploadImageFile
} from "@/lib/cloudinary";
import { validateProfileIdentityInput } from "@/lib/profile-identity";
import { prisma } from "@/lib/prisma";

function accountRedirect(query: Record<string, string>) {
  const params = new URLSearchParams(query);
  redirect(`/account?${params.toString()}`);
}

export async function updateScorecardIdentity(formData: FormData) {
  const userId = await getContributorUserId();
  if (!userId) {
    redirect("/login?next=/account");
  }

  const parsed = validateProfileIdentityInput({
    displayName: String(formData.get("displayName") ?? ""),
    handle: String(formData.get("handle") ?? "")
  });

  if (!parsed.ok) {
    const code =
      parsed.errors.displayName && parsed.errors.handle
        ? "identity-invalid"
        : parsed.errors.handle
          ? "identity-handle"
          : "identity-name";
    accountRedirect({ error: code });
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { handle: true }
  });

  if (!existing) {
    accountRedirect({ error: "identity-save" });
  }

  if (parsed.handle !== existing.handle) {
    const taken = await prisma.user.findFirst({
      where: { handle: parsed.handle, NOT: { id: userId } },
      select: { id: true }
    });
    if (taken) {
      accountRedirect({ error: "identity-handle-taken" });
    }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: parsed.displayName,
        handle: parsed.handle
      }
    });
  } catch {
    accountRedirect({ error: "identity-save" });
  }

  revalidatePath("/account");
  revalidatePath("/venues", "layout");
  accountRedirect({ saved: "identity" });
}

export async function uploadProfileAvatar(formData: FormData) {
  const userId = await getContributorUserId();
  if (!userId) {
    redirect("/login?next=/account");
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    accountRedirect({ error: "no-file" });
  }

  if (!isCloudinaryConfigured()) {
    accountRedirect({ error: "cloudinary" });
  }

  try {
    const { secureUrl } = await uploadImageFile(file, {
      folder: `stadium-slop/profiles/${userId}`,
      publicId: `${userId}-avatar`
    });

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: secureUrl }
    });
  } catch (err) {
    logUploadFailure("accountAvatar", file, err);
    const code = photoErrorQueryFromUploadFailure(err);
    accountRedirect({ error: code });
  }

  revalidatePath("/account");
  revalidatePath("/venues", "layout");
  accountRedirect({ saved: "avatar" });
}
