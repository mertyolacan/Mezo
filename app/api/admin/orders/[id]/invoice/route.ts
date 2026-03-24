import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, siteSettings } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument } from "@/lib/invoice";
import React from "react";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const [[order], settings] = await Promise.all([
    db.select().from(orders).where(eq(orders.id, Number(id))).limit(1),
    db.select().from(siteSettings).limit(1),
  ]);

  if (!order) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const siteName = settings[0]?.siteName ?? "MesoPro";

  const element = React.createElement(InvoiceDocument, {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customerName: order.customerName,
    address: order.shippingAddress as Parameters<typeof InvoiceDocument>[0]["address"],
    items: order.items as Parameters<typeof InvoiceDocument>[0]["items"],
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    total: Number(order.total),
    siteName,
  });

  // renderToBuffer expects DocumentProps element — cast through unknown
  const buffer = await renderToBuffer(element as unknown as React.ReactElement<import("@react-pdf/renderer").DocumentProps>);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="fatura-${order.orderNumber}.pdf"`,
    },
  });
}
