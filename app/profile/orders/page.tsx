import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, ChevronRight } from "lucide-react";

const statusLabels: Record<string, { label: string; class: string }> = {
  pending:    { label: "Beklemede",    class: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  processing: { label: "Hazırlanıyor", class: "bg-blue-100 text-brand-primary dark:bg-blue-950 dark:text-brand-primary" },
  shipped:    { label: "Kargoda",      class: "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/10 dark:text-brand-primary" },
  delivered:  { label: "Teslim Edildi",class: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" },
  cancelled:  { label: "İptal",        class: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
};

export default async function OrdersPage() {
  const auth = await getAuthUser();
  if (!auth) return null;

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, auth.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Siparişlerim</h1>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-400 gap-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <ShoppingBag className="h-10 w-10" />
          <p className="text-sm">Henüz sipariş yok</p>
          <Link href="/products" className="text-sm text-brand-primary hover:underline">Alışverişe başla</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => {
            const status = statusLabels[o.status] ?? { label: o.status, class: "" };
            const itemCount = (o.items as unknown[]).length;
            return (
              <Link
                key={o.id}
                href={`/profile/orders/${o.id}`}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-card border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      #{o.orderNumber}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.class}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {itemCount} ürün · {new Date(o.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatPrice(o.total)}</span>
                  <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
