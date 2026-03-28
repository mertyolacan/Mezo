"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import {
  LayoutDashboard,
  Package,
  Tag,
  Award,
  Megaphone,
  ShoppingCart,
  FileText,
  LifeBuoy,
  MessageSquare,
  Search,
  Settings,
  Image as ImageIcon,
  Navigation,
  Layers,
  ChevronRight,
  ChevronLeft,
  Users,
  HelpCircle,
  Star,
  X,
} from "lucide-react";

const navGroups = [
  {
    label: "Panel",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ]
  },
  {
    label: "Mağaza",
    items: [
      { href: "/admin/products", label: "Ürünler", icon: Package },
      { href: "/admin/categories", label: "Kategoriler", icon: Tag },
      { href: "/admin/brands", label: "Markalar", icon: Award },
      { href: "/admin/orders", label: "Siparişler", icon: ShoppingCart, notif: "orders" as const },
      { href: "/admin/campaigns", label: "Kampanyalar", icon: Megaphone },
    ]
  },
  {
    label: "İçerik",
    items: [
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/pages", label: "Sayfalar", icon: Layers },
      { href: "/admin/faqs", label: "SSS", icon: HelpCircle },
      { href: "/admin/media", label: "Medya", icon: ImageIcon },
    ]
  },
  {
    label: "Müşteriler",
    items: [
      { href: "/admin/users", label: "Müşteriler", icon: Users },
      { href: "/admin/messages", label: "Mesajlar", icon: MessageSquare, notif: "messages" as const },
      { href: "/admin/support", label: "Destek", icon: LifeBuoy, notif: "support" as const },
      { href: "/admin/reviews", label: "Değerlendirmeler", icon: Star },
    ]
  },
  {
    label: "Ayarlar",
    items: [
      { href: "/admin/settings", label: "Genel Ayarlar", icon: Settings },
      { href: "/admin/seo", label: "SEO & Meta", icon: Search },
      { href: "/admin/navigation", label: "Navigasyon", icon: Navigation },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen, notifCounts } = useSidebar();

  const showLabels = !collapsed || mobileOpen;

  return (
    <aside
      className={[
        "flex flex-col shrink-0 border-r border-zinc-200/80 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 transition-all duration-300 ease-in-out z-40",
        "fixed inset-y-0 left-0 w-64",
        "lg:relative lg:translate-x-0",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        collapsed ? "lg:w-[68px]" : "lg:w-64",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-900 overflow-hidden">
        <Link href="/admin" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-btn bg-brand-primary flex items-center justify-center shrink-0 shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg leading-none">M</span>
          </div>
          {showLabels && (
            <div className="flex flex-col animate-in slide-in-from-left-2 duration-300">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-none">Site Yön.</span>
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">Kontrol Paneli</span>
            </div>
          )}
        </Link>
        {/* Mobile close button */}
        <button
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-4 px-3 space-y-6 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {showLabels && (
              <h3 className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em] mb-2">
                {group.label}
              </h3>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = (item as any).exact ? pathname === item.href : pathname.startsWith(item.href);
                const count = "notif" in item && item.notif ? (notifCounts as any)[item.notif] : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!showLabels ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`group relative flex items-center rounded-btn px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary-light shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    {/* Active Accent Line */}
                    {active && (
                      <div className="absolute left-0 w-1 h-5 bg-brand-primary rounded-r-full" />
                    )}

                    <item.icon className={`h-[18px] w-[18px] shrink-0 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} />

                    {showLabels && <span className="ml-3 truncate flex-1">{item.label}</span>}

                    {count > 0 && (
                      <span className={`inline-flex items-center justify-center rounded-full bg-brand-primary text-white text-[10px] font-bold ring-2 ring-white dark:ring-zinc-950 ${
                        !showLabels ? "absolute -top-1 -right-1 min-w-[14px] h-[14px]" : "min-w-[18px] h-[18px] ml-auto"
                      }`}>
                        {count > 99 ? "99+" : count}
                      </span>
                    )}

                    {showLabels && active && (
                      <ChevronRight className="h-3.5 w-3.5 opacity-40 ml-1.5" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — Collapse (desktop only) */}
      <div className="hidden lg:block p-3 border-t border-zinc-100 dark:border-zinc-900">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
