import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthPageScaffold } from "@/components/auth-ui";
import { DevMockUserSignIn } from "@/components/dev-mock-user-sign-in";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { getSessionUser } from "@/lib/auth/require-user";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const nextPath =
    typeof query?.next === "string" && query.next.startsWith("/")
      ? query.next
      : "/account";

  const user = await getSessionUser();
  if (user) {
    redirect(nextPath);
  }

  return (
    <AuthPageScaffold
      eyebrow="Contributor account"
      title="Sign in"
      subtitle="Use Google to post reviews, upload photos, and report prices. Browsing stays free without an account."
      footer={
        <p className="text-center text-[0.75rem] leading-relaxed text-[var(--slop-cream-dim)]">
          {/* TODO: optional email magic link sign-in */}
          By signing in you agree to our{" "}
          <Link href="/terms" className="font-bold text-[var(--slop-gold)] hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-bold text-[var(--slop-gold)] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      }
    >
      <div className="mt-5 grid gap-3">
        <GoogleSignInButton callbackUrl={nextPath} />
        <DevMockUserSignIn nextPath={nextPath} />
      </div>
    </AuthPageScaffold>
  );
}
