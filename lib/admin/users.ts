import "server-only";

import type { EntityStatus, UserRole } from "@prisma/client";

export function formatAdminUserDate(d: Date) {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function userStatusLabel(status: EntityStatus) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "SUSPENDED":
      return "Suspended";
    case "HIDDEN":
      return "Hidden";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

export function userRoleLabel(role: UserRole) {
  return role;
}

export function userInitials(displayName: string) {
  return (
    displayName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}
