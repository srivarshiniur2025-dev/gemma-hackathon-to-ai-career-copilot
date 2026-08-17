"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  FileText,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Mic,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { useDashboardNav } from "@/components/dashboard/DashboardNavContext";
import { navItemsForProfile, type NavItem } from "@/lib/learner-track";
import { cn } from "@/lib/utils";

const ICONS: Record<NavItem["icon"], ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  assessment: ClipboardCheck,
  mocks: FlaskConical,
  roadmap: Map,
  planner: CalendarDays,
  resume: FileText,
  internships: Briefcase,
  interview: Mic,
  progress: TrendingUp,
  settings: Settings,
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  icon: Icon,
  label,
  expanded,
  onNavigate,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center rounded-xl transition-colors duration-200",
        expanded ? "w-full gap-3 px-3 py-2.5" : "h-11 w-11 justify-center",
        active
          ? expanded
            ? "bg-accent text-white shadow-sm"
            : "bg-accent text-white shadow-sm"
          : "text-muted-secondary hover:bg-background-hover"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="truncate text-sm font-medium"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

type DashboardIconSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function DashboardIconSidebar({ mobileOpen, onMobileClose }: DashboardIconSidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const { profile } = useCareerProfile();
  const navItems = navItemsForProfile(profile);
  const { navPanelOpen, toggleNavPanel, closeNavPanel, closeMobileNav } = useDashboardNav();

  const expanded = navPanelOpen;

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  function handleNavClick() {
    onMobileClose?.();
    closeNavPanel();
  }

  const sidebarInner = (
    <div className={cn("flex h-full flex-col py-6", expanded ? "px-4" : "items-center px-0")}>
      <button
        type="button"
        aria-label={expanded ? "Close menu" : "Open menu"}
        onClick={toggleNavPanel}
        className={cn(
          "mb-8 flex cursor-pointer items-center rounded-xl text-muted-secondary transition-colors hover:bg-background-hover",
          expanded ? "h-10 w-full justify-start gap-3 px-3" : "h-11 w-11 justify-center"
        )}
      >
        {expanded ? <X className="h-5 w-5 shrink-0" /> : <Menu className="h-5 w-5" />}
        {expanded && <span className="text-sm font-semibold text-foreground-heading">Menu</span>}
      </button>

      <nav className={cn("flex flex-1 flex-col gap-1.5", expanded ? "w-full" : "items-center")}>
        {navItems.map(({ href, icon, label }) => (
          <NavLink
            key={href}
            href={href}
            icon={ICONS[icon]}
            label={label}
            expanded={expanded}
            onNavigate={handleNavClick}
          />
        ))}
      </nav>

      <div className={cn("mt-auto flex flex-col gap-2 pt-4", expanded ? "w-full" : "items-center")}>
        <button
          type="button"
          aria-label="Logout"
          onClick={handleLogout}
          className={cn(
            "flex cursor-pointer items-center rounded-xl text-muted-secondary transition-colors hover:bg-background-hover",
            expanded ? "gap-3 px-3 py-2.5" : "h-11 w-11 justify-center"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {expanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / tablet — expandable rail */}
      <motion.aside
        animate={{ width: expanded ? 260 : 82 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="hidden h-full shrink-0 flex-col overflow-hidden border-r border-border bg-white md:flex"
      >
        {sidebarInner}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-white md:hidden"
            >
              {sidebarInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
