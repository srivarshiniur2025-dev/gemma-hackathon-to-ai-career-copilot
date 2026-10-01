"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Home, Menu } from "lucide-react";
import { useDashboardNav } from "@/components/dashboard/DashboardNavContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { navItemsForProfile } from "@/lib/learner-track";

const SEGMENT_LABELS: Record<string, string> = {
  setup: "Setup",
  feedback: "Feedback",
  live: "Live test",
};

const DYNAMIC_LABELS: Record<string, string> = {
  interview: "Session",
  mocks: "Test",
  assessment: "Test",
};

type Crumb = { label: string; href?: string };

export function PageBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, initials } = useCareerProfile();
  const { openMobileNav } = useDashboardNav();

  const items = navItemsForProfile(profile);
  const section = items
    .filter((i) => i.href !== "/dashboard" && (pathname === i.href || pathname.startsWith(`${i.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const crumbs: Crumb[] = [{ label: "Dashboard", href: "/dashboard" }];
  let parentHref = "/dashboard";
  if (section) {
    crumbs.push({ label: section.group });
    const rest = pathname.slice(section.href.length).split("/").filter(Boolean);
    crumbs.push({ label: section.label, href: rest.length ? section.href : undefined });
    let href = section.href;
    const root = section.href.split("/").filter(Boolean)[0] ?? "";
    rest.forEach((seg, i) => {
      parentHref = href;
      href = `${href}/${seg}`;
      crumbs.push({
        label: SEGMENT_LABELS[seg] ?? DYNAMIC_LABELS[root] ?? seg,
        href: i < rest.length - 1 ? href : undefined,
      });
    });
  }
  const goBack = () => {
    const sameOrigin = typeof document !== "undefined" && document.referrer.startsWith(window.location.origin);
    if (sameOrigin && window.history.length > 1) router.back();
    else router.push(parentHref);
  };

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={openMobileNav}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-muted-secondary transition-colors hover:bg-background-hover md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground-heading transition-colors duration-200 hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex min-w-0 items-center gap-1 text-sm">
            {crumbs.map((c, i) => (
              <li key={`${c.label}-${i}`} className={i === crumbs.length - 1 ? "min-w-0" : "hidden shrink-0 items-center sm:flex"}>
                <span className="flex items-center gap-1">
                  {i > 0 ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-disabled" aria-hidden /> : null}
                  {c.href ? (
                    <Link
                      href={c.href}
                      className="inline-flex items-center gap-1 rounded-md px-1 text-muted transition-colors hover:text-accent"
                    >
                      {i === 0 ? <Home className="h-3.5 w-3.5" /> : null}
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        i === crumbs.length - 1
                          ? "truncate px-1 font-semibold text-foreground-heading"
                          : "px-1 text-disabled"
                      }
                      aria-current={i === crumbs.length - 1 ? "page" : undefined}
                    >
                      {c.label}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <Link
          href="/settings"
          aria-label="Open settings"
          title="Settings"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-accent-light transition-opacity hover:opacity-90"
        >
          {initials}
        </Link>
      </div>
    </div>
  );
}
