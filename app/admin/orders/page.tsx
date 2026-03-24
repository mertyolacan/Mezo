import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Eye } from "lucide-react";
import ChangeOrderStatusButton from "./ChangeOrderStatusButton";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      userId: orders.userId,
      registeredUserId: users.id,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Siparişler</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500">Müşteri</th>
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500 hidden md:table-cell">İletişim</th>
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500 hidden lg:table-cell">Tarih</th>
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500">Tutar</th>
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500">Durum</th>
              <th className="px-3 py-2.5 sm:px-4 sm:py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{order.customerName}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      order.registeredUserId
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    }`}>
                      {order.registeredUserId ? "Kayıtlı" : "Kayıtlı değil"}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">{order.orderNumber}</div>
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3 hidden md:table-cell">
                  <div className="text-zinc-600 dark:text-zinc-300 text-xs">{order.customerEmail}</div>
                  {order.customerPhone && (
                    <div className="text-xs text-zinc-400 mt-0.5">{order.customerPhone}</div>
                  )}
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-500 hidden lg:table-cell whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3 font-semibold text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                  {Number(order.total).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <ChangeOrderStatusButton orderId={order.id} status={order.status} />
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors inline-flex"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
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
