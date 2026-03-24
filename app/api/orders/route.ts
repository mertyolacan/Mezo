import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, products } from "@/lib/db/schema";
import { orderSchema } from "@/lib/validations/order";
import { getUserFromRequest } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { eq, inArray } from "drizzle-orm";
import { evaluateCampaigns } from "@/lib/campaign-engine";
import { reduceStock } from "@/lib/stock";
import { recordCampaignUsage } from "@/lib/campaign-usage";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await rateLimit(`order:${ip}`, { limit: 5, window: 60_000 });
    if (!rl.ok) return NextResponse.json({ error: "Çok fazla istek. Lütfen bekleyin." }, { status: 429 });

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const clientItems: { id: number; name: string; image: string; quantity: number }[] = body.items;
    if (!clientItems || clientItems.length === 0) {
      return NextResponse.json({ error: "Sepet boş" }, { status: 400 });
    }

    const user = getUserFromRequest(req);

    // ── Fiyat ve stok doğrulaması — tüm ürünleri tek sorguda çek ──
    const productIds = clientItems.map((i) => i.id);
    const productRows = await db
      .select({ id: products.id, name: products.name, price: products.price, stock: products.stock, categoryId: products.categoryId, images: products.images })
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(productRows.map((p) => [p.id, p]));

    const cartItems: {
      id: number; name: string; price: number; image: string;
      quantity: number; categoryId: number | null;
    }[] = [];

    for (const item of clientItems) {
      const product = productMap.get(item.id);
      if (!product) {
        return NextResponse.json({ error: `Ürün bulunamadı: #${item.id}` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `"${product.name}" için yeterli stok yok` }, { status: 400 });
      }
      cartItems.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: (product.images as string[])?.[0] ?? "",
        quantity: item.quantity,
        categoryId: product.categoryId,
      });
    }

    // ── Kampanya hesabı sunucuda yapılır ──
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const campaignResult = await evaluateCampaigns(
      cartItems,
      subtotal,
      body.couponCode || undefined,
      user?.id
    );

    const discount = campaignResult.totalDiscount;
    const total = Math.max(0, subtotal - discount);
    const appliedCampaigns = campaignResult.applied.map((a) => ({
      id: a.id,
      name: a.name,
      discount: a.discount,
    }));

    // ── Siparişi oluştur ──
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId: user?.id ?? null,
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        customerPhone: parsed.data.customerPhone,
        shippingAddress: {
          street: parsed.data.shippingAddress.street,
          city: parsed.data.shippingAddress.city,
          district: parsed.data.shippingAddress.district,
          postalCode: parsed.data.shippingAddress.postalCode ?? "",
          country: parsed.data.shippingAddress.country,
        },
        notes: parsed.data.notes,
        items: cartItems.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        subtotal: String(subtotal),
        discount: String(discount),
        total: String(total),
        appliedCampaigns,
        paymentMethod: parsed.data.paymentMethod,
        status: "pending" as const,
      })
      .returning();

    // ── Stok düş (batch) + düşük stok uyarısı ──
    await reduceStock(cartItems);

    // ── Kampanya kullanım kaydı (batch) ──
    await recordCampaignUsage(appliedCampaigns, user?.id ?? null, order.id);

    // Fire-and-forget onay maili
    sendOrderConfirmation(parsed.data.customerEmail, order.orderNumber, total).catch(() => {});

    return NextResponse.json({
      data: { orderNumber: order.orderNumber, total, appliedCampaigns },
    }, { status: 201 });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(orders.createdAt);

  return NextResponse.json({ data: rows });
}
