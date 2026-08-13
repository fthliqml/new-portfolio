import "dotenv/config";

import { defineConfig } from "prisma/config";

const fallbackDatabaseUrl =
  "postgresql://portfolio:portfolio@127.0.0.1:5432/portfolio";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma generate/validate do not need a live database. The fallback keeps
    // those commands usable before local Supabase credentials are configured.
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      fallbackDatabaseUrl,
  },
});
