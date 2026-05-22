import { normalizeContributorHandle } from "@/lib/profile-identity";

/** Strip `@` for editable form fields. */
export function handleInputFromStored(handle: string): string {
  return handle.replace(/^@+/, "");
}

export function handleDisplayFromStored(handle: string): string {
  const normalized = normalizeContributorHandle(handle) ?? handle.trim();
  return normalized.startsWith("@") ? normalized : `@${normalized}`;
}
