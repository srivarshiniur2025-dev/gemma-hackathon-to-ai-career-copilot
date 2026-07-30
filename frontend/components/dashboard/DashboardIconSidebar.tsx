"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Mic,
  Settings,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/assessment", icon: ClipboardCheck, label: "Skill Assessment" },
  { href: "/roadmap", icon: Map, label: "Learning Roadmap" },
  { href: "/resume", icon: FileText, label: "Resume Builder" },
  { href: "/internships", icon: Briefcase, label: "Internships" },
  { href: "/interview", icon: Mic, label: "Mock Interview" },
  { href: "/progress", icon: TrendingUp, label: "Progress" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function NavIcon({
  href,
  icon: Icon,
  label,
  active,
  onNavigate,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      onClick={onNavigate}
      className="group relative flex items-center justify-center"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl transition-colors duration-200",
          active
            ? "bg-accent text-white shadow-sm"
            : "text-muted-secondary hover:bg-background-hover"
        )}
      >
        <Icon className="h-5 w-5" />
      </motion.div>
    </Link>
  );
}

type DashboardIconSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onMobileOpen?: () => void;
};

export function DashboardIconSidebar({ mobileOpen, onMobileClose, onMobileOpen }: DashboardIconSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const sidebarContent = (
    <div className="flex h-full flex-col items-center py-6">
      <button
        type="button"
        aria-label="Menu"
        onClick={onMobileOpen}
        className="mb-8 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted-secondary transition-colors hover:bg-background-hover lg:pointer-events-none"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map(({ href, icon, label }) => (
          <NavIcon
            key={href}
            href={href}
            icon={icon}
            label={label}
            active={pathname === href}
            onNavigate={onMobileClose}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-2 pt-4">
        <Link
          href="/settings"
          title="Profile"
          aria-label="Profile"
          onClick={onMobileClose}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted-secondary transition-colors hover:bg-background-hover"
        >
          <User className="h-5 w-5" />
        </Link>
        <button
          type="button"
          aria-label="Logout"
          onClick={handleLogout}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted-secondary transition-colors hover:bg-background-hover"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / tablet icon rail */}
      <aside className="hidden h-full w-[82px] shrink-0 flex-col border-r border-border bg-white md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile drawer trigger is in navbar; drawer overlay */}
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
              initial={{ x: -82 }}
              animate={{ x: 0 }}
              exit={{ x: -82 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[82px] flex-col border-r border-border bg-white md:hidden"
            >
              <button
                type="button"
                aria-label="Close menu"
                onClick={onMobileClose}
                className="absolute right-[-44px] top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-md"
              >
                <X className="h-4 w-4" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
