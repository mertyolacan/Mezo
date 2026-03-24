import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, orders, favorites } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { User, ShoppingBag, Heart } from "lucide-react";

export default async function ProfilePage() {
  const auth = await getAuthUser();
  if (!auth) return null;

  const [user] = await db.select().from(users).where(eq(users.id, auth.id)).limit(1);
  const [[{ orderCount }], [{ favCount }]] = await Promise.all([
    db.select({ orderCount: count() }).from(orders).where(eq(orders.userId, auth.id)),
    db.select({ favCount: count() }).from(favorites).where(eq(favorites.userId, auth.id)),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Hesabım</h1>

      {/* Profil kartı */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
          <User className="h-7 w-7 text-indigo-500" />
        </div>
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">{user?.name ?? "Kullanıcı"}</p>
          <p className="text-sm text-zinc-500">{user?.email}</p>
          {user?.phone && <p className="text-sm text-zinc-400">{user.phone}</p>}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{orderCount}</p>
            <p className="text-xs text-zinc-500">Sipariş</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-rose-50 dark:bg-rose-950 flex items-center justify-center">
            <Heart className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{favCount}</p>
            <p className="text-xs text-zinc-500">Favori</p>
          </div>
        </div>
      </div>
    </div>
  );
}
