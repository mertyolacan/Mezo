import { db } from "@/lib/db";
import { users, orders, supportTickets, productReviews, contactMessages } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import UserStatusToggle from "./UserStatusToggle";
import ToggleUserRoleButton from "../ToggleUserRoleButton";
import UserActivitySection from "./UserActivitySection";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) notFound();

  const [[orderCount], [reviewCount], [ticketCount], [messageCount]] = await Promise.all([
    db.select({ c: count() }).from(orders).where(eq(orders.userId, userId)),
    db.select({ c: count() }).from(productReviews).where(eq(productReviews.userId, userId)),
    db.select({ c: count() }).from(supportTickets).where(eq(supportTickets.userId, userId)),
    db.select({ c: count() }).from(contactMessages).where(eq(contactMessages.email, user.email)),
  ]);

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-4 w-4 text-zinc-500" />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Kullanıcı Detayı</h1>
      </div>

      {/* Profil Kartı */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{user.name ?? "İsim yok"}</p>
              <p className="text-sm text-zinc-500">{user.email}</p>
              {user.phone && <p className="text-xs text-zinc-400 mt-0.5">{user.phone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <ToggleUserRoleButton userId={user.id} role={user.role} />
            <UserStatusToggle userId={user.id} isActive={user.isActive} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Sipariş", value: Number(orderCount.c) },
            { label: "Yorum", value: Number(reviewCount.c) },
            { label: "Destek", value: Number(ticketCount.c) },
            { label: "Mesaj", value: Number(messageCount.c) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
          <span>Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR")}</span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${
            user.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          }`}>{user.isActive ? "Aktif" : "Pasif"}</span>
        </div>
      </div>

      {/* Accordion bölümleri — lazy fetch */}
      <UserActivitySection userId={userId} section="orders"   count={Number(orderCount.c)}   label="Siparişler"         />
      <UserActivitySection userId={userId} section="reviews"  count={Number(reviewCount.c)}  label="Yorumlar"           />
      <UserActivitySection userId={userId} section="tickets"  count={Number(ticketCount.c)}  label="Destek Talepleri"   />
      <UserActivitySection userId={userId} section="messages" count={Number(messageCount.c)} label="İletişim Mesajları" />
    </div>
  );
}
