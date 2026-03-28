import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { inArray, eq, and } from "drizzle-orm";

// GET /api/products/cross-sell?ids=1,2,3
// Returns cross-sell product suggestions for the given cart product IDs
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("ids") ?? "";
  const cartIds = raw
    .split(",")
    .map(Number)
    .filter((n) => n > 0);

  if (cartIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  // Fetch the cart products to get their crossSellIds
  const cartProducts = await db
    .select({ id: products.id, crossSellIds: products.crossSellIds })
    .from(products)
    .where(inArray(products.id, cartIds));

  // Collect all unique cross-sell IDs
  const crossSellSet = new Set<number>();
  for (const p of cartProducts) {
    for (const id of (p.crossSellIds as number[]) ?? []) {
      if (!cartIds.includes(id)) crossSellSet.add(id);
    }
  }

  if (crossSellSet.size === 0) {
    return NextResponse.json({ data: [] });
  }

  const crossSellProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      comparePrice: products.comparePrice,
      images: products.images,
    })
    .from(products)
    .where(and(inArray(products.id, [...crossSellSet]), eq(products.isActive, true)));

  // Map them back to the source cart item
  const mappedData = cartProducts.map(cp => {
    const ids = (cp.crossSellIds as number[]) ?? [];
    const suggestions = crossSellProducts.filter(csp => ids.includes(csp.id) && !cartIds.includes(csp.id));
    return {
      sourceId: cp.id,
      products: suggestions
    };
  }).filter(item => item.products.length > 0);

  return NextResponse.json({ data: mappedData });
}
