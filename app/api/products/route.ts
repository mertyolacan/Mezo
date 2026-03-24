import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories, brands } from "@/lib/db/schema";
import { productSchema } from "@/lib/validations/product";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { eq, like, and, desc, sql, or, gte, lte } from "drizzle-orm";
import { invalidateProducts } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 12);
  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const featured = searchParams.get("featured");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const offset = (page - 1) * limit;

  const conditions = [eq(products.isActive, true)];
  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(
        like(products.name, term),
        like(products.shortDescription, term),
        like(products.description, term),
      )!
    );
  }
  if (minPrice) conditions.push(gte(products.price, minPrice));
  if (maxPrice) conditions.push(lte(products.price, maxPrice));
  if (categoryId) conditions.push(eq(products.categoryId, Number(categoryId)));
  if (brandId) conditions.push(eq(products.brandId, Number(brandId)));
  if (featured === "true") conditions.push(eq(products.isFeatured, true));

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        comparePrice: products.comparePrice,
        stock: products.stock,
        images: products.images,
        isFeatured: products.isFeatured,
        category: { id: categories.id, name: categories.name },
        brand: { id: brands.id, name: brands.name },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions)),
  ]);

  return NextResponse.json({
    data: rows,
    meta: { total: Number(count), page, limit },
  });
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);

  const [product] = await db
    .insert(products)
    .values({
      ...data,
      slug,
      price: String(data.price),
      comparePrice: data.comparePrice ? String(data.comparePrice) : null,
    })
    .returning();

  invalidateProducts();
  return NextResponse.json({ data: product }, { status: 201 });
}
