import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public"
  },
  migrations: {
    path: "prisma/migrations",
    seed: "echo \"Seed placeholder: wire prisma/seed.ts when database writes are enabled.\""
  }
});
