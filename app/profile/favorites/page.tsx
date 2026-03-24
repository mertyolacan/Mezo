import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { favorites, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Heart, Package } from "lucide-react";
import RemoveFavoriteButton from "./RemoveFavoriteButton";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const auth = await getAuthUser();
  if (!auth) return null;

  const rows = await db
    .select({
      id: favorites.id,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        images: products.images,
        stock: products.stock,
      },
    })
    .from(favorites)
    .innerJoin(products, eq(favorites.productId, products.id))
    .where(eq(favorites.userId, auth.id));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Favorilerim</h1>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-400 gap-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <Heart className="h-10 w-10" />
          <p className="text-sm">Henüz favori eklenmedi</p>
          <Link href="/products" className="text-sm text-indigo-500 hover:underline">Ürünlere bak</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {rows.map(({ id, product: p }) => (
            <div key={id} className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden group">
              <RemoveFavoriteButton favoriteId={id} productId={p.id} />
              <Link href={`/products/${p.slug}`}>
                <div className="relative aspect-square bg-zinc-50 dark:bg-zinc-800">
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.name} fill className="object-contain group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-8 w-8 text-zinc-300" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug">{p.name}</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatPrice(p.price)}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
