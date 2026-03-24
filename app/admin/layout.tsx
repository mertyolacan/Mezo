import { db } from "@/lib/db";
import { orders, contactMessages, supportTickets } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [[{ val: pendingOrders }], [{ val: unreadMessages }], [{ val: openSupport }]] = await Promise.all([
    db.select({ val: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ val: count() }).from(contactMessages).where(eq(contactMessages.isRead, false)),
    db.select({ val: count() }).from(supportTickets).where(eq(supportTickets.status, "open")),
  ]);

  return (
    <AdminShell
      notifCounts={{
        orders: Number(pendingOrders),
        messages: Number(unreadMessages),
        support: Number(openSupport),
      }}
    >
      {children}
    </AdminShell>
  );
}
