import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { evaluateCampaigns } from "@/lib/campaign-engine";
import { getUserFromRequest } from "@/lib/auth";
import { initializeCheckoutForm } from "@/lib/payment/iyzico";
import { z } from "zod";

const schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  shippingAddress: z.object({
    street: z.string().min(5),
    district: z.string().min(2),
    city: z.string().min(2),
    postalCode: z.string().optional(),
    country: z.string().default("Türkiye"),
  }),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  items: z.array(z.object({
    id: z.number(),
    quantity: z.number().min(1),
  })).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { customerName, customerEmail, customerPhone, shippingAddress, notes, couponCode, items: clientItems } = parsed.data;
    const user = getUserFromRequest(req);

    // Fiyat + stok doğrulaması — tüm ürünleri tek sorguda çek
    const cartItems: { id: number; name: string; price: number; image: string; quantity: number; categoryId: number | null }[] = [];

    const productIds = clientItems.map((i) => i.id);
    const productRows = await db
      .select({ id: products.id, name: products.name, price: products.price, stock: products.stock, categoryId: products.categoryId, images: products.images })
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(productRows.map((p) => [p.id, p]));

    for (const item of clientItems) {
      const product = productMap.get(item.id);
      if (!product) return NextResponse.json({ error: `Ürün bulunamadı: #${item.id}` }, { status: 400 });
      if (product.stock < item.quantity) return NextResponse.json({ error: `"${product.name}" için yeterli stok yok` }, { status: 400 });

      cartItems.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: (product.images as string[])?.[0] ?? "",
        quantity: item.quantity,
        categoryId: product.categoryId,
      });
    }

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const campaignResult = await evaluateCampaigns(cartItems, subtotal, couponCode || undefined, user?.id);
    const total = Math.max(0, subtotal - campaignResult.totalDiscount);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const callbackUrl = `${baseUrl}/api/payment/callback`;
    const conversationId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Buyer identity number zorunlu — TC no olmadığı için placeholder kullanıyoruz
    // Production'da gerçek TC kimlik numarası alınmalıdır
    const [firstName, ...lastParts] = customerName.split(" ");
    const lastName = lastParts.join(" ") || firstName;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "85.34.78.112";

    const iyzicoResult = await initializeCheckoutForm({
      conversationId,
      price: total.toFixed(2),
      paidPrice: total.toFixed(2),
      currency: "TRY",
      basketId: conversationId,
      callbackUrl,
      buyer: {
        id: user?.id ? String(user.id) : `guest-${conversationId}`,
        name: firstName,
        surname: lastName,
        email: customerEmail,
        identityNumber: process.env.IYZICO_TEST_TC ?? "74300864791", // Sandbox: iyzico test TC. Production'da env'e gerçek TC girilmeli
        registrationAddress: shippingAddress.street,
        city: shippingAddress.city,
        country: shippingAddress.country,
        ip,
      },
      shippingAddress: {
        contactName: customerName,
        city: shippingAddress.city,
        country: shippingAddress.country,
        address: `${shippingAddress.street}, ${shippingAddress.district}`,
      },
      billingAddress: {
        contactName: customerName,
        city: shippingAddress.city,
        country: shippingAddress.country,
        address: `${shippingAddress.street}, ${shippingAddress.district}`,
      },
      basketItems: cartItems.map((item) => ({
        id: String(item.id),
        name: item.name.substring(0, 100),
        category1: "Mezoterapi",
        itemType: "PHYSICAL" as const,
        price: (item.price * item.quantity).toFixed(2),
      })),
    });

    if (iyzicoResult.status !== "success") {
      return NextResponse.json({ error: iyzicoResult.errorMessage ?? "Ödeme başlatılamadı" }, { status: 400 });
    }

    // Checkout bilgilerini session'a saklayalım (iyzico token → sipariş verisi)
    // Server-side olduğu için encrypted cookie kullanıyoruz
    const orderData = JSON.stringify({
      conversationId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      notes,
      couponCode,
      cartItems: cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, image: i.image, quantity: i.quantity })),
      subtotal,
      discount: campaignResult.totalDiscount,
      total,
      appliedCampaigns: campaignResult.applied.map((a) => ({ id: a.id, name: a.name, discount: a.discount })),
      userId: user?.id ?? null,
    });

    const response = NextResponse.json({
      data: {
        token: iyzicoResult.token,
        checkoutFormContent: iyzicoResult.checkoutFormContent,
      },
    });

    // Sipariş verisini cookie'de tut (max 4KB, şifreli değil — hassas veri içermemeli)
    response.cookies.set("mesopro_pending_order", orderData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 30, // 30 dakika
      path: "/",
    });

    return response;
  } catch (e) {
    console.error("[payment/initialize]", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
