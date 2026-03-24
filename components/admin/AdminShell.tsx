"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { SidebarContext } from "./sidebar-context";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mesopro-sidebar");
    if (saved) {
      setCollapsed(saved === "collapsed");
    } else {
      setCollapsed(window.innerWidth < 768);
    }
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("mesopro-sidebar", next ? "collapsed" : "expanded");
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed, mobileOpen, setMobileOpen }}>
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile top header */}
        <header className="fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4 gap-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Menu className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Meso<span className="text-indigo-500">Pro</span>
          </span>
          <span className="text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </header>

        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-[calc(3.5rem+1rem)] md:pt-6">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
