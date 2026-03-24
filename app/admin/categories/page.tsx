import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      image: categories.image,
      isActive: categories.isActive,
      sortOrder: categories.sortOrder,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.sortOrder, categories.name);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Kategoriler</h1>
      <CategoryManager initialCategories={rows} />
    </div>
  );
}
