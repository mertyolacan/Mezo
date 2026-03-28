import Link from "next/link";
import { db } from "@/lib/db";
import { products, categories, brands } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Plus, Pencil, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import DeleteProductButton from "./DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      images: products.images,
      lowStockThreshold: products.lowStockThreshold,
      category: { name: categories.name },
      brand: { name: brands.name },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .orderBy(desc(products.createdAt));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Ürünler</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-light text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Ürün
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-400 gap-3">
          <Package className="h-10 w-10" />
          <p className="text-sm">Henüz ürün yok</p>
          <Link href="/admin/products/new" className="text-brand-primary text-sm hover:underline">
            İlk ürünü ekle
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Ürün</th>
                <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Kategori</th>
                <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Fiyat</th>
                <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Stok</th>
                <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Durum</th>
                <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((p) => {
                const isLowStock = p.stock <= p.lowStockThreshold && p.stock > 0;
                const isOutOfStock = p.stock === 0;
                return (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                          {p.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-contain" />
                          ) : (
                            <Package className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-50 line-clamp-1">{p.name}</p>
                          {p.isFeatured && (
                            <span className="text-xs text-amber-600 dark:text-amber-400">Öne çıkan</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
                      {p.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 hidden lg:table-cell">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          isOutOfStock
                            ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                            : isLowStock
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                        }`}
                      >
                        {isOutOfStock ? "Tükendi" : isLowStock ? `Az stok: ${p.stock}` : p.stock}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.isActive
                            ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {p.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
