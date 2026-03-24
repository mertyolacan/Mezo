import { db } from "@/lib/db";
import { blogPosts, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { FileText } from "lucide-react";
import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("blog", {
    title: "Blog",
    description: "Mezoterapi hakkında uzman içerikler ve güncel haberler.",
  });
}

export default async function BlogPage() {
  const posts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      image: blogPosts.image,
      tags: blogPosts.tags,
      publishedAt: blogPosts.publishedAt,
      author: { name: users.name },
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(and(eq(blogPosts.status, "published")))
    .orderBy(desc(blogPosts.publishedAt));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">Blog</h1>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-400 gap-3">
          <FileText className="h-10 w-10" />
          <p className="text-sm">Henüz yazı yok</p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((p) => (
            <article key={p.id} className="group">
              <Link href={`/blog/${p.slug}`} className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {p.image && (
                  <div className="relative h-48 sm:h-40 w-full sm:w-56 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, 224px" />
                  </div>
                )}
                <div className="flex-1 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    {(p.tags as string[]).slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-2">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-zinc-400">
                    {p.author?.name && <span>{p.author.name}</span>}
                    {p.publishedAt && (
                      <span>{new Date(p.publishedAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="mt-6 border-b border-zinc-100 dark:border-zinc-800" />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
