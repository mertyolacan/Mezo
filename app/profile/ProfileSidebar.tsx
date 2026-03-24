"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, ShoppingBag, Heart, HeadphonesIcon, Settings, LogOut, MapPin } from "lucide-react";

const links = [
  { href: "/profile", label: "Hesabım", icon: User, exact: true },
  { href: "/profile/orders", label: "Siparişlerim", icon: ShoppingBag },
  { href: "/profile/favorites", label: "Favorilerim", icon: Heart },
  { href: "/profile/addresses", label: "Adreslerim", icon: MapPin },
  { href: "/profile/support", label: "Destek", icon: HeadphonesIcon },
  { href: "/profile/settings", label: "Ayarlar", icon: Settings },
];

export default function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-full md:w-52 shrink-0">
      <nav className="space-y-0.5">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Çıkış Yap
        </button>
      </nav>
    </aside>
  );
}
