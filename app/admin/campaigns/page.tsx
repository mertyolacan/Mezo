import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Plus, Pencil, Megaphone } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import DeleteCampaignButton from "./DeleteCampaignButton";
import ToggleCampaignButton from "./ToggleCampaignButton";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  coupon: "Kupon Kodu",
  cart_total: "Sepet Tutarı",
  product: "Ürüne Özel",
  category: "Kategoriye Özel",
  bogo: "Al X Öde Y",
  volume: "Adet İndirimi",
};

export default async function AdminCampaignsPage() {
  const rows = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Kampanyalar</h1>
        <Link
          href="/admin/campaigns/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Kampanya
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-400 gap-3">
          <Megaphone className="h-10 w-10" />
          <p className="text-sm">Henüz kampanya yok</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Kampanya</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Tip</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">İndirim</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Kullanım</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Durum</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">{c.name}</p>
                    {c.couponCode && (
                      <code className="text-xs bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                        {c.couponCode}
                      </code>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{typeLabels[c.type] ?? c.type}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {c.discountType === "percentage"
                      ? `%${c.discountValue}`
                      : formatPrice(Number(c.discountValue))}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {c.currentUsage}{c.maxUsage ? ` / ${c.maxUsage}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <ToggleCampaignButton id={c.id} isActive={c.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/campaigns/${c.id}`} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <DeleteCampaignButton id={c.id} name={c.name} />
                    </div>
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
