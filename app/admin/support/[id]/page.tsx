import { db } from "@/lib/db";
import { supportTickets, ticketReplies, users } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import AdminTicketReply from "./AdminTicketReply";
import TicketStatusSelect from "./TicketStatusSelect";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminTicketDetailPage({ params }: Props) {
  const { id } = await params;

  const [ticket] = await db
    .select()
    .from(supportTickets)
    .leftJoin(users, eq(supportTickets.userId, users.id))
    .where(eq(supportTickets.id, Number(id)))
    .limit(1);

  if (!ticket) notFound();

  const replies = await db
    .select()
    .from(ticketReplies)
    .where(eq(ticketReplies.ticketId, Number(id)))
    .orderBy(asc(ticketReplies.createdAt));

  const t = ticket.support_tickets;
  const user = ticket.users;

  const priorityLabel: Record<string, string> = {
    low: "Düşük", medium: "Orta", high: "Yüksek", urgent: "Acil"
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t.subject}</h1>
          <p className="text-sm text-zinc-400 font-mono mt-0.5">{t.ticketNumber} · {priorityLabel[t.priority]}</p>
        </div>
        <TicketStatusSelect ticketId={t.id} currentStatus={t.status} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-sm">
        <p className="text-zinc-500 text-xs mb-2">{user?.name} ({user?.email})</p>
        <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">{t.message}</p>
        <p className="text-xs text-zinc-400 mt-2">
          {new Date(t.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {replies.map((reply) => (
        <div
          key={reply.id}
          className={`rounded-xl border p-4 text-sm ${
            reply.isAdmin
              ? "border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 ml-8"
              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          }`}
        >
          <p className="text-xs text-zinc-400 mb-2">{reply.isAdmin ? "Admin" : user?.name}</p>
          <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">{reply.message}</p>
          <p className="text-xs text-zinc-400 mt-2">
            {new Date(reply.createdAt).toLocaleDateString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      ))}

      <AdminTicketReply ticketId={t.id} />
    </div>
  );
}
