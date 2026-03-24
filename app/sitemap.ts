import { MetadataRoute } from "next";
import { getSiteSettings, getSitemapProducts, getSitemapPosts } from "@/lib/cache";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://mesopro.com").replace(/\/$/, "");

    // 1. Statik Sayfalar
    const staticPages: MetadataRoute.Sitemap = [
      { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
      { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ];

    // 2. Dinamik Ürünler
    const products = await getSitemapProducts();
    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    // 3. Dinamik Blog Yazıları
    const posts = await getSitemapPosts();
    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    return [...staticPages, ...productEntries, ...postEntries];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return [];
  }
}
