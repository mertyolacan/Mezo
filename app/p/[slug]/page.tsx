import { db } from "@/lib/db";
import { dynamicPages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [page] = await db.select({ title: dynamicPages.title, seoTitle: dynamicPages.seoTitle, seoDescription: dynamicPages.seoDescription, ogImage: dynamicPages.ogImage })
    .from(dynamicPages).where(eq(dynamicPages.slug, slug)).limit(1);
  if (!page) return { title: "Sayfa Bulunamadı" };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
    openGraph: { images: page.ogImage ? [page.ogImage] : [] },
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;

  const [page] = await db
    .select()
    .from(dynamicPages)
    .where(and(eq(dynamicPages.slug, slug), eq(dynamicPages.status, "published")))
    .limit(1);

  if (!page) notFound();

  const sections = page.sections as Array<{ type: string; data: Record<string, string> }>;

  return (
    <main className="min-h-screen">
      {sections.map((section, i) => {
        switch (section.type) {
          case "hero":
            return (
              <section key={i} className="relative h-96 flex items-center justify-center text-center overflow-hidden bg-zinc-900">
                {section.data.image && (
                  <Image src={section.data.image} alt="" fill className="object-cover opacity-40" />
                )}
                <div className="relative z-10 px-6 max-w-2xl mx-auto">
                  {section.data.title && <h1 className="text-4xl font-bold text-white mb-3">{section.data.title}</h1>}
                  {section.data.subtitle && <p className="text-lg text-zinc-200 mb-6">{section.data.subtitle}</p>}
                  {section.data.buttonText && section.data.buttonUrl && (
                    <a href={section.data.buttonUrl} className="inline-block bg-brand-primary hover:bg-brand-primary-light text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                      {section.data.buttonText}
                    </a>
                  )}
                </div>
              </section>
            );

          case "text":
            return (
              <section key={i} className="max-w-2xl mx-auto px-4 py-12">
                {section.data.heading && <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">{section.data.heading}</h2>}
                {section.data.content && <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{section.data.content}</p>}
              </section>
            );

          case "image":
            return (
              <section key={i} className="max-w-4xl mx-auto px-4 py-8">
                {section.data.url && (
                  <figure>
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <Image src={section.data.url} alt={section.data.alt ?? ""} fill className="object-cover" />
                    </div>
                    {section.data.caption && <figcaption className="text-center text-sm text-zinc-400 mt-2">{section.data.caption}</figcaption>}
                  </figure>
                )}
              </section>
            );

          case "two_column":
            return (
              <section key={i} className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
                <div>
                  {section.data.leftHeading && <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{section.data.leftHeading}</h2>}
                  {section.data.leftContent && <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{section.data.leftContent}</p>}
                </div>
                <div>
                  {section.data.rightHeading && <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{section.data.rightHeading}</h2>}
                  {section.data.rightContent && <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{section.data.rightContent}</p>}
                </div>
              </section>
            );

          case "cta":
            return (
              <section key={i} className="bg-brand-primary dark:bg-brand-primary-light py-16 px-4 text-center">
                {section.data.text && <h2 className="text-3xl font-bold text-white mb-3">{section.data.text}</h2>}
                {section.data.description && <p className="text-indigo-100 mb-8 max-w-xl mx-auto">{section.data.description}</p>}
                {section.data.buttonText && section.data.buttonUrl && (
                  <a href={section.data.buttonUrl} className="inline-block bg-white text-brand-primary font-semibold px-8 py-3 rounded-lg hover:bg-brand-primary/5 transition-colors">
                    {section.data.buttonText}
                  </a>
                )}
              </section>
            );

          case "divider":
            return <hr key={i} className="max-w-4xl mx-auto border-zinc-200 dark:border-zinc-800 my-8" />;

          default:
            return null;
        }
      })}
    </main>
  );
}
