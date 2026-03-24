"use client";

import { createContext, useContext } from "react";

export interface SidebarCtx {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  toggleCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}
