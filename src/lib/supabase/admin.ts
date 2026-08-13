import "server-only";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const secretEnvSchema = z.object({
  url: z.url(),
  secretKey: z.string().min(1),
});

export function getSupabaseAdminClient() {
  const env = secretEnvSchema.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
  });

  if (!env.success) {
    throw new Error("Supabase server credentials are missing or invalid.");
  }

  return createClient(env.data.url, env.data.secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
