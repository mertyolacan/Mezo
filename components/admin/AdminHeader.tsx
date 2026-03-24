"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Home, Globe, Bell, User, Sun, Moon, LogOut, Settings, Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const paths = pathname.split("/").filter(Boolean);
  const [dark, setDark] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setMobileOpen } = useSidebar();

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("mesopro-theme", isDark ? "dark" : "light");
    setDark(isDark);
  }

  async function handleLogout() {
    setDropdownOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin-login");
  }

  const pathNames: Record<string, string> = {
    admin: "Panel",
    products: "Ürünler",
    categories: "Kategoriler",
    brands: "Markalar",
    campaigns: "Kampanyalar",
    orders: "Siparişler",
    users: "Müşteriler",
    blog: "Blog",
    faqs: "SSS",
    reviews: "Değerlendirmeler",
    messages: "Mesajlar",
    media: "Medya",
    navigation: "Navigasyon",
    pages: "Sayfalar",
    seo: "SEO",
    settings: "Ayarlar",
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Menüyü aç"
        >
          <Menu className="h-5 w-5" />
        </button>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/admin"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>

        {paths.map((path, i) => {
          const href = `/${paths.slice(0, i + 1).join("/")}`;
          const isLast = i === paths.length - 1;
          const label = pathNames[path] || path.charAt(0).toUpperCase() + path.slice(1);

          if (path === "admin" && i === 0) return null;

          return (
            <div key={href} className="flex items-center gap-2">
              <ChevronRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700" />
              {isLast ? (
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 px-2">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all border border-indigo-100 dark:border-indigo-500/20"
        >
          <Globe className="h-3.5 w-3.5" />
          Siteni Gör
        </Link>

        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={dark ? "Açık tema" : "Koyu tema"}
          className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 p-1 pl-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
          >
            <span className="hidden md:block text-xs font-bold text-zinc-700 dark:text-zinc-300">Admin</span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <User className="h-4 w-4 text-zinc-500" />
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl shadow-zinc-900/10 dark:shadow-zinc-900/40 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-900 mb-1">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Admin</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Yönetici</p>
              </div>

              <Link
                href="/admin/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Profil Ayarları
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
