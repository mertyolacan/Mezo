"use server";

import { db } from "@/lib/db";
import { siteSettings, seoPages, products, blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  GlobalSettingsSchema,
  ContentSeoSchema,
  PageSeoSchema,
  type GlobalSettingsInput,
  type ContentSeoInput,
  type PageSeoInput,
} from "@/lib/validations/seo";
import { TAGS } from "@/lib/cache";

/**
 * Global site ayarlarını günceller (Singleton: id=1)
 * Yalnızca SEO/meta/analytics kolonlarını yazar — iletişim/sosyal alanlara dokunmaz.
 */
export async function updateGlobalSettings(data: GlobalSettingsInput) {
  const validated = GlobalSettingsSchema.parse(data);

  const scripts = validated.customScripts
    ? {
        head:      validated.customScripts.head      ?? undefined,
        bodyStart: validated.customScripts.bodyStart ?? undefined,
        bodyEnd:   validated.customScripts.bodyEnd   ?? undefined,
      }
    : undefined;

  // Yalnızca SEO alanlarını güncelle — Settings alanlarını ezme
  const seoPayload = {
    siteName:           validated.siteName,
    titleSeparator:     validated.titleSeparator,
    defaultDescription: validated.defaultDescription ?? undefined,
    defaultOgImage:     validated.defaultOgImage     ?? undefined,
    gaId:               validated.gaId               ?? undefined,
    gscId:              validated.gscId              ?? undefined,
    faviconUrl:         validated.faviconUrl         ?? undefined,
    customScripts:      scripts,
    updatedAt:          new Date(),
  };

  const existing = await db
    .select({ id: siteSettings.id })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(siteSettings)
      .set(seoPayload)
      .where(eq(siteSettings.id, 1));
  } else {
    await db
      .insert(siteSettings)
      .values({ id: 1, ...seoPayload });
  }

  revalidateTag(TAGS.settings);
  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Sayfa bazlı SEO günceller (seo_pages tablosu)
 * SeoForm field → seoPages kolon dönüşümü yapar
 */
export async function updatePageSeo(data: PageSeoInput) {
  const validated = PageSeoSchema.parse(data);

  // SeoForm field → DB kolon mapping
  const dbPayload = {
    title:         validated.title       ?? null,
    description:   validated.description ?? null,
    keywords:      validated.keywords.length > 0 ? validated.keywords.join(", ") : null,
    ogTitle:       validated.title       ?? null,   // OG fallback → title
    ogDescription: validated.description ?? null,   // OG fallback → description
    ogImage:       validated.ogImage     ?? null,
    robots:        validated.noIndex ? "noindex, nofollow" : "index, follow",
    canonical:     validated.canonicalUrl ?? null,
    updatedAt:     new Date(),
  };

  const existing = await db
    .select({ id: seoPages.id })
    .from(seoPages)
    .where(eq(seoPages.page, validated.page))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(seoPages)
      .set(dbPayload)
      .where(eq(seoPages.page, validated.page));
  } else {
    await db
      .insert(seoPages)
      .values({ page: validated.page, ...dbPayload });
  }

  // İlgili sayfa cache'ini temizle
  const slugMap: Record<string, string> = {
    home: "/",
    products: "/products",
    blog: "/blog",
    contact: "/contact",
    faq: "/faq",
  };
  revalidatePath(slugMap[validated.page] || "/", "page");
  revalidateTag(TAGS.settings);
  return { success: true };
}

/**
 * Ürün veya Blog yazısının SEO Metadata (JSONB) alanını günceller
 */
export async function updateContentSeo(
  type: "product" | "post",
  id: number,
  data: ContentSeoInput
) {
  const validated = ContentSeoSchema.parse(data);

  const seo = {
    title:        validated.title        ?? undefined,
    description:  validated.description  ?? undefined,
    keywords:     validated.keywords,
    ogImage:      validated.ogImage      ?? undefined,
    noIndex:      validated.noIndex,
    canonicalUrl: validated.canonicalUrl ?? undefined,
  };

  if (type === "product") {
    await db.update(products)
      .set({ seoSettings: seo, updatedAt: new Date() })
      .where(eq(products.id, id));
    revalidatePath(`/products/${id}`);
  } else {
    await db.update(blogPosts)
      .set({ seoSettings: seo, updatedAt: new Date() })
      .where(eq(blogPosts.id, id));
    revalidatePath(`/blog/${id}`);
  }

  revalidatePath("/", "layout");
  return { success: true };
}
