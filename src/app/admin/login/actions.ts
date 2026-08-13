"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getAdminEnv } from "@/lib/auth/env";
import { isAllowlistedOwner } from "@/lib/auth/policy";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(1_024),
  next: z.string().optional(),
});

function safeAdminDestination(value?: string) {
  return value?.startsWith("/admin") && !value.startsWith("//")
    ? value
    : "/admin";
}

export async function login(formData: FormData) {
  const input = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!input.success) redirect("/admin/login?error=invalid_credentials");

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.data.email,
    password: input.data.password,
  });

  if (error || !data.user) {
    redirect("/admin/login?error=invalid_credentials");
  }

  if (!isAllowlistedOwner(data.user, getAdminEnv())) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_authorized");
  }

  redirect(safeAdminDestination(input.data.next));
}
