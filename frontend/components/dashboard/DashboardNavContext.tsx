"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type DashboardNavContextValue = {
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

export function DashboardNavProvider({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const value = useMemo(
    () => ({ mobileNavOpen, openMobileNav, closeMobileNav }),
    [mobileNavOpen, openMobileNav, closeMobileNav]
  );

  return <DashboardNavContext.Provider value={value}>{children}</DashboardNavContext.Provider>;
}

export function useDashboardNav() {
  const ctx = useContext(DashboardNavContext);
  if (!ctx) {
    return {
      mobileNavOpen: false,
      openMobileNav: () => {},
      closeMobileNav: () => {},
    };
  }
  return ctx;
}
