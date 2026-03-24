import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">İletişim Mesajları</h1>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-400 gap-3">
          <Mail className="h-10 w-10" />
          <p className="text-sm">Henüz mesaj yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{msg.name}</p>
                  <div className="flex gap-3 text-xs text-zinc-400 mt-0.5">
                    <span>{msg.email}</span>
                    {msg.phone && <span>·</span>}
                    {msg.phone && <span>{msg.phone}</span>}
                  </div>
                </div>
                <span className="text-xs text-zinc-400 shrink-0">
                  {new Date(msg.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{msg.subject}</p>
              <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Yanıtla →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
