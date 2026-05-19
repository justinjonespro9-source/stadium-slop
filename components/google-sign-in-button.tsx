import { signIn } from "@/auth";

type GoogleSignInButtonProps = {
  callbackUrl: string;
  label?: string;
  className?: string;
};

export function GoogleSignInButton({
  callbackUrl,
  label = "Sign in with Google",
  className = "brand-cta w-full rounded-xl px-4 py-3.5 text-sm font-black"
}: GoogleSignInButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: callbackUrl });
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
