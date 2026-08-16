import { NextResponse, type NextRequest } from "next/server";

import { resumePolicy } from "@/domain/resume/policy";
import { getDb } from "@/lib/db";
import { createPublicStorageUrl } from "@/lib/supabase/public-storage-url";

export const dynamic = "force-dynamic";

function fallbackResponse(request: NextRequest) {
  return NextResponse.redirect(new URL("/resume.pdf", request.url), 307);
}

export async function GET(request: NextRequest) {
  try {
    const resume = await getDb().resumeAsset.findUnique({
      where: { id: resumePolicy.singletonId },
    });
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!resume || !supabaseUrl) return fallbackResponse(request);

    const downloadName = request.nextUrl.searchParams.has("download")
      ? resume.originalName
      : undefined;
    const target = createPublicStorageUrl(
      supabaseUrl,
      resume.bucket,
      resume.objectPath,
      downloadName,
    );
    const response = NextResponse.redirect(target, 307);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    return fallbackResponse(request);
  }
}
