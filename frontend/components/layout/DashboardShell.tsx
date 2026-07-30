"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquare,
  Mic,
  Search,
  Settings,
  TrendingUp,
  Bell,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Logo } from "@/components/brand/Logo";
import { GemmaBadge } from "@/components/gemma/GemmaBrand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessment", label: "Assessment", icon: MessageSquare },
  { href: "/roadmap", label: "Learning Roadmap", icon: Map },
  { href: "/resume", label: "Resume Builder", icon: FileText },
  { href: "/internships", label: "Internships", icon: Briefcase },
  { href: "/interview", label: "Mock Interview", icon: Mic },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background-dashboard">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white lg:flex">
          <div className="border-b border-border px-5 py-5">
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>
          <div className="px-4 pt-3 pb-1">
            <GemmaBadge className="w-full justify-center" size="sm" />
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-muted-secondary hover:bg-background-hover hover:text-foreground-heading"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-accent" : "text-muted-secondary")} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-secondary"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-white px-6">
            <div className="relative hidden max-w-md flex-1 md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input placeholder="Search..." className="pl-10 bg-background-muted border-transparent" />
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button className="relative cursor-pointer rounded-[14px] p-2 hover:bg-background-hover">
                <Bell className="h-5 w-5 text-muted-secondary" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
              </button>
              <div className="flex items-center gap-3 rounded-[14px] border border-border px-3 py-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {(user?.displayName?.[0] ?? "U").toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold leading-none text-foreground-heading">
                    {user?.displayName ?? "Student"}
                  </p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
