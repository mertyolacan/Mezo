import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { Package } from "lucide-react";

const statusLabels: Record<string, { label: string; class: string }> = {
  pending:    { label: "Beklemede",     class: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  processing: { label: "Hazırlanıyor",  class: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  shipped:    { label: "Kargoda",       class: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
  delivered:  { label: "Teslim Edildi", class: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" },
  cancelled:  { label: "İptal",         class: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
};

type OrderItem = { productId: number; name: string; price: number; quantity: number; image: string };
type AppliedCampaign = { id: number; name: string; discount: number };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (!auth) return null;

  const [order] = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
  if (!order || order.userId !== auth.id) notFound();

  const status = statusLabels[order.status] ?? { label: order.status, class: "" };
  const items = order.items as OrderItem[];
  const campaigns = order.appliedCampaigns as AppliedCampaign[];
  const address = order.shippingAddress as { street: string; district: string; city: string; country: string };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Sipariş #{order.orderNumber}</h1>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${status.class}`}>{status.label}</span>
      </div>

      {/* Ürünler */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">Ürünler</p>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-5 w-5 text-zinc-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-2">{item.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5">x{item.quantity} · {formatPrice(item.price)} / adet</p>
              </div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 shrink-0">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Özet */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
        <p className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Sipariş Özeti</p>
        <div className="flex justify-between text-sm text-zinc-500">
          <span>Ara toplam</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        {campaigns.map((c) => (
          <div key={c.id} className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>{c.name}</span>
            <span>-{formatPrice(c.discount)}</span>
          </div>
        ))}
        {Number(order.discount) > 0 && (
          <div className="flex justify-between text-sm font-medium text-green-600 dark:text-green-400">
            <span>Toplam İndirim</span>
            <span>-{formatPrice(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-50 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span>Toplam</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Adres */}
      {address && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Teslimat Adresi</p>
          <p className="text-sm text-zinc-500">{address.street}</p>
          <p className="text-sm text-zinc-500">{address.district} / {address.city} / {address.country}</p>
        </div>
      )}

      {order.notes && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Sipariş Notu</p>
          <p className="text-sm text-zinc-500">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
