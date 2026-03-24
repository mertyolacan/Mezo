import { db } from "@/lib/db";
import { users, orders, supportTickets } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, ShoppingBag, MessageSquare } from "lucide-react";
import UserStatusToggle from "./UserStatusToggle";
import ToggleUserRoleButton from "../ToggleUserRoleButton";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) notFound();

  const [userOrders, userTickets, [orderTotal]] = await Promise.all([
    db.select({ id: orders.id, orderNumber: orders.orderNumber, total: orders.total, status: orders.status, createdAt: orders.createdAt })
      .from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)).limit(10),
    db.select({ id: supportTickets.id, ticketNumber: supportTickets.ticketNumber, subject: supportTickets.subject, status: supportTickets.status, createdAt: supportTickets.createdAt })
      .from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt)).limit(5),
    db.select({ count: count() }).from(orders).where(eq(orders.userId, userId)),
  ]);

  const statusMap: Record<string, { label: string; cls: string }> = {
    pending: { label: "Bekliyor", cls: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" },
    confirmed: { label: "Onaylandı", cls: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" },
    processing: { label: "Hazırlanıyor", cls: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" },
    shipped: { label: "Kargoda", cls: "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300" },
    delivered: { label: "Teslim", cls: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" },
    cancelled: { label: "İptal", cls: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" },
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-4 w-4 text-zinc-500" />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Kullanıcı Detayı</h1>
      </div>

      {/* Profil Kartı */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{user.name ?? "İsim yok"}</p>
              <p className="text-sm text-zinc-500">{user.email}</p>
              {user.phone && <p className="text-xs text-zinc-400 mt-0.5">{user.phone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <ToggleUserRoleButton userId={user.id} role={user.role} />
            <UserStatusToggle userId={user.id} isActive={user.isActive} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">Toplam Sipariş</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">{orderTotal.count}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">Kayıt Tarihi</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">{new Date(user.createdAt).toLocaleDateString("tr-TR")}</p>
          </div>
        </div>
      </div>

      {/* Son Siparişler */}
      {userOrders.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-zinc-400" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Son Siparişler</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {userOrders.map((order) => {
                const s = statusMap[order.status] ?? statusMap.pending;
                return (
                  <tr key={order.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                    <td className="px-5 py-3 font-mono text-xs">
                      <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                      {Number(order.total).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Destek Talepleri */}
      {userTickets.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-zinc-400" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Destek Talepleri</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {userTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-zinc-500">{ticket.ticketNumber}</td>
                  <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">{ticket.subject}</td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/support/${ticket.id}`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                      Görüntüle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
