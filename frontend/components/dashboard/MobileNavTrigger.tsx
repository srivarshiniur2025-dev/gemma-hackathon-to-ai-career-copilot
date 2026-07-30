"use client";

import { Menu } from "lucide-react";
import { useDashboardNav } from "@/components/dashboard/DashboardNavContext";

export function MobileNavTrigger() {
  const { openMobileNav } = useDashboardNav();

  return (
    <div className="sticky top-0 z-30 flex items-center border-b border-border bg-white px-4 py-3 md:hidden">
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={openMobileNav}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-muted-secondary transition-colors hover:bg-background-hover"
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="ml-3 text-sm font-semibold text-foreground-heading">AI Career Copilot</span>
    </div>
  );
}
