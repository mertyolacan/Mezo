"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";

export default function AdminHeader() {
  const { toggleMobile } = useSidebar();

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center px-4 shrink-0 md:hidden">
      <button
        onClick={toggleMobile}
        className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Menu className="h-4 w-4" />
      </button>
    </header>
  );
}
