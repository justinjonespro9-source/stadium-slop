import { redirect } from "next/navigation";

import { contributorLoginUrl, ADMIN_LOGIN_NEXT_PATH } from "@/lib/auth/admin-routes";

/** Legacy URL — Google sign-in runs only at /login to avoid PKCE/callback loops. */
export default function AdminLoginPage() {
  redirect(contributorLoginUrl(ADMIN_LOGIN_NEXT_PATH));
}
