import { db } from "@/lib/db";
import { products, categories, brands, favorites } from "@/lib/db/schema";
import { eq, and, like, or, desc, asc, sql, gte, lte } from "drizzle-orm";
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 shrink-0 space-y-6">
          {/* Arama */}
          <ProductSearch defaultValue={search} />

          {/* Kategoriler */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Kategoriler</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/products" className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${!category ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
                  Tümü
                </Link>
              </li>
              {cats.map((c) => (
                <li key={c.id}>
                  <Link href={`/products?category=${c.slug}`} className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${category === c.slug ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
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
                    <Link href={`/products?brand=${b.slug}`} className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${brand === b.slug ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
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
          <div className="flex items-center justify-between mb-6">
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
                const discount = p.comparePrice
                  ? Math.round((1 - Number(p.price) / Number(p.comparePrice)) * 100)
                  : null;

                return (
                  <Link key={p.id} href={`/products/${p.slug}`} className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm transition-all">
                    <div className="relative aspect-square bg-zinc-50 dark:bg-zinc-800">
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
                        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center">
                          <span className="text-xs font-semibold text-zinc-500">Tükendi</span>
                        </div>
                      )}
                      {discount && !outOfStock && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
                          -{discount}%
                        </span>
                      )}
                      {p.isFeatured && !discount && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
                          Öne Çıkan
                        </span>
                      )}
                      <FavoriteButton productId={p.id} initialFavorited={favSet.has(p.id)} />
                    </div>
                    <div className="p-3">
                      {p.brand && <p className="text-xs text-zinc-400 mb-0.5">{p.brand.name}</p>}
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug">{p.name}</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(p.price)}</span>
                        {p.comparePrice && (
                          <span className="text-xs text-zinc-400 line-through">{formatPrice(p.comparePrice)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
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
      className={`min-w-[2.25rem] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors px-2 ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </Link>
  );
}
