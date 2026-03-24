import { db } from "@/lib/db";
import { dynamicPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PageBuilderForm from "../PageBuilderForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditPagePage({ params }: Props) {
  const { id } = await params;
  const [page] = await db.select().from(dynamicPages).where(eq(dynamicPages.id, Number(id))).limit(1);
  if (!page) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Sayfayı Düzenle</h1>
      <PageBuilderForm
        initialData={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          sections: (page.sections as Array<{ type: string; data: Record<string, string> }>) ?? [],
          status: page.status,
          seoTitle: page.seoTitle ?? "",
          seoDescription: page.seoDescription ?? "",
          ogImage: page.ogImage ?? "",
        }}
      />
    </div>
  );
}
