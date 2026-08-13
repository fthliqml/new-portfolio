"use client";

import {
  Blocks,
  BriefcaseBusiness,
  FolderKanban,
  ImageIcon,
  LayoutDashboard,
  Archive,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban, exact: false },
  {
    href: "/admin/experiences",
    label: "Experience",
    icon: BriefcaseBusiness,
    exact: false,
  },
  { href: "/admin/skills", label: "Skills", icon: Blocks, exact: false },
  { href: "/admin/media", label: "Media", icon: ImageIcon, exact: false },
  { href: "/admin/archive", label: "Archive", icon: Archive, exact: false },
] as const;

interface AdminNavigationProps {
  onNavigate?: () => void;
}

export function AdminNavigation({ onNavigate }: AdminNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="space-y-1">
      {navigation.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex min-h-11 items-center justify-between border px-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isActive
                ? "border-foreground bg-primary text-primary-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-3">
              <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
              {label}
            </span>
            <span aria-hidden="true" className="text-[0.55rem] opacity-45">
              ↗
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
