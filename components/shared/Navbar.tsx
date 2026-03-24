"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag, Moon, Sun, Menu, X, User, LayoutDashboard, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Ana Sayfa", exact: true },
  { href: "/products", label: "Ürünler" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "SSS" },
  { href: "/contact", label: "İletişim" },
];

export default function Navbar({ isLoggedIn, isAdmin }: { isLoggedIn: boolean; isAdmin?: boolean }) {
  const { count, openCart } = useCart();
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn] = useState(isLoggedIn);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    function onScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("mesopro-theme", isDark ? "dark" : "light");
    setDark(isDark);
  }

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 border-b ${
        scrolled
          ? "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-sm border-zinc-200/80 dark:border-zinc-800/80"
          : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 shrink-0">
            Meso<span className="text-indigo-500">Pro</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ href, label, exact }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href, exact)
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Dark/light toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Tema değiştir"
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Admin Panel link — only for admins */}
            {isAdmin && (
              <Link
                href="/admin"
                aria-label="Yönetici Paneli"
                title="Yönetici Paneli"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Yönetici</span>
              </Link>
            )}

            {/* Favorites */}
            <Link
              href="/profile/favorites"
              aria-label="Favorilerim"
              className={`p-2 rounded-lg transition-colors ${
                isActive("/profile/favorites")
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Heart className="h-4 w-4" />
            </Link>

            {/* Profile / Login */}
            <Link
              href={loggedIn ? "/profile" : "/login"}
              aria-label={loggedIn ? "Profilim" : "Giriş yap"}
              className={`p-2 rounded-lg transition-colors ${
                isActive("/profile") && !isActive("/profile/favorites")
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <User className="h-4 w-4" />
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              aria-label="Sepeti aç"
              className="relative p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
              className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-zinc-100 dark:border-zinc-800 py-3 space-y-0.5">
            {navLinks.map(({ href, label, exact }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href, exact)
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
