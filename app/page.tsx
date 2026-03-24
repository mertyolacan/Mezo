import { db } from "@/lib/db";
import { products, categories, brands } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, RefreshCcw, Headphones } from "lucide-react";
import AddToCartButton from "@/components/shared/AddToCartButton";
import BrandMarquee from "@/components/shared/BrandMarquee";

export const revalidate = 60;

export default async function Home() {
  const [featuredProducts, allCategories, allBrands] = await Promise.all([
    db.select().from(products).where(and(eq(products.isActive, true), eq(products.isFeatured, true))).orderBy(desc(products.createdAt)).limit(8),
    db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder).limit(6),
    db.select({ id: brands.id, name: brands.name, logo: brands.logo }).from(brands).where(eq(brands.isActive, true)),
  ]);

  const features = [
    { icon: ShieldCheck, title: "Güvenli Alışveriş", desc: "SSL ile şifreli, güvenli ödeme" },
    { icon: Truck, title: "Hızlı Kargo", desc: "Siparişler 1-3 iş günü içinde" },
    { icon: RefreshCcw, title: "Kolay İade", desc: "14 gün içinde sorunsuz iade" },
    { icon: Headphones, title: "Canlı Destek", desc: "7/24 müşteri hizmetleri" },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-900 dark:to-zinc-950 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 leading-tight">
            Profesyonel<br />
            <span className="text-indigo-600 dark:text-indigo-400">Mezoterapi Ürünleri</span>
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-8">
            Klinikler ve uzmanlar için seçilmiş, kaliteli mezoterapi ürünleri.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Ürünleri İncele
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-zinc-100 dark:border-zinc-800 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="flex gap-3 items-start">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg shrink-0">
                <f.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{f.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Marquee */}
      <BrandMarquee brands={allBrands} />

      {/* Categories */}
      {allCategories.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Kategoriler</h2>
            <Link href="/products" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Tümünü gör →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {allCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative h-32 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-end p-4 hover:shadow-md transition-shadow"
              >
                {cat.image && (
                  <Image src={cat.image} alt={cat.name} fill className="object-cover opacity-70 group-hover:opacity-80 transition-opacity" />
                )}
                <span className="relative z-10 font-semibold text-white text-sm drop-shadow">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Öne Çıkan Ürünler</h2>
            <Link href="/products" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Tümünü gör →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => {
              const images = product.images as string[];
              const price = Number(product.price);
              const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
              const discount = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;

              return (
                <div key={product.id} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-shadow">
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
                      {images[0] ? (
                        <Image src={images[0]} alt={product.name} fill className="object-contain group-hover:scale-105 transition-transform duration-300" sizes="250px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs">Görsel yok</div>
                      )}
                      {discount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 mb-1">{product.name}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                          {price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                        </span>
                        {comparePrice && (
                          <span className="text-xs text-zinc-400 line-through">
                            {comparePrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-3 pb-3">
                    <AddToCartButton
                      product={{ id: product.id, name: product.name, price, image: images[0] ?? "", slug: product.slug, categoryId: product.categoryId }}
                      stock={product.stock}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
