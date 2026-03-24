"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebar } from "./sidebar-context";
import {
  LayoutDashboard,
  Package,
  Tag,
  Award,
  Megaphone,
  ShoppingCart,
  FileText,
  MessageSquare,
  HeadphonesIcon,
  Search,
  Settings,
  Image,
  Navigation,
  Layers,
  ChevronRight,
  ChevronLeft,
  Users,
  HelpCircle,
  Star,
  Sun,
  Moon,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Ürünler", icon: Package },
  { href: "/admin/categories", label: "Kategoriler", icon: Tag },
  { href: "/admin/brands", label: "Markalar", icon: Award },
  { href: "/admin/campaigns", label: "Kampanyalar", icon: Megaphone },
  { href: "/admin/orders", label: "Siparişler", icon: ShoppingCart },
  { href: "/admin/users", label: "Müşteriler", icon: Users },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/faqs", label: "SSS", icon: HelpCircle },
  { href: "/admin/reviews", label: "Değerlendirmeler", icon: Star },
  { href: "/admin/messages", label: "Mesajlar", icon: MessageSquare },
  { href: "/admin/support", label: "Destek", icon: HeadphonesIcon },
  { href: "/admin/media", label: "Medya", icon: Image },
  { href: "/admin/navigation", label: "Navigasyon", icon: Navigation },
  { href: "/admin/pages", label: "Sayfalar", icon: Layers },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("mesopro-theme", isDark ? "dark" : "light");
    setDark(isDark);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin-login");
  }

  function handleNavClick() {
    setMobileOpen(false);
  }

  const btnRow = `w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors`;

  // On mobile: fixed overlay, slides in/out
  // On desktop (md+): inline, collapses to w-14 or expands to w-64
  const sidebarClass = [
    "flex flex-col shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 overflow-hidden",
    // Mobile: fixed overlay
    "fixed inset-y-0 left-0 z-50 w-64",
    mobileOpen ? "translate-x-0" : "-translate-x-full",
    // Desktop: inline, width based on collapsed state
    "md:relative md:inset-auto md:translate-x-0",
    collapsed ? "md:w-14" : "md:w-64",
  ].join(" ");

  return (
    <aside className={sidebarClass}>
      {/* Logo */}
      <div
        className={`flex items-center border-b border-zinc-200 dark:border-zinc-800 h-14 ${
          collapsed ? "md:justify-center md:px-3 gap-2 px-5" : "gap-2 px-5"
        }`}
      >
        {collapsed ? (
          <>
            <span className="text-base font-bold text-indigo-500 hidden md:block">M</span>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:hidden">
              Meso<span className="text-indigo-500">Pro</span>
            </span>
            <span className="text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full md:hidden">
              Admin
            </span>
          </>
        ) : (
          <>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Meso<span className="text-indigo-500">Pro</span>
            </span>
            <span className="text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              title={collapsed ? label : undefined}
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? "md:justify-center" : ""
              } ${
                active
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span className={collapsed ? "md:hidden" : ""}>{label}</span>
              </span>
              {!collapsed && active && <ChevronRight className="h-3 w-3 opacity-50 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-2 space-y-0.5">
        {/* Theme */}
        <button
          onClick={toggleTheme}
          title={collapsed ? (dark ? "Açık Tema" : "Koyu Tema") : undefined}
          className={`${btnRow} text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 ${
            collapsed ? "md:justify-center" : ""
          }`}
        >
          {dark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          <span className={collapsed ? "md:hidden" : ""}>{dark ? "Açık Tema" : "Koyu Tema"}</span>
        </button>

        {/* Profile */}
        <Link
          href="/admin/settings"
          onClick={handleNavClick}
          title={collapsed ? "Profil" : undefined}
          className={`${btnRow} text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 ${
            collapsed ? "md:justify-center" : ""
          }`}
        >
          <User className="h-4 w-4 shrink-0" />
          <span className={collapsed ? "md:hidden" : ""}>Profil</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? "Çıkış Yap" : undefined}
          className={`${btnRow} text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 dark:hover:text-red-400 ${
            collapsed ? "md:justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={collapsed ? "md:hidden" : ""}>Çıkış Yap</span>
        </button>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Genişlet" : undefined}
          className={`hidden md:flex ${btnRow} text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-400 text-xs ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Küçült</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
