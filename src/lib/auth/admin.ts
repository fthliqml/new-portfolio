import "server-only";

import { redirect } from "next/navigation";

import { getAdminEnv } from "@/lib/auth/env";
import {
  AdminAuthorizationError,
  assertCmsMutationsAllowed,
  assertOwnerAuthorized,
} from "@/lib/auth/policy";
import { getDb } from "@/lib/db";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/admin/login");

  const allowlist = getAdminEnv();
  const adminRecord = await getDb().adminUser.findUnique({
    where: { userId: user.id },
    select: { userId: true, email: true },
  });

  try {
    return assertOwnerAuthorized(user, adminRecord, allowlist);
  } catch (authorizationError) {
    if (authorizationError instanceof AdminAuthorizationError) {
      await supabase.auth.signOut();
      redirect("/admin/login?error=not_authorized");
    }
    throw authorizationError;
  }
}

export async function requireAdminMutation() {
  const admin = await requireAdmin();

  assertCmsMutationsAllowed({
    mutationsEnabled: process.env.CMS_MUTATIONS_ENABLED === "true",
    vercelEnvironment: process.env.VERCEL_ENV,
  });

  return admin;
}
