import "server-only";

import { revalidatePath } from "next/cache";

export function revalidatePublicContent(projectSlug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/sitemap.xml");
  if (projectSlug) revalidatePath(`/projects/${projectSlug}`);
}
