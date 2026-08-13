import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Portfolio Admin" },
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return children;
}
