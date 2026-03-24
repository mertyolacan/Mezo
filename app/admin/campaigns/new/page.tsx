import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import CampaignForm from "../CampaignForm";

export default async function NewCampaignPage() {
  const [cats, prods] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name)),
    db.select({ id: products.id, name: products.name }).from(products).where(eq(products.isActive, true)).orderBy(asc(products.name)),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Yeni Kampanya</h1>
      <CampaignForm categories={cats} products={prods} />
    </div>
  );
}
