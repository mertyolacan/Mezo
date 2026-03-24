import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories, brands } from "@/lib/db/schema";
import { productSchema } from "@/lib/validations/product";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { eq, or } from "drizzle-orm";
import { invalidateProducts } from "@/lib/cache";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const isNumeric = !isNaN(Number(id));

  const [product] = await db
    .select()
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(isNumeric ? eq(products.id, Number(id)) : eq(products.slug, id))
    .limit(1);

  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);

  const seo = data.seoSettings
    ? {
        title:        data.seoSettings.title        ?? undefined,
        description:  data.seoSettings.description  ?? undefined,
        keywords:     data.seoSettings.keywords,
        ogImage:      data.seoSettings.ogImage      ?? undefined,
        noIndex:      data.seoSettings.noIndex,
        canonicalUrl: data.seoSettings.canonicalUrl ?? undefined,
      }
    : undefined;

  const [updated] = await db
    .update(products)
    .set({
      ...data,
      slug,
      price: String(data.price),
      comparePrice: data.comparePrice ? String(data.comparePrice) : null,
      seoSettings: seo,
      updatedAt: new Date(),
    })
    .where(eq(products.id, Number(id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }

  invalidateProducts();
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;

  await db.delete(products).where(eq(products.id, Number(id)));
  invalidateProducts();
  return NextResponse.json({ message: "Ürün silindi" });
}
