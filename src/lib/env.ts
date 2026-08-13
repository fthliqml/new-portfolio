import "server-only";

import { z } from "zod";

const postgresUrl = z
  .string()
  .min(1)
  .refine(
    (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "Expected a PostgreSQL connection URL.",
  );

const databaseEnvSchema = z.object({
  DATABASE_URL: postgresUrl,
  DIRECT_URL: postgresUrl.optional(),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export function getDatabaseEnv(): DatabaseEnv {
  const result = databaseEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
  });

  if (!result.success) {
    const fields = result.error.issues
      .map((issue) => issue.path.join("."))
      .filter(Boolean)
      .join(", ");

    throw new Error(
      `Database configuration is missing or invalid${fields ? `: ${fields}` : "."}`,
    );
  }

  return result.data;
}
