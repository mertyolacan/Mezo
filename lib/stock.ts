import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { sendLowStockAlert } from "@/lib/email";

/**
 * Batch reduce stock for all cart items in a single DB round-trip.
 * Sends low-stock alerts asynchronously after each update.
 */
export async function reduceStock(
  cartItems: { id: number; quantity: number }[]
): Promise<void> {
  if (cartItems.length === 0) return;

  const ids = cartItems.map((i) => i.id);
  const rows = await db
    .select({ id: products.id, stock: products.stock, lowStockThreshold: products.lowStockThreshold, name: products.name })
    .from(products)
    .where(inArray(products.id, ids));

  const stockMap = new Map(rows.map((r) => [r.id, r]));
  const adminEmail = process.env.SMTP_USER ?? "";

  for (const item of cartItems) {
    const cur = stockMap.get(item.id);
    if (!cur) continue;
    const newStock = Math.max(0, cur.stock - item.quantity);
    await db.update(products).set({ stock: newStock }).where(eq(products.id, item.id));
    const threshold = cur.lowStockThreshold ?? 5;
    if (newStock <= threshold && adminEmail) {
      sendLowStockAlert(adminEmail, cur.name, newStock).catch(() => {});
    }
  }
}
