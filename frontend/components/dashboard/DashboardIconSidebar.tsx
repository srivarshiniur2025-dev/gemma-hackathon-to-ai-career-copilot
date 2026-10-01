"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  FileText,
  FlaskConical,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Map,
  Mic,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { useDashboardNav } from "@/components/dashboard/DashboardNavContext";
import { NAV_GROUP_ORDER, navItemsForProfile, type NavItem } from "@/lib/learner-track";
import { cn } from "@/lib/utils";

const ICONS: Record<NavItem["icon"], ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  assessment: ClipboardCheck,
  mocks: FlaskConical,
  agent: Bot,
  notes: NotebookPen,
  activities: Gamepad2,
  scoreboard: Trophy,
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
      title={expanded ? undefined : label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center rounded-xl transition-colors duration-200",
        expanded ? "w-full gap-3 px-3 py-2" : "h-11 w-11 justify-center",
        active ? "bg-primary text-white shadow-sm" : "text-muted-secondary hover:bg-background-hover hover:text-foreground-heading"
      )}
    >
      {active && expanded ? <span aria-hidden className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent-light" /> : null}
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-accent-light")} />
      {expanded ? <span className="truncate text-sm font-medium">{label}</span> : null}
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
  const { navPanelOpen, toggleNavPanel } = useDashboardNav();

  const expanded = navPanelOpen;

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  function handleNavClick() {
    onMobileClose?.();
  }

  const renderInner = (isExpanded: boolean, isMobile: boolean) => (
    <div className={cn("flex h-full flex-col py-5", isExpanded ? "px-4" : "items-center px-0")}>
      <div className={cn("mb-6 flex items-center", isExpanded ? "w-full justify-between gap-2" : "flex-col gap-3")}>
        <Link href="/dashboard" onClick={handleNavClick} className="flex items-center gap-2.5" aria-label="Go to dashboard">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-heading text-sm font-bold text-accent-light">
            AI
          </span>
          {isExpanded ? (
            <span className="leading-tight">
              <span className="block font-heading text-sm font-bold text-foreground-heading">Career Copilot</span>
              <span className="block text-[11px] text-muted">Powered by Gemma</span>
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          aria-label={isMobile ? "Close menu" : isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          title={isMobile ? "Close menu" : isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          onClick={isMobile ? onMobileClose : toggleNavPanel}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-muted-secondary transition-colors hover:bg-background-hover hover:text-foreground-heading"
        >
          {isMobile ? <X className="h-5 w-5" /> : isExpanded ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
        </button>
      </div>

      <nav aria-label="Main" className={cn("flex flex-1 flex-col overflow-y-auto", isExpanded ? "w-full gap-4" : "items-center gap-3")}>
        {NAV_GROUP_ORDER.map((group) => {
          const items = navItems.filter((item) => item.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className={cn("flex flex-col gap-1", isExpanded ? "w-full" : "items-center")}>
              {isExpanded ? (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-disabled">{group}</p>
              ) : (
                <span aria-hidden className="mb-1 h-px w-6 bg-border first:hidden" />
              )}
              {items.map(({ href, icon, label }) => (
                <NavLink key={href} href={href} icon={ICONS[icon]} label={label} expanded={isExpanded} onNavigate={handleNavClick} />
              ))}
            </div>
          );
        })}
      </nav>

      <div className={cn("mt-auto flex flex-col gap-2 pt-4", expanded ? "w-full" : "items-center")}>
        <button
          type="button"
          aria-label="Logout"
          onClick={handleLogout}
          title={isExpanded ? undefined : "Logout"}
          className={cn(
            "flex cursor-pointer items-center rounded-xl text-muted-secondary transition-colors hover:bg-error/5 hover:text-error",
            isExpanded ? "gap-3 px-3 py-2.5" : "h-11 w-11 justify-center"
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {isExpanded && <span className="text-sm font-medium">Logout</span>}
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
        className="sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-white md:flex"
      >
        {renderInner(expanded, false)}
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
              {renderInner(true, true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
