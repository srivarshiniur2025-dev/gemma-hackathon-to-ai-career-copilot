"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardIconSidebar } from "@/components/dashboard/DashboardIconSidebar";
import { DashboardNavProvider, useDashboardNav } from "@/components/dashboard/DashboardNavContext";
import { MobileNavTrigger } from "@/components/dashboard/MobileNavTrigger";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { cn } from "@/lib/utils";

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useCareerProfile();
  const { mobileNavOpen, closeMobileNav } = useDashboardNav();
  const isAssessment = pathname === "/assessment";
  const isDashboard = pathname === "/dashboard";

  useEffect(() => {
    if (loading || !profile) return;
    if (profile.onboarding_complete === false) {
      router.replace("/onboarding");
    }
  }, [loading, profile, router]);

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {!isAssessment && (
        <DashboardIconSidebar
          mobileOpen={mobileNavOpen}
          onMobileClose={closeMobileNav}
        />
      )}

      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col overflow-hidden",
          isDashboard ? "p-3 md:p-4" : "overflow-auto"
        )}
      >
        {!isAssessment && !isDashboard && <MobileNavTrigger />}
        <main
          className={cn(
            "flex-1",
            !isDashboard && !isAssessment && "overflow-auto p-6 lg:p-8",
            isAssessment && "overflow-auto"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardNavProvider>
        <DashboardShellInner>{children}</DashboardShellInner>
      </DashboardNavProvider>
    </ProtectedRoute>
  );
}
