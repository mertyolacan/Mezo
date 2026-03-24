import { db } from "@/lib/db";
import { brands, products } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import BrandManager from "./BrandManager";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const rows = await db
    .select({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
      logo: brands.logo,
      isActive: brands.isActive,
      sortOrder: brands.sortOrder,
      productCount: count(products.id),
    })
    .from(brands)
    .leftJoin(products, eq(products.brandId, brands.id))
    .groupBy(brands.id)
    .orderBy(brands.sortOrder, brands.name);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Markalar</h1>
      <BrandManager initialBrands={rows} />
    </div>
  );
}
