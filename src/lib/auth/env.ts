import "server-only";

import { z } from "zod";

const adminEnvSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  userId: z.uuid(),
});

export interface AdminEnv {
  email: string;
  userId: string;
}

export function getAdminEnv(): AdminEnv {
  const result = adminEnvSchema.safeParse({
    email: process.env.ADMIN_EMAIL,
    userId: process.env.ADMIN_USER_ID,
  });

  if (!result.success) {
    throw new Error("The owner allowlist is missing or invalid.");
  }

  return result.data;
}
