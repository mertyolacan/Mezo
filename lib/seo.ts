import { db } from "@/lib/db";
import { seoPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

/**
 * Veritabanındaki seo_pages tablosundan ilgili sayfa kaydını çeker
 * ve Next.js Metadata objesine dönüştürür.
 *
 * @param page   seo_pages.page kolonundaki değer (örn. "home", "products", "blog", "contact")
 * @param defaults Veritabanında kayıt yoksa kullanılacak varsayılan değerler
 */
export async function getSeoMetadata(
  page: string,
  defaults: {
    title: string;
    description?: string;
    keywords?: string;
  }
): Promise<Metadata> {
  let row: typeof seoPages.$inferSelect | undefined;

  try {
    const rows = await db
      .select()
      .from(seoPages)
      .where(eq(seoPages.page, page))
      .limit(1);
    row = rows[0];
  } catch {
    // DB hatası olursa sessizce fallback kullan
  }

  const title = row?.title?.trim() || defaults.title;
  const description = row?.description?.trim() || defaults.description;
  const keywords = row?.keywords?.trim() || defaults.keywords;
  const ogTitle = row?.ogTitle?.trim() || title;
  const ogDescription = row?.ogDescription?.trim() || description;
  const ogImage = row?.ogImage?.trim() || undefined;
  const robots = row?.robots?.trim() || "index, follow";
  const canonical = row?.canonical?.trim() || undefined;

  const metadata: Metadata = {
    title: { absolute: title },
    description,
    keywords: keywords ? keywords.split(",").map((k) => k.trim()) : undefined,
    robots,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: canonical ? { canonical } : undefined,
  };

  return metadata;
}
