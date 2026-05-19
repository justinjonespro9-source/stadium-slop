import { redirect } from "next/navigation";

type SignupPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

/** Google OAuth only — contributor signup uses the login flow. */
export default async function SignupPage({ searchParams }: SignupPageProps) {
  const query = await searchParams;
  const next =
    typeof query?.next === "string" && query.next.startsWith("/")
      ? `?next=${encodeURIComponent(query.next)}`
      : "";
  redirect(`/login${next}`);
}
