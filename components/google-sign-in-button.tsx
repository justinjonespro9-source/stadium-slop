import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { isGoogleSignInConfigured } from "@/lib/auth/env";

type GoogleSignInButtonProps = {
  callbackUrl: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  /** When sign-in is blocked (e.g. /login vs /admin/login). */
  configErrorRedirect?: string;
};

export function GoogleSignInButton({
  callbackUrl,
  label = "Sign in with Google",
  className = "brand-cta w-full rounded-xl px-4 py-3.5 text-sm font-black",
  disabled = false,
  configErrorRedirect = "/login"
}: GoogleSignInButtonProps) {
  return (
    <form
      action={async () => {
        "use server";

        if (!isGoogleSignInConfigured()) {
          const nextParam =
            callbackUrl.startsWith("/")
              ? `&next=${encodeURIComponent(callbackUrl)}`
              : "";
          redirect(`${configErrorRedirect}?error=auth-config${nextParam}`);
        }

        await signIn("google", { redirectTo: callbackUrl });
      }}
    >
      <button type="submit" className={className} disabled={disabled}>
        {label}
      </button>
    </form>
  );
}
