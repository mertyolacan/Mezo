"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Star, ShoppingBag, HeadphonesIcon, Mail } from "lucide-react";
import Link from "next/link";

const iconMap = { orders: ShoppingBag, reviews: Star, tickets: HeadphonesIcon, messages: Mail } as const;

type Section = "orders" | "reviews" | "tickets" | "messages";

const orderStatusMap: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Bekliyor",      cls: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" },
  confirmed:  { label: "Onaylandı",    cls: "bg-blue-100 dark:bg-blue-900/40 text-brand-primary dark:text-blue-300" },
  processing: { label: "Hazırlanıyor", cls: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" },
  shipped:    { label: "Kargoda",      cls: "bg-brand-primary/10 dark:bg-brand-primary/10/40 text-brand-primary dark:text-brand-primary" },
  delivered:  { label: "Teslim",       cls: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
  cancelled:  { label: "İptal",        cls: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
};

const ticketStatusMap: Record<string, { label: string; cls: string }> = {
  open:        { label: "Açık",    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  in_progress: { label: "İşlemde", cls: "bg-blue-100 text-brand-primary dark:bg-blue-900/40 dark:text-blue-300" },
  resolved:    { label: "Çözüldü", cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  closed:      { label: "Kapalı",  cls: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800" },
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-600"}`} />
      ))}
    </span>
  );
}

export default function UserActivitySection({
  userId,
  section,
  count,
  label,
}: {
  userId: number;
  section: Section;
  count: number;
  label: string;
}) {
  const Icon = iconMap[section];
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  async function toggle() {
    if (!open && !loaded) {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${userId}/activity?section=${section}`);
      const json = await res.json();
      setData(json.data ?? []);
      setLoaded(true);
      setLoading(false);
    }
    setOpen((v) => !v);
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-zinc-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">{label}</span>
          <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">{count}</span>
        </div>
        {loading ? (
          <Loader2 className="h-4 w-4 text-zinc-400 animate-spin" />
        ) : open ? (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        )}
      </button>

      {open && loaded && (
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          {data.length === 0 ? (
            <p className="px-5 py-6 text-sm text-zinc-400 text-center">Kayıt bulunamadı</p>
          ) : section === "orders" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {data.map((o: any) => {
                    const s = orderStatusMap[o.status] ?? orderStatusMap.pending;
                    return (
                      <tr key={o.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                        <td className="px-5 py-3 font-mono text-xs">
                          <Link href={`/admin/orders/${o.id}`} className="text-brand-primary dark:text-brand-primary hover:underline">{o.orderNumber}</Link>
                        </td>
                        <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                          {Number(o.total).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-zinc-400 whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleDateString("tr-TR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : section === "reviews" ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.map((r: any) => (
                <div key={r.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Stars rating={r.rating} />
                      {r.productName && (
                        <Link href={`/products/${r.productSlug}`} target="_blank" className="text-xs text-brand-primary dark:text-brand-primary hover:underline">
                          {r.productName}
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${r.isApproved ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"}`}>
                        {r.isApproved ? "Onaylı" : "Bekliyor"}
                      </span>
                      <span className="text-xs text-zinc-400">{new Date(r.createdAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                  {r.title && <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">{r.title}</p>}
                  {r.comment && <p className="text-sm text-zinc-500 leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : section === "tickets" ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.map((t: any) => {
                const s = ticketStatusMap[t.status] ?? ticketStatusMap.open;
                return (
                  <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{t.subject}</p>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">{t.ticketNumber} · {new Date(t.createdAt).toLocaleDateString("tr-TR")}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                      <Link href={`/admin/support/${t.id}`} className="text-xs text-brand-primary dark:text-brand-primary hover:underline">Görüntüle →</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : section === "messages" ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.map((m: any) => (
                <div key={m.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-1.5 flex-wrap">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{m.subject ?? "—"}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${m.isRead ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800" : "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/10/30 dark:text-brand-primary"}`}>
                        {m.isRead ? "Okundu" : "Okunmadı"}
                      </span>
                      <span className="text-xs text-zinc-400">{new Date(m.createdAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed">{m.message}</p>
                  <a href={`mailto:${m.email}?subject=Re: ${m.subject}`} className="mt-2 inline-block text-xs text-brand-primary dark:text-brand-primary hover:underline">Yanıtla →</a>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
