import { unstable_cache, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { campaigns, categories, brands, siteSettings, products, blogPosts } from "@/lib/db/schema";
import { and, eq, gte, lte, or, isNull, asc } from "drizzle-orm";

// ── Tags ──────────────────────────────────────────────────────────────────────
export const TAGS = {
  campaigns: "campaigns",
  categories: "categories",
  brands: "brands",
  settings: "settings",
  products: "products",
} as const;

// ── Invalidators ──────────────────────────────────────────────────────────────
export function invalidateCampaigns() { revalidateTag(TAGS.campaigns); }
export function invalidateCategories() { revalidateTag(TAGS.categories); }
export function invalidateBrands() { revalidateTag(TAGS.brands); }
export function invalidateSettings() { revalidateTag(TAGS.settings); }
export function invalidateProducts() { revalidateTag(TAGS.products); }

// ── Cached fetchers ───────────────────────────────────────────────────────────
export const getActiveCampaigns = unstable_cache(
  async () => {
    const now = new Date();
    return db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.isActive, true),
          or(isNull(campaigns.startDate), lte(campaigns.startDate, now)),
          or(isNull(campaigns.endDate), gte(campaigns.endDate, now))
        )
      );
  },
  ["active-campaigns"],
  { tags: [TAGS.campaigns], revalidate: 60 }
);

export const getCategories = unstable_cache(
  async () =>
    db
      .select({ id: categories.id, name: categories.name, slug: categories.slug, description: categories.description, image: categories.image })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.name)),
  ["active-categories"],
  { tags: [TAGS.categories], revalidate: 300 }
);

export const getBrands = unstable_cache(
  async () =>
    db
      .select({ id: brands.id, name: brands.name, slug: brands.slug, logo: brands.logo })
      .from(brands)
      .where(eq(brands.isActive, true))
      .orderBy(asc(brands.name)),
  ["active-brands"],
  { tags: [TAGS.brands], revalidate: 300 }
);

export const getSiteSettings = unstable_cache(
  async () => {
    const [settings] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);
    return settings || null;
  },
  ["site-settings"],
  { tags: [TAGS.settings], revalidate: 600 }
);

// getAllSiteSettings: getSiteSettings ile aynı veriyi döner, geriye dönük uyumluluk için
export async function getAllSiteSettings(): Promise<Record<string, any>> {
  const settings = await getSiteSettings();
  if (!settings) return {};
  return {
    site_name: settings.siteName,
    contact_phone: settings.contactPhone,
    contact_email: settings.contactEmail,
    social_whatsapp: settings.socialWhatsapp,
    social_instagram: settings.socialInstagram,
    ...settings,
  };
}

// ── Sitemap Fetchers ──────────────────────────────────────────────────────────
export const getSitemapProducts = unstable_cache(
  async () =>
    db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.isActive, true)),
  ["sitemap-products"],
  { tags: [TAGS.products], revalidate: 3600 }
);

export const getSitemapPosts = unstable_cache(
  async () =>
    db
      .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published")),
  ["sitemap-posts"],
  { tags: ["blog-posts"], revalidate: 3600 }
);
