"use client";

import Link from "next/link";
import { ShoppingBag, Moon, Sun, Menu, X, User, LayoutDashboard, Heart, Search, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

interface Category {
  id: string;
  name: string;
  slug: string;
}

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn] = useState(isLoggedIn);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [expandedSection, setExpandedSection] = useState<'categories' | 'brands' | 'price' | null>(null);
  
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const handleApplyPrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  useEffect(() => {
    // Fetch Categories
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          setCategories(data.data);
        }
      })
      .catch(console.error);

    // Fetch Brands
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          setBrands(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    let lastY = window.scrollY;
    
    function onScroll() {
      const currentY = window.scrollY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (currentY / height) * 100;
      setScrollProgress(progress);
      
      if (currentY > 15 && currentY > lastY) {
        setScrolled(true);
      } else if (currentY < lastY) {
        setScrolled(false);
      }
      
      if (currentY < 15) {
        setScrolled(false);
      }
      
      lastY = currentY;
    }
    
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 border-b bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 ${
          scrolled ? "shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-b-transparent" : "border-b-zinc-100"
        }`}
      >
        {/* Scroll Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150 ease-out z-50 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
          style={{ width: `${scrollProgress}%` }}
        />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row: Hamburger, Logo, Search, Actions */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2 md:gap-y-3 gap-x-4 pt-2 pb-2 md:py-4">
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
              className="p-1 -ml-1 rounded-lg text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link href="/" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 shrink-0">
              Meso<span className="text-indigo-500">Pro</span>
            </Link>
          </div>

          <div className="order-last md:order-none w-full md:w-auto md:flex-1 max-w-3xl px-0 md:px-4 lg:px-8">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Ürün, kategori veya marka ara"
                className="w-full bg-zinc-100/60 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/50 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-zinc-50 rounded-2xl py-2.5 pl-12 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-zinc-500 focus:shadow-[0_0_20px_rgba(79,70,229,0.08)]"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-500">
                <Search className="h-5 w-5 text-zinc-400 group-focus-within:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            
            {/* Admin Panel link — only for admins */}
            {isAdmin && (
              <Link
                href="/admin"
                aria-label="Yönetici Paneli"
                title="Yönetici Paneli"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Yönetici</span>
              </Link>
            )}

            {/* Profile / Login */}
            <Link
              href={loggedIn ? "/profile" : "/login"}
              className={`flex items-center gap-2 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                isActive("/profile") && !isActive("/profile/favorites")
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              <User className="h-6 w-6" />
              <span className="hidden md:block text-sm font-medium">{loggedIn ? "Hesabım" : "Giriş Yap"}</span>
            </Link>

            {/* Favorites */}
            <Link
              href="/profile/favorites"
              className={`flex items-center gap-2 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                isActive("/profile/favorites")
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              <Heart className="h-6 w-6" />
              <span className="hidden md:block text-sm font-medium">Favorilerim</span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className={`relative flex items-center gap-2 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                isActive("/cart") ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              <div className="relative">
                <ShoppingBag className="h-6 w-6" />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-sm font-medium">Sepetim</span>
            </Link>


          </div>
        </div>
      </div>
    </header>

    {/* Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[50] bg-black/40 cursor-pointer backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Side Navigation Drawer */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-[60] w-full md:w-[400px] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-transform duration-300 flex flex-col overflow-hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Kapat"
              className="p-1 -ml-1 rounded-lg text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-7 w-7" />
            </button>
            <Link href="/" onClick={() => setMobileOpen(false)} className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">
              Meso<span className="text-indigo-500">Pro</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <button className="text-zinc-900 dark:text-zinc-50">
              <Search className="h-6 w-6" />
            </button>
            <Link
              href="/profile/favorites"
              onClick={() => setMobileOpen(false)}
              className="text-zinc-900 dark:text-zinc-50"
            >
              <Heart className="h-6 w-6" />
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-2 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                isActive("/cart") ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              <div className="relative">
                <ShoppingBag className="h-6 w-6" />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <Link
              href={loggedIn ? "/profile" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 text-zinc-900 dark:text-zinc-50"
            >
              <User className="h-6 w-6" />
              <span className="font-semibold text-sm">{loggedIn ? "Hesabım" : "Giriş Yap / Üye Ol"}</span>
            </Link>
          </div>

          {/* Menü İçeriği */}
          <div className="flex flex-col py-1 border-b border-zinc-100 dark:border-zinc-800">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="px-4 py-4">
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Kategoriler
            </h3>
            <div className="flex flex-col">
              {categories.map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="px-4 mt-2">
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Yönetici Paneli
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Floating Dark/Light Toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Tema değiştir"
        className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:-translate-y-1 hover:shadow-xl"
      >
        {dark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
      </button>
    </>
  );
}
