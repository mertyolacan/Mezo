import { db } from "@/lib/db";
import { categories, brands, products } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const [cats, brnds, allProducts] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name)),
    db.select({ id: brands.id, name: brands.name }).from(brands).where(eq(brands.isActive, true)).orderBy(asc(brands.name)),
    db.select({ id: products.id, name: products.name, images: products.images }).from(products).where(eq(products.isActive, true)).orderBy(asc(products.name)),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Yeni Ürün</h1>
      <ProductForm categories={cats} brands={brnds} allProducts={allProducts} />
    </div>
  );
}
