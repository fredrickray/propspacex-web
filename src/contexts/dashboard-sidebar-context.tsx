"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DashboardSidebarContextValue = {
  /** Large screens: narrow icon-only rail when true */
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
  /** Small screens: mobile drawer */
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  toggleMobile: () => void;
  /** Header button: collapse on lg+, drawer below lg */
  toggleSidebar: () => void;
};

const DashboardSidebarContext =
  createContext<DashboardSidebarContextValue | null>(null);

export function DashboardSidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((o) => !o);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      toggleCollapsed();
    } else {
      toggleMobile();
    }
  }, [toggleCollapsed, toggleMobile]);

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed,
      mobileOpen,
      setMobileOpen,
      toggleMobile,
      toggleSidebar,
    }),
    [
      collapsed,
      mobileOpen,
      toggleCollapsed,
      toggleMobile,
      toggleSidebar,
    ],
  );

  return (
    <DashboardSidebarContext.Provider value={value}>
      {children}
    </DashboardSidebarContext.Provider>
  );
}

export function useDashboardSidebar() {
  const ctx = useContext(DashboardSidebarContext);
  if (!ctx) {
    throw new Error(
      "useDashboardSidebar must be used within DashboardSidebarProvider",
    );
  }
  return ctx;
}
