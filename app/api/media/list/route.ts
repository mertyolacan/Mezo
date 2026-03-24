import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const folder = searchParams.get("folder") ?? "mesopro";
  const nextCursor = searchParams.get("next_cursor") ?? undefined;

  const result = await cloudinary.search
    .expression(`folder:${folder}`)
    .sort_by("created_at", "desc")
    .max_results(30)
    .next_cursor(nextCursor as string)
    .execute();

  const resources = (result.resources ?? []).map((r: { secure_url: string; public_id: string; bytes: number; created_at: string }) => ({
    url: r.secure_url,
    publicId: r.public_id,
    bytes: r.bytes,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ data: { resources, nextCursor: result.next_cursor ?? null } });
}
