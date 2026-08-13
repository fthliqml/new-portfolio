import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { refreshSupabaseSession } from "@/lib/supabase/proxy";

function loginUrl(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";

  if (request.nextUrl.pathname !== "/admin") {
    url.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
  }

  return url;
}

export async function proxy(request: NextRequest) {
  const { response, user } = await refreshSupabaseSession(request);
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && !user) {
    return NextResponse.redirect(loginUrl(request));
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
