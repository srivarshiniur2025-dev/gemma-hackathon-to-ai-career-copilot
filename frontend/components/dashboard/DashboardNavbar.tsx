"use client";

import { Bell, Menu, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardNav } from "@/components/dashboard/DashboardNavContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { cn } from "@/lib/utils";

type DashboardNavbarProps = {
  className?: string;
};

export function DashboardNavbar({ className }: DashboardNavbarProps) {
  const { openMobileNav, toggleNavPanel } = useDashboardNav();
  const { initials } = useCareerProfile();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-4 sm:px-6",
        className
      )}
    >
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => {
          toggleNavPanel();
          openMobileNav();
        }}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-muted-secondary transition-colors hover:bg-background-hover md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={toggleNavPanel}
        className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-muted-secondary transition-colors hover:bg-background-hover md:flex lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-lg font-bold text-foreground-heading sm:text-xl">Dashboard</h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="h-10 w-48 rounded-full border border-border bg-[#FAFAFA] pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent lg:w-64"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-white transition-colors hover:bg-background-hover"
        >
          <Bell className="h-4 w-4 text-muted-secondary" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white" aria-hidden>
          {initials}
        </div>
      </div>
    </motion.header>
  );
}
