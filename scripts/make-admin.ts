/**
 * Promote an existing contributor to admin by email.
 *
 * Usage: npm run make-admin -- you@example.com
 *
 * The user must already exist (sign in with Google once on /login first).
 */
import "dotenv/config";

import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

function usage() {
  console.error("Usage: npm run make-admin -- email@example.com");
  process.exit(1);
}

async function main() {
  const rawEmail = process.argv[2];
  if (!rawEmail?.trim()) {
    usage();
  }

  const email = rawEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, displayName: true }
  });

  if (!user) {
    console.error(
      `No user found for "${email}". Sign in with Google at /login once as that account, then run this command again.`
    );
    process.exit(1);
  }

  if (user.role === UserRole.ADMIN) {
    console.log(`${user.email} (${user.displayName}) is already ADMIN.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: UserRole.ADMIN }
  });

  console.log(`Promoted ${user.email} (${user.displayName}) to ADMIN.`);
  console.log("Sign out and sign in again (or open a new session) so the admin JWT picks up the role.");
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
