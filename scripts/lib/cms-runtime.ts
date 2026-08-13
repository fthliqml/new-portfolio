import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

import { PrismaClient } from "../../src/generated/prisma/client";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function createCmsRuntime() {
  const databaseUrl = requiredEnv("DATABASE_URL");
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const secretKey = requiredEnv("SUPABASE_SECRET_KEY");
  return {
    db: new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl, max: 2 }),
    }),
    supabase: createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
  };
}
