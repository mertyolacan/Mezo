import { db } from "@/lib/db";
import { navMenus, navItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import NavigationManager from "./NavigationManager";

export const dynamic = "force-dynamic";

export default async function AdminNavigationPage() {
  const menus = await db.select().from(navMenus);
  const items = await db.select().from(navItems).orderBy(navItems.sortOrder);

  const menusWithItems = menus.map((menu) => ({
    ...menu,
    items: items.filter((item) => item.menuId === menu.id),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Navigasyon Yönetimi</h1>
      <NavigationManager initialMenus={menusWithItems} />
    </div>
  );
}
