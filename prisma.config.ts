import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct connection; a pooled URL (e.g. Neon's
    // "-pooler" host) is only for the app. Falls back for local Postgres.
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
