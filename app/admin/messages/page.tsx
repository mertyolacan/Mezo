import { db } from "@/lib/db";
import { contactMessages, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await db
    .select({
      id: contactMessages.id,
      name: contactMessages.name,
      email: contactMessages.email,
      phone: contactMessages.phone,
      subject: contactMessages.subject,
      message: contactMessages.message,
      isRead: contactMessages.isRead,
      createdAt: contactMessages.createdAt,
      userId: users.id,
    })
    .from(contactMessages)
    .leftJoin(users, eq(contactMessages.email, users.email))
    .orderBy(desc(contactMessages.createdAt));

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
              <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">{msg.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      msg.userId
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}>
                      {msg.userId ? "Kayıtlı" : "Kayıtlı değil"}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-zinc-400 mt-0.5 flex-wrap">
                    <span>{msg.email}</span>
                    {msg.phone && <span>· {msg.phone}</span>}
                  </div>
                </div>
                <span className="text-xs text-zinc-400 shrink-0">
                  {new Date(msg.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{msg.subject}</p>
              <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Yanıtla →
                </a>
                {msg.userId && (
                  <a href={`/admin/users/${msg.userId}`} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:underline">
                    Kullanıcıya git →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
