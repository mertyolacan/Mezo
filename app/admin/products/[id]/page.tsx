import { db } from "@/lib/db";
import { products, categories, brands } from "@/lib/db/schema";
import { eq, asc, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProductForm from "../ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, cats, brnds, allProducts] = await Promise.all([
    db.select().from(products).where(eq(products.id, Number(id))).limit(1),
    db.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name)),
    db.select({ id: brands.id, name: brands.name }).from(brands).where(eq(brands.isActive, true)).orderBy(asc(brands.name)),
    db.select({ id: products.id, name: products.name, images: products.images }).from(products).where(eq(products.isActive, true)).orderBy(asc(products.name)).then((rows) => rows.filter((r) => r.id !== Number(id))),
  ]);

  if (!product[0]) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Ürün Düzenle</h1>
      <ProductForm
        categories={cats}
        brands={brnds}
        allProducts={allProducts}
        initialData={product[0] as Record<string, unknown>}
        productId={Number(id)}
      />
    </div>
  );
}
