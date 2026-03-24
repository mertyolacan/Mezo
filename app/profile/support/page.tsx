import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { supportTickets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { HeadphonesIcon, ChevronRight, Plus } from "lucide-react";
import NewTicketModal from "./NewTicketModal";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; class: string }> = {
  open:        { label: "Açık",          class: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  in_progress: { label: "İşlemde",       class: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  resolved:    { label: "Çözüldü",       class: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" },
  closed:      { label: "Kapatıldı",     class: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
};

const priorityConfig: Record<string, string> = {
  low:    "text-zinc-400",
  medium: "text-amber-500",
  high:   "text-red-500",
};

export default async function SupportPage() {
  const auth = await getAuthUser();
  if (!auth) return null;

  const rows = await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, auth.id))
    .orderBy(desc(supportTickets.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Destek Taleplerim</h1>
        <NewTicketModal />
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-400 gap-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <HeadphonesIcon className="h-10 w-10" />
          <p className="text-sm">Henüz destek talebiniz yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((t) => {
            const status = statusConfig[t.status] ?? { label: t.status, class: "" };
            return (
              <Link
                key={t.id}
                href={`/profile/support/${t.id}`}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-400">{t.ticketNumber}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.class}`}>{status.label}</span>
                    <span className={`text-xs font-medium ${priorityConfig[t.priority]}`}>
                      {t.priority === "high" ? "Yüksek" : t.priority === "medium" ? "Orta" : "Düşük"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t.subject}</p>
                  <p className="text-xs text-zinc-400">{new Date(t.createdAt).toLocaleDateString("tr-TR")}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 shrink-0 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
