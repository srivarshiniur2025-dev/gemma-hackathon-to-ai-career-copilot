"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type DashboardNavContextValue = {
  mobileNavOpen: boolean;
  navPanelOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleNavPanel: () => void;
  closeNavPanel: () => void;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

export function DashboardNavProvider({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navPanelOpen, setNavPanelOpen] = useState(false);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const toggleNavPanel = useCallback(() => setNavPanelOpen((v) => !v), []);
  const closeNavPanel = useCallback(() => setNavPanelOpen(false), []);

  const value = useMemo(
    () => ({
      mobileNavOpen,
      navPanelOpen,
      openMobileNav,
      closeMobileNav,
      toggleNavPanel,
      closeNavPanel,
    }),
    [mobileNavOpen, navPanelOpen, openMobileNav, closeMobileNav, toggleNavPanel, closeNavPanel]
  );

  return <DashboardNavContext.Provider value={value}>{children}</DashboardNavContext.Provider>;
}

export function useDashboardNav() {
  const ctx = useContext(DashboardNavContext);
  if (!ctx) {
    return {
      mobileNavOpen: false,
      navPanelOpen: false,
      openMobileNav: () => {},
      closeMobileNav: () => {},
      toggleNavPanel: () => {},
      closeNavPanel: () => {},
    };
  }
  return ctx;
}
