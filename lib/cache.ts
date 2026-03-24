import { unstable_cache, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { campaigns, categories, brands, siteSettings } from "@/lib/db/schema";
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
    const rows = await db.select().from(siteSettings).limit(1);
    return rows[0] ?? null;
  },
  ["site-settings"],
  { tags: [TAGS.settings], revalidate: 600 }
);

export const getAllSiteSettings = unstable_cache(
  async (): Promise<Record<string, string | null>> => {
    const rows = await db.select().from(siteSettings);
    const map: Record<string, string | null> = {};
    rows.forEach((r) => { map[r.key] = r.value; });
    return map;
  },
  ["all-site-settings"],
  { tags: [TAGS.settings], revalidate: 600 }
);
