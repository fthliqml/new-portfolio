"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { AdminNavigation } from "@/components/admin/AdminNavigation";

export function AdminMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="admin-mobile-navigation"
        onClick={() => setIsOpen((value) => !value)}
        className="grid size-10 place-items-center border border-border bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span className="sr-only">
          {isOpen ? "Close navigation" : "Open navigation"}
        </span>
        {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {isOpen && (
        <div
          id="admin-mobile-navigation"
          className="absolute inset-x-0 top-full z-50 border-b border-border bg-card p-4 shadow-xl"
        >
          <AdminNavigation onNavigate={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
