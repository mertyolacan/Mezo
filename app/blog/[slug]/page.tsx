import { db } from "@/lib/db";
import { blogPosts, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post] = await db
    .select({ 
      title: blogPosts.title, 
      seoSettings: blogPosts.seoSettings, 
      image: blogPosts.image 
    })
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);

  if (!post) return { title: "Yazı Bulunamadı" };

  const seo = post.seoSettings;

  return {
    title: seo?.title || post.title,
    description: seo?.description || undefined,
    keywords: seo?.keywords || undefined,
    alternates: {
      canonical: seo?.canonicalUrl || undefined,
    },
    robots: seo?.noIndex ? "noindex, nofollow" : "index, follow",
    openGraph: {
      title: seo?.title || post.title,
      description: seo?.description || undefined,
      images: seo?.ogImage ? [seo.ogImage] : post.image ? [post.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const [row] = await db
    .select()
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1);

  if (!row) notFound();

  const post = row.blog_posts;
  const author = row.users;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoSettings?.description ?? post.excerpt ?? undefined,
    image: post.image ?? post.seoSettings?.ogImage ?? undefined,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    ...(author?.name ? { author: { "@type": "Person", name: author.name } } : {}),
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/blog/${post.slug}`,
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {(post.tags as string[]).map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          {author?.name && <span>{author.name}</span>}
          {post.publishedAt && (
            <>
              <span>·</span>
              <time>{new Date(post.publishedAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</time>
            </>
          )}
        </div>
      </div>

      {post.image && (
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 bg-zinc-100 dark:bg-zinc-800">
          <Image src={post.image} alt={post.title} fill className="object-cover" priority sizes="(max-width: 672px) 100vw, 672px" />
        </div>
      )}

      <div
        className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 blog-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
    </>
  );
}
