import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { isAdminEmail, resolveUserRoleForEmail } from "@/lib/auth/admin";
import { syncUserFromOAuth } from "@/lib/auth/sync-user";
import { prisma } from "@/lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: googleClientId ?? "",
      clientSecret: googleClientSecret ?? ""
    })
  ],
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 14
  },
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email) {
        return false;
      }

      const displayName =
        user.name?.trim() ||
        profile?.name?.trim() ||
        user.email.split("@")[0] ||
        "Stadium Slop fan";

      await syncUserFromOAuth({
        email: user.email,
        displayName,
        avatarUrl: user.image
      });

      return true;
    },
    async jwt({ token }) {
      const email =
        typeof token.email === "string" ? token.email.trim().toLowerCase() : null;

      if (!email) {
        return token;
      }

      const dbUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true }
      });

      if (dbUser) {
        token.sub = dbUser.id;
        token.role = dbUser.role;
        token.isAdmin =
          dbUser.role === "ADMIN" || isAdminEmail(email);
      } else {
        token.role = resolveUserRoleForEmail(email);
        token.isAdmin = isAdminEmail(email);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === "string" ? token.sub : "";
        session.user.role =
          typeof token.role === "string" ? token.role : undefined;
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    }
  }
});
