"use server";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";

const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export async function updateOrderStatus(orderId: number, status: string) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") throw new Error("Yetkisiz");
  if (!validStatuses.includes(status)) throw new Error("Geçersiz durum");
  await db.update(orders).set({ status: status as any, updatedAt: new Date() }).where(eq(orders.id, orderId));
  revalidatePath("/admin/orders");
}
