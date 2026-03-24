import { db } from "@/lib/db";
import { products, categories, brands, campaigns } from "@/lib/db/schema";
import { eq, and, or, isNull, lte, gte, inArray, ne } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ClientCampaign } from "@/lib/campaign-engine-client";
import ProductDetailClient from "./ProductDetailClient";
import ProductImageGallery from "./ProductImageGallery";
import ReviewSection from "./ReviewSection";
import { getAuthUser } from "@/lib/auth";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [row] = await db
    .select({ name: products.name, seoTitle: products.seoTitle, seoDescription: products.seoDescription, ogImage: products.ogImage, images: products.images })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!row) return { title: "Ürün Bulunamadı" };

  return {
    title: row.seoTitle || row.name,
    description: row.seoDescription || undefined,
    openGraph: {
      title: row.seoTitle || row.name,
      description: row.seoDescription || undefined,
      images: row.ogImage ? [row.ogImage] : row.images[0] ? [row.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const [row] = await db
    .select()
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(eq(products.slug, slug))
    .limit(1);

  if (!row || !row.products.isActive) notFound();

  const p = row.products;
  const category = row.categories;
  const brand = row.brands;
  const outOfStock = p.stock === 0;
  const discount = p.comparePrice
    ? Math.round((1 - Number(p.price) / Number(p.comparePrice)) * 100)
    : null;

  const badgeMap: Record<string, string> = {
    coupon: "🏷️ ",
    cart_total: "🛒 ",
    product: "📦 ",
    category: "🗂️ ",
    bogo: "🎁 ",
    volume: "📊 ",
  };

  // Kampanyalar, auth ve ilgili ürünleri paralel çek
  const now = new Date();
  const [rawCampaigns, authUser, relatedProducts] = await Promise.all([
    db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.isActive, true),
          or(isNull(campaigns.startDate), lte(campaigns.startDate, now)),
          or(isNull(campaigns.endDate), gte(campaigns.endDate, now)),
          or(
            inArray(campaigns.type, ["cart_total", "bogo", "volume", "coupon"]),
            and(eq(campaigns.type, "product"), eq(campaigns.productId, p.id)),
            and(eq(campaigns.type, "category"), eq(campaigns.categoryId, p.categoryId!))
          )
        )
      ),
    getAuthUser(),
    p.categoryId
      ? db
          .select({ id: products.id, name: products.name, slug: products.slug, price: products.price, comparePrice: products.comparePrice, images: products.images })
          .from(products)
          .where(and(eq(products.isActive, true), eq(products.categoryId, p.categoryId), ne(products.id, p.id)))
          .limit(4)
      : Promise.resolve([]),
  ]);

  const clientCampaigns: ClientCampaign[] = rawCampaigns.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    discountType: c.discountType,
    discountValue: Number(c.discountValue),
    hasCoupon: c.type === "coupon",
    validatedCoupon: false,
    minAmount: c.minAmount ? Number(c.minAmount) : null,
    minQuantity: c.minQuantity,
    buyQuantity: c.buyQuantity,
    getQuantity: c.getQuantity,
    productId: c.productId,
    categoryId: c.categoryId,
    isStackable: c.isStackable,
    badge: (badgeMap[c.type] ?? "") + c.name,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.shortDescription ?? p.description ?? undefined,
    image: p.images,
    offers: {
      "@type": "Offer",
      price: Number(p.price).toFixed(2),
      priceCurrency: "TRY",
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/products/${p.slug}`,
    },
    ...(brand ? { brand: { "@type": "Brand", name: brand.name } } : {}),
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Görseller */}
        <ProductImageGallery images={p.images} name={p.name} discount={discount} />

        {/* Bilgiler */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {brand && <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{brand.name}</span>}
              {category && <span className="text-xs text-zinc-400">· {category.name}</span>}
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">{p.name}</h1>
          </div>

          <ProductDetailClient
            product={{
              id: p.id,
              name: p.name,
              price: Number(p.price),
              comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
              image: p.images[0] ?? "",
              slug: p.slug,
              stock: p.stock,
              lowStockThreshold: p.lowStockThreshold,
              categoryId: p.categoryId,
              shortDescription: p.shortDescription,
              tags: p.tags,
            }}
            campaigns={clientCampaigns}
          />
        </div>
      </div>

      {/* Açıklama */}
      {p.description && (
        <div className="mt-16 border-t border-zinc-100 dark:border-zinc-800 pt-10">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Ürün Açıklaması</h2>
          <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {p.description}
          </div>
        </div>
      )}

      <ReviewSection productId={p.id} isLoggedIn={!!authUser} />

      {/* İlgili Ürünler */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-zinc-100 dark:border-zinc-800 pt-10">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6">İlgili Ürünler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => {
              const rpDiscount = rp.comparePrice
                ? Math.round((1 - Number(rp.price) / Number(rp.comparePrice)) * 100)
                : null;
              return (
                <Link key={rp.id} href={`/products/${rp.slug}`} className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm transition-all">
                  <div className="relative aspect-square bg-zinc-50 dark:bg-zinc-800">
                    {rp.images[0] ? (
                      <Image src={rp.images[0]} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 25vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-xs">Görsel yok</div>
                    )}
                    {rpDiscount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">-{rpDiscount}%</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug">{rp.name}</p>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(rp.price)}</span>
                      {rp.comparePrice && <span className="text-xs text-zinc-400 line-through">{formatPrice(rp.comparePrice)}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
