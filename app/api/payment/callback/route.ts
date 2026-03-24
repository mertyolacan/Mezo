import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { retrieveCheckoutForm } from "@/lib/payment/iyzico";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/email";
import { reduceStock } from "@/lib/stock";
import { recordCampaignUsage } from "@/lib/campaign-usage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const token = body.get("token") as string;

    if (!token) {
      return NextResponse.redirect(new URL("/checkout?error=no_token", req.url));
    }

    // Pending order verisini cookie'den oku
    const pendingOrderCookie = req.cookies.get("mesopro_pending_order");
    if (!pendingOrderCookie?.value) {
      return NextResponse.redirect(new URL("/checkout?error=session_expired", req.url));
    }

    let orderData: {
      conversationId: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddress: { street: string; city: string; district: string; postalCode?: string; country: string };
      notes?: string;
      cartItems: { id: number; name: string; price: number; image: string; quantity: number }[];
      subtotal: number;
      discount: number;
      total: number;
      appliedCampaigns: { id: number; name: string; discount: number }[];
      userId: number | null;
    };

    try {
      orderData = JSON.parse(pendingOrderCookie.value);
    } catch {
      return NextResponse.redirect(new URL("/checkout?error=invalid_session", req.url));
    }

    // iyzico'dan ödeme sonucunu doğrula
    const result = await retrieveCheckoutForm(token, orderData.conversationId);

    if (result.status !== "success" || result.paymentStatus !== "SUCCESS") {
      return NextResponse.redirect(
        new URL(`/checkout/payment-failed?error=${encodeURIComponent(result.errorMessage ?? "Ödeme başarısız")}`, req.url)
      );
    }

    // Siparişi DB'ye yaz
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId: orderData.userId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: {
          street: orderData.shippingAddress.street,
          city: orderData.shippingAddress.city,
          district: orderData.shippingAddress.district,
          postalCode: orderData.shippingAddress.postalCode ?? "",
          country: orderData.shippingAddress.country,
        },
        notes: orderData.notes,
        items: orderData.cartItems.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        subtotal: String(orderData.subtotal),
        discount: String(orderData.discount),
        total: String(orderData.total),
        appliedCampaigns: orderData.appliedCampaigns,
        status: "confirmed" as const,
        paymentMethod: "iyzico",
        paymentStatus: "paid",
        paymentId: result.paymentId ?? token,
        iyzicoToken: token,
      })
      .returning();

    // Stok düş (batch) + düşük stok uyarısı
    await reduceStock(orderData.cartItems);

    // Kampanya kullanım kaydı (batch)
    await recordCampaignUsage(orderData.appliedCampaigns, orderData.userId, order.id);

    // Onay maili
    sendOrderConfirmation(orderData.customerEmail, order.orderNumber, orderData.total).catch(() => {});

    // Cookie'yi temizle ve başarı sayfasına yönlendir
    const response = NextResponse.redirect(
      new URL(`/checkout/success?order=${order.orderNumber}`, req.url)
    );
    response.cookies.set("mesopro_pending_order", "", { maxAge: 0, path: "/" });
    return response;

  } catch (e) {
    console.error("[payment/callback]", e);
    return NextResponse.redirect(new URL("/checkout?error=server_error", req.url));
  }
}

// iyzico bazen GET ile de callback yapabilir
export async function GET(req: NextRequest) {
  return POST(req);
}
