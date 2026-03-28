import { db } from "@/lib/db";
import { products, categories, brands, favorites, campaigns } from "@/lib/db/schema";
import { eq, and, like, or, desc, asc, sql, gte, lte, isNull } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";
import type { Metadata } from "next";
import SortSelect from "./SortSelect";
import ProductSearch from "./ProductSearch";
import FavoriteButton from "./FavoriteButton";
import PriceFilter from "./PriceFilter";
import { getAuthUser } from "@/lib/auth";
import { getSeoMetadata } from "@/lib/seo";
import MobileFilterBar from "./MobileFilterBar";
import { evaluateCampaignsClient, ClientCampaign } from "@/lib/campaign-engine-client";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("products", {
    title: "Ürünler",
    description: "Profesyonel mezoterapi ürünleri kataloğu.",
  });
}

const PAGE_SIZE = 24;

type Props = {
  searchParams: Promise<{ category?: string; brand?: string; search?: string; sort?: string; minPrice?: string; maxPrice?: string; page?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const { category, brand, search, sort, minPrice, maxPrice, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

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
  if (category) conditions.push(eq(categories.slug, category));
  if (brand) conditions.push(eq(brands.slug, brand));
  if (minPrice) conditions.push(gte(products.price, minPrice));
  if (maxPrice) conditions.push(lte(products.price, maxPrice));

  const orderBy = sort === "price-asc"
    ? asc(products.price)
    : sort === "price-desc"
    ? desc(products.price)
    : desc(products.createdAt);

  const authUser = await getAuthUser();

  const [rows, [{ total }], cats, brnds] = await Promise.all([
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
        categoryId: products.categoryId,
        category: { name: categories.name, slug: categories.slug },
        brand: { name: brands.name },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(...conditions)),
    db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name)),
    db.select({ id: brands.id, name: brands.name, slug: brands.slug }).from(brands).where(eq(brands.isActive, true)).orderBy(asc(brands.name)),
  ]);

  const totalCount = Number(total);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const favSet = new Set<number>();
  if (authUser) {
    const favRows = await db
      .select({ productId: favorites.productId })
      .from(favorites)
      .where(eq(favorites.userId, authUser.id));
    favRows.forEach((f) => favSet.add(f.productId));
  }

  // Aktif kampanyaların rozet bilgilerini çek
  const now = new Date();
  const activeCampaigns = await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.isActive, true),
        or(isNull(campaigns.startDate), lte(campaigns.startDate, now)),
        or(isNull(campaigns.endDate), gte(campaigns.endDate, now)),
      )
    );

  const clientCampaigns: ClientCampaign[] = activeCampaigns
    .filter((c) => c.type !== "coupon") // Kuponları listelerde gösterme
    .map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    discountType: c.discountType,
    discountValue: Number(c.discountValue),
    minAmount: c.minAmount ? Number(c.minAmount) : null,
    minQuantity: c.minQuantity,
    buyQuantity: c.buyQuantity,
    getQuantity: c.getQuantity,
    productId: c.productId,
    isStackable: c.isStackable,
    categoryId: c.categoryId,
    badge: c.name,
  }));

  // Ürün → rozet eşleştirmesi yap
  function getBadgeForProduct(productId: number, categoryId: number | null): string | null {
    for (const c of activeCampaigns) {
      if (!c.badgeImage || !c.showBadge || c.type === "coupon") continue;
      if (c.type === "product" && c.productId === productId) return c.badgeImage;
      if (c.type === "category" && categoryId && c.categoryId === categoryId) return c.badgeImage;
      if (["bogo", "volume", "cart_total"].includes(c.type) && !c.productId && !c.categoryId) return c.badgeImage;
    }
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto lg:px-8 pt-4 lg:pt-8 pb-12">
      <MobileFilterBar
        categories={cats}
        brands={brnds}
        currentCategory={category}
        currentBrand={brand}
        currentSort={sort}
        minPrice={minPrice}
        maxPrice={maxPrice}
        totalCount={totalCount}
      />

      <div className="flex flex-col lg:flex-row gap-8 lg:mt-0 px-2 sm:px-6 lg:px-0">
        {/* Sidebar (Desktop Only) */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 space-y-6">
          {/* Arama */}
          <ProductSearch defaultValue={search} />

          {/* Kategoriler */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Kategoriler</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/products" className={`block text-sm px-3 py-1.5 rounded-btn transition-colors ${!category ? "bg-brand-surface dark:bg-brand-primary/20 text-brand-primary font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
                  Tümü
                </Link>
              </li>
              {cats.map((c) => (
                <li key={c.id}>
                  <Link href={`/products?category=${c.slug}`} className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${category === c.slug ? "bg-brand-surface dark:bg-brand-primary/20 text-brand-primary font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Markalar */}
          {brnds.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Markalar</h3>
              <ul className="space-y-1">
                {brnds.map((b) => (
                  <li key={b.id}>
                    <Link href={`/products?brand=${b.slug}`} className={`block text-sm px-3 py-1.5 rounded-btn transition-colors ${brand === b.slug ? "bg-brand-surface dark:bg-brand-primary/20 text-brand-primary font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fiyat Aralığı */}
          <PriceFilter minPrice={minPrice} maxPrice={maxPrice} />
        </aside>

        {/* Ürün grid */}
        <div className="flex-1">
          <div className="hidden lg:flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500">{totalCount} ürün</p>
            <SortSelect value={sort} />
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-400 gap-3">
              <Package className="h-10 w-10" />
              <p className="text-sm">Ürün bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {rows.map((p) => {
                const outOfStock = p.stock === 0;
                const price = Number(p.price);
                const { totalDiscount } = evaluateCampaignsClient(
                  clientCampaigns,
                  [{ id: p.id, price, quantity: 1, categoryId: p.categoryId }],
                  price
                );
                const finalPrice = price - totalDiscount;

                const manualComparePrice = p.comparePrice ? Number(p.comparePrice) : null;
                const hasCampaignDiscount = totalDiscount > 0;

                const displayComparePrice = hasCampaignDiscount ? price : manualComparePrice;
                const displayPrice = hasCampaignDiscount ? finalPrice : price;

                const discount = displayComparePrice && displayComparePrice > displayPrice
                  ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)
                  : null;

                const badgeImage = getBadgeForProduct(p.id, p.categoryId);

                return (
                  <div key={p.id} className="group bg-white dark:bg-zinc-900 rounded-card border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:border-brand-primary/50 transition-all flex flex-col shadow-[var(--card-shadow)] hover:shadow-lg focus-within:border-brand-primary">
                    <Link href={`/products/${p.slug}`} className="relative aspect-square bg-zinc-50 dark:bg-zinc-800 block">
                      {p.images[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="h-10 w-10 text-zinc-300" />
                        </div>
                      )}
                      
                      {outOfStock && (
                        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center z-10">
                          <span className="text-xs font-semibold text-zinc-500">Tükendi</span>
                        </div>
                      )}
                      {discount && !outOfStock && (
                        <span className="absolute top-2 left-2 z-10 bg-brand-primary text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
                          -{discount}%
                        </span>
                      )}
                      {p.isFeatured && !discount && (
                        <span className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
                          Öne Çıkan
                        </span>
                      )}
                      {/* Kampanya Rozeti */}
                      {badgeImage && !outOfStock && (
                        <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
                          <img
                            src={badgeImage}
                            alt="Kampanya rozeti"
                            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md"
                          />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 z-10 bg-white dark:bg-zinc-900 rounded-full shadow-sm">
                        <FavoriteButton productId={p.id} initialFavorited={favSet.has(p.id)} />
                      </div>
                    </Link>
                    
                    <div className="p-3 flex-1 flex flex-col">
                      <Link href={`/products/${p.slug}`} className="flex-1">
                        {p.brand && <p className="text-[11px] font-bold text-zinc-500 mb-0.5 uppercase tracking-wide">{p.brand.name}</p>}
                        <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug hover:text-brand-primary transition-colors">{p.name}</p>
                        
                        {/* Fake Star Rating (Visual only placeholder for Trendyol style layout) */}
                        <div className="flex items-center gap-1 mt-1.5 opacity-60">
                          <div className="flex text-amber-400 text-[10px]">
                            ★★★★★
                          </div>
                          <span className="text-[10px] text-zinc-500">(10+)</span>
                        </div>

                        <div className="mt-2.5 flex flex-col justify-end">
                          <span className="text-sm sm:text-base font-bold text-brand-primary">
                            {formatPrice(displayPrice)}
                          </span>
                          {displayComparePrice && (
                            <span className="text-[10px] sm:text-xs text-zinc-400 line-through">
                              {formatPrice(displayComparePrice)}
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="mt-auto pt-2 pb-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-10">
              {page > 1 && (
                <PaginationLink href={buildHref({ category, brand, search, sort, minPrice, maxPrice, page: page - 1 })}>
                  ←
                </PaginationLink>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationLink
                  key={p}
                  href={buildHref({ category, brand, search, sort, minPrice, maxPrice, page: p })}
                  active={p === page}
                >
                  {p}
                </PaginationLink>
              ))}
              {page < totalPages && (
                <PaginationLink href={buildHref({ category, brand, search, sort, minPrice, maxPrice, page: page + 1 })}>
                  →
                </PaginationLink>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildHref(params: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && !(k === "page" && v === 1)) p.set(k, String(v));
  }
  const qs = p.toString();
  return `/products${qs ? `?${qs}` : ""}`;
}

function PaginationLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`min-w-[2.25rem] h-9 flex items-center justify-center rounded-btn text-sm font-medium transition-colors px-2 ${
        active
          ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </Link>
  );
}
