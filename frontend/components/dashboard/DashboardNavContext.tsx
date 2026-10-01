"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type DashboardNavContextValue = {
  mobileNavOpen: boolean;
  navPanelOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleNavPanel: () => void;
  closeNavPanel: () => void;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);
const PANEL_KEY = "careerCopilotNavPanelOpen";

export function DashboardNavProvider({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navPanelOpen, setNavPanelOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(PANEL_KEY);
    setNavPanelOpen(saved == null ? window.innerWidth >= 1024 : saved === "1");
  }, []);

  const setPanel = useCallback((open: boolean) => {
    setNavPanelOpen(open);
    window.localStorage.setItem(PANEL_KEY, open ? "1" : "0");
  }, []);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const toggleNavPanel = useCallback(() => setPanel(!navPanelOpen), [navPanelOpen, setPanel]);
  const closeNavPanel = useCallback(() => setPanel(false), [setPanel]);

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
