import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileDown } from "lucide-react";
import OrderStatusSelect from "./OrderStatusSelect";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: "Bekliyor", cls: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" },
  confirmed: { label: "Onaylandı", cls: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" },
  processing: { label: "Hazırlanıyor", cls: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" },
  shipped: { label: "Kargoda", cls: "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300" },
  delivered: { label: "Teslim Edildi", cls: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" },
  cancelled: { label: "İptal", cls: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" },
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const [row] = await db
    .select()
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, Number(id)))
    .limit(1);

  if (!row) notFound();

  const order = row.orders;
  const user = row.users;
  const items = order.items as Array<{ productId: number; name: string; price: number; quantity: number; image?: string }>;
  const campaigns = (order.appliedCampaigns as Array<{ name: string; discount: number }>) ?? [];
  const address = order.shippingAddress as Record<string, string>;
  const s = statusMap[order.status] ?? statusMap.pending;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Sipariş #{order.orderNumber}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
        <Link
          href={`/api/admin/orders/${order.id}/invoice`}
          target="_blank"
          className="ml-auto flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm px-3 py-1.5 rounded-lg transition-colors"
        >
          <FileDown className="h-4 w-4" /> Fatura İndir
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Customer */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Müşteri</h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{user?.name ?? "Misafir"}</p>
          {user?.email && <p className="text-sm text-zinc-500">{user.email}</p>}
          {user?.phone && <p className="text-sm text-zinc-500">{user.phone}</p>}
        </div>

        {/* Address */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Teslimat Adresi</h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{order.customerName}</p>
          <p className="text-sm text-zinc-500">{address.street}</p>
          <p className="text-sm text-zinc-500">{address.district} / {address.city} {address.postalCode}</p>
          <p className="text-sm text-zinc-500">{order.customerPhone}</p>
        </div>
      </div>

      {/* Status update */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm mb-3">Durumu Güncelle</h2>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Ürünler</h2>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{item.name}</p>
                <p className="text-xs text-zinc-400">x{item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {((item.price * item.quantity) / 100).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </p>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
          {campaigns.map((c, i) => (
            <div key={i} className="flex justify-between text-sm text-green-600 dark:text-green-400">
              <span>{c.name}</span>
              <span>-{(c.discount / 100).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-50 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span>Toplam</span>
            <span>{(Number(order.total) / 100).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm mb-2">Sipariş Notu</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
