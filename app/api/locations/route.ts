import { NextRequest, NextResponse } from "next/server";

const BASE = "https://turkiyeapi.dev/api/v1";

export const revalidate = 86400; // 24 saat cache

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  try {
    if (type === "iller") {
      const res = await fetch(`${BASE}/provinces?fields=id,name`, {
        next: { revalidate: 86400 },
      });
      if (!res.ok) throw new Error("Province fetch failed");
      const json = await res.json();
      const sorted = ((json.data as { id: number; name: string }[]) || [])
        .map((p) => ({ id: p.id, name: p.name }))
        .sort((a, b) => a.name.localeCompare(b.name, "tr"));
      return NextResponse.json(sorted, {
        headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" },
      });
    }

    if (type === "ilceler" && id) {
      const res = await fetch(`${BASE}/provinces/${id}?fields=id,name,districts`, {
        next: { revalidate: 86400 },
      });
      if (!res.ok) throw new Error("District fetch failed");
      const json = await res.json();
      const districts = ((json.data?.districts as { id: number; name: string }[]) || [])
        .map((d) => ({ id: d.id, name: d.name }))
        .sort((a, b) => a.name.localeCompare(b.name, "tr"));
      return NextResponse.json(districts, {
        headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" },
      });
    }

    if (type === "mahalleler" && id) {
      const res = await fetch(`${BASE}/districts/${id}?fields=id,name,neighborhoods`, {
        next: { revalidate: 86400 },
      });
      if (!res.ok) throw new Error("Neighborhood fetch failed");
      const json = await res.json();
      const neighborhoods = ((json.data?.neighborhoods as { id: number; name: string }[]) || [])
        .map((n) => ({ id: n.id, name: n.name }))
        .sort((a, b) => a.name.localeCompare(b.name, "tr"));
      return NextResponse.json(neighborhoods, {
        headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" },
      });
    }

    return NextResponse.json([]);
  } catch {
    return NextResponse.json({ error: "Konum verisi alınamadı" }, { status: 500 });
  }
}
