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
import { validateProfileSocialInput } from "@/lib/profile-social-links";
import { prisma } from "@/lib/prisma";

function accountRedirect(query: Record<string, string>): never {
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

  const { displayName, handle } = parsed;

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { handle: true }
  });

  if (!existing) {
    accountRedirect({ error: "identity-save" });
  }

  if (handle !== existing.handle) {
    const taken = await prisma.user.findFirst({
      where: { handle, NOT: { id: userId } },
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
        displayName,
        handle
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

export async function updateProfileSocialSettings(formData: FormData) {
  const userId = await getContributorUserId();
  if (!userId) {
    redirect("/login?next=/account");
  }

  const parsed = validateProfileSocialInput({
    instagram: String(formData.get("instagram") ?? ""),
    tiktok: String(formData.get("tiktok") ?? ""),
    youtube: String(formData.get("youtube") ?? ""),
    x: String(formData.get("x") ?? ""),
    website: String(formData.get("website") ?? ""),
    socialLinksPublic:
      formData.get("socialLinksPublic") === "on" ||
      formData.get("socialLinksPublic") === "true",
    reviewHistoryVisibility: String(formData.get("reviewHistoryVisibility") ?? "")
  });

  if (!parsed.ok) {
    const firstField = Object.keys(parsed.errors)[0];
    accountRedirect({
      error:
        firstField === "reviewHistoryVisibility"
          ? "social-visibility"
          : firstField === "form"
            ? "social-invalid"
            : "social-field"
    });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: parsed.data
    });
  } catch {
    accountRedirect({ error: "social-save" });
  }

  revalidatePath("/account");
  revalidatePath("/venues", "layout");
  accountRedirect({ saved: "social" });
}
