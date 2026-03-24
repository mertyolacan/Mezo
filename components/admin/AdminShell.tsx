"use client";

import { useState, useEffect } from "react";
import { SidebarContext, NotifCounts } from "./sidebar-context";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminShell({
  children,
  notifCounts = { orders: 0, messages: 0, support: 0 },
}: {
  children: React.ReactNode;
  notifCounts?: NotifCounts;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mesopro-sidebar");
    if (saved) setCollapsed(saved === "collapsed");
    else setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("mesopro-sidebar", next ? "collapsed" : "expanded");
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed, mobileOpen, setMobileOpen, notifCounts }}>
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth antialiased">
            <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
