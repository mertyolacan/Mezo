import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromRequestEdge, verifyTokenEdge } from "@/lib/auth-edge";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequestEdge(req);
  if (!token) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const payload = await verifyTokenEdge(token);
  if (!payload) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, payload.id))
    .limit(1);

  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  return NextResponse.json({ data: user });
}
