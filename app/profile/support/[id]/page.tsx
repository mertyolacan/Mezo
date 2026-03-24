import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { supportTickets, ticketReplies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import TicketReplyForm from "./TicketReplyForm";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (!auth) return null;

  const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, Number(id))).limit(1);
  if (!ticket || ticket.userId !== auth.id) notFound();

  const replies = await db
    .select()
    .from(ticketReplies)
    .where(eq(ticketReplies.ticketId, Number(id)))
    .orderBy(ticketReplies.createdAt);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-zinc-400">{ticket.ticketNumber}</span>
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{ticket.subject}</h1>
      </div>

      {/* İlk mesaj */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-500">{ticket.name}</span>
          <span className="text-xs text-zinc-400">{new Date(ticket.createdAt).toLocaleString("tr-TR")}</span>
        </div>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{ticket.message}</p>
      </div>

      {/* Yanıtlar */}
      {replies.map((r) => (
        <div
          key={r.id}
          className={`rounded-xl border p-5 ${
            r.isAdmin
              ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-100 dark:border-indigo-900"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${r.isAdmin ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500"}`}>
              {r.authorName}
            </span>
            <span className="text-xs text-zinc-400">{new Date(r.createdAt).toLocaleString("tr-TR")}</span>
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{r.message}</p>
        </div>
      ))}

      {/* Yanıt formu — sadece açık/işlemdeyse */}
      {(ticket.status === "open" || ticket.status === "in_progress") && (
        <TicketReplyForm ticketId={ticket.id} />
      )}

      {(ticket.status === "resolved" || ticket.status === "closed") && (
        <p className="text-sm text-zinc-400 text-center py-4">Bu talep kapatılmıştır.</p>
      )}
    </div>
  );
}
