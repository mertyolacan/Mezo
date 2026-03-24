import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Eye } from "lucide-react";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: "Bekliyor", cls: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" },
  confirmed: { label: "Onaylandı", cls: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" },
  processing: { label: "Hazırlanıyor", cls: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" },
  shipped: { label: "Kargoda", cls: "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300" },
  delivered: { label: "Teslim Edildi", cls: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" },
  cancelled: { label: "İptal", cls: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" },
};

export default async function AdminOrdersPage() {
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      user: { name: users.name, email: users.email },
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Siparişler</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Sipariş No</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden md:table-cell">Müşteri</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden lg:table-cell">Tarih</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Tutar</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => {
              const s = statusMap[order.status] ?? statusMap.pending;
              return (
                <tr key={order.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <td className="px-4 py-3 font-mono font-medium text-zinc-900 dark:text-zinc-50">{order.orderNumber}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-zinc-800 dark:text-zinc-200">{order.user?.name ?? "Misafir"}</div>
                    <div className="text-xs text-zinc-400">{order.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 hidden lg:table-cell">
                    {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                    {(Number(order.total) / 100).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors inline-flex"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400 text-sm">Henüz sipariş yok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
