import { db } from "@/lib/db";
import { products, blogPosts, dynamicPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mesopro.com.tr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productRows, blogRows, pageRows] = await Promise.all([
    db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.isActive, true)),
    db.select({ slug: blogPosts.slug, publishedAt: blogPosts.publishedAt }).from(blogPosts).where(eq(blogPosts.status, "published")),
    db.select({ slug: dynamicPages.slug, updatedAt: dynamicPages.updatedAt }).from(dynamicPages).where(eq(dynamicPages.status, "published")),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = productRows.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogRows.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.publishedAt ?? new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const pageRoutes: MetadataRoute.Sitemap = pageRows.map((p) => ({
    url: `${BASE_URL}/p/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes, ...pageRoutes];
}
