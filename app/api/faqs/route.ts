import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { faqs } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const rows = await db
    .select()
    .from(faqs)
    .where(eq(faqs.isActive, true))
    .orderBy(asc(faqs.sortOrder), asc(faqs.createdAt));

  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const [faq] = await db.insert(faqs).values(parsed.data).returning();
  return NextResponse.json({ data: faq }, { status: 201 });
}
