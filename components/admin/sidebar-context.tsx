"use client";

import { createContext, useContext } from "react";

export interface NotifCounts {
  orders: number;
  messages: number;
  support: number;
}

export interface SidebarCtx {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  notifCounts: NotifCounts;
}

export const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  toggleCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  notifCounts: { orders: 0, messages: 0, support: 0 },
});

export function useSidebar() {
  return useContext(SidebarContext);
}
