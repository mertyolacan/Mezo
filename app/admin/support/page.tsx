import { db } from "@/lib/db";
import { supportTickets, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Eye } from "lucide-react";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; cls: string }> = {
  open: { label: "Açık", cls: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" },
  in_progress: { label: "İşlemde", cls: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" },
  resolved: { label: "Çözüldü", cls: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" },
  closed: { label: "Kapalı", cls: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" },
};

const priorityMap: Record<string, { label: string; cls: string }> = {
  low: { label: "Düşük", cls: "text-zinc-500" },
  medium: { label: "Orta", cls: "text-amber-600 dark:text-amber-400" },
  high: { label: "Yüksek", cls: "text-red-600 dark:text-red-400" },
  urgent: { label: "Acil", cls: "text-red-700 dark:text-red-300 font-bold" },
};

export default async function AdminSupportPage() {
  const rows = await db
    .select({
      id: supportTickets.id,
      ticketNumber: supportTickets.ticketNumber,
      subject: supportTickets.subject,
      status: supportTickets.status,
      priority: supportTickets.priority,
      createdAt: supportTickets.createdAt,
      user: { name: users.name, email: users.email },
    })
    .from(supportTickets)
    .leftJoin(users, eq(supportTickets.userId, users.id))
    .orderBy(desc(supportTickets.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Destek Talepleri</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500">Ticket</th>
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500 hidden md:table-cell">Kullanıcı</th>
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500 hidden lg:table-cell">Öncelik</th>
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500 hidden lg:table-cell">Tarih</th>
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500">Durum</th>
              <th className="px-3 py-2.5 sm:px-4 sm:py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((ticket) => {
              const s = statusMap[ticket.status] ?? statusMap.open;
              const p = priorityMap[ticket.priority] ?? priorityMap.medium;
              return (
                <tr key={ticket.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50 line-clamp-1">{ticket.subject}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                        ticket.user?.name
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      }`}>
                        {ticket.user?.name ? "Kayıtlı" : "Kayıtlı değil"}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">{ticket.ticketNumber}</div>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 hidden md:table-cell">
                    <div className="text-zinc-800 dark:text-zinc-200">{ticket.user?.name ?? "—"}</div>
                    <div className="text-xs text-zinc-400">{ticket.user?.email}</div>
                  </td>
                  <td className={`px-4 py-3 text-xs hidden lg:table-cell ${p.cls}`}>{p.label}</td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-500 hidden lg:table-cell">
                    {new Date(ticket.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/support/${ticket.id}`}
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
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400 text-sm">Henüz destek talebi yok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
