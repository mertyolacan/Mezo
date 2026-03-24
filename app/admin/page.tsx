import { db } from "@/lib/db";
import { orders, users, products, blogPosts, supportTickets } from "@/lib/db/schema";
import { eq, count, sum, desc, sql } from "drizzle-orm";
import { ShoppingBag, Users, Package, MessageSquare, TrendingUp, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import RevenueChart from "@/components/admin/RevenueChart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    [orderStats],
    [userCount],
    [productCount],
    [ticketCount],
    [blogCount],
    recentOrders,
    lowStockItems,
  ] = await Promise.all([
    db.select({ count: count(), total: sum(orders.total) }).from(orders),
    db.select({ count: count() }).from(users).where(eq(users.role, "user")),
    db.select({ count: count() }).from(products).where(eq(products.isActive, true)),
    db.select({ count: count() }).from(supportTickets).where(eq(supportTickets.status, "open")),
    db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, "published")),
    db
      .select({ id: orders.id, orderNumber: orders.orderNumber, customerName: orders.customerName, total: orders.total, status: orders.status, createdAt: orders.createdAt })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5),
    db
      .select({ id: products.id, name: products.name, stock: products.stock, lowStockThreshold: products.lowStockThreshold })
      .from(products)
      .where(sql`${products.isActive} = true AND ${products.stock} <= COALESCE(${products.lowStockThreshold}, 5)`),
  ]);

  const totalRevenue = Number(orderStats.total ?? 0);

  const stats = [
    {
      label: "Toplam Gelir",
      value: totalRevenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY" }),
      icon: TrendingUp,
      cls: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      href: "/admin/orders",
    },
    {
      label: "Sipariş",
      value: orderStats.count.toLocaleString("tr-TR"),
      icon: ShoppingBag,
      cls: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
      href: "/admin/orders",
    },
    {
      label: "Müşteri",
      value: userCount.count.toLocaleString("tr-TR"),
      icon: Users,
      cls: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      href: "/admin/users",
    },
    {
      label: "Aktif Ürün",
      value: productCount.count.toLocaleString("tr-TR"),
      icon: Package,
      cls: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
      href: "/admin/products",
    },
    {
      label: "Açık Destek",
      value: ticketCount.count.toLocaleString("tr-TR"),
      icon: MessageSquare,
      cls: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
      href: "/admin/support",
    },
    {
      label: "Blog Yazısı",
      value: blogCount.count.toLocaleString("tr-TR"),
      icon: FileText,
      cls: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      href: "/admin/blog",
    },
  ];

  const statusMap: Record<string, { label: string; cls: string }> = {
    pending: { label: "Bekliyor", cls: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" },
    confirmed: { label: "Onaylandı", cls: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" },
    processing: { label: "Hazırlanıyor", cls: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" },
    shipped: { label: "Kargoda", cls: "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300" },
    delivered: { label: "Teslim", cls: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" },
    cancelled: { label: "İptal", cls: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" },
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div className={`p-3 rounded-xl shrink-0 ${stat.cls}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">{stat.label}</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <RevenueChart />

      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h2 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Düşük Stok Uyarısı</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="text-xs bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-1.5 text-amber-800 dark:text-amber-300 hover:border-amber-400 transition-colors"
              >
                {p.name} — <span className="font-bold">{p.stock} adet</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Son Siparişler</h2>
          <Link href="/admin/orders" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Tümünü gör →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Sipariş No</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500 hidden sm:table-cell">Müşteri</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Tutar</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Durum</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => {
              const s = statusMap[order.status] ?? statusMap.pending;
              return (
                <tr key={order.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                    <Link href={`/admin/orders/${order.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300 hidden sm:table-cell">{order.customerName}</td>
                  <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                    {Number(order.total).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-zinc-400 text-sm">Henüz sipariş yok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
