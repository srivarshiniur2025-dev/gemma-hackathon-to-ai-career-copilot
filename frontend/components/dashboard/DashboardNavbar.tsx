"use client";

import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardNav } from "@/components/dashboard/DashboardNavContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { dashboardHeading } from "@/lib/learner-track";
import { cn } from "@/lib/utils";

type DashboardNavbarProps = {
  className?: string;
};

export function DashboardNavbar({ className }: DashboardNavbarProps) {
  const { openMobileNav, toggleNavPanel } = useDashboardNav();
  const { initials, profile } = useCareerProfile();
  const heading = dashboardHeading(profile);

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

      <h1 className="text-lg font-bold text-foreground-heading sm:text-xl">{heading}</h1>

      <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white" aria-hidden>
        {initials}
      </div>
    </motion.header>
  );
}
