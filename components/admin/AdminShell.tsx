"use client";

import { useState, useEffect } from "react";
import { SidebarContext } from "./sidebar-context";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("mesopro-sidebar");
    if (saved) {
      setCollapsed(saved === "collapsed");
    } else {
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("mesopro-sidebar", next ? "collapsed" : "expanded");
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed, mobileOpen: false, setMobileOpen: () => {} }}>
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-3 md:p-6 min-w-0">{children}</main>
      </div>
    </SidebarContext.Provider>
  );
}
