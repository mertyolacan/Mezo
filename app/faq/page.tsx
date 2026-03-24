import { db } from "@/lib/db";
import { faqs } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { Metadata } from "next";
import FaqAccordion from "./FaqAccordion";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "MesoPro ürünleri ve sipariş süreciyle ilgili sık sorulan sorular.",
};

export default async function FaqPage() {
  const rows = await db
    .select()
    .from(faqs)
    .where(eq(faqs.isActive, true))
    .orderBy(asc(faqs.sortOrder), asc(faqs.createdAt));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: rows.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // Group by category
  const categories = Array.from(new Set(rows.map((f) => f.category ?? "Genel")));
  const grouped = categories.map((cat) => ({
    category: cat,
    items: rows.filter((f) => (f.category ?? "Genel") === cat),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Sıkça Sorulan Sorular</h1>
        <p className="text-zinc-500 mb-12">Aklınızdaki sorular için buradayız.</p>

        {rows.length === 0 ? (
          <p className="text-zinc-400 text-center py-12">Henüz SSS eklenmemiş.</p>
        ) : (
          <div className="space-y-10">
            {grouped.map((group) => (
              <section key={group.category}>
                {categories.length > 1 && (
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">{group.category}</h2>
                )}
                <FaqAccordion items={group.items} />
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
