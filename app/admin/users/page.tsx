import { db } from "@/lib/db";
import { users, orders, productReviews, supportTickets, contactMessages } from "@/lib/db/schema";
import { count, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import { Users, Search, Star, HeadphonesIcon, Mail, ShoppingCart } from "lucide-react";
import ToggleUserRoleButton from "./ToggleUserRoleButton";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, Number(pageParam));
  const limit = 20;
  const offset = (page - 1) * limit;

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() }).from(users);
  const totalPages = Math.ceil(total / limit);

  // Sayım verileri
  const userIds = allUsers.map((u) => u.id);
  const userEmails = allUsers.map((u) => u.email);

  const [reviewCounts, ticketCounts, orderCounts, messageCounts] = userIds.length
    ? await Promise.all([
        db.select({ userId: productReviews.userId, c: count() })
          .from(productReviews).where(inArray(productReviews.userId, userIds)).groupBy(productReviews.userId),
        db.select({ userId: supportTickets.userId, c: count() })
          .from(supportTickets).where(inArray(supportTickets.userId as any, userIds)).groupBy(supportTickets.userId),
        db.select({ userId: orders.userId, c: count() })
          .from(orders).where(inArray(orders.userId as any, userIds)).groupBy(orders.userId),
        db.select({ email: contactMessages.email, c: count() })
          .from(contactMessages).where(inArray(contactMessages.email, userEmails)).groupBy(contactMessages.email),
      ])
    : [[], [], [], []];

  const reviewMap = Object.fromEntries(reviewCounts.map((r) => [r.userId, Number(r.c)]));
  const ticketMap = Object.fromEntries(ticketCounts.map((t) => [t.userId, Number(t.c)]));
  const orderMap = Object.fromEntries(orderCounts.map((o) => [o.userId, Number(o.c)]));
  const messageMap = Object.fromEntries(messageCounts.map((m) => [m.email, Number(m.c)]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Kullanıcılar</h1>
            <p className="text-xs text-zinc-500">{total} kayıtlı kullanıcı</p>
          </div>
        </div>
      </div>

      <form method="GET" className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Ad veya e-posta ile ara..."
          className="w-full max-w-sm pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </form>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-3 py-2.5 sm:px-5 sm:py-3 font-medium text-zinc-500">Ad / E-posta</th>
              <th className="text-left px-3 py-2.5 sm:px-5 sm:py-3 font-medium text-zinc-500 hidden sm:table-cell">Telefon</th>
              <th className="text-left px-3 py-2.5 sm:px-5 sm:py-3 font-medium text-zinc-500">Rol</th>
              <th className="text-left px-3 py-2.5 sm:px-5 sm:py-3 font-medium text-zinc-500 hidden md:table-cell">Aktivite</th>
              <th className="text-left px-3 py-2.5 sm:px-5 sm:py-3 font-medium text-zinc-500 hidden lg:table-cell">Kayıt Tarihi</th>
              <th className="px-3 py-2.5 sm:px-5 sm:py-3" />
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => {
              const reviews = reviewMap[user.id] ?? 0;
              const tickets = ticketMap[user.id] ?? 0;
              const msgs = messageMap[user.email] ?? 0;
              const orderCount = orderMap[user.id] ?? 0;
              return (
                <tr key={user.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-3 py-2.5 sm:px-5 sm:py-3">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm">{user.name ?? "—"}</p>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </td>
                  <td className="px-3 py-2.5 sm:px-5 sm:py-3 hidden sm:table-cell text-xs text-zinc-500">
                    {user.phone ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 sm:px-5 sm:py-3">
                    <ToggleUserRoleButton userId={user.id} role={user.role} />
                  </td>
                  <td className="px-3 py-2.5 sm:px-5 sm:py-3 hidden md:table-cell">
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1" title="Sipariş">
                        <ShoppingCart className="h-3.5 w-3.5" /> {orderCount}
                      </span>
                      <span className="flex items-center gap-1" title="Yorum">
                        <Star className="h-3.5 w-3.5" /> {reviews}
                      </span>
                      <span className="flex items-center gap-1" title="Destek">
                        <HeadphonesIcon className="h-3.5 w-3.5" /> {tickets}
                      </span>
                      <span className="flex items-center gap-1" title="Mesaj">
                        <Mail className="h-3.5 w-3.5" /> {msgs}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 sm:px-5 sm:py-3 text-xs text-zinc-400 hidden lg:table-cell whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-3 py-2.5 sm:px-5 sm:py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Detay →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {allUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400 text-sm">Kullanıcı bulunamadı</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/users?page=${p}${q ? `&q=${q}` : ""}`}
              className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
