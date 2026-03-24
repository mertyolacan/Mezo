import { db } from "@/lib/db";
import { campaigns, categories, products } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import CampaignForm from "../CampaignForm";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [campaign, cats, prods] = await Promise.all([
    db.select().from(campaigns).where(eq(campaigns.id, Number(id))).limit(1),
    db.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name)),
    db.select({ id: products.id, name: products.name }).from(products).where(eq(products.isActive, true)).orderBy(asc(products.name)),
  ]);

  if (!campaign[0]) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Kampanya Düzenle</h1>
      <CampaignForm
        categories={cats}
        products={prods}
        initialData={campaign[0] as Record<string, unknown>}
        campaignId={Number(id)}
      />
    </div>
  );
}
